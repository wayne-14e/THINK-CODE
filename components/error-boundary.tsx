'use client';

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class AcademyErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let readable = error.message || 'An unexpected error occurred.';
    try {
      const parsed = JSON.parse(error.message);
      if (parsed?.error) {
        readable = `Data access error (${parsed.operationType || 'operation'}): ${parsed.error}`;
      }
    } catch {
      // Keep plain error message
    }
    return { hasError: true, message: readable };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--surface-deep)] text-[var(--text-primary)]">
          <div className="max-w-md w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-raised)] p-6 space-y-4">
            <div className="flex items-center gap-3 text-[var(--status-error)]">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-semibold">Workspace recovery required</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, message: '' })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--brand-primary)] text-[var(--brand-ink)] hover:bg-[var(--brand-primary-hover)] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload workspace</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
