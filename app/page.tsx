'use client';

import React, { useState } from 'react';
import { AppShell, NavSection } from '@/components/app-shell';
import { useFirebase } from '@/components/providers/firebase-provider';
import { LandingView } from '@/components/views/landing-view';
import { OverviewView } from '@/components/views/overview-view';
import { SyllabusView } from '@/components/views/syllabus-view';
import { ChallengesView } from '@/components/views/challenges-view';
import { SandboxView } from '@/components/views/sandbox-view';
import { WorkshopsView } from '@/components/views/workshops-view';
import { LeaderboardView } from '@/components/views/leaderboard-view';
import { ProfileView } from '@/components/views/profile-view';
import { AdminComposerView } from '@/components/views/admin-composer-view';

function AuthenticatedWorkspace() {
  const { problems } = useFirebase();
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);

  const selectedProblem = selectedProblemId
    ? problems.find((p) => p.id === selectedProblemId) || null
    : null;

  const handleOpenProblem = (problemId: string) => {
    setSelectedProblemId(problemId);
    setActiveSection('challenges');
  };

  const handleNavigate = (section: NavSection) => {
    setActiveSection(section);
    if (section !== 'challenges') {
      setSelectedProblemId(null);
    }
  };

  return (
    <AppShell activeSection={activeSection} onNavigate={handleNavigate}>
      {activeSection === 'overview' && (
        <OverviewView onOpenProblem={handleOpenProblem} onNavigate={handleNavigate} />
      )}
      {activeSection === 'syllabus' && <SyllabusView onOpenProblem={handleOpenProblem} />}
      {activeSection === 'challenges' &&
        (selectedProblem ? (
          <SandboxView
            key={selectedProblem.id}
            problem={selectedProblem}
            onBack={() => setSelectedProblemId(null)}
          />
        ) : (
          <ChallengesView onOpenProblem={handleOpenProblem} />
        ))}
      {activeSection === 'workshops' && <WorkshopsView />}
      {activeSection === 'leaderboard' && <LeaderboardView />}
      {activeSection === 'profile' && <ProfileView />}
      {activeSection === 'compose' && <AdminComposerView />}
    </AppShell>
  );
}

export default function HomePage() {
  const { user, authReady } = useFirebase();

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-deep)] text-[var(--text-secondary)]">
        <span className="font-mono text-sm">Loading THINK//CODE...</span>
      </div>
    );
  }

  if (!user) {
    return <LandingView />;
  }

  return <AuthenticatedWorkspace key={user.uid} />;
}
