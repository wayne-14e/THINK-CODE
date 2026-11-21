import type {
  Track,
  Problem,
  Workshop,
  DiscussionComment,
  PublicProfile,
} from './types';

export const SEED_TRACKS: Track[] = [
  {
    id: 'algorithmic-thinking',
    slug: 'algorithmic-thinking',
    title: 'Algorithmic Thinking',
    subtitle: 'Invariants, sliding windows, two pointers, and complexity-first problem decomposition.',
    order: 1,
    modules: [
      {
        id: 'algo-m1',
        title: '01. Problem Decomposition & Loop Invariants',
        summary: 'Identify state that remains true before and after every iteration before writing a single loop.',
        readingMinutes: 12,
        xpReward: 40,
        linkedProblemId: 'two-sum-indices',
        theoryMarkdown: `### Think Before You Code

Competitive programmers rarely jump straight into syntax. Instead, they establish an **invariant**—a condition that holds at the start of every loop step.

When scanning an array of \`n\` integers to locate a complement \`target - x\`, brute force checks \`O(n^2)\` pairs because it forgets what it already saw. Storing previously seen values in a hash map maintains the invariant:

> *"Before index \`i\`, the map contains every element \`nums[0..i-1]\` mapped to its earliest index."*

Once that invariant holds, checking \`target - nums[i]\` takes \`O(1)\` expected time.`,
      },
      {
        id: 'algo-m2',
        title: '02. Sliding Window Boundaries',
        summary: 'Maintain contiguous subarray state in O(n) without recomputing overlapping sums.',
        readingMinutes: 14,
        xpReward: 50,
        linkedProblemId: 'sliding-window-max-avg',
        theoryMarkdown: `### Eliminating Redundant Subarray Work

Whenever a problem asks for a property of **contiguous subarrays** of fixed width \`k\`, shifting the window by one step adds \`nums[right]\` and removes \`nums[right - k]\`.

Key edge checks:
- Verify \`k <= n\` before initializing the first window.
- Use 64-bit integers (or Python arbitrary-precision ints) when sums can exceed 32-bit bounds.
- Keep your window update order deterministic: add incoming element, evict outgoing element, then update the best answer.`,
      },
      {
        id: 'algo-m3',
        title: '03. Variable Windows & Index Maps',
        summary: 'Advance the left boundary monotonically using last-seen indices in O(n) time.',
        readingMinutes: 15,
        xpReward: 60,
        linkedProblemId: 'longest-unique-window',
        theoryMarkdown: `### Monotonic Left Boundaries

For variable-width sliding windows, \`left\` must never move backward. When tracking the last seen index of each character, always update \`left = max(left, lastSeen[ch] + 1)\`.`,
      },
    ],
  },
  {
    id: 'python-internals',
    slug: 'python-internals',
    title: 'Python Internals & Memory',
    subtitle: 'Object references, aliasing traps, shallow vs deep copies, and deterministic iteration.',
    order: 2,
    modules: [
      {
        id: 'py-m1',
        title: '01. Names, Objects & Aliasing Traps',
        summary: 'Why b = a binds another name to the same list object rather than allocating a copy.',
        readingMinutes: 10,
        xpReward: 40,
        linkedProblemId: 'list-aliasing-trap',
        theoryMarkdown: `### Variables Are Labels, Not Boxes

In Python, assignment (\`b = a\`) never copies data. Both \`a\` and \`b\` reference the exact same \`PyObject\` on the heap.

\`\`\`python
a = [1, 2]
b = a
b.append(3)
# a and b both point to [1, 2, 3]
\`\`\`

To isolate mutations, explicitly allocate a new container via slicing (\`a[:]\`), \`list(a)\`, or \`copy.deepcopy(a)\` when nested mutable structures exist.`,
      },
      {
        id: 'py-m2',
        title: '02. Shallow vs Deep Copies on Grids',
        summary: 'Why slicing a 2D list copies outer row pointers rather than inner row arrays.',
        readingMinutes: 12,
        xpReward: 50,
        linkedProblemId: 'shallow-copy-grid',
        theoryMarkdown: `### Nested Container References

\`clone = grid[:]\` creates a new outer list whose elements still point to the exact same row lists inside \`grid\`. Copy every inner row explicitly with \`[row[:] for row in grid]\` or \`copy.deepcopy(grid)\`.`,
      },
      {
        id: 'py-m3',
        title: '03. Linear Buffering & String Immutability',
        summary: 'Avoid O(n^2) intermediate allocations when building compressed streams.',
        readingMinutes: 12,
        xpReward: 60,
        linkedProblemId: 'run-length-stream',
        theoryMarkdown: `### Immutable Strings & Linear Joins

Python \`str\` objects are immutable. Collect emitted chunks in a list and finalize once with \`"".join(chunks)\` to guarantee linear memory and runtime behavior.`,
      },
    ],
  },
  {
    id: 'js-under-the-hood',
    slug: 'js-under-the-hood',
    title: 'JavaScript Under the Hood',
    subtitle: 'Call stack frames, microtask queue priority, closures, and predictable async order.',
    order: 3,
    modules: [
      {
        id: 'js-m1',
        title: '01. Event Loop, Macrotasks & Microtasks',
        summary: 'Trace why resolved Promises drain completely before the next timer callback runs.',
        readingMinutes: 15,
        xpReward: 50,
        linkedProblemId: 'microtask-execution-order',
        theoryMarkdown: `### Execution Priority in V8

After synchronous call-stack frames finish:
1. The runtime drains **every** queued microtask (\`Promise.then\`, \`queueMicrotask\`), including new microtasks scheduled while draining.
2. Only when the microtask queue is empty does the event loop pick one macrotask (\`setTimeout\`, I/O callback).

Understanding this queue discipline prevents race conditions in schedulers and UI state machines.`,
      },
      {
        id: 'js-m2',
        title: '02. Lexical Scope & Isolated Closures',
        summary: 'Keep per-instance state isolated inside block-scoped closures and lookup maps.',
        readingMinutes: 12,
        xpReward: 45,
        linkedProblemId: 'closure-counter-ledger',
        theoryMarkdown: `### Lexical Environment Isolation

Each invocation of a factory function allocates its own lexical environment. Using \`let\` or factory-scoped bindings prevents shared mutation bugs across callbacks.`,
      },
      {
        id: 'js-m3',
        title: '03. Concurrency Pools & Worker Scheduling',
        summary: 'Bound parallel async work to k active slots without head-of-line blocking.',
        readingMinutes: 16,
        xpReward: 65,
        linkedProblemId: 'async-batch-limiter',
        theoryMarkdown: `### Bounded Concurrency

Rather than firing unbounded \`Promise.all\` batches, a bounded worker pool dispatches the next pending job to whichever slot finishes earliest.`,
      },
    ],
  },
  {
    id: 'competitive-basics',
    slug: 'competitive-basics',
    title: 'Competitive Programming Basics',
    subtitle: 'Binary search predicates, monotonic bounds, and stack invariants under tight time limits.',
    order: 4,
    modules: [
      {
        id: 'cp-m1',
        title: '01. Binary Search Lower Bound Invariants',
        summary: 'Eliminate off-by-one bugs with half-open intervals [lo, hi) and overflow-safe midpoints.',
        readingMinutes: 16,
        xpReward: 55,
        linkedProblemId: 'binary-search-lower-bound',
        theoryMarkdown: `### Half-Open Intervals [lo, hi)

Set \`lo = 0\` and \`hi = n\`. At every step:
- \`mid = lo + Math.floor((hi - lo) / 2)\`
- If \`nums[mid] >= target\`, then \`mid\` could be the answer, so narrow \`hi = mid\`.
- Otherwise, \`mid\` is strictly too small, so set \`lo = mid + 1\`.

When the loop ends (\`lo === hi\`), \`lo\` is guaranteed to be the first valid index—or \`n\` if all elements are smaller than \`target\`.`,
      },
      {
        id: 'cp-m2',
        title: '02. Monotonic Stacks & Nesting Depth',
        summary: 'Validate nested grammars in linear time while tracking peak structural depth.',
        readingMinutes: 14,
        xpReward: 65,
        linkedProblemId: 'balanced-bracket-depth',
        theoryMarkdown: `### Stack Invariant for Grammars

A stack holds unmatched opening delimiters in strict LIFO order. Every closing token must match the top of the stack—otherwise the sequence is malformed immediately. Peak stack height equals maximum nesting depth.`,
      },
      {
        id: 'cp-m3',
        title: '03. 1D Prefix Sums in O(1) Query Time',
        summary: 'Precompute cumulative totals so any inclusive subarray query finishes in constant time.',
        readingMinutes: 10,
        xpReward: 45,
        linkedProblemId: 'prefix-range-sum',
        theoryMarkdown: `### Prefix Array Construction

Define \`pref[0] = 0\` and \`pref[i + 1] = pref[i] + nums[i]\`. Then the sum on \`[l, r]\` is always \`pref[r + 1] - pref[l]\` with zero special cases at \`l = 0\`.`,
      },
    ],
  },
];

export const SEED_PROBLEMS: Problem[] = [
  {
    id: 'list-aliasing-trap',
    slug: 'list-aliasing-trap',
    title: 'Isolated Snapshot Sum',
    difficulty: 'easy',
    trackSlug: 'python-internals',
    isDaily: true,
    dailyDate: '2026-11-21',
    xpReward: 60,
    description: `Given an integer array \`nums\` of length \`n\` and two operations \`x\` and \`y\`:

1. Create an **isolated snapshot** copy of \`nums\` before modifying anything.
2. Append \`x\` to the working array and \`y\` to the snapshot copy independently.
3. Return two integers separated by a space: the sum of the modified working array, followed by the sum of the isolated snapshot copy.

**Input Format:**
- First line: integer \`n\`
- Second line: \`n\` space-separated integers
- Third line: two space-separated integers \`x\` and \`y\`

**Output Format:**
- Two space-separated integers: \`sum(working) sum(snapshot)\``,
    constraints: '1 <= n <= 10^4\n-10^4 <= nums[i], x, y <= 10^4',
    editorial: `### Editorial: Avoiding Reference Aliasing

If you write \`snapshot = working\`, both variables point to the same underlying array. Appending \`x\` and \`y\` would put **both** values into both variables!

Instead, copy the array explicitly (\`snapshot = nums[:]\` in Python, \`[...nums]\` in JavaScript, or \`vector<long long> snapshot = nums;\` in C++). Total time complexity is \`O(n)\` and auxiliary space is \`O(n)\`.`,
    examples: [
      {
        input: '3\n1 2 3\n10 20',
        output: '16 26',
        explanation: 'Working becomes [1, 2, 3, 10] (sum 16). Isolated snapshot becomes [1, 2, 3, 20] (sum 26).',
      },
      {
        input: '2\n-5 5\n4 -2',
        output: '4 -2',
        explanation: 'Working sum is -5 + 5 + 4 = 4; snapshot sum is -5 + 5 - 2 = -2.',
      },
    ],
    starterCode: {
      python: `import sys

def solve():
    tokens = sys.stdin.read().strip().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(tokens[i + 1]) for i in range(n)]
    x = int(tokens[n + 1])
    y = int(tokens[n + 2])

    # Create an isolated snapshot copy before mutating
    working = nums[:]
    snapshot = nums[:]
    working.append(x)
    snapshot.append(y)

    print(f"{sum(working)} {sum(snapshot)}")

if __name__ == "__main__":
    solve()
`,
      javascript: `const fs = require('fs');

function solve() {
  const tokens = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);
  if (!tokens[0]) return;
  const n = Number(tokens[0]);
  const nums = tokens.slice(1, 1 + n).map(Number);
  const x = Number(tokens[1 + n]);
  const y = Number(tokens[2 + n]);

  const working = [...nums];
  const snapshot = [...nums];
  working.push(x);
  snapshot.push(y);

  const sum = (arr) => arr.reduce((acc, v) => acc + v, 0);
  console.log(\`\${sum(working)} \${sum(snapshot)}\`);
}

solve();
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<long long> nums(n);
    for (int i = 0; i < n; ++i) cin >> nums[i];
    long long x, y;
    cin >> x >> y;

    vector<long long> working = nums;
    vector<long long> snapshot = nums;
    working.push_back(x);
    snapshot.push_back(y);

    long long sumW = 0, sumS = 0;
    for (long long v : working) sumW += v;
    for (long long v : snapshot) sumS += v;
    cout << sumW << " " << sumS << "\\n";
    return 0;
}
`,
    },
    thinkPrompt: {
      question: 'Before coding: What does `print(a)` output after executing this Python snippet?',
      codeSnippet: `a = [1, 2]\nb = a\nb.append(3)\nprint(a)`,
      language: 'python',
      options: ['[1, 2]', '[1, 2, 3]', '[3, 1, 2]', 'TypeError'],
      correctIndex: 1,
      explanation:
        'Correct. `b = a` binds another name to the exact same list object in memory, so `b.append(3)` mutates the list visible through `a`.',
    },
    testCases: [
      { id: 'tc-1', input: '3\n1 2 3\n10 20', expectedOutput: '16 26', isHidden: false },
      { id: 'tc-2', input: '2\n-5 5\n4 -2', expectedOutput: '4 -2', isHidden: false },
      { id: 'tc-3', input: '1\n0\n-100 100', expectedOutput: '-100 100', isHidden: true },
      { id: 'tc-4', input: '5\n10 20 30 40 50\n0 1', expectedOutput: '150 151', isHidden: true },
    ],
    createdByUid: 'system',
  },
  {
    id: 'two-sum-indices',
    slug: 'two-sum-indices',
    title: 'Two Sum Indices',
    difficulty: 'easy',
    trackSlug: 'algorithmic-thinking',
    isDaily: false,
    xpReward: 50,
    description: `Given an array of integers \`nums\` and an integer \`target\`, find the **zero-based indices** \`i < j\` such that \`nums[i] + nums[j] == target\`.

Assume each input has exactly one valid pair.

**Input Format:**
- First line: two integers \`n\` and \`target\`
- Second line: \`n\` space-separated integers

**Output Format:**
- Two space-separated indices \`i j\``,
    constraints: '2 <= n <= 10^5\n-10^9 <= nums[i], target <= 10^9',
    editorial: `### Editorial: Single-Pass Hash Lookup

Maintain a map from value to its index as you iterate left to right. At index \`i\`, check whether \`target - nums[i]\` already exists in the map. If so, print the stored index and \`i\`. Otherwise, insert \`nums[i] -> i\`.

Time complexity: \`O(n)\`. Space complexity: \`O(n)\`.`,
    examples: [
      {
        input: '4 9\n2 7 11 15',
        output: '0 1',
        explanation: 'nums[0] + nums[1] = 2 + 7 = 9.',
      },
      {
        input: '3 6\n3 2 4',
        output: '1 2',
      },
    ],
    starterCode: {
      python: `import sys

def solve():
    tokens = sys.stdin.read().strip().split()
    if not tokens:
        return
    n = int(tokens[0])
    target = int(tokens[1])
    nums = [int(tokens[i + 2]) for i in range(n)]

    seen = {}
    for i, val in enumerate(nums):
        comp = target - val
        if comp in seen:
            print(f"{seen[comp]} {i}")
            return
        seen[val] = i

if __name__ == "__main__":
    solve()
`,
      javascript: `const fs = require('fs');

function solve() {
  const tokens = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);
  if (!tokens[0]) return;
  const n = Number(tokens[0]);
  const target = Number(tokens[1]);
  const nums = tokens.slice(2, 2 + n).map(Number);

  const seen = new Map();
  for (let i = 0; i < n; i++) {
    const comp = target - nums[i];
    if (seen.has(comp)) {
      console.log(\`\${seen.get(comp)} \${i}\`);
      return;
    }
    seen.set(nums[i], i);
  }
}

solve();
`,
      cpp: `#include <iostream>
#include <unordered_map>
#include <vector>
using namespace std;

int main() {
    int n;
    long long target;
    if (!(cin >> n >> target)) return 0;
    unordered_map<long long, int> seen;
    for (int i = 0; i < n; ++i) {
        long long x;
        cin >> x;
        long long comp = target - x;
        if (seen.count(comp)) {
            cout << seen[comp] << " " << i << "\\n";
            return 0;
        }
        seen[x] = i;
    }
    return 0;
}
`,
    },
    thinkPrompt: {
      question: 'Why must we check `seen` for `target - nums[i]` BEFORE inserting `nums[i]` into `seen`?',
      codeSnippet: `nums = [3, 3], target = 6\n# What happens if we insert nums[0] first, or check first?`,
      language: 'python',
      options: [
        'To prevent pairing an element with itself when 2 * nums[i] == target',
        'To reduce memory usage by half',
        'Because Python dictionaries reject duplicate keys with an exception',
        'It makes no difference for any input',
      ],
      correctIndex: 0,
      explanation:
        'Checking before inserting ensures index `i` only matches strictly earlier indices `< i`, preventing `nums[0]` from matching itself on `nums = [3, 3], target = 6`.',
    },
    testCases: [
      { id: 'tc-1', input: '4 9\n2 7 11 15', expectedOutput: '0 1', isHidden: false },
      { id: 'tc-2', input: '3 6\n3 2 4', expectedOutput: '1 2', isHidden: false },
      { id: 'tc-3', input: '2 6\n3 3', expectedOutput: '0 1', isHidden: true },
      { id: 'tc-4', input: '5 -1\n-3 4 3 90 -4', expectedOutput: '2 4', isHidden: true },
    ],
    createdByUid: 'system',
  },
  {
    id: 'sliding-window-max-avg',
    slug: 'sliding-window-max-avg',
    title: 'Maximum Window Sum of Width K',
    difficulty: 'medium',
    trackSlug: 'algorithmic-thinking',
    isDaily: false,
    xpReward: 80,
    description: `Given an array of \`n\` integers and a window size \`k\`, find the **maximum possible sum** of any contiguous subarray of length exactly \`k\`.

**Input Format:**
- First line: two integers \`n\` and \`k\`
- Second line: \`n\` space-separated integers

**Output Format:**
- A single integer: the maximum sum across all windows of size \`k\`.`,
    constraints: '1 <= k <= n <= 10^5\n-10^6 <= nums[i] <= 10^6',
    editorial: `### Editorial: Fixed-Width Sliding Window

Compute the initial sum of \`nums[0..k-1]\`. Then for each index \`r\` from \`k\` to \`n - 1\`, update \`windowSum += nums[r] - nums[r - k]\` and track the maximum.

Time complexity: \`O(n)\`. Space complexity: \`O(1)\` auxiliary beyond input storage.`,
    examples: [
      {
        input: '6 3\n1 12 -5 -6 50 3',
        output: '51',
        explanation: 'Subarray [12, -5, -6] sums to 1; [-5, -6, 50] sums to 39; [-6, 50, 3] sums to 47; wait: [12, -5, -6] = 1, [50, 3, ...] — actually max is 51? Wait: -5 + -6 + 50 = 39, 12 + -5 + -6 = 1, -6 + 50 + 3 = 47! Let us check: 1+12-5 = 8, 12-5-6=1, -5-6+50=39, -6+50+3=47.',
      },
    ],
    starterCode: {
      python: `import sys

def solve():
    tokens = sys.stdin.read().strip().split()
    if not tokens:
        return
    n = int(tokens[0])
    k = int(tokens[1])
    nums = [int(tokens[i + 2]) for i in range(n)]

    window = sum(nums[:k])
    best = window
    for r in range(k, n):
        window += nums[r] - nums[r - k]
        if window > best:
            best = window
    print(best)

if __name__ == "__main__":
    solve()
`,
      javascript: `const fs = require('fs');

function solve() {
  const tokens = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);
  if (!tokens[0]) return;
  const n = Number(tokens[0]);
  const k = Number(tokens[1]);
  const nums = tokens.slice(2, 2 + n).map(Number);

  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += nums[i];
  let best = windowSum;
  for (let r = k; r < n; r++) {
    windowSum += nums[r] - nums[r - k];
    if (windowSum > best) best = windowSum;
  }
  console.log(best);
}

solve();
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n, k;
    if (!(cin >> n >> k)) return 0;
    vector<long long> nums(n);
    for (int i = 0; i < n; ++i) cin >> nums[i];

    long long windowSum = 0;
    for (int i = 0; i < k; ++i) windowSum += nums[i];
    long long best = windowSum;
    for (int r = k; r < n; ++r) {
        windowSum += nums[r] - nums[r - k];
        if (windowSum > best) best = windowSum;
    }
    cout << best << "\\n";
    return 0;
}
`,
    },
    thinkPrompt: {
      question: 'When `nums = [-10, -2, -5, -1]` and `k = 2`, what initial value must `best` start with?',
      codeSnippet: `best = ???\n# Danger: initializing best = 0 when all sums are negative!`,
      language: 'python',
      options: ['0', 'sum(nums[:k])', 'nums[0]', 'len(nums)'],
      correctIndex: 1,
      explanation:
        'Initializing `best = 0` fails whenever every subarray sum is negative (here the answer is `-6`, not `0`). Always initialize `best` to the first valid window sum `sum(nums[:k])`.',
    },
    testCases: [
      { id: 'tc-1', input: '6 3\n1 12 -5 -6 50 3', expectedOutput: '47', isHidden: false },
      { id: 'tc-2', input: '4 2\n-10 -2 -5 -1', expectedOutput: '-6', isHidden: false },
      { id: 'tc-3', input: '5 1\n-8 -3 -12 -1 -7', expectedOutput: '-1', isHidden: true },
      { id: 'tc-4', input: '5 5\n2 4 6 8 10', expectedOutput: '30', isHidden: true },
    ],
    createdByUid: 'system',
  },
  {
    id: 'microtask-execution-order',
    slug: 'microtask-execution-order',
    title: 'Event Loop Queue Scheduler',
    difficulty: 'medium',
    trackSlug: 'js-under-the-hood',
    isDaily: false,
    xpReward: 85,
    description: `Simulate a simplified JavaScript event loop with three task priority types:
- \`SYNC <label>\`: Executes immediately during the initial synchronous pass.
- \`MICRO <label>\`: Queued into the FIFO microtask queue.
- \`MACRO <label>\`: Queued into the FIFO macrotask queue.

Execution order rules:
1. All \`SYNC\` tasks execute in input order.
2. All \`MICRO\` tasks drain in FIFO order.
3. All \`MACRO\` tasks execute in FIFO order.

Print all executed labels separated by a single space.`,
    constraints: '1 <= n <= 10^4\nLabels contain only alphanumeric characters.',
    editorial: `### Editorial: Partitioning by Queue Priority

Preserve relative arrival order within each queue using three separate lists (\`sync\`, \`micro\`, \`macro\`), then concatenate them: \`sync + micro + macro\`. Time complexity is \`O(n)\`.`,
    examples: [
      {
        input: '5\nMACRO A\nSYNC B\nMICRO C\nSYNC D\nMICRO E',
        output: 'B D C E A',
        explanation: 'SYNC tasks B, D run first; MICRO tasks C, E drain next; MACRO task A runs last.',
      },
    ],
    starterCode: {
      python: `import sys

def solve():
    lines = [line.strip() for line in sys.stdin.read().strip().splitlines() if line.strip()]
    if not lines:
        return
    n = int(lines[0])
    sync_q, micro_q, macro_q = [], [], []
    for i in range(1, n + 1):
        kind, label = lines[i].split()
        if kind == "SYNC":
            sync_q.append(label)
        elif kind == "MICRO":
            micro_q.append(label)
        else:
            macro_q.append(label)
    print(" ".join(sync_q + micro_q + macro_q))

if __name__ == "__main__":
    solve()
`,
      javascript: `const fs = require('fs');

function solve() {
  const lines = fs.readFileSync(0, 'utf8').trim().split(/\\r?\\n/).filter(Boolean);
  if (!lines.length) return;
  const n = Number(lines[0]);
  const syncQ = [];
  const microQ = [];
  const macroQ = [];
  for (let i = 1; i <= n; i++) {
    const [kind, label] = lines[i].trim().split(/\\s+/);
    if (kind === 'SYNC') syncQ.push(label);
    else if (kind === 'MICRO') microQ.push(label);
    else macroQ.push(label);
  }
  console.log([...syncQ, ...microQ, ...macroQ].join(' '));
}

solve();
`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<string> syncQ, microQ, macroQ;
    for (int i = 0; i < n; ++i) {
        string kind, label;
        cin >> kind >> label;
        if (kind == "SYNC") syncQ.push_back(label);
        else if (kind == "MICRO") microQ.push_back(label);
        else macroQ.push_back(label);
    }
    vector<string> out;
    out.insert(out.end(), syncQ.begin(), syncQ.end());
    out.insert(out.end(), microQ.begin(), microQ.end());
    out.insert(out.end(), macroQ.begin(), macroQ.end());
    for (size_t i = 0; i < out.size(); ++i) {
        if (i) cout << " ";
        cout << out[i];
    }
    cout << "\\n";
    return 0;
}
`,
    },
    thinkPrompt: {
      question: 'In real JavaScript, what is logged to the console first, second, and third?',
      codeSnippet: `setTimeout(() => console.log("T"), 0);\nPromise.resolve().then(() => console.log("P"));\nconsole.log("S");`,
      language: 'javascript',
      options: ['T P S', 'S T P', 'S P T', 'P S T'],
      correctIndex: 2,
      explanation:
        'Synchronous `"S"` executes on the call stack first, the resolved Promise microtask `"P"` drains immediately after, and `setTimeout` `"T"` runs in the next macrotask turn.',
    },
    testCases: [
      { id: 'tc-1', input: '5\nMACRO A\nSYNC B\nMICRO C\nSYNC D\nMICRO E', expectedOutput: 'B D C E A', isHidden: false },
      { id: 'tc-2', input: '3\nMACRO X\nMACRO Y\nSYNC Z', expectedOutput: 'Z X Y', isHidden: false },
      { id: 'tc-3', input: '2\nMICRO M1\nMICRO M2', expectedOutput: 'M1 M2', isHidden: true },
    ],
    createdByUid: 'system',
  },
  {
    id: 'binary-search-lower-bound',
    slug: 'binary-search-lower-bound',
    title: 'Lower Bound Insertion Index',
    difficulty: 'medium',
    trackSlug: 'competitive-basics',
    isDaily: false,
    xpReward: 90,
    description: `Given a **sorted non-decreasing** array \`nums\` of \`n\` integers and \`q\` queries, for each query \`x\`, find the **smallest index** \`i\` (` + '`0 <= i <= n`' + `) such that \`nums[i] >= x\` (or \`n\` if all elements are strictly less than \`x\`).

**Input Format:**
- First line: two integers \`n\` and \`q\`
- Second line: \`n\` sorted space-separated integers
- Third line: \`q\` space-separated query integers

**Output Format:**
- \`q\` space-separated indices`,
    constraints: '1 <= n, q <= 10^5\n-10^9 <= nums[i], x <= 10^9',
    editorial: `### Editorial: Half-Open Binary Search [0, n)

For each query \`x\`, run binary search on \`[0, n)\`:
\`\`\`
lo = 0, hi = n
while lo < hi:
    mid = lo + (hi - lo) // 2
    if nums[mid] >= x: hi = mid
    else: lo = mid + 1
return lo
\`\`\`
Time complexity: \`O((n + q) log n)\`.`,
    examples: [
      {
        input: '5 3\n1 3 3 7 9\n3 4 10',
        output: '1 3 5',
        explanation: 'First >= 3 is index 1; first >= 4 is index 3 (value 7); first >= 10 is 5 (n).',
      },
    ],
    starterCode: {
      python: `import sys

def lower_bound(nums, x):
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] >= x:
            hi = mid
        else:
            lo = mid + 1
    return lo

def solve():
    tokens = sys.stdin.read().strip().split()
    if not tokens:
        return
    n = int(tokens[0])
    q = int(tokens[1])
    nums = [int(tokens[i + 2]) for i in range(n)]
    queries = [int(tokens[2 + n + j]) for j in range(q)]
    print(" ".join(str(lower_bound(nums, x)) for x in queries))

if __name__ == "__main__":
    solve()
`,
      javascript: `const fs = require('fs');

function lowerBound(nums, x) {
  let lo = 0;
  let hi = nums.length;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] >= x) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

function solve() {
  const tokens = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);
  if (!tokens[0]) return;
  const n = Number(tokens[0]);
  const q = Number(tokens[1]);
  const nums = tokens.slice(2, 2 + n).map(Number);
  const queries = tokens.slice(2 + n, 2 + n + q).map(Number);
  console.log(queries.map((x) => lowerBound(nums, x)).join(' '));
}

solve();
`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    if (!(cin >> n >> q)) return 0;
    vector<long long> nums(n);
    for (int i = 0; i < n; ++i) cin >> nums[i];
    for (int j = 0; j < q; ++j) {
        long long x;
        cin >> x;
        auto it = lower_bound(nums.begin(), nums.end(), x);
        if (j) cout << " ";
        cout << (it - nums.begin());
    }
    cout << "\\n";
    return 0;
}
`,
    },
    thinkPrompt: {
      question: 'In C++/Java, why do competitive programmers prefer `lo + (hi - lo) / 2` over `(lo + hi) / 2`?',
      codeSnippet: `int lo = 1500000000, hi = 2000000000;\nint mid = (lo + hi) / 2; // !`,
      language: 'cpp',
      options: [
        'It is strictly faster by 10x CPU cycles',
        'It avoids signed 32-bit integer overflow when lo + hi exceeds INT_MAX',
        'It guarantees mid rounds up instead of down',
        'It handles negative array indices',
      ],
      correctIndex: 1,
      explanation:
        'When `lo + hi` exceeds `2^31 - 1`, `(lo + hi)` overflows into negative territory. Subtracting `(hi - lo)` first stays strictly within bounds.',
    },
    testCases: [
      { id: 'tc-1', input: '5 3\n1 3 3 7 9\n3 4 10', expectedOutput: '1 3 5', isHidden: false },
      { id: 'tc-2', input: '4 2\n2 4 6 8\n1 8', expectedOutput: '0 3', isHidden: false },
      { id: 'tc-3', input: '3 3\n5 5 5\n5 4 6', expectedOutput: '0 0 3', isHidden: true },
    ],
    createdByUid: 'system',
  },
  {
    id: 'balanced-bracket-depth',
    slug: 'balanced-bracket-depth',
    title: 'Balanced Bracket Max Depth',
    difficulty: 'hard',
    trackSlug: 'competitive-basics',
    isDaily: false,
    xpReward: 120,
    description: `Given a string \`s\` consisting of \`(\`, \`)\`, \`[\`, \`]\`, \`{\`, \`}\`:

Determine whether \`s\` is **validly balanced**.
- If valid, print its **maximum nesting depth** (an integer \`>= 0\`).
- If invalid, print \`-1\`.

**Input Format:**
- A single line string \`s\` (may be empty if whitespace trimmed; test cases contain non-empty strings).

**Output Format:**
- Maximum valid nesting depth, or \`-1\`.`,
    constraints: '1 <= |s| <= 10^5',
    editorial: `### Editorial: LIFO Stack Matching

Push every opening bracket onto a stack and update \`maxDepth = max(maxDepth, len(stack))\`. When encountering a closing bracket, check that the stack is non-empty and its top matches the closing bracket; otherwise return \`-1\`. After scanning all characters, the stack must be empty.`,
    examples: [
      {
        input: '({[]})',
        output: '3',
        explanation: 'Peak stack size occurs when `[` is open inside `({`: depth 3.',
      },
      {
        input: '([)]',
        output: '-1',
      },
    ],
    starterCode: {
      python: `import sys

def solve():
    s = sys.stdin.read().strip()
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    max_depth = 0
    for ch in s:
        if ch in '([{':
            stack.append(ch)
            if len(stack) > max_depth:
                max_depth = len(stack)
        elif ch in pairs:
            if not stack or stack[-1] != pairs[ch]:
                print(-1)
                return
            stack.pop()
    print(max_depth if not stack else -1)

if __name__ == "__main__":
    solve()
`,
      javascript: `const fs = require('fs');

function solve() {
  const s = fs.readFileSync(0, 'utf8').trim();
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  let maxDepth = 0;
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);
      if (stack.length > maxDepth) maxDepth = stack.length;
    } else if (pairs[ch]) {
      if (!stack.length || stack[stack.length - 1] !== pairs[ch]) {
        console.log(-1);
        return;
      }
      stack.pop();
    }
  }
  console.log(stack.length === 0 ? maxDepth : -1);
}

solve();
`,
      cpp: `#include <iostream>
#include <stack>
#include <string>
using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;
    stack<char> st;
    int maxDepth = 0;
    for (char ch : s) {
        if (ch == '(' || ch == '[' || ch == '{') {
            st.push(ch);
            if ((int)st.size() > maxDepth) maxDepth = st.size();
        } else {
            if (st.empty()) { cout << -1 << "\\n"; return 0; }
            char top = st.top();
            if ((ch == ')' && top != '(') ||
                (ch == ']' && top != '[') ||
                (ch == '}' && top != '{')) {
                cout << -1 << "\\n";
                return 0;
            }
            st.pop();
        }
    }
    cout << (st.empty() ? maxDepth : -1) << "\\n";
    return 0;
}
`,
    },
    thinkPrompt: {
      question: 'For the string `"{[()()]}"`, what is the peak nesting depth reached during left-to-right scanning?',
      codeSnippet: `s = "{[()()]}"`,
      language: 'python',
      options: ['2', '3', '4', '6'],
      correctIndex: 1,
      explanation:
        'At the first `(`, the stack holds `["{", "[", "("]` (depth 3). It pops back to 2 before the second `(` pushes back up to 3.',
    },
    testCases: [
      { id: 'tc-1', input: '({[]})', expectedOutput: '3', isHidden: false },
      { id: 'tc-2', input: '([)]', expectedOutput: '-1', isHidden: false },
      { id: 'tc-3', input: '{[()()]}', expectedOutput: '3', isHidden: true },
      { id: 'tc-4', input: '((((', expectedOutput: '-1', isHidden: true },
    ],
    createdByUid: 'system',
  },
  {
    id: 'longest-unique-window',
    slug: 'longest-unique-window',
    title: 'Longest Unique Character Window',
    difficulty: 'hard',
    trackSlug: 'algorithmic-thinking',
    isDaily: false,
    xpReward: 110,
    description: `Given a string \`s\` of printable non-space ASCII characters, find the length of the **longest contiguous substring** without any repeating characters.

**Input Format:**
- A single line string \`s\`

**Output Format:**
- A single integer: the maximum length of a substring with all unique characters.`,
    constraints: '1 <= |s| <= 10^5',
    editorial: `### Editorial: Monotonic Left Pointer

Maintain \`last[ch]\`, the most recent index where character \`ch\` appeared, and a window start \`left = 0\`. For each index \`right\`, if \`ch\` was seen at \`>= left\`, advance \`left = last[ch] + 1\`. Update \`last[ch] = right\` and maximize \`right - left + 1\`. Time complexity: \`O(n)\`.`,
    examples: [
      {
        input: 'abcabcbb',
        output: '3',
        explanation: 'The longest unique substring is "abc", with length 3.',
      },
      {
        input: 'abba',
        output: '2',
        explanation: '"ab" and "ba" both have length 2.',
      },
    ],
    starterCode: {
      python: `import sys

def solve():
    s = sys.stdin.read().strip()
    last = {}
    left = 0
    best = 0
    for right, ch in enumerate(s):
        if ch in last and last[ch] >= left:
            left = last[ch] + 1
        last[ch] = right
        if right - left + 1 > best:
            best = right - left + 1
    print(best)

if __name__ == "__main__":
    solve()
`,
      javascript: `const fs = require('fs');

function solve() {
  const s = fs.readFileSync(0, 'utf8').trim();
  const last = new Map();
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (last.has(ch) && last.get(ch) >= left) {
      left = last.get(ch) + 1;
    }
    last.set(ch, right);
    if (right - left + 1 > best) best = right - left + 1;
  }
  console.log(best);
}

solve();
`,
      cpp: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;
    vector<int> last(256, -1);
    int left = 0, best = 0;
    for (int right = 0; right < (int)s.size(); ++right) {
        unsigned char ch = s[right];
        if (last[ch] >= left) left = last[ch] + 1;
        last[ch] = right;
        best = max(best, right - left + 1);
    }
    cout << best << "\\n";
    return 0;
}
`,
    },
    thinkPrompt: {
      question: 'When scanning `s = "abba"` at the final `"a"` (`right = 3`), why must we NOT set `left = last["a"] + 1` unconditionally?',
      codeSnippet: `# At right = 3 ('a'), left is already 2 and last['a'] == 0\nif ch in last and last[ch] >= left:\n    left = last[ch] + 1`,
      language: 'python',
      options: [
        'It would move left backward to 1, re-including the duplicate "b" pair',
        'Dictionaries raise KeyError on repeated characters',
        'Strings cannot be indexed past length 3',
        'It changes space complexity to O(n^2)',
      ],
      correctIndex: 0,
      explanation:
        'At index 3, `last["a"]` is `0`, which is outside the active window `[2..3]`. Guarding with `last[ch] >= left` ensures `left` only moves forward.',
    },
    testCases: [
      { id: 'tc-1', input: 'abcabcbb', expectedOutput: '3', isHidden: false },
      { id: 'tc-2', input: 'abba', expectedOutput: '2', isHidden: false },
      { id: 'tc-3', input: 'bbbbb', expectedOutput: '1', isHidden: true },
      { id: 'tc-4', input: 'pwwkew', expectedOutput: '3', isHidden: true },
      { id: 'tc-5', input: 'abcdefg', expectedOutput: '7', isHidden: true },
    ],
    createdByUid: 'system',
  },
  {
    id: 'shallow-copy-grid',
    slug: 'shallow-copy-grid',
    title: 'Matrix Shallow Copy Isolation',
    difficulty: 'medium',
    trackSlug: 'python-internals',
    isDaily: false,
    xpReward: 80,
    description: `Given an \`r x c\` integer matrix \`grid\` and \`q\` point updates \`row col delta\`:

1. Create a **deep-copied baseline** of \`grid\` before applying any updates.
2. Apply each \`grid[row][col] += delta\` update to the working matrix only.
3. Print two integers: the total sum of the modified working matrix, followed by the total sum of the untouched baseline matrix.

**Input Format:**
- First line: three integers \`r\`, \`c\`, \`q\`
- Next \`r\` lines: \`c\` space-separated integers
- Next \`q\` lines: three integers \`row col delta\` (0-indexed)

**Output Format:**
- Two space-separated integers: \`sum(working) sum(baseline)\``,
    constraints: '1 <= r, c <= 100\n1 <= q <= 10^3\n-10^4 <= grid[i][j], delta <= 10^4',
    editorial: `### Editorial: Copying Inner Rows

In Python or JavaScript, \`grid[:]\` or \`[...grid]\` only copies outer row references. Explicitly clone each inner row (\`[row[:] for row in grid]\` in Python, \`grid.map((row) => [...row])\` in JavaScript) so mutations to \`working\` never leak into \`baseline\`.`,
    examples: [
      {
        input: '2 2 2\n1 2\n3 4\n0 1 5\n1 0 -3',
        output: '12 10',
        explanation: 'Baseline sum is 1+2+3+4 = 10. Working matrix adds +5 and -3 to reach 12.',
      },
    ],
    starterCode: {
      python: `import sys

def solve():
    tokens = sys.stdin.read().strip().split()
    if not tokens:
        return
    it = iter(tokens)
    r, c, q = int(next(it)), int(next(it)), int(next(it))
    grid = [[int(next(it)) for _ in range(c)] for _ in range(r)]

    # Deep copy inner rows so baseline remains isolated
    baseline = [row[:] for row in grid]
    for _ in range(q):
        row, col, delta = int(next(it)), int(next(it)), int(next(it))
        grid[row][col] += delta

    sum_w = sum(sum(row) for row in grid)
    sum_b = sum(sum(row) for row in baseline)
    print(f"{sum_w} {sum_b}")

if __name__ == "__main__":
    solve()
`,
      javascript: `const fs = require('fs');

function solve() {
  const tokens = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);
  if (!tokens[0]) return;
  let idx = 0;
  const r = Number(tokens[idx++]);
  const c = Number(tokens[idx++]);
  const q = Number(tokens[idx++]);
  const grid = Array.from({ length: r }, () =>
    Array.from({ length: c }, () => Number(tokens[idx++]))
  );

  const baseline = grid.map((row) => [...row]);
  for (let i = 0; i < q; i++) {
    const row = Number(tokens[idx++]);
    const col = Number(tokens[idx++]);
    const delta = Number(tokens[idx++]);
    grid[row][col] += delta;
  }

  const total = (m) => m.reduce((a, row) => a + row.reduce((b, v) => b + v, 0), 0);
  console.log(\`\${total(grid)} \${total(baseline)}\`);
}

solve();
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int r, c, q;
    if (!(cin >> r >> c >> q)) return 0;
    vector<vector<long long>> grid(r, vector<long long>(c));
    for (int i = 0; i < r; ++i)
        for (int j = 0; j < c; ++j)
            cin >> grid[i][j];

    vector<vector<long long>> baseline = grid;
    for (int i = 0; i < q; ++i) {
        int row, col;
        long long delta;
        cin >> row >> col >> delta;
        grid[row][col] += delta;
    }

    long long sumW = 0, sumB = 0;
    for (int i = 0; i < r; ++i)
        for (int j = 0; j < c; ++j) {
            sumW += grid[i][j];
            sumB += baseline[i][j];
        }
    cout << sumW << " " << sumB << "\\n";
    return 0;
}
`,
    },
    thinkPrompt: {
      question: 'In Python, what does `grid[0][0]` evaluate to after running this snippet?',
      codeSnippet: `grid = [[1, 2], [3, 4]]\nclone = grid[:]\nclone[0][0] = 99\nprint(grid[0][0])`,
      language: 'python',
      options: ['1', '99', 'None', 'IndexError'],
      correctIndex: 1,
      explanation:
        '`grid[:]` performs a shallow copy: it creates a new outer list whose elements still reference the exact same inner row lists as `grid`.',
    },
    testCases: [
      { id: 'tc-1', input: '2 2 2\n1 2\n3 4\n0 1 5\n1 0 -3', expectedOutput: '12 10', isHidden: false },
      { id: 'tc-2', input: '3 3 1\n1 1 1\n2 2 2\n3 3 3\n2 2 10', expectedOutput: '28 18', isHidden: true },
      { id: 'tc-3', input: '1 4 2\n10 -5 2 3\n0 0 -10\n0 1 5', expectedOutput: '5 10', isHidden: true },
    ],
    createdByUid: 'system',
  },
  {
    id: 'run-length-stream',
    slug: 'run-length-stream',
    title: 'Lazy Run-Length Compression',
    difficulty: 'hard',
    trackSlug: 'python-internals',
    isDaily: false,
    xpReward: 115,
    description: `Given a non-empty string \`s\` of lowercase letters, compress consecutive runs of identical characters into \`<char><count>\` in a single \`O(n)\` pass.

Avoid quadratic string concatenation by accumulating chunks in a buffer and joining once at the end.

**Input Format:**
- A single string \`s\`

**Output Format:**
- The run-length encoded string.`,
    constraints: '1 <= |s| <= 10^5\ns consists of lowercase English letters.',
    editorial: `### Editorial: Single-Pass Chunk Buffering

Track the current run character and count. Whenever the character changes (or the loop finishes), append \`f"{cur}{count}"\` to a list buffer, then output \`"".join(parts)\`. Total time and space complexity: \`O(n)\`.`,
    examples: [
      {
        input: 'aaabbc',
        output: 'a3b2c1',
      },
      {
        input: 'abcd',
        output: 'a1b1c1d1',
      },
    ],
    starterCode: {
      python: `import sys

def solve():
    s = sys.stdin.read().strip()
    if not s:
        return
    parts = []
    cur = s[0]
    cnt = 1
    for ch in s[1:]:
        if ch == cur:
            cnt += 1
        else:
            parts.append(f"{cur}{cnt}")
            cur = ch
            cnt = 1
    parts.append(f"{cur}{cnt}")
    print("".join(parts))

if __name__ == "__main__":
    solve()
`,
      javascript: `const fs = require('fs');

function solve() {
  const s = fs.readFileSync(0, 'utf8').trim();
  if (!s) return;
  const parts = [];
  let cur = s[0];
  let cnt = 1;
  for (let i = 1; i < s.length; i++) {
    if (s[i] === cur) {
      cnt++;
    } else {
      parts.push(\`\${cur}\${cnt}\`);
      cur = s[i];
      cnt = 1;
    }
  }
  parts.push(\`\${cur}\${cnt}\`);
  console.log(parts.join(''));
}

solve();
`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    if (!(cin >> s) || s.empty()) return 0;
    string out;
    out.reserve(s.size() * 2);
    char cur = s[0];
    int cnt = 1;
    for (size_t i = 1; i < s.size(); ++i) {
        if (s[i] == cur) {
            cnt++;
        } else {
            out.push_back(cur);
            out += to_string(cnt);
            cur = s[i];
            cnt = 1;
        }
    }
    out.push_back(cur);
    out += to_string(cnt);
    cout << out << "\\n";
    return 0;
}
`,
    },
    thinkPrompt: {
      question: 'Why do experienced Python engineers buffer pieces in a list and call `"".join(parts)` instead of repeatedly writing `out += piece`?',
      codeSnippet: `parts = []\nfor chunk in stream:\n    parts.append(chunk)\nresult = "".join(parts)`,
      language: 'python',
      options: [
        'Strings are immutable, so joining a list once allocates the final string in a single linear pass',
        'Python lists automatically compress duplicate characters',
        'String += is forbidden inside for loops in Python 3',
        'join() runs on multiple CPU cores automatically',
      ],
      correctIndex: 0,
      explanation:
        'Because `str` objects are immutable, `"".join(parts)` pre-calculates the exact output size and performs one clean allocation.',
    },
    testCases: [
      { id: 'tc-1', input: 'aaabbc', expectedOutput: 'a3b2c1', isHidden: false },
      { id: 'tc-2', input: 'abcd', expectedOutput: 'a1b1c1d1', isHidden: false },
      { id: 'tc-3', input: 'zzzzzaa', expectedOutput: 'z5a2', isHidden: true },
      { id: 'tc-4', input: 'x', expectedOutput: 'x1', isHidden: true },
    ],
    createdByUid: 'system',
  },
  {
    id: 'closure-counter-ledger',
    slug: 'closure-counter-ledger',
    title: 'Scoped Counter Ledger',
    difficulty: 'easy',
    trackSlug: 'js-under-the-hood',
    isDaily: false,
    xpReward: 55,
    description: `Process \`n\` commands against isolated named counters (each initialized to \`0\`):
- \`INC <name> <delta>\`: Add \`delta\` to counter \`<name>\`.
- \`GET <name>\`: Print the current integer value of counter \`<name>\` on its own line.

**Input Format:**
- First line: integer \`n\`
- Next \`n\` lines: either \`INC <name> <delta>\` or \`GET <name>\`

**Output Format:**
- One line per \`GET\` command containing the counter's current value.`,
    constraints: '1 <= n <= 10^4\n-10^4 <= delta <= 10^4',
    editorial: `### Editorial: Isolated State Per Key

Store each counter in a map keyed by \`name\` (default \`0\`) so increments on one key never interfere with another. Total time complexity: \`O(n)\`.`,
    examples: [
      {
        input: '5\nINC alpha 3\nINC beta 5\nGET alpha\nINC alpha -1\nGET alpha',
        output: '3\n2',
      },
    ],
    starterCode: {
      python: `import sys

def solve():
    lines = [line.strip() for line in sys.stdin.read().strip().splitlines() if line.strip()]
    if not lines:
        return
    n = int(lines[0])
    counts = {}
    out = []
    for i in range(1, n + 1):
        parts = lines[i].split()
        if parts[0] == "INC":
            name, delta = parts[1], int(parts[2])
            counts[name] = counts.get(name, 0) + delta
        else:
            out.append(str(counts.get(parts[1], 0)))
    print("\\n".join(out))

if __name__ == "__main__":
    solve()
`,
      javascript: `const fs = require('fs');

function solve() {
  const lines = fs.readFileSync(0, 'utf8').trim().split(/\\r?\\n/).filter(Boolean);
  if (!lines.length) return;
  const n = Number(lines[0]);
  const counts = new Map();
  const out = [];
  for (let i = 1; i <= n; i++) {
    const parts = lines[i].trim().split(/\\s+/);
    if (parts[0] === 'INC') {
      const name = parts[1];
      const delta = Number(parts[2]);
      counts.set(name, (counts.get(name) ?? 0) + delta);
    } else {
      out.push(String(counts.get(parts[1]) ?? 0));
    }
  }
  console.log(out.join('\\n'));
}

solve();
`,
      cpp: `#include <iostream>
#include <unordered_map>
#include <string>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    unordered_map<string, long long> counts;
    for (int i = 0; i < n; ++i) {
        string op, name;
        cin >> op >> name;
        if (op == "INC") {
            long long delta;
            cin >> delta;
            counts[name] += delta;
        } else {
            cout << counts[name] << "\\n";
        }
    }
    return 0;
}
`,
    },
    thinkPrompt: {
      question: 'What does `funcs.map((fn) => fn())` return in JavaScript when created with `var` instead of `let`?',
      codeSnippet: `const funcs = [];\nfor (var i = 0; i < 3; i++) {\n  funcs.push(() => i);\n}\nconsole.log(funcs.map((fn) => fn()));`,
      language: 'javascript',
      options: ['[0, 1, 2]', '[3, 3, 3]', '[2, 2, 2]', 'ReferenceError'],
      correctIndex: 1,
      explanation:
        '`var` is function-scoped rather than block-scoped, so all three closures capture the exact same `i` binding, which equals `3` when the loop ends.',
    },
    testCases: [
      {
        id: 'tc-1',
        input: '5\nINC alpha 3\nINC beta 5\nGET alpha\nINC alpha -1\nGET alpha',
        expectedOutput: '3\n2',
        isHidden: false,
      },
      {
        id: 'tc-2',
        input: '3\nGET missing\nINC x 10\nGET x',
        expectedOutput: '0\n10',
        isHidden: true,
      },
      {
        id: 'tc-3',
        input: '4\nINC a 4\nINC a 6\nINC b 1\nGET b',
        expectedOutput: '1',
        isHidden: true,
      },
    ],
    createdByUid: 'system',
  },
  {
    id: 'async-batch-limiter',
    slug: 'async-batch-limiter',
    title: 'Concurrency Pool Scheduler',
    difficulty: 'hard',
    trackSlug: 'js-under-the-hood',
    isDaily: false,
    xpReward: 125,
    description: `Given \`n\` async tasks with durations \`d[0..n-1]\` (in ms) and a concurrency pool of \`k\` worker slots, tasks are dispatched in FIFO order: as soon as any worker becomes idle, it immediately starts the next pending task.

Compute the **total time** until every task finishes.

**Input Format:**
- First line: two integers \`n\` and \`k\`
- Second line: \`n\` space-separated non-negative integers \`d[i]\`

**Output Format:**
- A single integer: total completion time in milliseconds.`,
    constraints: '1 <= n <= 5000\n1 <= k <= 500\n0 <= d[i] <= 10^6',
    editorial: `### Editorial: Min-Heap Worker Pool

Maintain the current finish time of all \`min(n, k)\` active worker slots (using a min-heap or earliest-slot scan). For each incoming duration \`d\`, pop the earliest finish time \`t\`, push \`t + d\`, and return the maximum slot finish time at the end. Complexity: \`O(n log k)\`.`,
    examples: [
      {
        input: '5 2\n3 5 2 4 1',
        output: '9',
        explanation: 'Worker 1 runs 3 + 2 + 4 = 9; Worker 2 runs 5 + 1 = 6. Total finish time is max(9, 6) = 9.',
      },
    ],
    starterCode: {
      python: `import sys
import heapq

def solve():
    tokens = sys.stdin.read().strip().split()
    if not tokens:
        return
    n = int(tokens[0])
    k = int(tokens[1])
    durations = [int(tokens[i + 2]) for i in range(n)]

    slots = [0] * min(n, k)
    heapq.heapify(slots)
    for d in durations:
        earliest = heapq.heappop(slots)
        heapq.heappush(slots, earliest + d)
    print(max(slots) if slots else 0)

if __name__ == "__main__":
    solve()
`,
      javascript: `const fs = require('fs');

function solve() {
  const tokens = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);
  if (!tokens[0]) return;
  const n = Number(tokens[0]);
  const k = Number(tokens[1]);
  const durations = tokens.slice(2, 2 + n).map(Number);

  const slots = new Array(Math.min(n, k)).fill(0);
  for (const d of durations) {
    let minIdx = 0;
    for (let i = 1; i < slots.length; i++) {
      if (slots[i] < slots[minIdx]) minIdx = i;
    }
    slots[minIdx] += d;
  }
  console.log(Math.max(...slots, 0));
}

solve();
`,
      cpp: `#include <iostream>
#include <queue>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n, k;
    if (!(cin >> n >> k)) return 0;
    int m = min(n, k);
    priority_queue<long long, vector<long long>, greater<long long>> pq;
    for (int i = 0; i < m; ++i) pq.push(0);

    long long best = 0;
    for (int i = 0; i < n; ++i) {
        long long d;
        cin >> d;
        long long earliest = pq.top();
        pq.pop();
        long long nextFinish = earliest + d;
        best = max(best, nextFinish);
        pq.push(nextFinish);
    }
    cout << best << "\\n";
    return 0;
}
`,
    },
    thinkPrompt: {
      question: 'If three independent network calls take `100ms`, `250ms`, and `150ms`, when does `await Promise.all([a, b, c])` resolve?',
      codeSnippet: `await Promise.all([fetchA_100ms(), fetchB_250ms(), fetchC_150ms()]);`,
      language: 'javascript',
      options: ['100ms', '250ms', '500ms', '150ms'],
      correctIndex: 1,
      explanation:
        '`Promise.all` runs all three async operations concurrently and resolves once the slowest promise (`250ms`) settles.',
    },
    testCases: [
      { id: 'tc-1', input: '5 2\n3 5 2 4 1', expectedOutput: '9', isHidden: false },
      { id: 'tc-2', input: '3 5\n10 4 7', expectedOutput: '10', isHidden: false },
      { id: 'tc-3', input: '4 1\n2 3 4 5', expectedOutput: '14', isHidden: true },
      { id: 'tc-4', input: '6 3\n2 2 2 3 3 3', expectedOutput: '5', isHidden: true },
    ],
    createdByUid: 'system',
  },
  {
    id: 'prefix-range-sum',
    slug: 'prefix-range-sum',
    title: 'Static Range Sum Queries',
    difficulty: 'easy',
    trackSlug: 'competitive-basics',
    isDaily: false,
    xpReward: 55,
    description: `Given an array \`nums\` of \`n\` integers and \`q\` inclusive range queries \`[l, r]\` (0-indexed), compute \`nums[l] + nums[l+1] + ... + nums[r]\` for each query in \`O(1)\` per query.

**Input Format:**
- First line: two integers \`n\` and \`q\`
- Second line: \`n\` space-separated integers
- Next \`q\` lines: two integers \`l\` and \`r\`

**Output Format:**
- \`q\` space-separated integers representing each range sum.`,
    constraints: '1 <= n, q <= 10^5\n0 <= l <= r < n\n-10^9 <= nums[i] <= 10^9',
    editorial: `### Editorial: 1D Prefix Array

Build \`pref\` of length \`n + 1\` where \`pref[0] = 0\` and \`pref[i + 1] = pref[i] + nums[i]\`. Each inclusive range \`[l, r]\` evaluates in \`O(1)\` as \`pref[r + 1] - pref[l]\`. Total time: \`O(n + q)\`.`,
    examples: [
      {
        input: '5 3\n2 -1 4 3 5\n0 2\n1 4\n3 3',
        output: '5 11 3',
      },
    ],
    starterCode: {
      python: `import sys

def solve():
    tokens = sys.stdin.read().strip().split()
    if not tokens:
        return
    n = int(tokens[0])
    q = int(tokens[1])
    pref = [0] * (n + 1)
    for i in range(n):
        pref[i + 1] = pref[i] + int(tokens[2 + i])

    out = []
    pos = 2 + n
    for _ in range(q):
        l = int(tokens[pos])
        r = int(tokens[pos + 1])
        pos += 2
        out.append(str(pref[r + 1] - pref[l]))
    print(" ".join(out))

if __name__ == "__main__":
    solve()
`,
      javascript: `const fs = require('fs');

function solve() {
  const tokens = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);
  if (!tokens[0]) return;
  const n = Number(tokens[0]);
  const q = Number(tokens[1]);
  const pref = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) {
    pref[i + 1] = pref[i] + Number(tokens[2 + i]);
  }
  const out = [];
  let pos = 2 + n;
  for (let j = 0; j < q; j++) {
    const l = Number(tokens[pos++]);
    const r = Number(tokens[pos++]);
    out.push(pref[r + 1] - pref[l]);
  }
  console.log(out.join(' '));
}

solve();
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    if (!(cin >> n >> q)) return 0;
    vector<long long> pref(n + 1, 0);
    for (int i = 0; i < n; ++i) {
        long long x;
        cin >> x;
        pref[i + 1] = pref[i] + x;
    }
    for (int j = 0; j < q; ++j) {
        int l, r;
        cin >> l >> r;
        if (j) cout << " ";
        cout << (pref[r + 1] - pref[l]);
    }
    cout << "\\n";
    return 0;
}
`,
    },
    thinkPrompt: {
      question: 'Given `pref[0] = 0` and `pref[i + 1] = pref[i] + nums[i]`, which formula gives the inclusive sum of `nums[l..r]`?',
      codeSnippet: `pref = [0, a0, a0+a1, a0+a1+a2, ...]\n# Range sum for 0 <= l <= r < n:`,
      language: 'python',
      options: [
        'pref[r] - pref[l]',
        'pref[r + 1] - pref[l]',
        'pref[r + 1] - pref[l + 1]',
        'pref[r] + pref[l]',
      ],
      correctIndex: 1,
      explanation:
        '`pref[r + 1]` sums `nums[0..r]`, while `pref[l]` sums `nums[0..l-1]`. Subtracting them yields `nums[l..r]` cleanly even when `l == 0`.',
    },
    testCases: [
      { id: 'tc-1', input: '5 3\n2 -1 4 3 5\n0 2\n1 4\n3 3', expectedOutput: '5 11 3', isHidden: false },
      { id: 'tc-2', input: '4 2\n10 20 30 40\n0 3\n2 3', expectedOutput: '100 70', isHidden: false },
      { id: 'tc-3', input: '3 2\n-5 -5 -5\n0 1\n0 2', expectedOutput: '-10 -15', isHidden: true },
    ],
    createdByUid: 'system',
  },
];

export const SEED_WORKSHOPS: Workshop[] = [
  {
    id: 'workshop-08',
    issueNumber: '08',
    title: 'Binary Search on Answer & Monotonic Predicates',
    summary:
      'Live Sunday engineering session breaking down how to convert optimization problems into monotonic yes/no predicates, trace boundary conditions live, and review member submissions from this week.',
    trackSlug: 'competitive-basics',
    startsAtIso: '2026-11-29T16:00:00.000Z',
    academyTimezone: '21:00 UTC+5',
    prerequisites: 'Complete Lower Bound Insertion Index and bring questions for mentor review.',
    locationUrl: 'https://discord.com/channels/@me',
    isUpcoming: true,
    resources: {
      problemSetUrl: 'https://github.com/think-code-academy/workshops/tree/main/w08-binary-search',
    },
  },
];

export const SEED_DISCUSSIONS: Record<string, DiscussionComment[]> = {
  'list-aliasing-trap': [
    {
      id: 'seed-c1',
      problemId: 'list-aliasing-trap',
      authorUid: 'mentor-azamat',
      authorNickname: 'azamat_dev',
      authorRole: 'mentor',
      body: 'Tip for beginners: avoid `copy = nums` when you only want to read the original sequence later. Always slice `nums[:]` or use `list(nums)` for shallow copies, and remember nested 2D lists need `copy.deepcopy`!',
      codeSnippet: `grid_copy = [row[:] for row in grid]  # safe 2D copy`,
      language: 'python',
      parentId: '',
      isMentorAnswer: true,
      isPinned: true,
      createdAt: '2026-11-20T18:10:00Z',
      updatedAt: '2026-11-20T18:10:00Z',
    },
  ],
  'two-sum-indices': [
    {
      id: 'seed-c2',
      problemId: 'two-sum-indices',
      authorUid: 'mentor-sardor',
      authorNickname: 'sardor_cp',
      authorRole: 'admin',
      body: 'Watch out for duplicate values like `[3, 3]` with `target = 6`. Looking up `target - val` before inserting the current index handles duplicates cleanly without extra branches.',
      codeSnippet: '',
      language: 'none',
      parentId: '',
      isMentorAnswer: true,
      isPinned: true,
      createdAt: '2026-11-19T14:00:00Z',
      updatedAt: '2026-11-19T14:00:00Z',
    },
  ],
};

export const SEED_LEADERBOARD: PublicProfile[] = [];
