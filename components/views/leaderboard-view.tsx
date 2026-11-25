'use client';

import React, { useMemo, useState } from 'react';
import { Flame, Search, ShieldCheck, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { useFirebase } from '../providers/firebase-provider';
import { MemberProfileModal } from '../member-profile-modal';
import { useI18n } from '@/lib/i18n';
import type { PublicProfile } from '@/lib/types';
import { effectiveWeeklyXp } from '@/lib/week';

export function LeaderboardView() {
  const { leaderboard, user, tracks } = useFirebase();
  const { t } = useI18n();
  const [period, setPeriod] = useState<'weekly' | 'alltime'>('weekly');
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<PublicProfile | null>(null);

  const scoreOf = (member: PublicProfile) =>
    period === 'weekly' ? effectiveWeeklyXp(member) : member.xp;

  const sortedAll = useMemo(
    () => [...leaderboard].sort((a, b) => scoreOf(b) - scoreOf(a)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [leaderboard, period]
  );

  const topThree = sortedAll.slice(0, 3);
  const topXp = Math.max(1, ...(topThree.map(scoreOf) || [1]));

  const ranked = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortedAll
      .map((member, index) => ({ member, rank: index + 1 }))
      .filter(({ member }) => !q || member.nickname.toLowerCase().includes(q));
  }, [sortedAll, search]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="p-4 sm:p-6 lg:p-8 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          {t('Leaderboard')}
        </h1>

        <div className="flex items-center gap-1 p-1 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-raised)] w-fit">
          <button
            type="button"
            onClick={() => setPeriod('weekly')}
            className={`min-h-[34px] px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              period === 'weekly'
                ? 'bg-[var(--brand-primary)] text-[var(--brand-ink)] font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t('Weekly')}
          </button>
          <button
            type="button"
            onClick={() => setPeriod('alltime')}
            className={`min-h-[34px] px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              period === 'alltime'
                ? 'bg-[var(--brand-primary)] text-[var(--brand-ink)] font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t('All-Time')}
          </button>
        </div>
      </div>

      {/* Visual Top 3 XP Comparison Strip */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {topThree.map((member, idx) => {
            const val = scoreOf(member);
            const pct = Math.max(12, Math.round((val / topXp) * 100));
            return (
              <button
                type="button"
                key={member.uid}
                onClick={() => setSelectedMember(member)}
                className="text-left rounded-xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-5 space-y-3 hover:border-[var(--text-tertiary)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)] focus-visible:outline-offset-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[var(--text-tertiary)]">#{idx + 1}</span>
                  <Trophy
                    className={`w-4 h-4 ${
                      idx === 0 ? 'text-[var(--brand-primary)]' : 'text-[var(--accent-amber)]'
                    }`}
                  />
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-base font-semibold text-[var(--text-primary)] truncate">
                    {member.nickname}
                  </span>
                  <span className="font-mono text-sm font-bold tabular-nums text-[var(--brand-primary)] shrink-0">
                    {val} XP
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--surface-overlay)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--brand-primary)] transition-all"
                    style={{ width: `${pct}%`, opacity: idx === 0 ? 1 : 0.65 }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex justify-end">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Find member...')}
            aria-label={t('Filter leaderboard by nickname')}
            className="w-full min-h-[40px] pl-9 pr-3 py-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-raised)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)]"
          />
        </div>
      </div>

      <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-raised)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--surface-border)] text-xs font-medium text-[var(--text-tertiary)] bg-[var(--surface-overlay)]/50">
                <th className="py-3 px-4 w-16 font-mono">{t('Rank')}</th>
                <th className="py-3 px-4">{t('Member')}</th>
                <th className="py-3 px-4 text-right font-mono">{t('Streak')}</th>
                <th className="py-3 px-4 text-right font-mono hidden sm:table-cell">
                  {t('E / M / H')}
                </th>
                <th className="py-3 px-4 text-right font-mono">
                  {period === 'weekly' ? t('Weekly XP') : t('Total XP')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-border)] text-sm">
              {ranked.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 px-4 text-center text-[var(--text-secondary)]">
                    {leaderboard.length === 0
                      ? t('No ranked members yet.')
                      : t('No matching members.')}
                  </td>
                </tr>
              ) : (
                ranked.map(({ member, rank }) => {
                  const isSelf = user?.uid === member.uid;
                  return (
                    <tr
                      key={member.uid}
                      className={`h-11 cursor-pointer ${
                        isSelf ? 'bg-[var(--surface-overlay)]' : 'hover:bg-[var(--surface-overlay)]/50'
                      }`}
                      onClick={() => setSelectedMember(member)}
                    >
                      <td className="py-2.5 px-4 font-mono text-xs tabular-nums text-[var(--text-tertiary)]">
                        #{rank}
                      </td>
                      <td className="py-2.5 px-4">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedMember(member);
                          }}
                          className="flex items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)] focus-visible:outline-offset-2 rounded"
                        >
                          <span className="font-mono text-xs text-[var(--brand-primary)] w-6">
                            {member.avatarInitials}
                          </span>
                          <span className="font-medium text-[var(--text-primary)] hover:underline">
                            {member.nickname}
                          </span>
                          {(member.role === 'admin' || member.role === 'mentor') && (
                            <span className="inline-flex items-center gap-1 text-xs font-mono text-[var(--accent-cyan)]">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>{t('Mentor')}</span>
                            </span>
                          )}
                          {isSelf && (
                            <span className="text-xs font-mono text-[var(--brand-primary)]">
                              · {t('You')}
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-xs tabular-nums text-[var(--text-secondary)]">
                        <span className="inline-flex items-center justify-end gap-1">
                          <Flame className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                          <span>{member.currentStreak}d</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-xs tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                        {member.solvedEasy} / {member.solvedMedium} / {member.solvedHard}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-xs font-semibold tabular-nums text-[var(--brand-primary)]">
                        {scoreOf(member)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MemberProfileModal
        profile={selectedMember}
        tracks={tracks}
        onClose={() => setSelectedMember(null)}
      />
    </motion.div>
  );
}
