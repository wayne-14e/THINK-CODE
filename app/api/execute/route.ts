import { NextRequest, NextResponse } from 'next/server';

interface ExecuteTestCaseInput {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

interface ExecuteRequestBody {
  language?: string;
  code?: string;
  testCases?: ExecuteTestCaseInput[];
}

const LANGUAGE_MAP: Record<string, { language: string; version: string; filename: string }> = {
  python: { language: 'python', version: '3.10.0', filename: 'main.py' },
  javascript: { language: 'javascript', version: '18.15.0', filename: 'main.js' },
  cpp: { language: 'cpp', version: '10.2.0', filename: 'main.cpp' },
};

function normalizeOutput(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ExecuteRequestBody;
    const { language, code, testCases } = body;

    if (!language || !LANGUAGE_MAP[language]) {
      return NextResponse.json(
        { error: 'Unsupported language. Choose python, javascript, or cpp.' },
        { status: 400 }
      );
    }

    if (typeof code !== 'string' || code.trim().length === 0 || code.length > 25000) {
      return NextResponse.json(
        { error: 'Code must be a non-empty string under 25,000 characters.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(testCases) || testCases.length === 0 || testCases.length > 25) {
      return NextResponse.json(
        { error: 'Provide between 1 and 25 test cases.' },
        { status: 400 }
      );
    }

    const pistonBaseUrl = process.env.PISTON_API_URL?.trim();
    if (!pistonBaseUrl) {
      return NextResponse.json({
        fallbackRequired: true,
        reason: 'External Piston API not configured; using isolated browser worker.',
      });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(pistonBaseUrl);
      if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json({
        fallbackRequired: true,
        reason: 'Invalid PISTON_API_URL configuration; using isolated browser worker.',
      });
    }

    const endpoint = parsedUrl.toString().replace(/\/$/, '') + '/execute';
    const langMeta = LANGUAGE_MAP[language];
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (process.env.PISTON_API_KEY?.trim()) {
      headers['Authorization'] = `Bearer ${process.env.PISTON_API_KEY.trim()}`;
    }

    const results = [];
    let totalRuntimeMs = 0;
    let passedCount = 0;
    let overallStatus: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' =
      'Accepted';

    for (const tc of testCases) {
      const start = Date.now();
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          language: langMeta.language,
          version: langMeta.version,
          files: [{ name: langMeta.filename, content: code }],
          stdin: typeof tc.input === 'string' ? tc.input : '',
          run_timeout: 3000,
          compile_timeout: 5000,
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (response.status === 401 || response.status === 403 || response.status >= 500) {
        return NextResponse.json({
          fallbackRequired: true,
          reason: `Piston endpoint returned HTTP ${response.status}; falling back to local sandbox.`,
        });
      }

      if (!response.ok) {
        const text = await response.text();
        return NextResponse.json(
          { error: `Execution service rejected request (${response.status}): ${text.slice(0, 200)}` },
          { status: 502 }
        );
      }

      const data = await response.json();
      const elapsed = Date.now() - start;
      totalRuntimeMs += elapsed;

      const compileStderr = data?.compile?.stderr || '';
      const compileCode = data?.compile?.code ?? 0;
      const runStdout = data?.run?.stdout || '';
      const runStderr = data?.run?.stderr || '';
      const runSignal = data?.run?.signal || null;
      const runCode = data?.run?.code ?? 0;

      if (compileCode !== 0 || compileStderr) {
        overallStatus = 'Runtime Error';
        results.push({
          testCaseId: tc.id,
          passed: false,
          isHidden: Boolean(tc.isHidden),
          input: tc.isHidden ? '[Hidden]' : tc.input,
          expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
          actualOutput: '',
          stderr: compileStderr || 'Compilation failed',
          runtimeMs: elapsed,
        });
        continue;
      }

      if (runSignal === 'SIGKILL' || runSignal === 'SIGTERM') {
        overallStatus = 'Time Limit Exceeded';
        results.push({
          testCaseId: tc.id,
          passed: false,
          isHidden: Boolean(tc.isHidden),
          input: tc.isHidden ? '[Hidden]' : tc.input,
          expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
          actualOutput: normalizeOutput(runStdout),
          stderr: 'Time Limit Exceeded (3000 ms)',
          runtimeMs: elapsed,
          timedOut: true,
        });
        continue;
      }

      if (runCode !== 0) {
        if (overallStatus === 'Accepted') overallStatus = 'Runtime Error';
        results.push({
          testCaseId: tc.id,
          passed: false,
          isHidden: Boolean(tc.isHidden),
          input: tc.isHidden ? '[Hidden]' : tc.input,
          expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
          actualOutput: normalizeOutput(runStdout),
          stderr: runStderr || `Exited with status ${runCode}`,
          runtimeMs: elapsed,
        });
        continue;
      }

      const actual = normalizeOutput(runStdout);
      const expected = normalizeOutput(tc.expectedOutput || '');
      const passed = actual === expected;
      if (passed) {
        passedCount++;
      } else if (overallStatus === 'Accepted') {
        overallStatus = 'Wrong Answer';
      }

      results.push({
        testCaseId: tc.id,
        passed,
        isHidden: Boolean(tc.isHidden),
        input: tc.isHidden ? '[Hidden]' : tc.input,
        expectedOutput: tc.isHidden ? '[Hidden]' : expected,
        actualOutput: tc.isHidden ? (passed ? '[Hidden]' : 'Mismatch on hidden case') : actual,
        stderr: runStderr || undefined,
        runtimeMs: elapsed,
      });
    }

    return NextResponse.json({
      fallbackRequired: false,
      summary: {
        status: overallStatus,
        engine: 'piston',
        runtimeMs: totalRuntimeMs,
        passedCount,
        totalCount: testCases.length,
        results,
      },
    });
  } catch (error) {
    console.error('Execution proxy error:', error);
    return NextResponse.json({
      fallbackRequired: true,
      reason: 'Could not reach Piston service; falling back to local browser worker.',
    });
  }
}
