'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, BarChart3, Braces, BrainCircuit, Calendar, CheckCircle2, Cloud, Code2, Trophy, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useFirebase } from '../providers/firebase-provider';
import { useIsClient } from '@/hooks/use-is-client';
import { AuthModal } from '../auth-modal';
import { CommunityLinks } from '../community-links';
import { LanguageToggle } from '../language-toggle';
import { useI18n } from '@/lib/i18n';

const TRACK_ACCENTS = ['ambient-card--green', 'ambient-card--blurple'] as const;

const MARQUEE_TOPICS = [
  { label: 'Python', Icon: Code2 },
  { label: 'JavaScript', Icon: Braces },
  { label: 'AI & ML', Icon: BrainCircuit },
  { label: 'DevOps', Icon: Cloud },
  { label: 'Data Science', Icon: BarChart3 },
  { label: 'LeetCode / Codeforces', Icon: Trophy },
] as const;

export function LandingView() {
  const { tracks, problems, workshops } = useFirebase();
  const isClient = useIsClient();
  const { t, locale } = useI18n();

  const [authModalOpen, setAuthModalOpen] = useState(false);

  const featuredProblem = problems.find((p) => p.isDaily) || problems[0];
  const upcomingWorkshop = workshops.find((w) => w.isUpcoming);

  const [demoSelected, setDemoSelected] = useState<number | null>(null);
  const [demoChecked, setDemoChecked] = useState(false);

  const demoIsCorrect =
    featuredProblem && demoSelected !== null
      ? demoSelected === featuredProblem.thinkPrompt.correctIndex
      : false;

  const workshopDateLabel = upcomingWorkshop
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
    <div className="app-canvas min-h-screen flex flex-col bg-[var(--surface-deep)] text-[var(--text-primary)]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 h-16 border-b border-[var(--surface-border)] bg-[var(--surface-deep)]/85 backdrop-blur-md px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1280px] h-full flex items-center justify-between gap-8">
          <a
            href="#top"
            className="inline-flex items-center gap-2.5 font-mono text-base font-bold tracking-tight text-[var(--text-primary)] whitespace-nowrap shrink-0 rounded"
          >
            <Image
              src="/assets/logo.svg"
              alt={t('Brand logo')}
              width={36}
              height={22}
              referrerPolicy="no-referrer"
              className="h-6 w-auto shrink-0"
              priority
            />
            <span>
              THINK<span className="text-[var(--brand-primary)]">{'//'}</span>CODE
            </span>
          </a>

          <nav
            aria-label={t('Community')}
            className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]"
          >
            <a
              href="#craft"
              className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0"
            >
              {t('Practice')}
            </a>
            <a
              href="#tracks"
              className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0"
            >
              {t('Tracks')}
            </a>
            <a
              href="#workshops"
              className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0"
            >
              {t('Workshops')}
            </a>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <LanguageToggle compact />
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="min-h-[40px] px-5 py-2 rounded-lg text-sm font-semibold tracking-tight bg-white text-[var(--surface-deep)] hover:bg-white/90 transition-colors whitespace-nowrap shrink-0"
            >
              {t('Sign in')}
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* Hero */}
        <section className="hero-stage px-4 sm:px-6 lg:px-10 pt-16 sm:pt-24 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="mx-auto max-w-[1280px] space-y-12"
          >
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <p className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-[var(--brand-primary)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)]" aria-hidden="true" />
                {t('Competitive Programming · Human Mentors')}
              </p>

              <h1
                className="display-hero text-[var(--text-primary)]"
                style={{ fontSize: 'clamp(2.75rem, 7vw, 5.25rem)' }}
              >
                {t('Think deeper. Solve')}{' '}
                <span className="bg-[linear-gradient(90deg,var(--brand-primary),var(--brand-secondary))] bg-clip-text text-transparent">
                  {t('smarter')}
                </span>
                .
              </h1>

              {/* <div
                className="mx-auto h-1 w-28 rounded-full bg-[linear-gradient(90deg,var(--brand-primary),var(--brand-secondary))]"
                aria-hidden="true"
              /> */}

              <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
                {t(
                  'Build algorithmic confidence through deliberate practice, real mentors, and a community that codes together.'
                )}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="min-h-[50px] inline-flex items-center gap-2 px-7 py-3 rounded-lg text-sm font-bold uppercase tracking-wide bg-[var(--brand-primary)] text-[var(--brand-primary-ink)] hover:bg-[var(--brand-primary-hover)] transition-colors whitespace-nowrap"
                >
                  <span>{t('Start practicing')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#craft"
                  className="min-h-[50px] inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold border border-white/25 bg-white/5 text-[var(--text-primary)] hover:bg-white/10 hover:border-white/40 transition-colors whitespace-nowrap"
                >
                  {t('See how it works')}
                </a>
              </div>
            </div>

            {/* Full-bleed hero media */}
            <div className="mx-auto w-full max-w-4xl space-y-4">
              <div className="gif-frame hero-visual aspect-[400/246] w-full">
                <Image
                  src="/images/cat-coding.gif"
                  alt={t('A cat typing code at a desk')}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 896px) 100vw, 896px"
                  className="object-cover"
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Marquee band */}
        <div className="marquee border-y border-[var(--brand-primary)]/35 bg-[var(--surface-raised)]/70 py-3 sm:py-4">
          <div className="marquee-track items-center">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                aria-hidden={copy === 1}
                className="flex min-w-[100vw] shrink-0 items-center justify-around"
              >
                {MARQUEE_TOPICS.map(({ label, Icon }) => (
                  <span
                    key={`${copy}-${label}`}
                    className="display-band flex items-center gap-3 px-6 text-2xl text-[var(--brand-primary)] sm:text-3xl"
                  >
                    <Icon
                      className="h-6 w-6 shrink-0 text-[var(--brand-secondary-soft)] sm:h-7 sm:w-7"
                      aria-hidden="true"
                    />
                    <span>{label}</span>
                    <span className="ml-8 text-[var(--brand-secondary-soft)]" aria-hidden="true">
                      ·
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Trace check */}
        <section id="craft" className="px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
          <div className="mx-auto max-w-[1280px] grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            <div className="lg:col-span-5 flex flex-col rounded-2xl overflow-hidden border border-[var(--brand-primary)]/35 bg-[var(--surface-raised)] ambient-card ambient-card--green">
              <div className="relative aspect-[4/3] w-full shrink-0">
                <Image
                  src="/images/anthem-func.gif"
                  alt={t('An animated function working through its steps')}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6 sm:p-8 space-y-2">
                <p className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--brand-primary)]">
                  {t('Paper first')}
                </p>
                <h2 className="text-2xl sm:text-3xl text-[var(--text-primary)]">
                  {t('Think before you run.')}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {t('Work through the state before you touch the keyboard.')}
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              {featuredProblem && (
                <div className="h-full rounded-2xl border border-[var(--brand-primary)]/40 bg-[var(--surface-raised)] p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-[0_22px_60px_rgba(53,237,126,0.12)]">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4 text-xs font-mono uppercase tracking-wide text-[var(--text-tertiary)]">
                      <span className="inline-flex items-center gap-2 font-semibold text-[var(--brand-primary)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)]" aria-hidden="true" />
                        {t('Live Trace Check')}
                      </span>
                      <span className="truncate">{featuredProblem.title}</span>
                    </div>

                    <pre className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface-black)] p-4 text-xs sm:text-sm font-mono text-[var(--text-primary)] overflow-x-auto leading-relaxed">
                      <code>{featuredProblem.thinkPrompt.codeSnippet}</code>
                    </pre>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {featuredProblem.thinkPrompt.options.map((opt, idx) => {
                        const selected = demoSelected === idx;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setDemoSelected(idx);
                              setDemoChecked(false);
                            }}
                            className={`text-left px-4 py-3 rounded-lg border text-xs font-mono transition-colors ${
                              selected
                                ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/12 text-[var(--text-primary)]'
                                : 'border-[var(--surface-border)] bg-[var(--surface-deep)]/70 text-[var(--text-secondary)] hover:border-[var(--brand-primary)]/60'
                            }`}
                          >
                            <span className="text-[var(--text-tertiary)] mr-2">{idx + 1}.</span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--surface-border)]">
                    <button
                      type="button"
                      disabled={demoSelected === null}
                      onClick={() => setDemoChecked(true)}
                      className="min-h-[42px] px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide bg-[var(--brand-primary)] text-[var(--brand-primary-ink)] hover:bg-[var(--brand-primary-hover)] disabled:opacity-40 transition-colors whitespace-nowrap"
                    >
                      {t('Verify trace')}
                    </button>

                    {demoChecked && demoSelected !== null && (
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          demoIsCorrect ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'
                        }`}
                      >
                        {demoIsCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{t('Trace verified')}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            <span>{t('Trace it line by line')}</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tracks */}
        <section id="tracks" className="px-4 sm:px-6 lg:px-10 pb-16 sm:pb-24">
          <div className="mx-auto max-w-[1280px] grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            <div className="lg:col-span-5 relative overflow-hidden rounded-2xl border border-[var(--brand-primary)]/30 bg-[linear-gradient(140deg,#052a1b_0%,#071a33_52%,#0a1029_100%)] p-8 sm:p-10 flex flex-col justify-between min-h-[300px] shadow-[0_22px_60px_rgba(3,8,20,0.7)]">
              <div
                className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[32px] border-[var(--brand-primary)]/15"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[var(--brand-secondary)]/15 blur-2xl"
                aria-hidden="true"
              />
              <span className="relative font-mono text-xs uppercase tracking-[0.2em] text-[var(--brand-primary)]">
                {t('Learning path')}
              </span>
              <div className="relative space-y-3">
                <span className="display-hero block text-[6rem] leading-none text-[var(--brand-primary)]">
                  {String(tracks.length).padStart(2, '0')}
                </span>
                <h2 className="text-3xl sm:text-4xl text-white">
                  {t('Four core tracks.')}
                </h2>
                <p className="max-w-xs text-sm text-[var(--text-secondary)]">
                  {t('From first principles to competitive programming, one deliberate step at a time.')}
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tracks.map((track, index) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className={`ambient-card ${TRACK_ACCENTS[index % TRACK_ACCENTS.length]} text-left rounded-xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-6 flex flex-col justify-between gap-6 group`}
                >
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wide text-[var(--text-tertiary)]">
                    <span>0{track.order}</span>
                    <ArrowRight className="track-arrow w-4 h-4 text-[var(--text-tertiary)] transition-colors" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg text-[var(--text-primary)]">{track.title}</h3>
                    <div className="flex items-center gap-1.5" aria-hidden="true">
                      {track.modules.map((m) => (
                        <span
                          key={m.id}
                          className="track-node h-1.5 flex-1 rounded-full bg-[var(--surface-overlay)] transition-colors"
                        />
                      ))}
                    </div>
                    <p className="text-xs font-mono tabular-nums uppercase text-[var(--text-tertiary)]">
                      {t('{count} modules', { count: track.modules.length })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Workshop showcase */}
        {upcomingWorkshop && (
          <section id="workshops" className="px-4 sm:px-6 lg:px-10 pb-16 sm:pb-24">
            <div className="mx-auto max-w-[1280px] rounded-2xl overflow-hidden border border-[var(--brand-secondary)]/40 bg-[var(--surface-raised)] grid grid-cols-1 lg:grid-cols-12 items-stretch shadow-[0_22px_60px_rgba(88,101,242,0.16)]">
              <div className="relative lg:col-span-6 min-h-[280px]">
                <Image
                  src="/images/workshops.gif"
                  alt={t('Live Problem Breakdown')}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(6,8,28,0.6)_100%)]" />
              </div>

              <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between gap-6">
                <div className="space-y-3 max-w-xl">
                  <p className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.14em] text-[var(--brand-secondary-soft)]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {t('Live Workshop · {issue} · {date}', {
                        issue: upcomingWorkshop.issueNumber,
                        date: workshopDateLabel,
                      })}
                    </span>
                  </p>
                  <h2 className="text-2xl sm:text-4xl text-[var(--text-primary)]">
                    {upcomingWorkshop.title}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {t('Live problem breakdowns, real mentors, and room for your questions.')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="min-h-[48px] inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide bg-[var(--brand-secondary)] text-[var(--brand-secondary-ink)] hover:bg-[var(--brand-secondary-hover)] transition-colors whitespace-nowrap shrink-0 self-start"
                >
                  <span>{t('Join with Google or GitHub')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* CTA band */}
        <section className="px-4 sm:px-6 lg:px-10 pb-16 sm:pb-24">
          <div className="mx-auto max-w-[1280px] relative overflow-hidden rounded-2xl border border-[var(--brand-primary)]/30 bg-[var(--surface-raised)] px-6 py-14 sm:px-12 sm:py-20 text-center">
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[var(--brand-primary)]/15 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-[var(--brand-secondary)]/20 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative mx-auto max-w-3xl space-y-6">
              <h2
                className="display-band text-white"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
              >
                {t('Ready to think in code?')}
              </h2>
              <p className="mx-auto max-w-xl text-sm sm:text-base text-[var(--text-secondary)]">
                {t(
                  'Join the next workshop, trace your first problem, and build interview-ready habits with people who care.'
                )}
              </p>
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="min-h-[52px] inline-flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-wide bg-[var(--brand-primary)] text-[var(--brand-primary-ink)] hover:bg-[var(--brand-primary-hover)] transition-colors whitespace-nowrap"
              >
                <span>{t('Start practicing')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--surface-border)] bg-[var(--surface-deep)] px-4 sm:px-6 lg:px-10 pt-10 pb-4">
        <div className="mx-auto max-w-[1280px] space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[var(--text-tertiary)]">
            <span className="font-mono font-bold text-[var(--text-primary)]">
              THINK<span className="text-[var(--brand-primary)]">{'//'}</span>CODE
            </span>
            <CommunityLinks variant="footer" />
            <span className="uppercase tracking-wide">{t('Think. Code. Repeat.')}</span>
          </div>
          <div
            className="display-band select-none text-center leading-none text-white/10"
            style={{ fontSize: 'clamp(2.5rem, 11vw, 9rem)' }}
            aria-hidden="true"
          >
            THINK//CODE
          </div>
        </div>
      </footer>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
