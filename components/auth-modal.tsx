'use client';

import React, { useEffect } from 'react';
import { X, Github, Chrome, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFirebase } from './providers/firebase-provider';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { signInWithGoogle, signInWithGithub, authError, clearAuthError, user } = useFirebase();

  useEffect(() => {
    if (user && open) {
      onClose();
    }
  }, [user, open, onClose]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="w-full max-w-md rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-[var(--text-tertiary)]">
                  THINK//CODE Academy
                </p>
                <h2
                  id="auth-modal-title"
                  className="mt-1 text-xl font-bold text-[var(--text-primary)]"
                >
                  Sign in to your workstation
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  clearAuthError();
                  onClose();
                }}
                aria-label="Close sign-in dialog"
                className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-[var(--surface-border)] bg-[var(--surface-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)] focus-visible:outline-offset-2 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="mt-2 text-xs text-[var(--text-tertiary)]">
              Competitive programming · Zero AI
            </p>

            {authError && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2.5 rounded-lg border border-[var(--status-error)]/40 bg-[var(--surface-overlay)] p-3 text-xs text-[var(--status-error)]"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[var(--brand-primary)] text-[var(--brand-ink)] hover:bg-[var(--brand-primary-hover)] focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)] focus-visible:outline-offset-2 transition-colors whitespace-nowrap"
              >
                <Chrome className="w-4 h-4 shrink-0" />
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => void signInWithGithub()}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium border border-[var(--surface-border)] bg-[var(--surface-overlay)] text-[var(--text-primary)] hover:border-[var(--text-tertiary)] focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)] focus-visible:outline-offset-2 transition-colors whitespace-nowrap"
              >
                <Github className="w-4 h-4 shrink-0" />
                <span>Continue with GitHub</span>
              </button>
            </div>

            <p className="mt-4 text-xs text-[var(--text-tertiary)]">
              You can link your Telegram and GitHub community handles from your Profile tab after signing in.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
