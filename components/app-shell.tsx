'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import {
  BookOpen,
  Calendar,
  Code2,
  Compass,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  PenSquare,
  Trophy,
  User,
} from 'lucide-react';
import { useFirebase } from './providers/firebase-provider';
import { AuthModal } from './auth-modal';

export type NavSection =
  | 'overview'
  | 'syllabus'
  | 'challenges'
  | 'workshops'
  | 'leaderboard'
  | 'profile'
  | 'compose';

interface AppShellProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  children: React.ReactNode;
}

const SIDEBAR_STORAGE_KEY = 'thinkcode_sidebar_collapsed';
const sidebarListeners = new Set<() => void>();

function subscribeSidebar(callback: () => void) {
  sidebarListeners.add(callback);
  return () => {
    sidebarListeners.delete(callback);
  };
}

function getSidebarSnapshot(): boolean {
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function getSidebarServerSnapshot(): boolean {
  return false;
}

export function AppShell({
  activeSection,
  onNavigate,
  children,
}: AppShellProps) {
  const { user, publicProfile, isAdmin, signOut } = useFirebase();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const sidebarCollapsed = useSyncExternalStore(
    subscribeSidebar,
    getSidebarSnapshot,
    getSidebarServerSnapshot
  );

  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
    } catch {
      // Ignore storage errors
    }
    sidebarListeners.forEach((cb) => cb());
  };

  const navItems: { id: NavSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
    { id: 'challenges', label: 'Challenges', icon: Code2 },
    { id: 'workshops', label: 'Workshops', icon: Calendar },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (isAdmin) {
    navItems.push({ id: 'compose', label: 'Compose', icon: PenSquare });
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-deep)] text-[var(--text-primary)]">
      {/* 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-30 h-14 border-b border-[var(--surface-border)] bg-[var(--surface-raised)] px-4 lg:px-6 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Logo + Wordmark */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => onNavigate('overview')}
            className="inline-flex items-center gap-2.5 font-mono text-base font-bold tracking-tight text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)] focus-visible:outline-offset-2 rounded"
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
          </button>
        </div>

        {/* Zone 2: Quiet inline progress summary for signed-in users (desktop only) */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono tabular-nums text-[var(--text-secondary)] whitespace-nowrap">
          {publicProfile ? (
            <>
              <span>
                Streak <strong className="text-[var(--brand-primary)]">{publicProfile.currentStreak}d</strong>
              </span>
              <span aria-hidden="true" className="text-[var(--surface-border)]">
                ·
              </span>
              <span>
                XP <strong className="text-[var(--text-primary)]">{publicProfile.xp}</strong>
              </span>
            </>
          ) : (
            <span className="text-[var(--text-tertiary)]">Think. Code. Repeat.</span>
          )}
        </div>

        {/* Zone 3: Primary Account Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {user ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className="min-h-[36px] inline-flex items-center gap-2 px-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-overlay)] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--text-tertiary)] focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)] focus-visible:outline-offset-2 transition-colors whitespace-nowrap shrink-0"
              >
                <span className="font-mono text-xs text-[var(--brand-primary)]">
                  {publicProfile?.avatarInitials || 'TC'}
                </span>
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {publicProfile?.nickname || 'Member'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => void signOut()}
                aria-label="Sign out"
                className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg border border-[var(--surface-border)] bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:text-[var(--status-error)] focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)] focus-visible:outline-offset-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="min-h-[36px] px-4 py-1.5 rounded-lg text-sm font-semibold bg-[var(--brand-primary)] text-[var(--brand-ink)] hover:bg-[var(--brand-primary-hover)] focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)] focus-visible:outline-offset-2 transition-colors whitespace-nowrap shrink-0"
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* Main Body: Collapsible Desktop Sidebar + Content */}
      <div className="flex-1 flex min-h-0">
        <aside
          aria-label="Primary navigation"
          className={`hidden lg:flex lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] z-20 shrink-0 flex-col justify-between border-r border-[var(--surface-border)] bg-[var(--surface-raised)] transition-[width] duration-200 ease-out ${
            sidebarCollapsed ? 'w-16 p-2.5' : 'w-60 p-4'
          }`}
        >
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  aria-current={active ? 'page' : undefined}
                  aria-label={sidebarCollapsed ? item.label : undefined}
                  className={`relative group w-full min-h-[40px] flex items-center rounded-lg text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)] focus-visible:outline-offset-2 ${
                    sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3 py-2'
                  } ${
                    active
                      ? 'bg-[var(--surface-overlay)] text-[var(--text-primary)] border border-[var(--surface-border)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)]/60 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? 'text-[var(--brand-primary)]' : 'text-[var(--text-tertiary)]'
                    }`}
                  />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                  {sidebarCollapsed && (
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-40 px-2.5 py-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-overlay)] text-xs font-medium text-[var(--text-primary)] shadow-[0_4px_12px_rgba(0,0,0,0.2)] whitespace-nowrap opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 transition-all duration-150"
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Side Panel Footer & Collapse Toggle */}
          <div
            className={`pt-3 border-t border-[var(--surface-border)] flex items-center ${
              sidebarCollapsed ? 'justify-center' : 'justify-between gap-2'
            }`}
          >
            {!sidebarCollapsed && (
              <p className="text-xs font-medium text-[var(--text-secondary)] truncate">
                Think. Code. Repeat.
              </p>
            )}
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? 'Expand side panel' : 'Collapse side panel'}
              aria-expanded={!sidebarCollapsed}
              className="relative group min-h-[36px] min-w-[36px] shrink-0 inline-flex items-center justify-center rounded-lg border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] hover:border-[var(--surface-border)] focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)] focus-visible:outline-offset-2 transition-colors"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
              {sidebarCollapsed && (
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-40 px-2.5 py-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-overlay)] text-xs font-medium text-[var(--text-primary)] shadow-[0_4px_12px_rgba(0,0,0,0.2)] whitespace-nowrap opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 transition-all duration-150"
                >
                  Expand side panel
                </span>
              )}
            </button>
          </div>
        </aside>

        {/* Primary Content Region */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-8">
          <div className="mx-auto max-w-[1440px] h-full">{children}</div>
        </main>
      </div>

      {/* Mobile Compact Bottom Navigation (<= 15% height, >= 44px targets) */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-16 border-t border-[var(--surface-border)] bg-[var(--surface-raised)] px-2 flex items-center justify-around"
      >
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={active ? 'page' : undefined}
              className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-0.5 px-2 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${
                active ? 'text-[var(--brand-primary)]' : 'text-[var(--text-secondary)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
