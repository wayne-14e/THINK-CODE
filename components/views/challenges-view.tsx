'use client';

import React, { useMemo, useState } from 'react';
import { Check, CheckCircle2, Circle, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useFirebase } from '../providers/firebase-provider';
import { useI18n } from '@/lib/i18n';
import type { Difficulty } from '@/lib/types';

interface ChallengesViewProps {
  onOpenProblem: (problemId: string) => void;
}

const DIFFICULTY_TEXT: Record<Difficulty, string> = {
  easy: 'text-[var(--status-success)]',
  medium: 'text-[var(--accent-amber)]',
  hard: 'text-[var(--status-error)]',
};

const DIFFICULTY_BAR: Record<Difficulty, string> = {
  easy: 'bg-[var(--status-success)]',
  medium: 'bg-[var(--accent-amber)]',
  hard: 'bg-[var(--status-error)]',
};

export function ChallengesView({ onOpenProblem }: ChallengesViewProps) {
  const { problems, tracks, userPrivate } = useFirebase();
  const { t } = useI18n();
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | Difficulty>('all');
  const [trackFilter, setTrackFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const trackTitleBySlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of tracks) map.set(t.slug, t.title);
    return map;
  }, [tracks]);

  const difficultyStats = useMemo(() => {
    const solvedSet = new Set(userPrivate?.solvedProblemIds || []);
    return (['easy', 'medium', 'hard'] as Difficulty[]).map((level) => {
      const total = problems.filter((p) => p.difficulty === level).length;
      const solved = problems.filter((p) => p.difficulty === level && solvedSet.has(p.id)).length;
      const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
      return { level, total, solved, pct };
    });
  }, [problems, userPrivate?.solvedProblemIds]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return problems.filter((p) => {
      if (difficultyFilter !== 'all' && p.difficulty !== difficultyFilter) return false;
      if (trackFilter !== 'all' && p.trackSlug !== trackFilter) return false;
      if (q && !p.title.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [problems, difficultyFilter, trackFilter, searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="p-4 sm:p-6 lg:p-8 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          {t('Challenges')}
        </h1>
        <span className="font-mono text-xs text-[var(--text-tertiary)]">
          Python · JavaScript · C++
        </span>
      </div>

      {/* Visual Difficulty Progress Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {difficultyStats.map((stat) => (
          <button
            key={stat.level}
            type="button"
            onClick={() =>
              setDifficultyFilter(difficultyFilter === stat.level ? 'all' : stat.level)
            }
            aria-pressed={difficultyFilter === stat.level}
            className={`text-left rounded-xl border p-4 space-y-2.5 transition-colors ${
              difficultyFilter === stat.level
                ? 'border-[var(--brand-primary)] bg-[var(--surface-overlay)]'
                : 'border-[var(--surface-border)] bg-[var(--surface-raised)] hover:border-[var(--text-tertiary)]'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className={`inline-flex items-center gap-1 capitalize font-semibold ${DIFFICULTY_TEXT[stat.level]}`}>
                <span>{t(stat.level)}</span>
                {difficultyFilter === stat.level && <Check className="w-3 h-3" aria-hidden="true" />}
              </span>
              <span className="tabular-nums text-[var(--text-secondary)]">
                {stat.solved}/{stat.total}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--surface-overlay)] overflow-hidden">
              <div
                className={`h-full transition-all ${DIFFICULTY_BAR[stat.level]}`}
                style={{ width: `${Math.max(4, stat.pct)}%`, opacity: stat.solved === 0 ? 0.25 : 1 }}
              />
            </div>
          </button>
        ))}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {difficultyFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setDifficultyFilter('all')}
              className="min-h-[40px] px-3 py-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-overlay)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
            >
              {t('All difficulties')}
            </button>
          )}

          <label className="sr-only" htmlFor="track-filter-select">
            {t('Filter by track')}
          </label>
          <select
            id="track-filter-select"
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            className="min-h-[40px] px-3 py-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-raised)] text-sm text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)]"
          >
            <option value="all">{t('All tracks')}</option>
            {tracks.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search...')}
            aria-label={t('Search challenges')}
            className="w-full min-h-[40px] pl-9 pr-3 py-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-raised)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)]"
          />
        </div>
      </div>

      {/* High-Density Problem Table */}
      <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-raised)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--surface-border)] text-xs font-medium text-[var(--text-tertiary)] bg-[var(--surface-overlay)]/50">
                <th className="py-3 px-4 w-12">{t('Status')}</th>
                <th className="py-3 px-4">{t('Challenge')}</th>
                <th className="py-3 px-4 hidden sm:table-cell">{t('Track')}</th>
                <th className="py-3 px-4">{t('Difficulty')}</th>
                <th className="py-3 px-4 text-right font-mono">{t('XP')}</th>
                <th className="py-3 px-4 text-right">{t('Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-border)] text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 px-4 text-center text-[var(--text-secondary)]">
                    {t('No matching challenges.')}
                  </td>
                </tr>
              ) : (
                filtered.map((problem) => {
                  const solved = userPrivate?.solvedProblemIds.includes(problem.id) ?? false;
                  const thinkPassed =
                    userPrivate?.thinkPassedProblemIds.includes(problem.id) ?? false;

                  return (
                    <tr
                      key={problem.id}
                      className="h-12 hover:bg-[var(--surface-overlay)]/60 transition-colors"
                    >
                      <td className="py-2.5 px-4">
                        {solved ? (
                          <CheckCircle2
                            className="w-4 h-4 text-[var(--status-success)]"
                            aria-label={t('Accepted')}
                          />
                        ) : (
                          <Circle
                            className="w-4 h-4 text-[var(--surface-border)]"
                            aria-label={t('Unsolved')}
                          />
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenProblem(problem.id)}
                            className="text-left font-medium text-[var(--text-primary)] hover:text-[var(--brand-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)] focus-visible:outline-offset-2 rounded transition-colors"
                          >
                            {problem.title}
                          </button>
                          {problem.isDaily && (
                            <span className="font-mono text-xs text-[var(--brand-primary)]">
                              · {t('Daily')}
                            </span>
                          )}
                          {thinkPassed && (
                            <span className="font-mono text-xs text-[var(--text-tertiary)]">
                              · {t('Trace')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 hidden sm:table-cell text-xs text-[var(--text-secondary)]">
                        {trackTitleBySlug.get(problem.trackSlug) || problem.trackSlug}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`text-xs font-medium capitalize ${
                            DIFFICULTY_TEXT[problem.difficulty]
                          }`}
                        >
                          {t(problem.difficulty)}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-xs tabular-nums text-[var(--text-secondary)]">
                        {problem.xpReward}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenProblem(problem.id);
                          }}
                          className="min-h-[32px] px-3 py-1 rounded-lg text-xs font-medium border border-[var(--surface-border)] bg-[var(--surface-overlay)] text-[var(--text-primary)] hover:border-[var(--text-tertiary)] whitespace-nowrap"
                        >
                          {t('Solve')}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
