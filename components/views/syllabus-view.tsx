'use client';

import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { CheckCircle2, ChevronDown, ChevronUp, Clock, Code2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useFirebase } from '../providers/firebase-provider';

interface SyllabusViewProps {
  onOpenProblem: (problemId: string) => void;
}

export function SyllabusView({ onOpenProblem }: SyllabusViewProps) {
  const { tracks, userPrivate, user, completeModule } = useFirebase();
  const [selectedTrackId, setSelectedTrackId] = useState<string>(tracks[0]?.id || '');
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [busyModuleId, setBusyModuleId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const activeTrack = tracks.find((t) => t.id === selectedTrackId) || tracks[0];
  const completedInTrack = activeTrack
    ? activeTrack.modules.filter((m) => userPrivate?.completedModuleIds.includes(m.id)).length
    : 0;
  const trackPct =
    activeTrack && activeTrack.modules.length > 0
      ? Math.round((completedInTrack / activeTrack.modules.length) * 100)
      : 0;
  const trackXp = activeTrack
    ? activeTrack.modules.reduce((acc, mod) => acc + mod.xpReward, 0)
    : 0;
  const trackMinutes = activeTrack
    ? activeTrack.modules.reduce((acc, mod) => acc + mod.readingMinutes, 0)
    : 0;

  const handleComplete = async (moduleId: string, xpReward: number) => {
    if (!user) {
      setNotice('Sign in to save progress.');
      return;
    }
    setNotice(null);
    setBusyModuleId(moduleId);
    try {
      await completeModule(moduleId, xpReward);
    } finally {
      setBusyModuleId(null);
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
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Syllabus</h1>

        <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-raised)] w-fit max-w-full">
          {tracks.map((track) => {
            const active = track.id === activeTrack?.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => {
                  setSelectedTrackId(track.id);
                  setExpandedModuleId(null);
                }}
                className={`min-h-[34px] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[var(--brand-primary)] text-[var(--brand-ink)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)]'
                }`}
              >
                {track.title}
              </button>
            );
          })}
        </div>
      </div>

      {notice && (
        <div className="rounded-lg border border-[var(--accent-amber)]/40 bg-[var(--surface-raised)] px-4 py-2.5 text-xs text-[var(--accent-amber)]">
          {notice}
        </div>
      )}

      {activeTrack && (
        <div className="space-y-5">
          {/* Track header: orientation and totals, no illustration */}
          <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
              <div className="space-y-1.5 max-w-2xl">
                <p className="text-xs font-mono text-[var(--brand-primary)]">
                  Track 0{activeTrack.order}
                </p>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  {activeTrack.title}
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">{activeTrack.subtitle}</p>
              </div>

              <div className="flex items-center gap-6 font-mono tabular-nums shrink-0">
                <div>
                  <p className="text-xs text-[var(--text-tertiary)]">Modules</p>
                  <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">
                    {activeTrack.modules.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)]">XP</p>
                  <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">{trackXp}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)]">Reading</p>
                  <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">
                    {trackMinutes}m
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono tabular-nums text-[var(--text-tertiary)]">
                <span>Progress</span>
                <span className="text-[var(--text-primary)]">
                  {completedInTrack}/{activeTrack.modules.length} ({trackPct}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--surface-overlay)] overflow-hidden">
                <div
                  className="h-full bg-[var(--brand-primary)] transition-all"
                  style={{ width: `${Math.max(3, trackPct)}%`, opacity: completedInTrack === 0 ? 0.25 : 1 }}
                />
              </div>
            </div>
          </div>

          {/* Scannable Module Cards */}
          <div className="space-y-3">
            {activeTrack.modules.map((mod, idx) => {
              const completed = userPrivate?.completedModuleIds.includes(mod.id) ?? false;
              const isBusy = busyModuleId === mod.id;
              const expanded = expandedModuleId === mod.id;

              return (
                <article
                  key={mod.id}
                  className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-raised)] overflow-hidden"
                >
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <span className="font-mono text-xs tabular-nums text-[var(--text-tertiary)] pt-1 shrink-0">
                        0{idx + 1}
                      </span>
                      <div className="space-y-1 min-w-0">
                        <h3 className="text-base font-semibold text-[var(--text-primary)]">
                          {mod.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--text-tertiary)]">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{mod.readingMinutes}m</span>
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{mod.xpReward} XP</span>
                          {completed && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1 text-[var(--status-success)] font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Done</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setExpandedModuleId(expanded ? null : mod.id)}
                        className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--surface-border)] bg-[var(--surface-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
                      >
                        <span>{expanded ? 'Hide notes' : 'Notes'}</span>
                        {expanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={completed || isBusy}
                        onClick={() => void handleComplete(mod.id, mod.xpReward)}
                        className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                          completed
                            ? 'border-[var(--status-success)]/40 bg-[var(--surface-overlay)] text-[var(--status-success)] cursor-default'
                            : 'border-[var(--surface-border)] bg-[var(--surface-overlay)] text-[var(--text-primary)] hover:border-[var(--text-tertiary)]'
                        }`}
                      >
                        {completed ? 'Completed' : isBusy ? 'Saving...' : 'Mark done'}
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenProblem(mod.linkedProblemId)}
                        className="min-h-[38px] inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-[var(--brand-primary)] text-[var(--brand-ink)] hover:bg-[var(--brand-primary-hover)] transition-colors whitespace-nowrap"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Solve</span>
                      </button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="px-5 pb-5 pt-4 border-t border-[var(--surface-border)] bg-[var(--surface-deep)]/40">
                      <div className="prose prose-sm prose-invert max-w-[72ch] text-[var(--text-secondary)] prose-headings:text-[var(--text-primary)] prose-code:text-[var(--accent-cyan)] prose-pre:bg-[var(--surface-deep)] prose-pre:border prose-pre:border-[var(--surface-border)]">
                        <Markdown>{mod.theoryMarkdown}</Markdown>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
