export type Language = 'python' | 'javascript' | 'cpp';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type UserRole = 'learner' | 'mentor' | 'admin';
export type SubmissionStatus =
  | 'Accepted'
  | 'Wrong Answer'
  | 'Time Limit Exceeded'
  | 'Runtime Error';

export interface PublicProfile {
  uid: string;
  nickname: string;
  role: UserRole;
  avatarInitials: string;
  githubHandle?: string;
  telegramHandle?: string;
  stack?: string[];
  tags?: string[];
  badges?: string[];
  completedTrackSlugs?: string[];
  weeklyXpWeek?: string;
  xp: number;
  weeklyXp: number;
  currentStreak: number;
  longestStreak: number;
  solvedEasy: number;
  solvedMedium: number;
  solvedHard: number;
  completedModulesCount: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface UserPrivate {
  uid: string;
  email: string;
  lastSolvedDate: string;
  solvedProblemIds: string[];
  completedModuleIds: string[];
  thinkPassedProblemIds: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SyllabusModule {
  id: string;
  title: string;
  summary: string;
  readingMinutes: number;
  xpReward: number;
  theoryMarkdown: string;
  linkedProblemId: string;
}

export interface Track {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  order: number;
  modules: SyllabusModule[];
  updatedAt?: unknown;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ThinkPrompt {
  question: string;
  codeSnippet: string;
  language: Language;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  trackSlug: string;
  isDaily: boolean;
  dailyDate?: string;
  xpReward: number;
  description: string;
  constraints: string;
  editorial: string;
  examples: ProblemExample[];
  starterCode: Record<Language, string>;
  thinkPrompt: ThinkPrompt;
  testCases: TestCase[];
  createdByUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface DiscussionComment {
  id: string;
  problemId: string;
  authorUid: string;
  authorNickname: string;
  authorRole: UserRole;
  body: string;
  codeSnippet: string;
  language: Language | 'none';
  parentId: string;
  isMentorAnswer: boolean;
  isPinned: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Submission {
  id: string;
  userUid: string;
  problemId: string;
  problemTitle: string;
  language: Language;
  code: string;
  status: SubmissionStatus;
  runtimeMs: number;
  passedCount: number;
  totalCount: number;
  thinkPassed: boolean;
  xpAwarded: number;
  createdAt?: unknown;
}

export interface WorkshopResources {
  slidesUrl?: string;
  repoUrl?: string;
  notebookUrl?: string;
  problemSetUrl?: string;
  replayUrl?: string;
}

export interface Workshop {
  id: string;
  issueNumber: string;
  title: string;
  summary: string;
  trackSlug: string;
  startsAtIso: string;
  academyTimezone: string;
  prerequisites: string;
  locationUrl: string;
  isUpcoming: boolean;
  agenda?: string[];
  resources: WorkshopResources;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface WorkshopRsvp {
  uid: string;
  nickname: string;
  rsvpedAt?: unknown;
}

export interface WorkshopTopicFeedback {
  uid: string;
  nickname: string;
  works: boolean;
  suggestion: string;
  updatedAt?: unknown;
}

export interface TestCaseExecutionResult {
  testCaseId: string;
  passed: boolean;
  isHidden: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  stderr?: string;
  runtimeMs: number;
  timedOut?: boolean;
}

export interface ExecutionSummary {
  status: SubmissionStatus;
  engine: 'piston' | 'local-js-worker' | 'local-pyodide-worker' | 'unavailable';
  runtimeMs: number;
  passedCount: number;
  totalCount: number;
  results: TestCaseExecutionResult[];
  message?: string;
}
