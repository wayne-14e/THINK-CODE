'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  BookMarked,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileCode2,
  ListChecks,
  PlayCircle,
  Presentation,
  Send,
  ThumbsUp,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useFirebase } from '../providers/firebase-provider';
import { useIsClient } from '@/hooks/use-is-client';
import { useI18n } from '@/lib/i18n';
import type { WorkshopRsvp, WorkshopTopicFeedback } from '@/lib/types';

function formatLocalDateTime(iso: string, isClient: boolean, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(isClient ? locale : 'en-US', {
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

function formatAcademyDate(iso: string, academyTimezone: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const shifted = new Date(date.getTime() + parseUtcOffsetMinutes(academyTimezone) * 60_000);
  return new Intl.DateTimeFormat(locale, {
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
      className="min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--surface-border)] bg-[var(--surface-overlay)] text-[var(--text-primary)] hover:border-[var(--text-tertiary)] whitespace-nowrap transition-colors"
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
    subscribeWorkshopTopicFeedback,
    submitWorkshopTopicFeedback,
  } = useFirebase();
  const isClient = useIsClient();
  const { t, locale } = useI18n();

  const [trackFilter, setTrackFilter] = useState<string>('all');
  const [rsvps, setRsvps] = useState<WorkshopRsvp[]>([]);
  const [rsvpBusy, setRsvpBusy] = useState(false);
  const [rsvpMessage, setRsvpMessage] = useState<string | null>(null);

  const [topicFeedback, setTopicFeedback] = useState<WorkshopTopicFeedback[]>([]);
  const [feedbackDraft, setFeedbackDraft] = useState<{
    works: boolean;
    suggestion: string;
  } | null>(null);
  const [feedbackBusy, setFeedbackBusy] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const upcoming = workshops.find((w) => w.isUpcoming);
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

  useEffect(() => {
    if (!upcoming) return;
    const unsub = subscribeWorkshopTopicFeedback(upcoming.id, setTopicFeedback);
    return () => unsub();
  }, [upcoming, subscribeWorkshopTopicFeedback]);

  const userRsvped = Boolean(user && rsvps.some((r) => r.uid === user.uid));
  const userFeedback = user ? topicFeedback.find((item) => item.uid === user.uid) : undefined;
  const worksCount = topicFeedback.filter((item) => item.works).length;
  const suggestionCount = topicFeedback.length - worksCount;
  const feedbackWorks = feedbackDraft?.works ?? userFeedback?.works ?? true;
  const feedbackSuggestion = feedbackDraft?.suggestion ?? userFeedback?.suggestion ?? '';

  const handleToggleRsvp = async () => {
    if (!upcoming) return;
    if (!user) {
      setRsvpMessage(t('Sign in first to RSVP.'));
      return;
    }
    setRsvpMessage(null);
    setRsvpBusy(true);
    try {
      await toggleWorkshopRsvp(upcoming.id, userRsvped);
    } catch (err) {
      setRsvpMessage(err instanceof Error ? err.message : t('Unable to update RSVP.'));
    } finally {
      setRsvpBusy(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upcoming) return;
    if (!user) {
      setFeedbackMessage(t('Sign in to share topic feedback.'));
      return;
    }
    setFeedbackMessage(null);
    setFeedbackBusy(true);
    try {
      await submitWorkshopTopicFeedback(upcoming.id, feedbackWorks, feedbackSuggestion);
      setFeedbackMessage(t('Feedback saved.'));
    } catch (err) {
      setFeedbackMessage(
        err instanceof Error ? err.message : t('Unable to save profile.')
      );
    } finally {
      setFeedbackBusy(false);
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
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          {t('Workshops')}
        </h1>
        <span className="font-mono text-xs text-[var(--text-tertiary)]">
          {t('Live problem breakdowns')}
        </span>
      </div>

      {/* Upcoming Workshop Visual Showcase */}
      {upcoming && (
        <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-raised)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-5 relative min-h-[280px] border-b lg:border-b-0 lg:border-r border-[var(--surface-border)]">
            <Image
              src="/images/workshops.gif"
              alt={t('Live Problem Breakdown')}
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--surface-raised)] via-[var(--surface-raised)]/70 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
              <span className="text-[var(--brand-primary)]">
                {t('Workshop {issue}', { issue: upcoming.issueNumber })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
                <span>{t('{count} going', { count: rsvps.length })}</span>
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 lg:p-8 flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--accent-cyan)]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {t('Academy time · {date} · {tz}', {
                      date: formatAcademyDate(upcoming.startsAtIso, upcoming.academyTimezone, locale),
                      tz: upcoming.academyTimezone,
                    })}
                  </span>
                </p>
                <p className="text-xs font-mono text-[var(--text-tertiary)]">
                  {t('Your time · {date}', {
                    date: formatLocalDateTime(upcoming.startsAtIso, isClient, locale),
                  })}
                </p>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                {upcoming.title}
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">{upcoming.summary}</p>
              <p className="text-xs text-[var(--text-tertiary)]">
                <span className="font-mono">{t('Prerequisites:')}</span> {upcoming.prerequisites}
              </p>

              {upcoming.agenda && upcoming.agenda.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <h3 className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wide text-[var(--text-tertiary)]">
                    <ListChecks className="w-3.5 h-3.5" />
                    <span>{t('Agenda')}</span>
                  </h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-[var(--text-secondary)]">
                    {upcoming.agenda.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {rsvpMessage && <p className="text-xs text-[var(--status-warning)]">{rsvpMessage}</p>}

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
                    <span>{rsvpBusy ? t('Updating...') : t('Going (Cancel)')}</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>{rsvpBusy ? t('Saving...') : t('RSVP')}</span>
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
                  <span>{t('Session link')}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              {upcoming.resources.replayUrl && (
                <ResourceLink
                  href={upcoming.resources.replayUrl}
                  icon={PlayCircle}
                  label={t('Replay')}
                />
              )}
            </div>

            {/* Topic feedback */}
            <div className="pt-4 border-t border-[var(--surface-border)] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  {t('Does this topic work for you?')}
                </h3>
                <span className="text-xs font-mono text-[var(--text-tertiary)]">
                  {t('{works} works · {suggests} suggestions', {
                    works: worksCount,
                    suggests: suggestionCount,
                  })}
                </span>
              </div>

              {user ? (
                <form onSubmit={(e) => void handleSubmitFeedback(e)} className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFeedbackDraft({ works: true, suggestion: feedbackSuggestion })
                      }
                      aria-pressed={feedbackWorks}
                      className={`min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        feedbackWorks
                          ? 'border-[var(--status-success)]/60 bg-[var(--status-success)]/10 text-[var(--status-success)]'
                          : 'border-[var(--surface-border)] bg-[var(--surface-overlay)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{t('Yes, works for me')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFeedbackDraft({ works: false, suggestion: feedbackSuggestion })
                      }
                      aria-pressed={!feedbackWorks}
                      className={`min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        !feedbackWorks
                          ? 'border-[var(--status-warning)]/60 bg-[var(--status-warning)]/10 text-[var(--status-warning)]'
                          : 'border-[var(--surface-border)] bg-[var(--surface-overlay)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t('Suggest another topic')}</span>
                    </button>
                  </div>

                  {!feedbackWorks && (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="workshop-topic-suggestion"
                        className="block text-xs font-medium text-[var(--text-secondary)]"
                      >
                        {t('Your suggestion')}
                      </label>
                      <textarea
                        id="workshop-topic-suggestion"
                        required
                        maxLength={400}
                        rows={2}
                        value={feedbackSuggestion}
                        onChange={(e) =>
                          setFeedbackDraft({
                            works: feedbackWorks,
                            suggestion: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-deep)] text-sm text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)] resize-y"
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={feedbackBusy}
                      className="min-h-[34px] px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--brand-primary)] text-[var(--brand-ink)] hover:bg-[var(--brand-primary-hover)] disabled:opacity-50 transition-colors whitespace-nowrap"
                    >
                      {feedbackBusy ? t('Saving...') : t('Submit feedback')}
                    </button>
                    {feedbackMessage && (
                      <p className="text-xs text-[var(--text-secondary)]">{feedbackMessage}</p>
                    )}
                  </div>
                </form>
              ) : (
                <p className="text-xs text-[var(--text-tertiary)]">
                  {t('Sign in to share topic feedback.')}
                </p>
              )}

              {topicFeedback.some((item) => !item.works && item.suggestion) && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-mono uppercase tracking-wide text-[var(--text-tertiary)]">
                    {t('Member suggestions')}
                  </h4>
                  <ul className="space-y-1">
                    {topicFeedback
                      .filter((item) => !item.works && item.suggestion)
                      .map((item) => (
                        <li key={item.uid} className="text-xs text-[var(--text-secondary)]">
                          <span className="font-medium text-[var(--text-primary)]">
                            {item.nickname}:
                          </span>{' '}
                          {item.suggestion}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Archive (only shown when non-upcoming workshops exist) */}
      {workshops.some((w) => w.id !== upcoming?.id) && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t('Archive')}</h2>

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
                {t('All')}
              </button>
              {tracks.map((track) => (
                <button
                  key={track.slug}
                  type="button"
                  onClick={() => setTrackFilter(track.slug)}
                  className={`min-h-[32px] px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    trackFilter === track.slug
                      ? 'bg-[var(--brand-primary)] text-[var(--brand-ink)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {track.title}
                </button>
              ))}
            </div>
          </div>

          {archived.length === 0 ? (
            <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-8 text-center text-sm text-[var(--text-secondary)]">
              {t('No archived workshops in this track.')}
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
                      <span>{formatAcademyDate(ws.startsAtIso, ws.academyTimezone, locale)}</span>
                    </div>
                    <h3 className="text-base font-semibold text-[var(--text-primary)]">
                      {ws.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{ws.summary}</p>
                    {ws.agenda && ws.agenda.length > 0 && (
                      <ol className="list-decimal list-inside space-y-0.5 text-xs text-[var(--text-tertiary)] pt-1">
                        {ws.agenda.map((item, index) => (
                          <li key={`${ws.id}-agenda-${index}`}>{item}</li>
                        ))}
                      </ol>
                    )}
                  </div>

                  {(ws.resources.slidesUrl ||
                    ws.resources.repoUrl ||
                    ws.resources.notebookUrl ||
                    ws.resources.problemSetUrl ||
                    ws.resources.replayUrl) && (
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--surface-border)]">
                      {ws.resources.replayUrl && (
                        <ResourceLink
                          href={ws.resources.replayUrl}
                          icon={PlayCircle}
                          label={t('Replay')}
                        />
                      )}
                      {ws.resources.slidesUrl && (
                        <ResourceLink
                          href={ws.resources.slidesUrl}
                          icon={Presentation}
                          label={t('Slides')}
                        />
                      )}
                      {ws.resources.repoUrl && (
                        <ResourceLink href={ws.resources.repoUrl} icon={FileCode2} label={t('Repo')} />
                      )}
                      {ws.resources.notebookUrl && (
                        <ResourceLink
                          href={ws.resources.notebookUrl}
                          icon={BookMarked}
                          label={t('Notebook')}
                        />
                      )}
                      {ws.resources.problemSetUrl && (
                        <ResourceLink
                          href={ws.resources.problemSetUrl}
                          icon={ExternalLink}
                          label={t('Problems')}
                        />
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </motion.div>
  );
}
