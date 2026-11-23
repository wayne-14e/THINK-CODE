'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Database, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useFirebase } from '../providers/firebase-provider';
import type { Difficulty, Language, TestCase } from '@/lib/types';

export function AdminComposerView() {
  const {
    isAdmin,
    tracks,
    saveAdminProblem,
    saveAdminWorkshop,
    syncStarterCurriculum,
  } = useFirebase();

  const [tab, setTab] = useState<'problem' | 'workshop'>('problem');
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  // Problem Composer State
  const [probTitle, setProbTitle] = useState('');
  const [probSlug, setProbSlug] = useState('');
  const [probDifficulty, setProbDifficulty] = useState<Difficulty>('easy');
  const [probTrack, setProbTrack] = useState(tracks[0]?.slug || 'algorithmic-thinking');
  const [probXp, setProbXp] = useState(60);
  const [probIsDaily, setProbIsDaily] = useState(false);
  const [probDescription, setProbDescription] = useState('');
  const [probConstraints, setProbConstraints] = useState('1 <= n <= 10^5');
  const [probEditorial, setProbEditorial] = useState('');
  const [probPyStarter, setProbPyStarter] = useState(
    'import sys\n\ndef solve():\n    data = sys.stdin.read().strip()\n    print(data)\n\nif __name__ == "__main__":\n    solve()\n'
  );
  const [probJsStarter, setProbJsStarter] = useState(
    "const fs = require('fs');\nconst data = fs.readFileSync(0, 'utf8').trim();\nconsole.log(data);\n"
  );
  const [probCppStarter, setProbCppStarter] = useState(
    '#include <iostream>\nusing namespace std;\nint main() {\n    return 0;\n}\n'
  );

  // Think-Before-You-Run State
  const [thinkQuestion, setThinkQuestion] = useState('');
  const [thinkSnippet, setThinkSnippet] = useState('');
  const [thinkLang, setThinkLang] = useState<Language>('python');
  const [thinkOptions, setThinkOptions] = useState(['Option A', 'Option B', 'Option C', 'Option D']);
  const [thinkCorrectIndex, setThinkCorrectIndex] = useState(0);
  const [thinkExplanation, setThinkExplanation] = useState('');

  // Dynamic Test Cases
  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: 'tc-1', input: '', expectedOutput: '', isHidden: false },
    { id: 'tc-2', input: '', expectedOutput: '', isHidden: true },
  ]);

  // Workshop Composer State
  const [wsIssue, setWsIssue] = useState('09');
  const [wsTitle, setWsTitle] = useState('');
  const [wsSummary, setWsSummary] = useState('');
  const [wsTrack, setWsTrack] = useState(tracks[0]?.slug || 'algorithmic-thinking');
  const [wsStartsAt, setWsStartsAt] = useState('2026-12-06T16:00:00.000Z');
  const [wsTimezone, setWsTimezone] = useState('21:00 UTC+5');
  const [wsPrereq, setWsPrereq] = useState('');
  const [wsLocation, setWsLocation] = useState('https://discord.com/channels/@me');
  const [wsUpcoming, setWsUpcoming] = useState(true);
  const [wsSlides, setWsSlides] = useState('');
  const [wsRepo, setWsRepo] = useState('');
  const [wsNotebook, setWsNotebook] = useState('');

  const [saving, setSaving] = useState(false);

  if (!isAdmin) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-lg rounded-xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-6 space-y-2">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Admin Composer</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Mentor or Admin permissions are required to publish problems or workshops.
          </p>
        </div>
      </div>
    );
  }

  const handleSyncStarter = async () => {
    setSyncing(true);
    setNotice(null);
    try {
      await syncStarterCurriculum();
      setNotice({
        ok: true,
        text: 'Starter syllabus tracks, challenges, and workshops synced to Firestore.',
      });
    } catch (err) {
      setNotice({ ok: false, text: err instanceof Error ? err.message : 'Sync failed.' });
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = (probSlug || probTitle)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 64);

    if (!cleanSlug || cleanSlug.length < 2) {
      setNotice({ ok: false, text: 'Provide a valid problem title or slug.' });
      return;
    }

    setSaving(true);
    setNotice(null);
    try {
      await saveAdminProblem({
        id: cleanSlug,
        slug: cleanSlug,
        title: probTitle.trim(),
        difficulty: probDifficulty,
        trackSlug: probTrack,
        isDaily: probIsDaily,
        dailyDate: probIsDaily ? new Date().toISOString().slice(0, 10) : '',
        xpReward: Number(probXp) || 50,
        description: probDescription.trim(),
        constraints: probConstraints.trim(),
        editorial: probEditorial.trim() || 'Official editorial coming after workshop review.',
        examples: testCases
          .filter((tc) => !tc.isHidden)
          .slice(0, 2)
          .map((tc) => ({ input: tc.input, output: tc.expectedOutput })),
        starterCode: {
          python: probPyStarter,
          javascript: probJsStarter,
          cpp: probCppStarter,
        },
        thinkPrompt: {
          question: thinkQuestion.trim() || 'Trace the time complexity before coding.',
          codeSnippet: thinkSnippet.trim() || '# Trace carefully',
          language: thinkLang,
          options: thinkOptions,
          correctIndex: thinkCorrectIndex,
          explanation: thinkExplanation.trim() || 'Verify invariants before implementing.',
        },
        testCases: testCases.map((tc, idx) => ({ ...tc, id: `tc-${idx + 1}` })),
      });
      setNotice({ ok: true, text: `Published challenge "${probTitle}" (${cleanSlug}).` });
      setProbTitle('');
      setProbSlug('');
      setProbDescription('');
    } catch (err) {
      setNotice({
        ok: false,
        text: err instanceof Error ? err.message : 'Unable to save problem.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `workshop-${wsIssue.trim().replace(/[^a-zA-Z0-9_-]/g, '')}`;
    setSaving(true);
    setNotice(null);
    try {
      await saveAdminWorkshop({
        id,
        issueNumber: wsIssue.trim(),
        title: wsTitle.trim(),
        summary: wsSummary.trim(),
        trackSlug: wsTrack,
        startsAtIso: wsStartsAt.trim(),
        academyTimezone: wsTimezone.trim(),
        prerequisites: wsPrereq.trim(),
        locationUrl: wsLocation.trim(),
        isUpcoming: wsUpcoming,
        resources: {
          ...(wsSlides.trim() ? { slidesUrl: wsSlides.trim() } : {}),
          ...(wsRepo.trim() ? { repoUrl: wsRepo.trim() } : {}),
          ...(wsNotebook.trim() ? { notebookUrl: wsNotebook.trim() } : {}),
        },
      });
      setNotice({ ok: true, text: `Published Workshop ${wsIssue}: "${wsTitle}".` });
      setWsTitle('');
      setWsSummary('');
    } catch (err) {
      setNotice({
        ok: false,
        text: err instanceof Error ? err.message : 'Unable to publish workshop.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="p-4 sm:p-6 lg:p-8 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Admin Composer
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Publish challenges and live workshops.
          </p>
        </div>

        <button
          type="button"
          disabled={syncing}
          onClick={() => void handleSyncStarter()}
          className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border border-[var(--surface-border)] bg-[var(--surface-raised)] text-[var(--text-primary)] hover:border-[var(--text-tertiary)] whitespace-nowrap shrink-0"
        >
          <Database className="w-4 h-4 text-[var(--brand-primary)]" />
          <span>{syncing ? 'Syncing...' : 'Sync Starter Curriculum'}</span>
        </button>
      </div>

      <div className="flex items-center gap-1 p-1 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-raised)] w-fit">
        <button
          type="button"
          onClick={() => setTab('problem')}
          className={`min-h-[34px] px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
            tab === 'problem'
              ? 'bg-[var(--brand-primary)] text-[var(--brand-ink)] font-semibold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Problem Composer
        </button>
        <button
          type="button"
          onClick={() => setTab('workshop')}
          className={`min-h-[34px] px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
            tab === 'workshop'
              ? 'bg-[var(--brand-primary)] text-[var(--brand-ink)] font-semibold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Workshop Publisher
        </button>
      </div>

      {notice && (
        <div
          role={notice.ok ? 'status' : 'alert'}
          className={`flex items-center gap-2 rounded-lg border bg-[var(--surface-raised)] px-4 py-3 text-sm ${
            notice.ok
              ? 'border-[var(--brand-primary)]/40 text-[var(--brand-primary)]'
              : 'border-[var(--status-error)]/40 text-[var(--status-error)]'
          }`}
        >
          {notice.ok ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      {tab === 'problem' ? (
        <form
          onSubmit={(e) => void handleCreateProblem(e)}
          className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="p-title" className="block text-xs font-medium text-[var(--text-secondary)]">
                Challenge title
              </label>
              <input
                id="p-title"
                required
                minLength={2}
                value={probTitle}
                onChange={(e) => setProbTitle(e.target.value)}
                placeholder="Prefix Sum Range Queries"
                className="w-full min-h-[40px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm text-[var(--text-primary)]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="p-slug" className="block text-xs font-medium text-[var(--text-secondary)]">
                URL slug (auto-generated if blank)
              </label>
              <input
                id="p-slug"
                value={probSlug}
                onChange={(e) => setProbSlug(e.target.value)}
                placeholder="prefix-sum-range"
                className="w-full min-h-[40px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm font-mono text-[var(--text-primary)]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="p-diff" className="block text-xs font-medium text-[var(--text-secondary)]">
                Difficulty
              </label>
              <select
                id="p-diff"
                value={probDifficulty}
                onChange={(e) => setProbDifficulty(e.target.value as Difficulty)}
                className="w-full min-h-[40px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm text-[var(--text-primary)]"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="p-track" className="block text-xs font-medium text-[var(--text-secondary)]">
                Syllabus Track
              </label>
              <select
                id="p-track"
                value={probTrack}
                onChange={(e) => setProbTrack(e.target.value)}
                className="w-full min-h-[40px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm text-[var(--text-primary)]"
              >
                {tracks.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="p-xp" className="block text-xs font-medium text-[var(--text-secondary)]">
                XP Reward (10 - 500)
              </label>
              <input
                id="p-xp"
                type="number"
                min={10}
                max={500}
                value={probXp}
                onChange={(e) => setProbXp(Number(e.target.value))}
                className="w-full min-h-[40px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm font-mono text-[var(--text-primary)]"
              />
            </div>

            <div className="flex items-end pb-2">
              <label className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={probIsDaily}
                  onChange={(e) => setProbIsDaily(e.target.checked)}
                  className="w-4 h-4 accent-[var(--brand-primary)]"
                />
                <span>Feature as Daily Challenge</span>
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="p-desc" className="block text-xs font-medium text-[var(--text-secondary)]">
              Problem statement (Markdown supported)
            </label>
            <textarea
              id="p-desc"
              required
              minLength={10}
              rows={4}
              value={probDescription}
              onChange={(e) => setProbDescription(e.target.value)}
              placeholder="Describe the problem, stdin format, and expected stdout format..."
              className="w-full p-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm text-[var(--text-primary)]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="p-constraints" className="block text-xs font-medium text-[var(--text-secondary)]">
                Constraints
              </label>
              <textarea
                id="p-constraints"
                rows={2}
                value={probConstraints}
                onChange={(e) => setProbConstraints(e.target.value)}
                className="w-full p-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-xs font-mono text-[var(--text-primary)]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="p-editorial" className="block text-xs font-medium text-[var(--text-secondary)]">
                Official Mentor Editorial
              </label>
              <textarea
                id="p-editorial"
                rows={2}
                value={probEditorial}
                onChange={(e) => setProbEditorial(e.target.value)}
                placeholder="Explain the key invariant and time/space complexity..."
                className="w-full p-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm text-[var(--text-primary)]"
              />
            </div>
          </div>

          {/* Think-Before-You-Run Builder */}
          <div className="pt-4 border-t border-[var(--surface-border)] space-y-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Think Before You Run Check
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={thinkQuestion}
                onChange={(e) => setThinkQuestion(e.target.value)}
                placeholder="Prediction question (e.g., What does this print?)"
                className="min-h-[40px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm text-[var(--text-primary)]"
              />
              <select
                value={thinkLang}
                onChange={(e) => setThinkLang(e.target.value as Language)}
                className="min-h-[40px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm text-[var(--text-primary)]"
              >
                <option value="python">Python snippet</option>
                <option value="javascript">JavaScript snippet</option>
                <option value="cpp">C++ snippet</option>
              </select>
            </div>
            <textarea
              rows={2}
              value={thinkSnippet}
              onChange={(e) => setThinkSnippet(e.target.value)}
              placeholder="Short trace snippet..."
              className="w-full p-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-xs font-mono text-[var(--text-primary)]"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {thinkOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctThinkOpt"
                    checked={thinkCorrectIndex === idx}
                    onChange={() => setThinkCorrectIndex(idx)}
                    aria-label={`Mark option ${idx + 1} as correct`}
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const next = [...thinkOptions];
                      next[idx] = e.target.value;
                      setThinkOptions(next);
                    }}
                    className="flex-1 min-h-[36px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-xs font-mono text-[var(--text-primary)]"
                  />
                </div>
              ))}
            </div>
            <input
              type="text"
              value={thinkExplanation}
              onChange={(e) => setThinkExplanation(e.target.value)}
              placeholder="Explanation shown when verified..."
              className="w-full min-h-[40px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm text-[var(--text-primary)]"
            />
          </div>

          {/* Dynamic Test Cases */}
          <div className="pt-4 border-t border-[var(--surface-border)] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Test Cases (Sample & Hidden)
              </h2>
              <button
                type="button"
                onClick={() =>
                  setTestCases((prev) => [
                    ...prev,
                    { id: `tc-${prev.length + 1}`, input: '', expectedOutput: '', isHidden: true },
                  ])
                }
                className="min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border border-[var(--surface-border)] bg-[var(--surface-overlay)] text-[var(--text-primary)]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add test case</span>
              </button>
            </div>

            <div className="space-y-3">
              {testCases.map((tc, idx) => (
                <div
                  key={tc.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] items-center"
                >
                  <textarea
                    rows={2}
                    placeholder="Stdin input"
                    value={tc.input}
                    onChange={(e) => {
                      const next = [...testCases];
                      next[idx] = { ...tc, input: e.target.value };
                      setTestCases(next);
                    }}
                    className="md:col-span-5 p-2 rounded border border-[var(--surface-border)] bg-[var(--surface-raised)] text-xs font-mono text-[var(--text-primary)]"
                  />
                  <textarea
                    rows={2}
                    placeholder="Expected stdout"
                    value={tc.expectedOutput}
                    onChange={(e) => {
                      const next = [...testCases];
                      next[idx] = { ...tc, expectedOutput: e.target.value };
                      setTestCases(next);
                    }}
                    className="md:col-span-4 p-2 rounded border border-[var(--surface-border)] bg-[var(--surface-raised)] text-xs font-mono text-[var(--text-primary)]"
                  />
                  <label className="md:col-span-2 inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                    <input
                      type="checkbox"
                      checked={tc.isHidden}
                      onChange={(e) => {
                        const next = [...testCases];
                        next[idx] = { ...tc, isHidden: e.target.checked };
                        setTestCases(next);
                      }}
                    />
                    <span>Hidden</span>
                  </label>
                  <button
                    type="button"
                    disabled={testCases.length <= 1}
                    onClick={() => setTestCases((prev) => prev.filter((_, i) => i !== idx))}
                    aria-label="Remove test case"
                    className="md:col-span-1 min-h-[32px] inline-flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--status-error)] disabled:opacity-40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[var(--surface-border)]">
            <div className="space-y-1">
              <label className="text-xs font-mono text-[var(--text-tertiary)]">Python starter</label>
              <textarea
                rows={4}
                value={probPyStarter}
                onChange={(e) => setProbPyStarter(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-xs font-mono text-[var(--text-primary)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-[var(--text-tertiary)]">JavaScript starter</label>
              <textarea
                rows={4}
                value={probJsStarter}
                onChange={(e) => setProbJsStarter(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-xs font-mono text-[var(--text-primary)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-[var(--text-tertiary)]">C++ starter</label>
              <textarea
                rows={4}
                value={probCppStarter}
                onChange={(e) => setProbCppStarter(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-xs font-mono text-[var(--text-primary)]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-semibold bg-[var(--brand-primary)] text-[var(--brand-ink)] hover:bg-[var(--brand-primary-hover)] disabled:opacity-50 transition-colors"
          >
            {saving ? 'Publishing...' : 'Publish challenge'}
          </button>
        </form>
      ) : (
        <form
          onSubmit={(e) => void handleCreateWorkshop(e)}
          className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-6 space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="w-issue" className="block text-xs font-medium text-[var(--text-secondary)]">
                Issue number
              </label>
              <input
                id="w-issue"
                required
                value={wsIssue}
                onChange={(e) => setWsIssue(e.target.value)}
                className="w-full min-h-[40px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm font-mono text-[var(--text-primary)]"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label htmlFor="w-title" className="block text-xs font-medium text-[var(--text-secondary)]">
                Workshop title
              </label>
              <input
                id="w-title"
                required
                minLength={2}
                value={wsTitle}
                onChange={(e) => setWsTitle(e.target.value)}
                placeholder="Graph Traversals & Shortest Paths"
                className="w-full min-h-[40px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="w-summary" className="block text-xs font-medium text-[var(--text-secondary)]">
              Summary
            </label>
            <textarea
              id="w-summary"
              required
              minLength={10}
              rows={3}
              value={wsSummary}
              onChange={(e) => setWsSummary(e.target.value)}
              className="w-full p-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm text-[var(--text-primary)]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="w-track" className="block text-xs font-medium text-[var(--text-secondary)]">
                Track
              </label>
              <select
                id="w-track"
                value={wsTrack}
                onChange={(e) => setWsTrack(e.target.value)}
                className="w-full min-h-[40px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm text-[var(--text-primary)]"
              >
                {tracks.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="w-iso" className="block text-xs font-medium text-[var(--text-secondary)]">
                Start time (ISO UTC)
              </label>
              <input
                id="w-iso"
                required
                value={wsStartsAt}
                onChange={(e) => setWsStartsAt(e.target.value)}
                className="w-full min-h-[40px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm font-mono text-[var(--text-primary)]"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="w-tz" className="block text-xs font-medium text-[var(--text-secondary)]">
                Academy timezone label
              </label>
              <input
                id="w-tz"
                required
                value={wsTimezone}
                onChange={(e) => setWsTimezone(e.target.value)}
                className="w-full min-h-[40px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm font-mono text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={wsPrereq}
              onChange={(e) => setWsPrereq(e.target.value)}
              placeholder="Prerequisites..."
              className="min-h-[40px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm text-[var(--text-primary)]"
            />
            <input
              type="url"
              value={wsLocation}
              onChange={(e) => setWsLocation(e.target.value)}
              placeholder="Discord / Google Meet URL"
              className="min-h-[40px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm text-[var(--text-primary)]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="url"
              value={wsSlides}
              onChange={(e) => setWsSlides(e.target.value)}
              placeholder="Slides URL (optional)"
              className="min-h-[40px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm text-[var(--text-primary)]"
            />
            <input
              type="url"
              value={wsRepo}
              onChange={(e) => setWsRepo(e.target.value)}
              placeholder="Repository URL (optional)"
              className="min-h-[40px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm text-[var(--text-primary)]"
            />
            <input
              type="url"
              value={wsNotebook}
              onChange={(e) => setWsNotebook(e.target.value)}
              placeholder="Colab Notebook URL (optional)"
              className="min-h-[40px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm text-[var(--text-primary)]"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer">
            <input
              type="checkbox"
              checked={wsUpcoming}
              onChange={(e) => setWsUpcoming(e.target.checked)}
              className="w-4 h-4 accent-[var(--brand-primary)]"
            />
            <span>Feature as the upcoming live session</span>
          </label>

          <div>
            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-semibold bg-[var(--brand-primary)] text-[var(--brand-ink)] hover:bg-[var(--brand-primary-hover)] disabled:opacity-50 transition-colors"
            >
              {saving ? 'Publishing...' : 'Publish workshop'}
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
}
