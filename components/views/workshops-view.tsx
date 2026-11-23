'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  BookMarked,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileCode2,
  Presentation,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useFirebase } from '../providers/firebase-provider';
import { useIsClient } from '@/hooks/use-is-client';
import type { WorkshopRsvp } from '@/lib/types';

function formatLocalDateTime(iso: string, isClient: boolean): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(isClient ? undefined : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
    ...(isClient ? {} : { timeZone: 'UTC' }),
  }).format(date);
}

function parseUtcOffsetMinutes(label: string): number {
  const match = label.match(/UTC\s*([+-])\s*(\d{1,2})(?::?(\d{2}))?/i);
  if (!match) return 0;
  const sign = match[1] === '-' ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3] ?? 0));
}

function formatAcademyDate(iso: string, academyTimezone: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const shifted = new Date(date.getTime() + parseUtcOffsetMinutes(academyTimezone) * 60_000);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(shifted);
}

function ResourceLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--surface-border)] bg-[var(--surface-overlay)] text-[var(--text-primary)] hover:border-[var(--text-tertiary)] whitespace-nowrap"
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </a>
  );
}

export function WorkshopsView() {
  const {
    workshops,
    tracks,
    user,
    subscribeWorkshopRsvps,
    toggleWorkshopRsvp,
  } = useFirebase();
  const isClient = useIsClient();

  const [trackFilter, setTrackFilter] = useState<string>('all');
  const [rsvps, setRsvps] = useState<WorkshopRsvp[]>([]);
  const [rsvpBusy, setRsvpBusy] = useState(false);
  const [rsvpMessage, setRsvpMessage] = useState<string | null>(null);

  const upcoming = workshops.find((w) => w.isUpcoming) || workshops[0];
  const archived = useMemo(
    () =>
      workshops
        .filter((w) => w.id !== upcoming?.id)
        .filter((w) => trackFilter === 'all' || w.trackSlug === trackFilter),
    [workshops, upcoming?.id, trackFilter]
  );

  useEffect(() => {
    if (!upcoming) return;
    const unsub = subscribeWorkshopRsvps(upcoming.id, setRsvps);
    return () => unsub();
  }, [upcoming, subscribeWorkshopRsvps]);

  const userRsvped = Boolean(user && rsvps.some((r) => r.uid === user.uid));

  const handleToggleRsvp = async () => {
    if (!upcoming) return;
    if (!user) {
      setRsvpMessage('Sign in first to RSVP.');
      return;
    }
    setRsvpMessage(null);
    setRsvpBusy(true);
    try {
      await toggleWorkshopRsvp(upcoming.id, userRsvped);
    } catch (err) {
      setRsvpMessage(err instanceof Error ? err.message : 'Unable to update RSVP.');
    } finally {
      setRsvpBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="p-4 sm:p-6 lg:p-8 space-y-8"
    >
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Workshops</h1>
        <span className="font-mono text-xs text-[var(--text-tertiary)]">
          Live problem breakdowns
        </span>
      </div>

      {/* Upcoming Workshop Visual Showcase */}
      {upcoming && (
        <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-raised)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-5 relative min-h-[220px] border-b lg:border-b-0 lg:border-r border-[var(--surface-border)]">
            <Image
              src="/images/illustration-hero.png"
              alt="Code editor illustration representing a live workshop"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-contain p-6"
            />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[var(--surface-raised)] to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
              <span className="text-[var(--brand-primary)]">Workshop {upcoming.issueNumber}</span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
                <span>{rsvps.length} going</span>
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 lg:p-8 flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--accent-cyan)]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Academy time · {formatAcademyDate(upcoming.startsAtIso, upcoming.academyTimezone)} ·{' '}
                    {upcoming.academyTimezone}
                  </span>
                </p>
                <p className="text-xs font-mono text-[var(--text-tertiary)]">
                  Your time · {formatLocalDateTime(upcoming.startsAtIso, isClient)}
                </p>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                {upcoming.title}
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">{upcoming.summary}</p>
              <p className="text-xs text-[var(--text-tertiary)]">
                <span className="font-mono">Prerequisites:</span> {upcoming.prerequisites}
              </p>
            </div>

            {rsvpMessage && <p className="text-xs text-[var(--accent-amber)]">{rsvpMessage}</p>}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={rsvpBusy}
                onClick={() => void handleToggleRsvp()}
                className={`min-h-[42px] inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                  userRsvped
                    ? 'border border-[var(--status-success)]/50 bg-[var(--surface-overlay)] text-[var(--status-success)]'
                    : 'bg-[var(--brand-primary)] text-[var(--brand-ink)] hover:bg-[var(--brand-primary-hover)]'
                }`}
              >
                {userRsvped ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{rsvpBusy ? 'Updating...' : 'Going (Cancel)'}</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>{rsvpBusy ? 'Saving...' : 'RSVP'}</span>
                  </>
                )}
              </button>

              {upcoming.locationUrl && (
                <a
                  href={upcoming.locationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--surface-border)] bg-[var(--surface-overlay)] text-[var(--text-primary)] hover:border-[var(--text-tertiary)] transition-colors whitespace-nowrap"
                >
                  <span>Session link</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Archive (only shown when non-upcoming workshops exist) */}
      {workshops.some((w) => w.id !== upcoming?.id) && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Archive</h2>

            <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-raised)] w-fit">
              <button
                type="button"
                onClick={() => setTrackFilter('all')}
                className={`min-h-[32px] px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  trackFilter === 'all'
                    ? 'bg-[var(--brand-primary)] text-[var(--brand-ink)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                All
              </button>
              {tracks.map((t) => (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => setTrackFilter(t.slug)}
                  className={`min-h-[32px] px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    trackFilter === t.slug
                      ? 'bg-[var(--brand-primary)] text-[var(--brand-ink)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {t.title}
                </button>
              ))}
            </div>
          </div>

          {archived.length === 0 ? (
            <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-8 text-center text-sm text-[var(--text-secondary)]">
              No archived workshops in this track.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {archived.map((ws) => (
                <article
                  key={ws.id}
                  className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-tertiary)]">
                      <span className="text-[var(--accent-cyan)]">#{ws.issueNumber}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatAcademyDate(ws.startsAtIso, ws.academyTimezone)}</span>
                    </div>
                    <h3 className="text-base font-semibold text-[var(--text-primary)]">{ws.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{ws.summary}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--surface-border)]">
                    {ws.resources.slidesUrl && (
                      <ResourceLink href={ws.resources.slidesUrl} icon={Presentation} label="Slides" />
                    )}
                    {ws.resources.repoUrl && (
                      <ResourceLink href={ws.resources.repoUrl} icon={FileCode2} label="Repo" />
                    )}
                    {ws.resources.notebookUrl && (
                      <ResourceLink
                        href={ws.resources.notebookUrl}
                        icon={BookMarked}
                        label="Notebook"
                      />
                    )}
                    {ws.resources.problemSetUrl && (
                      <ResourceLink
                        href={ws.resources.problemSetUrl}
                        icon={ExternalLink}
                        label="Problems"
                      />
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </motion.div>
  );
}
