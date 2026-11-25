'use client';

import React, { useEffect, useRef } from 'react';
import {
  CalendarCheck,
  Flame,
  GraduationCap,
  ShieldCheck,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { BADGE_CATALOG, getBadgeDefinition, type BadgeIcon } from '@/lib/badges';
import { useI18n } from '@/lib/i18n';
import type { PublicProfile, Track } from '@/lib/types';
import { effectiveWeeklyXp } from '@/lib/week';

const BADGE_ICONS: Record<BadgeIcon, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  calendar: CalendarCheck,
  users: Users,
  flame: Flame,
  graduation: GraduationCap,
};

interface MemberProfileModalProps {
  profile: PublicProfile | null;
  tracks: Track[];
  onClose: () => void;
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] p-3">
      <p className="text-xs text-[var(--text-tertiary)]">{label}</p>
      <p className="mt-1 font-mono text-lg font-bold tabular-nums text-[var(--text-primary)]">
        {value}
      </p>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-[var(--surface-border)] bg-[var(--surface-overlay)] px-2 py-1 text-xs text-[var(--text-secondary)]">
      {children}
    </span>
  );
}

export function MemberProfileModal({ profile, tracks, onClose }: MemberProfileModalProps) {
  const { t, language } = useI18n();
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!profile) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [profile, onClose]);

  if (!profile) return null;

  const completedTrackSlugs = profile.completedTrackSlugs || [];
  const completedTracks = tracks.filter((track) => completedTrackSlugs.includes(track.slug));
  const badges = (profile.badges || [])
    .map((id) => getBadgeDefinition(id))
    .filter((badge): badge is NonNullable<typeof badge> => Boolean(badge));
  const unknownBadges = (profile.badges || []).filter(
    (id) => !BADGE_CATALOG.some((badge) => badge.id === id)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-profile-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--surface-border)] bg-[var(--surface-overlay)] font-mono text-sm font-bold text-[var(--brand-primary)]">
              {profile.avatarInitials}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-mono text-[var(--text-tertiary)]">
                {t('Public member profile')}
              </p>
              <h2
                id="member-profile-title"
                className="mt-0.5 truncate text-xl font-bold text-[var(--text-primary)]"
              >
                {profile.nickname}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                <span className="capitalize">{profile.role}</span>
                {(profile.role === 'admin' || profile.role === 'mentor') && (
                  <span className="inline-flex items-center gap-1 font-mono text-[var(--accent-cyan)]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t('Mentor')}</span>
                  </span>
                )}
                {profile.githubHandle && (
                  <a
                    href={`https://github.com/${encodeURIComponent(profile.githubHandle)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent-cyan)] hover:underline"
                  >
                    GitHub · {profile.githubHandle}
                  </a>
                )}
                {profile.telegramHandle && (
                  <a
                    href={`https://t.me/${encodeURIComponent(profile.telegramHandle)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent-cyan)] hover:underline"
                  >
                    Telegram · {profile.telegramHandle}
                  </a>
                )}
              </div>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t('Close profile')}
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-[var(--surface-border)] bg-[var(--surface-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label={t('Total XP')} value={profile.xp} />
          <Stat label={t('Weekly XP')} value={effectiveWeeklyXp(profile)} />
          <Stat
            label={t('Current Streak')}
            value={
              <span className="inline-flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[var(--brand-primary)]" />
                <span>{profile.currentStreak}d</span>
              </span>
            }
          />
          <Stat label={t('Longest streak')} value={`${profile.longestStreak}d`} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{t('Stack')}</h3>
            {profile.stack && profile.stack.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.stack.map((item) => (
                  <Chip key={item}>{item}</Chip>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-tertiary)]">{t('No stack listed.')}</p>
            )}
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{t('Tags')}</h3>
            {profile.tags && profile.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.tags.map((item) => (
                  <Chip key={item}>{item}</Chip>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-tertiary)]">{t('No tags listed.')}</p>
            )}
          </section>
        </div>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{t('Solved Breakdown')}</h3>
          <div className="grid grid-cols-3 gap-3">
            <Stat label={t('Easy')} value={profile.solvedEasy} />
            <Stat label={t('Medium')} value={profile.solvedMedium} />
            <Stat label={t('Hard')} value={profile.solvedHard} />
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{t('Badges')}</h3>
          {badges.length > 0 || unknownBadges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => {
                const Icon = BADGE_ICONS[badge.icon];
                return (
                  <span
                    key={badge.id}
                    title={language === 'ru' ? badge.descriptionRu : badge.description}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-overlay)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-primary)]"
                  >
                    <Icon className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                    <span>{language === 'ru' ? badge.labelRu : badge.label}</span>
                  </span>
                );
              })}
              {unknownBadges.map((id) => (
                <Chip key={id}>{id}</Chip>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-tertiary)]">{t('No badges yet.')}</p>
          )}
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{t('Completed tracks')}</h3>
          {completedTracks.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {completedTracks.map((track) => (
                <Chip key={track.slug}>{track.title}</Chip>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-tertiary)]">{t('No completed tracks yet.')}</p>
          )}
        </section>
      </div>
    </div>
  );
}
