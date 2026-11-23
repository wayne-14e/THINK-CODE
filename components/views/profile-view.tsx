'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Flame, KeyRound, Save, ShieldCheck, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useFirebase } from '../providers/firebase-provider';

export function ProfileView() {
  const {
    user,
    isAdmin,
    publicProfile,
    userPrivate,
    tracks,
    submissions,
    updateProfileDetails,
    unlockAdmin,
    signInWithGoogle,
  } = useFirebase();

  const [draftNickname, setDraftNickname] = useState<string | null>(null);
  const [draftGithub, setDraftGithub] = useState<string | null>(null);
  const [draftTelegram, setDraftTelegram] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [showPasscodeInput, setShowPasscodeInput] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeBusy, setPasscodeBusy] = useState(false);
  const [passcodeNotice, setPasscodeNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const nickname = draftNickname ?? publicProfile?.nickname ?? '';
  const githubHandle = draftGithub ?? publicProfile?.githubHandle ?? '';
  const telegramHandle = draftTelegram ?? publicProfile?.telegramHandle ?? '';

  if (!user || !publicProfile) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-lg rounded-xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-6 space-y-4">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Profile</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Sign in to sync streaks, solved challenges, and handles.
          </p>
          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            className="min-h-[42px] px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--brand-primary)] text-[var(--brand-ink)] hover:bg-[var(--brand-primary-hover)] transition-colors"
          >
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  const totalModules = tracks.reduce((acc, t) => acc + t.modules.length, 0);
  const completedModules = userPrivate?.completedModuleIds.length || 0;
  const pct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setSaving(true);
    try {
      await updateProfileDetails({ nickname, githubHandle, telegramHandle });
      setStatusMsg({ ok: true, text: 'Profile updated.' });
    } catch (err) {
      setStatusMsg({
        ok: false,
        text: err instanceof Error ? err.message : 'Unable to save profile.',
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
      className="p-4 sm:p-6 lg:p-8 space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-[var(--brand-primary)] capitalize">
            {isAdmin ? 'admin' : 'learner'} account
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            {publicProfile.nickname}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">Signed in as {user.email}</p>
        </div>

        <div className="flex items-center gap-6 font-mono tabular-nums">
          <div>
            <p className="text-xs text-[var(--text-tertiary)]">Current Streak</p>
            <p className="text-xl font-bold text-[var(--brand-primary)] inline-flex items-center gap-1.5">
              <Flame className="w-4 h-4" />
              <span>{publicProfile.currentStreak}d</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-tertiary)]">Longest</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">
              {publicProfile.longestStreak}d
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-tertiary)]">Total XP</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{publicProfile.xp}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Progress & Solved Breakdown */}
        <section className="lg:col-span-5 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[var(--text-primary)]">Syllabus Completion</span>
              <span className="font-mono text-xs tabular-nums text-[var(--brand-primary)]">
                {completedModules}/{totalModules} ({pct}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--surface-overlay)] overflow-hidden">
              <div
                className="h-full bg-[var(--brand-primary)] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-[var(--surface-border)]">
            <div className="flex items-center justify-between text-sm">
              <h2 className="font-semibold text-[var(--text-primary)]">Solved Breakdown</h2>
              <span className="font-mono text-xs tabular-nums text-[var(--text-tertiary)]">
                {publicProfile.solvedEasy + publicProfile.solvedMedium + publicProfile.solvedHard} total
              </span>
            </div>

            {(() => {
              const totalSolved =
                publicProfile.solvedEasy + publicProfile.solvedMedium + publicProfile.solvedHard;
              const easyW = totalSolved > 0 ? (publicProfile.solvedEasy / totalSolved) * 100 : 0;
              const medW = totalSolved > 0 ? (publicProfile.solvedMedium / totalSolved) * 100 : 0;
              const hardW = totalSolved > 0 ? (publicProfile.solvedHard / totalSolved) * 100 : 0;
              return (
                <div
                  className="h-2.5 rounded-full bg-[var(--surface-overlay)] overflow-hidden flex"
                  aria-hidden="true"
                >
                  {easyW > 0 && (
                    <div
                      className="h-full bg-[var(--status-success)] transition-all"
                      style={{ width: `${easyW}%` }}
                    />
                  )}
                  {medW > 0 && (
                    <div
                      className="h-full bg-[var(--accent-amber)] transition-all"
                      style={{ width: `${medW}%` }}
                    />
                  )}
                  {hardW > 0 && (
                    <div
                      className="h-full bg-[var(--status-error)] transition-all"
                      style={{ width: `${hardW}%` }}
                    />
                  )}
                </div>
              );
            })()}

            <div className="grid grid-cols-3 gap-3 font-mono tabular-nums">
              <div className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] p-3">
                <p className="text-xs text-[var(--status-success)]">Easy</p>
                <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">
                  {publicProfile.solvedEasy}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] p-3">
                <p className="text-xs text-[var(--accent-amber)]">Medium</p>
                <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">
                  {publicProfile.solvedMedium}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] p-3">
                <p className="text-xs text-[var(--status-error)]">Hard</p>
                <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">
                  {publicProfile.solvedHard}
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => void handleSave(e)}
            className="space-y-4 pt-4 border-t border-[var(--surface-border)]"
          >
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Public profile</h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Your display name is the identity shown on the leaderboard and in mentor Q&amp;A.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-nick" className="block text-xs font-medium text-[var(--text-secondary)]">
                Display name
              </label>
              <input
                id="profile-nick"
                type="text"
                required
                minLength={2}
                maxLength={40}
                value={nickname}
                onChange={(e) => setDraftNickname(e.target.value)}
                className="w-full min-h-[40px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-gh" className="block text-xs font-medium text-[var(--text-secondary)]">
                GitHub handle <span className="text-[var(--text-tertiary)]">(optional)</span>
              </label>
              <input
                id="profile-gh"
                type="text"
                maxLength={40}
                placeholder="username"
                value={githubHandle}
                onChange={(e) => setDraftGithub(e.target.value)}
                className="w-full min-h-[40px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm font-mono text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-tg" className="block text-xs font-medium text-[var(--text-secondary)]">
                Telegram handle <span className="text-[var(--text-tertiary)]">(optional)</span>
              </label>
              <input
                id="profile-tg"
                type="text"
                maxLength={40}
                placeholder="username"
                value={telegramHandle}
                onChange={(e) => setDraftTelegram(e.target.value)}
                className="w-full min-h-[40px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm font-mono text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)]"
              />
            </div>

            {statusMsg && (
              <p
                className={`inline-flex items-center gap-1.5 text-xs ${
                  statusMsg.ok ? 'text-[var(--brand-primary)]' : 'text-[var(--status-error)]'
                }`}
              >
                {statusMsg.ok ? (
                  <UserCheck className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                <span>{statusMsg.text}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--brand-primary)] text-[var(--brand-ink)] hover:bg-[var(--brand-primary-hover)] disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save profile'}</span>
            </button>
          </form>

          {/* Admin Elevation Passcode (hidden input revealed on click) */}
          <div className="pt-4 border-t border-[var(--surface-border)] space-y-3">
            {isAdmin ? (
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--status-success)]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Admin access unlocked · Compose tab is active</span>
              </div>
            ) : !showPasscodeInput ? (
              <button
                type="button"
                onClick={() => {
                  setShowPasscodeInput(true);
                  setPasscodeNotice(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)] focus-visible:outline-offset-2 rounded transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Admin passcode</span>
              </button>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void (async () => {
                    setPasscodeBusy(true);
                    setPasscodeNotice(null);
                    const result = await unlockAdmin(passcode);
                    setPasscodeBusy(false);
                    if (result.ok) {
                      setPasscode('');
                      setShowPasscodeInput(false);
                      setPasscodeNotice({
                        ok: true,
                        text: 'Admin composer unlocked.',
                      });
                    } else {
                      setPasscodeNotice({
                        ok: false,
                        text: result.error || 'Invalid admin passcode.',
                      });
                    }
                  })();
                }}
                className="space-y-2.5"
              >
                <label
                  htmlFor="admin-passcode-input"
                  className="block text-xs font-medium text-[var(--text-secondary)]"
                >
                  Enter admin passcode
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="admin-passcode-input"
                    type="password"
                    autoFocus
                    autoComplete="off"
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Passcode"
                    className="flex-1 min-w-0 min-h-[38px] px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm font-mono text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)]"
                  />
                  <button
                    type="submit"
                    disabled={passcodeBusy}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--brand-primary)] text-[var(--brand-ink)] hover:bg-[var(--brand-primary-hover)] disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {passcodeBusy ? 'Checking...' : 'Verify'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasscodeInput(false);
                      setPasscode('');
                      setPasscodeNotice(null);
                    }}
                    className="min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--surface-border)] bg-[var(--surface-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
                  >
                    Cancel
                  </button>
                </div>
                {passcodeNotice && (
                  <p
                    className={`text-xs ${
                      passcodeNotice.ok
                        ? 'text-[var(--status-success)]'
                        : 'text-[var(--status-error)]'
                    }`}
                  >
                    {passcodeNotice.text}
                  </p>
                )}
              </form>
            )}
          </div>
        </section>

        {/* Recent Submissions History */}
        <section className="lg:col-span-7 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-6 space-y-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Recent Submissions
          </h2>

          {submissions.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--text-secondary)]">
              No submissions yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--surface-border)] text-xs text-[var(--text-tertiary)]">
                    <th className="py-2.5 pr-4">Challenge</th>
                    <th className="py-2.5 px-3">Language</th>
                    <th className="py-2.5 px-3">Verdict</th>
                    <th className="py-2.5 pl-3 text-right font-mono">Tests</th>
                    <th className="py-2.5 pl-3 text-right font-mono">Runtime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--surface-border)]">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="h-11">
                      <td className="py-2 pr-4 font-medium text-[var(--text-primary)]">
                        {sub.problemTitle}
                      </td>
                      <td className="py-2 px-3 font-mono text-xs text-[var(--text-secondary)]">
                        {sub.language}
                      </td>
                      <td className="py-2 px-3 text-xs">
                        <span
                          className={`inline-flex items-center gap-1 font-medium ${
                            sub.status === 'Accepted'
                              ? 'text-[var(--status-success)]'
                              : sub.status === 'Time Limit Exceeded'
                                ? 'text-[var(--status-warning)]'
                                : 'text-[var(--status-error)]'
                          }`}
                        >
                          {sub.status === 'Accepted' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          <span>{sub.status}</span>
                        </span>
                      </td>
                      <td className="py-2 pl-3 text-right font-mono text-xs tabular-nums text-[var(--text-secondary)]">
                        {sub.passedCount}/{sub.totalCount}
                      </td>
                      <td className="py-2 pl-3 text-right font-mono text-xs tabular-nums text-[var(--text-tertiary)]">
                        {sub.runtimeMs} ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}
