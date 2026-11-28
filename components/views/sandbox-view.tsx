'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Editor, { type BeforeMount } from '@monaco-editor/react';
import Markdown from 'react-markdown';
import {
  AlertCircle,
  ArrowLeft,
  Brain,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Pin,
  Play,
  RotateCcw,
  Send,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useFirebase } from '../providers/firebase-provider';
import { useI18n } from '@/lib/i18n';
import { executeCodeSuite } from '@/lib/code-runner';
import type {
  DiscussionComment,
  ExecutionSummary,
  Language,
  Problem,
  SubmissionStatus,
} from '@/lib/types';

interface SandboxViewProps {
  problem: Problem;
  onBack: () => void;
}

type LeftTab = 'description' | 'think' | 'editorial' | 'discussion';
type MobilePane = 'problem' | 'editor' | 'tests';

const LANGUAGE_LABELS: Record<Language, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  cpp: 'C++',
};

const MONACO_LANGUAGE: Record<Language, string> = {
  python: 'python',
  javascript: 'javascript',
  cpp: 'cpp',
};

const defineThinkCodeTheme: BeforeMount = (monaco) => {
  monaco.editor.defineTheme('thinkcode-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6b7399', fontStyle: 'italic' },
      { token: 'keyword', foreground: '35ed7e' },
      { token: 'string', foreground: '8b95ff' },
      { token: 'number', foreground: '5cf295' },
      { token: 'type', foreground: 'b6bcdc' },
      { token: 'function', foreground: 'ffffff' },
    ],
    colors: {
      'editor.background': '#06081c',
      'editor.foreground': '#ffffff',
      'editorLineNumber.foreground': '#4c5480',
      'editorLineNumber.activeForeground': '#b6bcdc',
      'editor.selectionBackground': '#5865f266',
      'editor.inactiveSelectionBackground': '#5865f233',
      'editor.lineHighlightBackground': '#0e1230',
      'editorCursor.foreground': '#35ed7e',
      'editorIndentGuide.background1': '#171c3d',
      'editorIndentGuide.activeBackground1': '#5865f2',
      'editorWidget.background': '#0e1230',
      'editorWidget.border': '#252c55',
      'editorSuggestWidget.background': '#0e1230',
      'editorSuggestWidget.border': '#252c55',
      'editorSuggestWidget.selectedBackground': '#5865f2',
      'scrollbarSlider.background': '#252c5580',
      'scrollbarSlider.hoverBackground': '#7b83ab80',
      'scrollbarSlider.activeBackground': '#7b83abaa',
    },
  });
};

function StatusBadge({ status }: { status: SubmissionStatus | 'Running' }) {
  const { t } = useI18n();
  if (status === 'Running') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--status-info)]">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{t('Running')}</span>
      </span>
    );
  }
  if (status === 'Accepted') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--status-success)]">
        <CheckCircle2 className="w-4 h-4" />
        <span>{t('Accepted')}</span>
      </span>
    );
  }
  if (status === 'Time Limit Exceeded') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--status-warning)]">
        <Clock className="w-4 h-4" />
        <span>{t('Time Limit Exceeded')}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--status-error)]">
      <XCircle className="w-4 h-4" />
      <span>{status}</span>
    </span>
  );
}

export function SandboxView({ problem, onBack }: SandboxViewProps) {
  const {
    user,
    isAdmin,
    userPrivate,
    markThinkPassed,
    recordSubmission,
    subscribeDiscussions,
    postDiscussion,
    toggleMentorAnnotation,
  } = useFirebase();
  const { t } = useI18n();
  const [splitPct, setSplitPct] = useState<number>(() => {
    if (typeof window === 'undefined') return 40;
    try {
      const saved = window.localStorage.getItem('thinkcode_sandbox_split');
      if (saved) {
        const parsed = Number(saved);
        if (parsed >= 30 && parsed <= 55) return parsed;
      }
    } catch {
      // Ignore
    }
    return 40;
  });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const [leftTab, setLeftTab] = useState<LeftTab>('description');
  const [mobilePane, setMobilePane] = useState<MobilePane>('problem');

  // Language & unsaved code draft preservation
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'python';
    try {
      const savedLang = window.localStorage.getItem('thinkcode_sandbox_lang');
      if (savedLang === 'python' || savedLang === 'javascript' || savedLang === 'cpp') {
        return savedLang;
      }
    } catch {
      // Ignore
    }
    return 'python';
  });

  const [codeByLang, setCodeByLang] = useState<Record<Language, string>>(() => {
    const nextDrafts: Record<Language, string> = { ...problem.starterCode };
    if (typeof window === 'undefined') return nextDrafts;
    (['python', 'javascript', 'cpp'] as Language[]).forEach((lang) => {
      try {
        const saved = window.localStorage.getItem(`thinkcode_draft_${problem.id}_${lang}`);
        if (saved && saved.trim().length > 0) {
          nextDrafts[lang] = saved;
        }
      } catch {
        // Keep starter code
      }
    });
    return nextDrafts;
  });

  // Code Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [runMode, setRunMode] = useState<'sample' | 'submit'>('sample');
  const [execSummary, setExecSummary] = useState<ExecutionSummary | null>(null);
  const [activeTestIdx, setActiveTestIdx] = useState(0);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleLanguageChange = (nextLang: Language) => {
    setLanguage(nextLang);
    try {
      window.localStorage.setItem('thinkcode_sandbox_lang', nextLang);
    } catch {
      // Ignore
    }
  };

  const handleCodeChange = (val: string | undefined) => {
    const next = val ?? '';
    setCodeByLang((prev) => ({ ...prev, [language]: next }));
    try {
      window.localStorage.setItem(`thinkcode_draft_${problem.id}_${language}`, next);
    } catch {
      // Ignore
    }
  };

  const handleResetCode = () => {
    const starter = problem.starterCode[language];
    setCodeByLang((prev) => ({ ...prev, [language]: starter }));
    try {
      window.localStorage.removeItem(`thinkcode_draft_${problem.id}_${language}`);
    } catch {
      // Ignore
    }
  };

  // Drag handler for split divider
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const rawPct = ((e.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(55, Math.max(30, Math.round(rawPct)));
      setSplitPct(clamped);
    };
    const onUp = () => {
      if (draggingRef.current) {
        draggingRef.current = false;
        try {
          window.localStorage.setItem('thinkcode_sandbox_split', String(splitPct));
        } catch {
          // Ignore
        }
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [splitPct]);

  // Think-Before-You-Run state
  const thinkAlreadyPassed = userPrivate?.thinkPassedProblemIds.includes(problem.id) ?? false;
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [thinkFeedback, setThinkFeedback] = useState<'correct' | 'wrong' | null>(null);

  const effectiveSelected = thinkAlreadyPassed
    ? problem.thinkPrompt.correctIndex
    : selectedOption;
  const effectiveThinkFeedback = thinkAlreadyPassed ? 'correct' : thinkFeedback;

  const handleVerifyThink = async () => {
    if (effectiveSelected === null) return;
    if (effectiveSelected === problem.thinkPrompt.correctIndex) {
      setThinkFeedback('correct');
      if (user) {
        await markThinkPassed(problem.id);
      }
    } else {
      setThinkFeedback('wrong');
    }
  };

  const sampleCases = useMemo(
    () => problem.testCases.filter((tc) => !tc.isHidden),
    [problem.testCases]
  );

  const handleExecute = async (mode: 'sample' | 'submit') => {
    setIsRunning(true);
    setRunMode(mode);
    setSaveMessage(null);
    setMobilePane('tests');

    const targetCases = mode === 'sample' && sampleCases.length > 0 ? sampleCases : problem.testCases;
    try {
      const summary = await executeCodeSuite(language, codeByLang[language], targetCases);
      setExecSummary(summary);
      setActiveTestIdx(0);

      if (mode === 'submit' && summary.engine !== 'unavailable') {
        if (!user) {
          setSaveMessage(t('Sign in to save submissions, XP, and daily streaks.'));
        } else {
          const { xpAwarded, syncedToCloud } = await recordSubmission({
            problem,
            language,
            code: codeByLang[language],
            status: summary.status,
            runtimeMs: summary.runtimeMs,
            passedCount: summary.passedCount,
            totalCount: summary.totalCount,
            thinkPassed: effectiveThinkFeedback === 'correct' || thinkAlreadyPassed,
          });
          if (syncedToCloud) {
            setSaveMessage(
              xpAwarded > 0
                ? `Saved submission (+${xpAwarded} XP awarded).`
                : t('Submission recorded to your profile history.')
            );
          } else {
            setSaveMessage(
              t(
                'Executed locally. Admin curriculum sync is required to persist cloud submissions for starter problems.'
              )
            );
          }
        }
      }
    } finally {
      setIsRunning(false);
    }
  };

  // Discussions state
  const [comments, setComments] = useState<DiscussionComment[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [commentCode, setCommentCode] = useState('');
  const [commentLang, setCommentLang] = useState<Language | 'none'>('none');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    const unsub = subscribeDiscussions(problem.id, setComments);
    return () => unsub();
  }, [problem.id, subscribeDiscussions]);

  const handlePostDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setCommentError(null);
    setPostingComment(true);
    try {
      await postDiscussion({
        problemId: problem.id,
        body: commentBody,
        codeSnippet: commentCode,
        language: commentLang,
      });
      setCommentBody('');
      setCommentCode('');
      setCommentLang('none');
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : t('Unable to post comment.'));
    } finally {
      setPostingComment(false);
    }
  };

  const problemSolved = userPrivate?.solvedProblemIds.includes(problem.id) ?? false;

  const leftPanelContent = (
    <div className="flex flex-col h-full min-h-0">
      {/* Left Panel Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-[var(--surface-border)] bg-[var(--surface-overlay)]/40 overflow-x-auto shrink-0">
        {(
          [
            { id: 'description', label: t('Description') },
            { id: 'think', label: t('Think Check') },
            { id: 'editorial', label: t('Editorial') },
            { id: 'discussion', label: t('Mentor Discussion ({count})', { count: comments.length }) },
          ] as { id: LeftTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setLeftTab(tab.id)}
            className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              leftTab === tab.id
                ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--surface-border)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Left Panel Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {leftTab === 'description' && (
          <div className="space-y-6">
            <div className="prose prose-sm prose-invert max-w-none text-[var(--text-secondary)] prose-headings:text-[var(--text-primary)] prose-code:text-[var(--accent-cyan)] prose-a:text-[var(--brand-link)] prose-strong:text-[var(--text-primary)]">
              <Markdown>{problem.description}</Markdown>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{t('Examples')}</h3>
              {problem.examples.map((ex, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] p-3.5 space-y-2 text-xs font-mono"
                >
                  <div>
                    <span className="text-[var(--text-tertiary)]">{t('Input:')}</span>
                    <pre className="mt-1 text-[var(--text-primary)] whitespace-pre-wrap">
                      {ex.input}
                    </pre>
                  </div>
                  <div>
                    <span className="text-[var(--text-tertiary)]">{t('Output:')}</span>
                    <pre className="mt-1 text-[var(--brand-primary)] whitespace-pre-wrap">
                      {ex.output}
                    </pre>
                  </div>
                  {ex.explanation && (
                    <p className="font-sans text-xs text-[var(--text-secondary)] pt-1 border-t border-[var(--surface-border)]">
                      {ex.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{t('Constraints')}</h3>
              <pre className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] p-3 text-xs font-mono text-[var(--text-secondary)] whitespace-pre-wrap">
                {problem.constraints}
              </pre>
            </div>
          </div>
        )}

        {leftTab === 'think' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent-cyan)]">
              <Brain className="w-4 h-4" />
              <span>{t('Think Before You Run (+15 XP)')}</span>
            </div>

            <h3 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
              {problem.thinkPrompt.question}
            </h3>

            <pre className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] p-4 text-xs font-mono text-[var(--text-primary)] overflow-x-auto">
              {problem.thinkPrompt.codeSnippet}
            </pre>

            <div className="space-y-2" role="radiogroup" aria-label={t('Prediction choices')}>
              {problem.thinkPrompt.options.map((opt, idx) => {
                const chosen = effectiveSelected === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    role="radio"
                    aria-checked={chosen}
                    onClick={() => {
                      setSelectedOption(idx);
                      setThinkFeedback(null);
                    }}
                    className={`w-full min-h-[44px] text-left px-4 py-2.5 rounded-lg border text-sm font-mono transition-colors ${
                      chosen
                        ? 'border-[var(--brand-primary)] bg-[var(--surface-overlay)] text-[var(--text-primary)]'
                        : 'border-[var(--surface-border)] bg-[var(--surface-deep)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={effectiveSelected === null}
              onClick={() => void handleVerifyThink()}
              className="min-h-[40px] px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--brand-primary)] text-[var(--brand-ink)] hover:bg-[var(--brand-primary-hover)] disabled:opacity-50 transition-colors"
            >
              {t('Verify prediction')}
            </button>

            {effectiveThinkFeedback === 'correct' && (
              <div className="rounded-lg border border-[var(--status-success)]/40 bg-[var(--surface-deep)] p-4 space-y-1.5">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--status-success)]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('Trace verified')}</span>
                </p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {problem.thinkPrompt.explanation}
                </p>
              </div>
            )}

            {effectiveThinkFeedback === 'wrong' && (
              <div className="rounded-lg border border-[var(--status-error)]/40 bg-[var(--surface-deep)] p-4 space-y-1">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--status-error)]">
                  <XCircle className="w-4 h-4" />
                  <span>{t('Trace again')}</span>
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {t(
                    'Walk through each variable binding line by line before selecting another answer.'
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {leftTab === 'editorial' && (
          <div className="space-y-4">
            <p className="text-xs font-mono text-[var(--text-tertiary)]">
              {t('Official Academy Editorial')}
            </p>
            <div className="prose prose-sm prose-invert max-w-none text-[var(--text-secondary)] prose-headings:text-[var(--text-primary)] prose-code:text-[var(--accent-cyan)] prose-a:text-[var(--brand-link)] prose-strong:text-[var(--text-primary)]">
              <Markdown>{problem.editorial}</Markdown>
            </div>
          </div>
        )}

        {leftTab === 'discussion' && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {t('Ask a Human Mentor')}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {t(
                  'Share your reasoning or snippet. Academy mentors and peers review questions directly.'
                )}
              </p>
            </div>

            <form onSubmit={(e) => void handlePostDiscussion(e)} className="space-y-3">
              <textarea
                rows={3}
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder={
                  user
                    ? t('Explain where your trace diverges or share an optimization idea...')
                    : t('Sign in at the top right to post a question...')
                }
                disabled={!user || postingComment}
                className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)]"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  aria-label={t('Snippet language')}
                  value={commentLang}
                  onChange={(e) => setCommentLang(e.target.value as Language | 'none')}
                  disabled={!user || postingComment}
                  className="min-h-[36px] px-2.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-xs text-[var(--text-primary)]"
                >
                  <option value="none">{t('No code snippet')}</option>
                  <option value="python">{t('Python snippet')}</option>
                  <option value="javascript">{t('JavaScript snippet')}</option>
                  <option value="cpp">{t('C++ snippet')}</option>
                </select>
                {commentLang !== 'none' && (
                  <input
                    type="text"
                    value={commentCode}
                    onChange={(e) => setCommentCode(e.target.value)}
                    placeholder={t('Paste optional short snippet...')}
                    disabled={!user || postingComment}
                    className="flex-1 min-h-[36px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-xs font-mono text-[var(--text-primary)]"
                  />
                )}
                <button
                  type="submit"
                  disabled={!user || postingComment || !commentBody.trim()}
                  className="min-h-[36px] inline-flex items-center justify-center gap-1.5 px-4 rounded-lg text-xs font-semibold bg-[var(--brand-primary)] text-[var(--brand-ink)] hover:bg-[var(--brand-primary-hover)] disabled:opacity-50 whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{postingComment ? t('Posting...') : t('Post')}</span>
                </button>
              </div>
              {commentError && (
                <p className="text-xs text-[var(--status-error)]">{commentError}</p>
              )}
            </form>

            <div className="divide-y divide-[var(--surface-border)]">
              {comments.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--text-tertiary)]">
                  <MessageSquare className="w-5 h-5 mx-auto mb-2 opacity-60" />
                  <p>{t('No questions posted yet. Start the discussion above.')}</p>
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="py-4 space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[var(--text-primary)]">
                          {c.authorNickname}
                        </span>
                        {(c.isMentorAnswer || c.authorRole !== 'learner') && (
                          <span className="inline-flex items-center gap-1 font-mono text-[var(--brand-primary)]">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{t('Mentor')}</span>
                          </span>
                        )}
                        {c.isPinned && (
                          <span className="inline-flex items-center gap-1 font-mono text-[var(--accent-cyan)]">
                            <Pin className="w-3 h-3" />
                            <span>{t('Pinned')}</span>
                          </span>
                        )}
                      </div>

                      {isAdmin && !c.id.startsWith('seed-') && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void toggleMentorAnnotation(problem.id, c, 'isPinned')}
                            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                          >
                            {c.isPinned ? t('Unpin') : t('Pin')}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void toggleMentorAnnotation(problem.id, c, 'isMentorAnswer')
                            }
                            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                          >
                            {c.isMentorAnswer ? t('Unmark mentor') : t('Mark mentor')}
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                      {c.body}
                    </p>

                    {c.codeSnippet && (
                      <pre className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] p-3 text-xs font-mono text-[var(--text-primary)] overflow-x-auto">
                        {c.codeSnippet}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const editorPanelContent = (
    <div className="flex flex-col h-full min-h-0">
      {/* Editor Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-b border-[var(--surface-border)] bg-[var(--surface-overlay)]/40 shrink-0">
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="sandbox-lang-select">
            {t('Programming language')}
          </label>
          <select
            id="sandbox-lang-select"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
            className="min-h-[34px] px-2.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-raised)] text-xs font-medium text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)]"
          >
            {(['python', 'javascript', 'cpp'] as Language[]).map((lang) => (
              <option key={lang} value={lang}>
                {LANGUAGE_LABELS[lang]}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleResetCode}
            aria-label={t('Reset starter code')}
            className="min-h-[34px] inline-flex items-center gap-1.5 px-2.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-raised)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('Reset')}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={isRunning}
            onClick={() => void handleExecute('sample')}
            className="min-h-[34px] inline-flex items-center gap-1.5 px-3.5 rounded-lg text-xs font-medium border border-[var(--surface-border)] bg-[var(--surface-raised)] text-[var(--text-primary)] hover:border-[var(--text-tertiary)] disabled:opacity-50 whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isRunning && runMode === 'sample' ? t('Running...') : t('Run code')}</span>
          </button>

          <button
            type="button"
            disabled={isRunning}
            onClick={() => void handleExecute('submit')}
            className="min-h-[34px] inline-flex items-center gap-1.5 px-4 rounded-lg text-xs font-semibold bg-[var(--brand-primary)] text-[var(--brand-ink)] hover:bg-[var(--brand-primary-hover)] disabled:opacity-50 whitespace-nowrap"
          >
            <span>{isRunning && runMode === 'submit' ? t('Submitting...') : t('Submit solution')}</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-[260px] bg-[var(--surface-deep)]">
        <Editor
          height="100%"
          language={MONACO_LANGUAGE[language]}
          theme="thinkcode-dark"
          beforeMount={defineThinkCodeTheme}
          value={codeByLang[language]}
          onChange={handleCodeChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineHeight: 21,
            fontFamily: 'var(--font-mono-family), ui-monospace, monospace',
            padding: { top: 14, bottom: 14 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: language === 'python' ? 4 : 2,
          }}
        />
      </div>
    </div>
  );

  const testDockContent = (
    <div
      className="border-t border-[var(--surface-border)] bg-[var(--surface-raised)] p-4 space-y-3"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[var(--text-primary)]">{t('Test Output')}</span>
          {isRunning && <StatusBadge status="Running" />}
          {!isRunning && execSummary && <StatusBadge status={execSummary.status} />}
        </div>

        {!isRunning && execSummary && (
          <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-[var(--text-tertiary)]">
            <span>
              {t('{passed}/{total} passed', {
                passed: execSummary.passedCount,
                total: execSummary.totalCount,
              })}
            </span>
            <span aria-hidden="true">·</span>
            <span>{t('{ms} ms', { ms: execSummary.runtimeMs })}</span>
            <span aria-hidden="true">·</span>
            <span>
              {execSummary.engine === 'piston'
                ? t('Piston')
                : execSummary.engine === 'local-js-worker'
                  ? t('Local JS')
                  : execSummary.engine === 'local-pyodide-worker'
                    ? t('Local Python')
                    : t('Config needed')}
            </span>
          </div>
        )}
      </div>

      {execSummary?.message && (
        <div className="flex items-start gap-2 rounded-lg border border-[var(--status-warning)]/40 bg-[var(--surface-deep)] p-3 text-xs text-[var(--status-warning)]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{execSummary.message}</span>
        </div>
      )}

      {saveMessage && (
        <p className="text-xs text-[var(--accent-cyan)]">{saveMessage}</p>
      )}

      {!execSummary && !isRunning && (
        <p className="text-xs text-[var(--text-tertiary)]">
          {t('Run code to check visible sample cases, or Submit solution to evaluate hidden edge cases.')}
        </p>
      )}

      {execSummary && execSummary.results.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {execSummary.results.map((r, idx) => (
              <button
                key={r.testCaseId}
                type="button"
                onClick={() => setActiveTestIdx(idx)}
                className={`min-h-[30px] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border transition-colors ${
                  activeTestIdx === idx
                    ? 'border-[var(--text-primary)] bg-[var(--surface-overlay)] text-[var(--text-primary)]'
                    : 'border-[var(--surface-border)] bg-[var(--surface-deep)] text-[var(--text-secondary)]'
                }`}
              >
                {r.passed ? (
                  <CheckCircle2 className="w-3 h-3 text-[var(--status-success)]" />
                ) : (
                  <XCircle className="w-3 h-3 text-[var(--status-error)]" />
                )}
                <span>
                  {r.isHidden
                    ? t('Hidden {index}', { index: idx + 1 })
                    : t('Case {index}', { index: idx + 1 })}
                </span>
              </button>
            ))}
          </div>

          {execSummary.results[activeTestIdx] && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
              <div className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] p-2.5">
                <span className="text-[var(--text-tertiary)]">{t('Input')}</span>
                <pre className="mt-1 text-[var(--text-primary)] whitespace-pre-wrap">
                  {execSummary.results[activeTestIdx].input}
                </pre>
              </div>
              <div className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] p-2.5">
                <span className="text-[var(--text-tertiary)]">{t('Expected')}</span>
                <pre className="mt-1 text-[var(--text-primary)] whitespace-pre-wrap">
                  {execSummary.results[activeTestIdx].expectedOutput}
                </pre>
              </div>
              <div className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] p-2.5">
                <span className="text-[var(--text-tertiary)]">
                  {execSummary.results[activeTestIdx].stderr ? t('Error') : t('Actual Output')}
                </span>
                <pre
                  className={`mt-1 whitespace-pre-wrap ${
                    execSummary.results[activeTestIdx].passed
                      ? 'text-[var(--status-success)]'
                      : 'text-[var(--status-error)]'
                  }`}
                >
                  {execSummary.results[activeTestIdx].stderr ||
                    execSummary.results[activeTestIdx].actualOutput ||
                    t('(empty)')}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] min-h-[600px]">
      {/* Workspace Header Strip */}
      <div className="px-4 py-3 border-b border-[var(--surface-border)] bg-[var(--surface-raised)] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="min-h-[34px] inline-flex items-center gap-1.5 px-2.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-overlay)] text-xs font-medium text-[var(--text-primary)] hover:border-[var(--text-tertiary)] whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('Challenges')}</span>
          </button>

          <h1 className="text-base sm:text-lg font-bold text-[var(--text-primary)] truncate">
            {problem.title}
          </h1>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-tertiary)] shrink-0">
          <span className="capitalize">{t(problem.difficulty)}</span>
          <span aria-hidden="true">·</span>
          <span>{problem.xpReward} XP</span>
          {problemSolved && (
            <>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-[var(--status-success)] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('Accepted')}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Mobile Tab Switcher (< 1024px) */}
      <div className="lg:hidden flex items-center gap-1 p-2 border-b border-[var(--surface-border)] bg-[var(--surface-raised)] shrink-0">
        {(['problem', 'editor', 'tests'] as MobilePane[]).map((pane) => (
          <button
            key={pane}
            type="button"
            onClick={() => setMobilePane(pane)}
            className={`flex-1 min-h-[38px] rounded-lg text-xs font-medium capitalize transition-colors ${
              mobilePane === pane
                ? 'bg-[var(--brand-primary)] text-[var(--brand-ink)] font-semibold'
                : 'text-[var(--text-secondary)] bg-[var(--surface-overlay)]'
            }`}
          >
            {t(pane === 'problem' ? 'Problem' : pane === 'editor' ? 'Editor' : 'Tests')}
          </button>
        ))}
      </div>

      {/* Mobile View */}
      <div className="lg:hidden flex-1 min-h-0 flex flex-col overflow-y-auto bg-[var(--surface-raised)]">
        {mobilePane === 'problem' && leftPanelContent}
        {mobilePane === 'editor' && editorPanelContent}
        {mobilePane === 'tests' && testDockContent}
      </div>

      {/* Desktop Resizable Split Workspace (>= 1024px) */}
      <div ref={containerRef} className="hidden lg:flex flex-1 min-h-0">
        <div
          style={{ width: `${splitPct}%` }}
          className="h-full min-h-0 border-r border-[var(--surface-border)] bg-[var(--surface-raised)]"
        >
          {leftPanelContent}
        </div>

        {/* Keyboard-operable split divider */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={t('Resize problem and editor panels')}
          aria-valuenow={splitPct}
          aria-valuemin={30}
          aria-valuemax={55}
          tabIndex={0}
          onMouseDown={() => {
            draggingRef.current = true;
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setSplitPct((p) => Math.max(30, p - 2));
            if (e.key === 'ArrowRight') setSplitPct((p) => Math.min(55, p + 2));
          }}
          className="w-1.5 cursor-col-resize bg-[var(--surface-deep)] hover:bg-[var(--accent-cyan)] focus-visible:bg-[var(--accent-cyan)] transition-colors outline-none"
        />

        <div
          style={{ width: `${100 - splitPct}%` }}
          className="h-full min-h-0 flex flex-col bg-[var(--surface-raised)]"
        >
          <div className="flex-1 min-h-0">{editorPanelContent}</div>
          <div className="max-h-[260px] overflow-y-auto shrink-0">{testDockContent}</div>
        </div>
      </div>
    </div>
  );
}
