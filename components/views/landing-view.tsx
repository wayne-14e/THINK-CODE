'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useFirebase } from '../providers/firebase-provider';
import { useIsClient } from '@/hooks/use-is-client';
import { AuthModal } from '../auth-modal';

export function LandingView() {
  const { tracks, problems, workshops } = useFirebase();
  const isClient = useIsClient();

  const [authModalOpen, setAuthModalOpen] = useState(false);

  const featuredProblem = problems.find((p) => p.isDaily) || problems[0];
  const upcomingWorkshop = workshops.find((w) => w.isUpcoming) || workshops[0];

  const [demoSelected, setDemoSelected] = useState<number | null>(null);
  const [demoChecked, setDemoChecked] = useState(false);

  const demoIsCorrect =
    featuredProblem && demoSelected !== null
      ? demoSelected === featuredProblem.thinkPrompt.correctIndex
      : false;

  const workshopDateLabel = upcomingWorkshop
    ? new Intl.DateTimeFormat(isClient ? undefined : 'en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...(isClient ? {} : { timeZone: 'UTC' }),
      }).format(new Date(upcomingWorkshop.startsAtIso))
    : '';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-deep)] text-[var(--text-primary)]">
      {/* 3-Zone Top Bar */}
      <header className="sticky top-0 z-30 h-16 border-b border-[var(--surface-border)] bg-[var(--surface-raised)]/95 backdrop-blur-sm px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1280px] h-full flex items-center justify-between gap-8">
          <a
            href="#top"
            className="inline-flex items-center gap-2.5 font-mono text-base font-bold tracking-tight text-[var(--text-primary)] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)] focus-visible:outline-offset-2 rounded"
          >
            <Image
              src="/assets/aistudio/logo.svg"
              alt="THINK//CODE logo"
              width={36}
              height={22}
              referrerPolicy="no-referrer"
              className="h-6 w-auto shrink-0"
              priority
            />
            <span>THINK//CODE</span>
          </a>

          <nav
            aria-label="Community sections"
            className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--text-secondary)]"
          >
            <a
              href="#craft"
              className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0"
            >
              Craft
            </a>
            <a
              href="#tracks"
              className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0"
            >
              Tracks
            </a>
            <a
              href="#workshops"
              className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0"
            >
              Workshops
            </a>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="min-h-[40px] px-4 py-2 rounded-lg text-sm font-mono font-semibold tracking-tight bg-[var(--brand-primary)] text-[var(--brand-ink)] hover:bg-[var(--brand-primary-hover)] focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)] focus-visible:outline-offset-2 transition-colors whitespace-nowrap shrink-0"
            >
              Sign in
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* Hero: Minimal Headline + Full-Frame Studio Visual */}
        <section className="hero-stage px-4 sm:px-6 lg:px-10 pt-14 sm:pt-20 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="mx-auto max-w-[1280px] space-y-10"
          >
            <div className="max-w-3xl mx-auto text-center space-y-5">
              <p className="text-xs font-mono text-[var(--brand-primary)]">
                Competitive Programming <span aria-hidden="true">·</span> Zero AI Slop
              </p>

              <h1
                className="font-bold tracking-tight text-[var(--text-primary)] leading-[1.06]"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
              >
                Kill <span className="accent-spectrum">AI slop.</span>{' '}
                Keep real coding alive.
              </h1>

              <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
                No prompting Claude or Codex. Pure algorithmic training from scratch.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="min-h-[46px] inline-flex items-center gap-2 px-7 py-3 rounded-lg text-sm font-mono font-semibold tracking-tight bg-[var(--brand-primary)] text-[var(--brand-ink)] hover:bg-[var(--brand-primary-hover)] focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)] focus-visible:outline-offset-2 transition-colors whitespace-nowrap"
                >
                  <span>Enter Academy</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Hero 16:9 Studio Visual */}
            <div className="hero-visual relative rounded-2xl overflow-hidden border border-[var(--surface-border)] bg-[var(--surface-raised)] aspect-[16/9] max-h-[540px] mx-auto">
              <Image
                src="/images/illustration-hero.png"
                alt="THINK//CODE code editor illustration with an Accepted result"
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-contain p-4 sm:p-8"
              />
              <div className="absolute bottom-5 left-6 right-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[var(--text-secondary)]">
                <span>Python · JavaScript · C++</span>
                <span className="text-[var(--accent-cyan)]">
                  {tracks.length} Tracks · {problems.length} Challenges
                </span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Section 2: Paper Trace Before Compiler (Visual + Live Mini Trace) */}
        <section id="craft" className="px-4 sm:px-6 lg:px-10 py-14 sm:py-20">
          <div className="mx-auto max-w-[1280px] grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Macro Paper Craft Visual */}
            <div className="ambient-card ambient-card--amber lg:col-span-6 relative rounded-2xl overflow-hidden border border-[var(--surface-border)] bg-[var(--surface-raised)] min-h-[340px]">
              <Image
                src="/images/illustration-trace.png"
                alt="Hand-drawn sliding window and pointer trace on paper"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-6 pb-24 sm:p-8 sm:pb-28"
              />
              <div className="absolute bottom-6 left-6 right-6 space-y-1.5">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                  Think before you run.
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Trace invariants first. Prompt nothing.
                </p>
              </div>
            </div>

            {/* Interactive Trace Check Visual */}
            <div className="lg:col-span-6">
              {featuredProblem && (
                <div className="ambient-card ambient-card--cyan h-full rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-6 sm:p-8 flex flex-col justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono text-[var(--text-tertiary)]">
                      <span className="text-[var(--accent-cyan)] font-semibold">
                        Live Trace Check
                      </span>
                      <span>{featuredProblem.title}</span>
                    </div>

                    <pre className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-deep)] p-4 text-xs sm:text-sm font-mono text-[var(--text-primary)] overflow-x-auto leading-relaxed">
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
                            className={`text-left px-3.5 py-3 rounded-lg border text-xs font-mono transition-colors ${
                              selected
                                ? 'border-[var(--brand-primary)] bg-[var(--surface-overlay)] text-[var(--text-primary)]'
                                : 'border-[var(--surface-border)] bg-[var(--surface-deep)] text-[var(--text-secondary)] hover:border-[var(--text-tertiary)]'
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
                      className="min-h-[40px] px-4 py-2 rounded-lg text-xs font-mono font-semibold tracking-tight bg-[var(--brand-primary)] text-[var(--brand-ink)] hover:bg-[var(--brand-primary-hover)] disabled:opacity-40 transition-colors whitespace-nowrap"
                    >
                      Verify trace
                    </button>

                    {demoChecked && demoSelected !== null && (
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          demoIsCorrect
                            ? 'text-[var(--status-success)]'
                            : 'text-[var(--status-error)]'
                        }`}
                      >
                        {demoIsCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Exact match</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            <span>Try again</span>
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

        {/* Section 3: Algorithmic Geometry + Visual Tracks */}
        <section id="tracks" className="px-4 sm:px-6 lg:px-10 py-14 sm:py-20">
          <div className="mx-auto max-w-[1280px] space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="ambient-card ambient-card--cyan lg:col-span-5 relative rounded-2xl overflow-hidden border border-[var(--surface-border)] bg-[var(--surface-raised)] min-h-[280px]">
                <Image
                  src="/images/illustration-path.png"
                  alt="Isometric path of stairs leading to a flag, representing syllabus progression"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-contain p-6 sm:p-8"
                />
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                    Four core tracks.
                  </h2>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tracks.map((track, index) => (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => setAuthModalOpen(true)}
                    className={`ambient-card ambient-card--${index % 4 === 2 ? 'amber' : index % 4 === 1 ? 'cyan' : 'lime'} text-left rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-6 flex flex-col justify-between gap-6 group`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono text-[var(--text-tertiary)]">
                      <span>0{track.order}</span>
                      <ArrowRight className="track-arrow w-4 h-4 text-[var(--text-tertiary)] transition-colors" />
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                        {track.title}
                      </h3>
                      {/* Visual module node strip */}
                      <div className="flex items-center gap-1.5" aria-hidden="true">
                        {track.modules.map((m) => (
                          <span
                            key={m.id}
                            className="track-node h-1.5 flex-1 rounded-full bg-[var(--surface-overlay)] transition-colors"
                          />
                        ))}
                      </div>
                      <p className="text-xs font-mono tabular-nums text-[var(--text-tertiary)]">
                        {track.modules.length} modules
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Sunday Workshop Visual Showcase */}
        <section id="workshops" className="px-4 sm:px-6 lg:px-10 pt-6 pb-20">
          <div className="mx-auto max-w-[1280px]">
            <div className="ambient-card ambient-card--cyan rounded-2xl overflow-hidden border border-[var(--surface-border)] bg-[var(--surface-raised)] grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-5 relative min-h-[240px]">
                <Image
                  src="/images/illustration-hero.png"
                  alt="Code editor illustration representing a live Sunday workshop"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-contain p-6 sm:p-8"
                />
              </div>

              <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <p className="inline-flex items-center gap-2 text-xs font-mono text-[var(--accent-cyan)]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Sunday Workshop · {upcomingWorkshop?.issueNumber} · {workshopDateLabel}
                    </span>
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                    {upcomingWorkshop?.title || 'Live Problem Breakdown'}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Live problem breakdowns, real mentors, and no AI shortcuts.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="min-h-[44px] inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-mono font-semibold tracking-tight bg-[var(--brand-primary)] text-[var(--brand-ink)] hover:bg-[var(--brand-primary-hover)] transition-colors whitespace-nowrap shrink-0 self-start"
                >
                  <span>Join with Google or GitHub</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--surface-border)] bg-[var(--surface-raised)] px-4 sm:px-6 lg:px-10 py-6">
        <div className="mx-auto max-w-[1280px] flex items-center justify-between gap-4 text-xs text-[var(--text-tertiary)]">
          <span className="font-mono font-bold text-[var(--text-primary)]">THINK//CODE</span>
          <span>Think. Code. Repeat.</span>
        </div>
      </footer>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
