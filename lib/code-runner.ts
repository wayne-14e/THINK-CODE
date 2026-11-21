'use client';

import type {
  ExecutionSummary,
  Language,
  SubmissionStatus,
  TestCase,
  TestCaseExecutionResult,
} from './types';

function normalizeOutput(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

function runJsInWorker(
  code: string,
  stdin: string,
  timeoutMs = 2500
): Promise<{ stdout: string; stderr: string; timedOut: boolean; runtimeMs: number }> {
  return new Promise((resolve) => {
    const start = performance.now();
    const workerSource = `
      self.onmessage = function(e) {
        const { userCode, stdinData } = e.data;
        const logs = [];
        const console = {
          log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
          error: (...args) => logs.push(args.map(a => String(a)).join(' ')),
          warn: (...args) => logs.push(args.map(a => String(a)).join(' '))
        };
        const require = (mod) => {
          if (mod === 'fs') {
            return {
              readFileSync: (fd) => (fd === 0 || fd === '/dev/stdin') ? stdinData : ''
            };
          }
          throw new Error('Module "' + mod + '" is unavailable in sandbox');
        };
        const process = { exit: () => {}, stdin: { fd: 0 } };
        try {
          const fn = new Function('console', 'require', 'process', userCode);
          fn(console, require, process);
          self.postMessage({ stdout: logs.join('\\n'), stderr: '' });
        } catch (err) {
          self.postMessage({ stdout: logs.join('\\n'), stderr: err && err.stack ? String(err.message) : String(err) });
        }
      };
    `;

    const blob = new Blob([workerSource], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    let finished = false;
    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        worker.terminate();
        URL.revokeObjectURL(url);
        resolve({
          stdout: '',
          stderr: `Time Limit Exceeded (${timeoutMs} ms)`,
          timedOut: true,
          runtimeMs: Math.round(performance.now() - start),
        });
      }
    }, timeoutMs);

    worker.onmessage = (event) => {
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        worker.terminate();
        URL.revokeObjectURL(url);
        resolve({
          stdout: event.data.stdout || '',
          stderr: event.data.stderr || '',
          timedOut: false,
          runtimeMs: Math.round(performance.now() - start),
        });
      }
    };

    worker.onerror = (err) => {
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        worker.terminate();
        URL.revokeObjectURL(url);
        resolve({
          stdout: '',
          stderr: err.message || 'Worker runtime error',
          timedOut: false,
          runtimeMs: Math.round(performance.now() - start),
        });
      }
    };

    worker.postMessage({ userCode: code, stdinData: stdin });
  });
}

let pyWorkerInstance: Worker | null = null;
let pyWorkerReadyPromise: Promise<Worker> | null = null;

function getPythonWorker(): Promise<Worker> {
  if (pyWorkerInstance && pyWorkerReadyPromise) {
    return pyWorkerReadyPromise;
  }

  pyWorkerReadyPromise = new Promise((resolve, reject) => {
    const workerSource = `
      importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
      let pyodideReady = null;
      async function init() {
        if (!pyodideReady) {
          pyodideReady = loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/' });
        }
        return await pyodideReady;
      }
      self.onmessage = async (e) => {
        const { type, userCode, stdinData, id } = e.data;
        try {
          const py = await init();
          if (type === 'ping') {
            self.postMessage({ type: 'ready', id });
            return;
          }
          py.globals.set('__tc_stdin__', stdinData || '');
          py.globals.set('__tc_code__', userCode || '');
          const resultJson = await py.runPythonAsync(\`
import sys, io, json, traceback
_stdout = io.StringIO()
_stderr = io.StringIO()
_old_in, _old_out, _old_err = sys.stdin, sys.stdout, sys.stderr
sys.stdin = io.StringIO(__tc_stdin__)
sys.stdout = _stdout
sys.stderr = _stderr
_err_msg = ""
try:
    exec(compile(__tc_code__, "<sandbox>", "exec"), {"__name__": "__main__"})
except Exception:
    _err_msg = traceback.format_exc()
finally:
    sys.stdin, sys.stdout, sys.stderr = _old_in, _old_out, _old_err
json.dumps({"stdout": _stdout.getvalue(), "stderr": _err_msg or _stderr.getvalue()})
\`);
          const parsed = JSON.parse(resultJson);
          self.postMessage({ type: 'result', id, stdout: parsed.stdout, stderr: parsed.stderr });
        } catch (err) {
          self.postMessage({ type: 'result', id, stdout: '', stderr: String(err) });
        }
      };
    `;

    const blob = new Blob([workerSource], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    const onInitMsg = (ev: MessageEvent) => {
      if (ev.data?.type === 'ready') {
        worker.removeEventListener('message', onInitMsg);
        pyWorkerInstance = worker;
        resolve(worker);
      } else if (ev.data?.type === 'result' && ev.data?.stderr) {
        worker.removeEventListener('message', onInitMsg);
        pyWorkerInstance = null;
        pyWorkerReadyPromise = null;
        reject(new Error(ev.data.stderr));
      }
    };

    worker.addEventListener('message', onInitMsg);
    worker.onerror = (err) => {
      pyWorkerInstance = null;
      pyWorkerReadyPromise = null;
      reject(new Error(err.message || 'Failed to initialize Python WASM runtime'));
    };

    worker.postMessage({ type: 'ping', id: 'init' });
  });

  return pyWorkerReadyPromise;
}

async function runPythonInWorker(
  code: string,
  stdin: string,
  timeoutMs = 5000
): Promise<{ stdout: string; stderr: string; timedOut: boolean; runtimeMs: number }> {
  const worker = await getPythonWorker();
  const start = performance.now();
  const reqId = `${Date.now()}-${Math.random()}`;

  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        worker.terminate();
        pyWorkerInstance = null;
        pyWorkerReadyPromise = null;
        resolve({
          stdout: '',
          stderr: `Time Limit Exceeded (${timeoutMs} ms)`,
          timedOut: true,
          runtimeMs: Math.round(performance.now() - start),
        });
      }
    }, timeoutMs);

    const handler = (ev: MessageEvent) => {
      if (ev.data?.type === 'result' && ev.data?.id === reqId && !settled) {
        settled = true;
        clearTimeout(timer);
        worker.removeEventListener('message', handler);
        resolve({
          stdout: ev.data.stdout || '',
          stderr: ev.data.stderr || '',
          timedOut: false,
          runtimeMs: Math.round(performance.now() - start),
        });
      }
    };

    worker.addEventListener('message', handler);
    worker.postMessage({ type: 'run', id: reqId, userCode: code, stdinData: stdin });
  });
}

export async function executeCodeSuite(
  language: Language,
  code: string,
  testCases: TestCase[]
): Promise<ExecutionSummary> {
  // 1. Try server-side Piston proxy first if configured
  try {
    const res = await fetch('/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, code, testCases }),
    });
    if (res.ok) {
      const data = await res.json();
      if (!data.fallbackRequired && data.summary) {
        return data.summary as ExecutionSummary;
      }
    }
  } catch {
    // Proceed directly to local isolated worker fallback
  }

  // 2. C++ requires an external Piston endpoint when not configured locally
  if (language === 'cpp') {
    return {
      status: 'Runtime Error',
      engine: 'unavailable',
      runtimeMs: 0,
      passedCount: 0,
      totalCount: testCases.length,
      message:
        'C++ execution requires a Piston v2 endpoint in PISTON_API_URL. Python and JavaScript run immediately in the local isolated sandbox.',
      results: testCases.map((tc) => ({
        testCaseId: tc.id,
        passed: false,
        isHidden: tc.isHidden,
        input: tc.isHidden ? '[Hidden]' : tc.input,
        expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
        actualOutput: '',
        stderr: 'PISTON_API_URL not configured for C++ compiler',
        runtimeMs: 0,
      })),
    };
  }

  // 3. Execute Python or JavaScript inside isolated browser Web Workers
  const results: TestCaseExecutionResult[] = [];
  let passedCount = 0;
  let totalRuntimeMs = 0;
  let overallStatus: SubmissionStatus = 'Accepted';

  for (const tc of testCases) {
    try {
      const run =
        language === 'javascript'
          ? await runJsInWorker(code, tc.input)
          : await runPythonInWorker(code, tc.input);

      totalRuntimeMs += run.runtimeMs;

      if (run.timedOut) {
        overallStatus = 'Time Limit Exceeded';
        results.push({
          testCaseId: tc.id,
          passed: false,
          isHidden: tc.isHidden,
          input: tc.isHidden ? '[Hidden]' : tc.input,
          expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
          actualOutput: normalizeOutput(run.stdout),
          stderr: run.stderr,
          runtimeMs: run.runtimeMs,
          timedOut: true,
        });
        continue;
      }

      if (run.stderr) {
        if (overallStatus === 'Accepted') overallStatus = 'Runtime Error';
        results.push({
          testCaseId: tc.id,
          passed: false,
          isHidden: tc.isHidden,
          input: tc.isHidden ? '[Hidden]' : tc.input,
          expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
          actualOutput: normalizeOutput(run.stdout),
          stderr: run.stderr,
          runtimeMs: run.runtimeMs,
        });
        continue;
      }

      const actual = normalizeOutput(run.stdout);
      const expected = normalizeOutput(tc.expectedOutput);
      const passed = actual === expected;

      if (passed) {
        passedCount++;
      } else if (overallStatus === 'Accepted') {
        overallStatus = 'Wrong Answer';
      }

      results.push({
        testCaseId: tc.id,
        passed,
        isHidden: tc.isHidden,
        input: tc.isHidden ? '[Hidden]' : tc.input,
        expectedOutput: tc.isHidden ? '[Hidden]' : expected,
        actualOutput: tc.isHidden ? (passed ? '[Hidden]' : 'Mismatch on hidden case') : actual,
        runtimeMs: run.runtimeMs,
      });
    } catch (err) {
      if (overallStatus === 'Accepted') overallStatus = 'Runtime Error';
      results.push({
        testCaseId: tc.id,
        passed: false,
        isHidden: tc.isHidden,
        input: tc.isHidden ? '[Hidden]' : tc.input,
        expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
        actualOutput: '',
        stderr: err instanceof Error ? err.message : 'Execution failed',
        runtimeMs: 0,
      });
    }
  }

  return {
    status: overallStatus,
    engine: language === 'javascript' ? 'local-js-worker' : 'local-pyodide-worker',
    runtimeMs: totalRuntimeMs,
    passedCount,
    totalCount: testCases.length,
    results,
  };
}
