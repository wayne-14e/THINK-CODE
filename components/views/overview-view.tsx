'use client';

import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  Code2,
  Flame,
  Trophy,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useFirebase } from '../providers/firebase-provider';
import { useIsClient } from '@/hooks/use-is-client';
import { useI18n } from '@/lib/i18n';
import type { NavSection } from '../app-shell';

interface OverviewViewProps {
  onOpenProblem: (problemId: string) => void;
  onNavigate: (section: NavSection) => void;
}

function ProgressRing({ pct, accent = false }: { pct: number; accent?: boolean }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const r = 16;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  return (
    <svg width="42" height="42" viewBox="0 0 42 42" className="-rotate-90 shrink-0" aria-hidden="true">
      <circle
        cx="21"
        cy="21"
        r={r}
        fill="none"
        stroke="var(--surface-border)"
        strokeWidth="3.5"
      />
      <circle
        cx="21"
        cy="21"
        r={r}
        fill="none"
        stroke={accent ? 'var(--brand-primary)' : 'var(--accent-cyan)'}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

export function OverviewView({ onOpenProblem, onNavigate }: OverviewViewProps) {
  const { problems, tracks, workshops, leaderboard, publicProfile, userPrivate } = useFirebase();
  const isClient = useIsClient();
  const { t, locale } = useI18n();

  const dailyProblem = problems.find((p) => p.isDaily) || problems[0];
  const upcomingWorkshop = workshops.find((w) => w.isUpcoming);

  const totalModules = tracks.reduce((acc, t) => acc + t.modules.length, 0);
  const completedModules = userPrivate?.completedModuleIds.length || 0;
  const solvedTotal = userPrivate?.solvedProblemIds.length || 0;
  const solvedPct = problems.length > 0 ? Math.round((solvedTotal / problems.length) * 100) : 0;
  const modulesPct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const dailySolved = dailyProblem
    ? userPrivate?.solvedProblemIds.includes(dailyProblem.id) ?? false
    : false;
  const thinkDone = dailyProblem
    ? userPrivate?.thinkPassedProblemIds.includes(dailyProblem.id) ?? false
    : false;

  const localWorkshopDate = upcomingWorkshop
    ? new Intl.DateTimeFormat(isClient ? locale : 'en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...(isClient ? {} : { timeZone: 'UTC' }),
      }).format(new Date(upcomingWorkshop.startsAtIso))
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="p-4 sm:p-6 lg:p-8 space-y-6"
    >
      {/* Daily Challenge: task first, with the trace-to-editor flow beside it */}
      {dailyProblem && (
        <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-raised)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 lg:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--text-tertiary)]">
                <span className="text-[var(--brand-primary)] font-semibold">
                  {t('Daily Challenge')}
                </span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">{t(dailyProblem.difficulty)}</span>
                <span aria-hidden="true">·</span>
                <span>{dailyProblem.xpReward} XP</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                {dailyProblem.title}
              </h1>

              <p className="max-w-lg text-sm text-[var(--text-secondary)]">
                {t('Read the statement, predict the trace, then implement it in the workspace.')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onOpenProblem(dailyProblem.id)}
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[var(--brand-primary)] text-[var(--brand-ink)] hover:bg-[var(--brand-primary-hover)] focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)] focus-visible:outline-offset-2 transition-colors whitespace-nowrap"
              >
                <span>{t('Open workspace')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('challenges')}
                className="min-h-[44px] px-4 py-2.5 rounded-lg text-sm font-medium border border-[var(--surface-border)] bg-[var(--surface-overlay)] text-[var(--text-primary)] hover:border-[var(--text-tertiary)] transition-colors whitespace-nowrap"
              >
                {t('All challenges')}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-[var(--surface-border)] bg-[var(--surface-deep)]/40 p-6 lg:p-8">
            <p className="text-xs font-mono text-[var(--text-tertiary)]">{t("Today's flow")}</p>
            <ol className="mt-4 space-y-4">
              <li className="flex items-start gap-3">
                {thinkDone ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--status-success)]" />
                ) : (
                  <Brain className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-tertiary)]" />
                )}
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{t('Trace check')}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {thinkDone
                      ? t('Passed. The reasoning is saved.')
                      : t('Predict the output before running.')}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                {dailySolved ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--status-success)]" />
                ) : (
                  <Code2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-tertiary)]" />
                )}
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {t('Implement and submit')}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {dailySolved ? t('Accepted. Nice work.') : t('Not submitted yet.')}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-tertiary)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {t('Review the editorial')}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {t('Compare your approach after a real attempt.')}
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>
      )}

      {/* 4-Column Visual KPI Strip */}
      <section aria-label={t('Progress')} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-[var(--text-tertiary)]">{t('Total XP')}</p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-[var(--text-primary)]">
              {publicProfile?.xp ?? 0}
            </p>
          </div>
          <Trophy className="w-6 h-6 text-[var(--accent-amber)] shrink-0" />
        </div>

        <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-[var(--text-tertiary)]">{t('Streak')}</p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-[var(--brand-primary)]">
              {publicProfile?.currentStreak ?? 0}d
            </p>
          </div>
          <Flame className="w-6 h-6 text-[var(--brand-primary)] shrink-0" />
        </div>

        <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-[var(--text-tertiary)]">{t('Solved')}</p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-[var(--text-primary)]">
              {solvedTotal}/{problems.length}
            </p>
          </div>
          <ProgressRing pct={solvedPct} accent />
        </div>

        <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-[var(--text-tertiary)]">{t('Modules')}</p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-[var(--text-primary)]">
              {completedModules}/{totalModules}
            </p>
          </div>
          <ProgressRing pct={modulesPct} />
        </div>
      </section>

      {/* Secondary Grid: Visual Track Bars + Workshop Card & Leaders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Track Progress Visual Bars */}
        <section className="lg:col-span-7 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">{t('Tracks')}</h2>
            <button
              type="button"
              onClick={() => onNavigate('syllabus')}
              className="text-xs font-medium text-[var(--accent-cyan)] hover:underline whitespace-nowrap"
            >
              {t('Open syllabus')}
            </button>
          </div>

          <div className="space-y-4">
            {tracks.map((track) => {
              const doneCount = track.modules.filter((m) =>
                userPrivate?.completedModuleIds.includes(m.id)
              ).length;
              const pct =
                track.modules.length > 0
                  ? Math.round((doneCount / track.modules.length) * 100)
                  : 0;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => onNavigate('syllabus')}
                  className="w-full text-left space-y-2 group"
                >
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors truncate">
                      {track.title}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-[var(--text-tertiary)] shrink-0">
                      {doneCount}/{track.modules.length}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--surface-overlay)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--brand-primary)] transition-all"
                      style={{ width: `${Math.max(4, pct)}%`, opacity: doneCount === 0 ? 0.25 : 1 }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Right Stack: Visual Workshop Card + Leaderboard */}
        <div className="lg:col-span-5 space-y-6">
          {upcomingWorkshop && (
            <section className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-5 space-y-3">
              <div className="flex items-center justify-between gap-3 text-xs font-mono text-[var(--text-secondary)]">
                <span className="inline-flex items-center gap-1.5 text-[var(--accent-cyan)]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t('Workshop {issue}', { issue: upcomingWorkshop.issueNumber })}</span>
                </span>
                <span className="text-right">
                  {t('Your time · {date}', { date: localWorkshopDate })}
                </span>
              </div>

              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                {upcomingWorkshop.title}
              </h2>

              <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                {upcomingWorkshop.summary}
              </p>

              <button
                type="button"
                onClick={() => onNavigate('workshops')}
                className="min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--surface-overlay)] border border-[var(--surface-border)] text-[var(--text-primary)] hover:border-[var(--text-tertiary)] whitespace-nowrap"
              >
                {t('View workshop & RSVP')}
              </button>
            </section>
          )}

          <section className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-5 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">{t('Top Members')}</h2>
              <button
                type="button"
                onClick={() => onNavigate('leaderboard')}
                className="text-xs font-medium text-[var(--accent-cyan)] hover:underline whitespace-nowrap"
              >
                {t('Rankings')}
              </button>
            </div>

            {leaderboard.length === 0 ? (
              <p className="py-4 text-xs text-[var(--text-tertiary)]">
                {t('No ranked members yet.')}
              </p>
            ) : (
              <div className="divide-y divide-[var(--surface-border)]">
                {leaderboard.slice(0, 4).map((member, index) => (
                  <div
                    key={member.uid}
                    className="py-2 flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-xs tabular-nums text-[var(--text-tertiary)] w-5">
                        {index + 1}.
                      </span>
                      <span className="font-medium text-[var(--text-primary)] truncate">
                        {member.nickname}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-xs tabular-nums shrink-0">
                      <span className="text-[var(--text-secondary)]">{member.currentStreak}d</span>
                      <span className="text-[var(--brand-primary)] font-semibold">
                        {member.xp} XP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </motion.div>
  );
}
