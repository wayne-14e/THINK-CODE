'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  limit,
} from 'firebase/firestore';
import {
  OperationType,
  auth,
  db,
  githubAuthProvider,
  googleAuthProvider,
  handleFirestoreError,
  testConnection,
} from '@/lib/firebase';
import {
  SEED_DISCUSSIONS,
  SEED_PROBLEMS,
  SEED_TRACKS,
  SEED_WORKSHOPS,
} from '@/lib/seed-data';
import type {
  DiscussionComment,
  Difficulty,
  Language,
  Problem,
  PublicProfile,
  Submission,
  SubmissionStatus,
  Track,
  UserPrivate,
  Workshop,
  WorkshopRsvp,
} from '@/lib/types';

interface FirebaseContextValue {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  publicProfile: PublicProfile | null;
  userPrivate: UserPrivate | null;
  tracks: Track[];
  problems: Problem[];
  workshops: Workshop[];
  leaderboard: PublicProfile[];
  submissions: Submission[];
  firestoreProblemIds: Set<string>;
  firestoreWorkshopIds: Set<string>;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfileDetails: (data: {
    nickname: string;
    githubHandle: string;
    telegramHandle: string;
  }) => Promise<void>;
  completeModule: (moduleId: string, xpReward: number) => Promise<void>;
  markThinkPassed: (problemId: string) => Promise<void>;
  recordSubmission: (payload: {
    problem: Problem;
    language: Language;
    code: string;
    status: SubmissionStatus;
    runtimeMs: number;
    passedCount: number;
    totalCount: number;
    thinkPassed: boolean;
  }) => Promise<{ xpAwarded: number; syncedToCloud: boolean }>;
  subscribeDiscussions: (
    problemId: string,
    onChange: (items: DiscussionComment[]) => void
  ) => () => void;
  postDiscussion: (payload: {
    problemId: string;
    body: string;
    codeSnippet: string;
    language: Language | 'none';
    parentId?: string;
  }) => Promise<void>;
  toggleMentorAnnotation: (
    problemId: string,
    comment: DiscussionComment,
    field: 'isMentorAnswer' | 'isPinned'
  ) => Promise<void>;
  subscribeWorkshopRsvps: (
    workshopId: string,
    onChange: (items: WorkshopRsvp[]) => void
  ) => () => void;
  toggleWorkshopRsvp: (workshopId: string, currentlyRsvped: boolean) => Promise<void>;
  saveAdminProblem: (problem: Omit<Problem, 'createdAt' | 'updatedAt' | 'createdByUid'>) => Promise<void>;
  saveAdminWorkshop: (workshop: Omit<Workshop, 'createdAt' | 'updatedAt'>) => Promise<void>;
  syncStarterCurriculum: () => Promise<void>;
  unlockAdmin: (passcode: string) => Promise<{ ok: boolean; error?: string }>;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

function todayUtcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayUtcDate(): string {
  const d = new Date(Date.now() - 86400000);
  return d.toISOString().slice(0, 10);
}

function computeInitials(name: string): string {
  const parts = name.trim().split(/[\s_.-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
  }
  return name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'TC';
}

function sanitizeNickname(raw: string | null | undefined, email: string | null | undefined): string {
  const base = (raw || email?.split('@')[0] || 'member').trim().slice(0, 36);
  return base.length >= 2 ? base : `${base}_dev`;
}

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(null);
  const [userPrivate, setUserPrivate] = useState<UserPrivate | null>(null);
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  const [cloudTracks, setCloudTracks] = useState<Track[]>([]);
  const [cloudProblems, setCloudProblems] = useState<Problem[]>([]);
  const [cloudWorkshops, setCloudWorkshops] = useState<Workshop[]>([]);
  const [cloudProfiles, setCloudProfiles] = useState<PublicProfile[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const seededOnceRef = useRef(false);

  useEffect(() => {
    void testConnection();
  }, []);

  const isAdmin = Boolean(user && adminUnlocked);

  const ensureUserRecords = useCallback(async (u: User) => {
    const pubRef = doc(db, 'publicProfiles', u.uid);
    const privRef = doc(db, 'usersPrivate', u.uid);
    const nickname = sanitizeNickname(u.displayName, u.email);

    try {
      const pubSnap = await getDoc(pubRef);
      if (!pubSnap.exists()) {
        await setDoc(pubRef, {
          uid: u.uid,
          nickname,
          role: 'learner',
          avatarInitials: computeInitials(nickname),
          githubHandle: '',
          telegramHandle: '',
          xp: 0,
          weeklyXp: 0,
          currentStreak: 0,
          longestStreak: 0,
          solvedEasy: 0,
          solvedMedium: 0,
          solvedHard: 0,
          completedModulesCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `publicProfiles/${u.uid}`);
    }

    try {
      const privSnap = await getDoc(privRef);
      if (!privSnap.exists()) {
        await setDoc(privRef, {
          uid: u.uid,
          email: u.email || `${u.uid}@thinkcode.local`,
          lastSolvedDate: '',
          solvedProblemIds: [],
          completedModuleIds: [],
          thinkPassedProblemIds: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `usersPrivate/${u.uid}`);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (nextUser) {
        void ensureUserRecords(nextUser);
      } else {
        setPublicProfile(null);
        setUserPrivate(null);
        setSubmissions([]);
        setAdminUnlocked(false);
      }
    });
    return () => unsub();
  }, [ensureUserRecords]);

  // Public collections (tracks, problems, workshops, leaderboard)
  useEffect(() => {
    const unsubTracks = onSnapshot(
      query(collection(db, 'tracks'), orderBy('order', 'asc')),
      (snap) => {
        setCloudTracks(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Track, 'id'>) })));
      },
      (err) => {
        console.warn('Tracks read fallback:', err.message);
      }
    );

    const unsubProblems = onSnapshot(
      collection(db, 'problems'),
      (snap) => {
        setCloudProblems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Problem, 'id'>) })));
      },
      (err) => {
        console.warn('Problems read fallback:', err.message);
      }
    );

    const unsubWorkshops = onSnapshot(
      collection(db, 'workshops'),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Workshop, 'id'>) }));
        items.sort((a, b) => Number(b.issueNumber) - Number(a.issueNumber));
        setCloudWorkshops(items);
      },
      (err) => {
        console.warn('Workshops read fallback:', err.message);
      }
    );

    const unsubLeaderboard = onSnapshot(
      query(collection(db, 'publicProfiles'), orderBy('xp', 'desc'), limit(50)),
      (snap) => {
        setCloudProfiles(snap.docs.map((d) => d.data() as PublicProfile));
      },
      (err) => {
        console.warn('Leaderboard read fallback:', err.message);
      }
    );

    return () => {
      unsubTracks();
      unsubProblems();
      unsubWorkshops();
      unsubLeaderboard();
    };
  }, []);

  // Authenticated user's live profile, private state, admin check & submissions
  useEffect(() => {
    if (!authReady || !user) return;

    const unsubPub = onSnapshot(
      doc(db, 'publicProfiles', user.uid),
      (snap) => {
        if (snap.exists()) {
          setPublicProfile(snap.data() as PublicProfile);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `publicProfiles/${user.uid}`)
    );

    const unsubPriv = onSnapshot(
      doc(db, 'usersPrivate', user.uid),
      (snap) => {
        if (snap.exists()) {
          setUserPrivate(snap.data() as UserPrivate);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `usersPrivate/${user.uid}`)
    );

    // Verify whether the signed-in user has an active passcode-unlocked admin session
    let cancelled = false;
    void (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch('/api/admin/session', {
          method: 'GET',
          headers: { Authorization: `Bearer ${idToken}` },
          credentials: 'include',
        });
        if (!res.ok) {
          if (!cancelled) setAdminUnlocked(false);
          return;
        }
        const data = (await res.json()) as { isAdmin?: boolean };
        if (!cancelled) {
          setAdminUnlocked(Boolean(data.isAdmin));
        }
      } catch {
        if (!cancelled) setAdminUnlocked(false);
      }
    })();

    const unsubSubs = onSnapshot(
      query(
        collection(db, 'usersPrivate', user.uid, 'submissions'),
        orderBy('createdAt', 'desc'),
        limit(30)
      ),
      (snap) => {
        setSubmissions(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Submission, 'id'>) }))
        );
      },
      (err) =>
        handleFirestoreError(err, OperationType.LIST, `usersPrivate/${user.uid}/submissions`)
    );

    return () => {
      cancelled = true;
      unsubPub();
      unsubPriv();
      unsubSubs();
    };
  }, [authReady, user]);

  const syncStarterCurriculum = useCallback(async () => {
    if (!user || !isAdmin) return;
    try {
      for (const track of SEED_TRACKS) {
        await setDoc(doc(db, 'tracks', track.id), {
          slug: track.slug,
          title: track.title,
          subtitle: track.subtitle,
          order: track.order,
          modules: track.modules,
          updatedAt: serverTimestamp(),
        });
      }
      for (const prob of SEED_PROBLEMS) {
        const probRef = doc(db, 'problems', prob.id);
        const existing = await getDoc(probRef);
        if (!existing.exists()) {
          await setDoc(probRef, {
            slug: prob.slug,
            title: prob.title,
            difficulty: prob.difficulty,
            trackSlug: prob.trackSlug,
            isDaily: prob.isDaily,
            dailyDate: prob.dailyDate || '',
            xpReward: prob.xpReward,
            description: prob.description,
            constraints: prob.constraints,
            editorial: prob.editorial,
            examples: prob.examples,
            starterCode: prob.starterCode,
            thinkPrompt: prob.thinkPrompt,
            testCases: prob.testCases,
            createdByUid: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        const seedComments = SEED_DISCUSSIONS[prob.id] || [];
        for (const comment of seedComments) {
          const cRef = doc(db, 'problems', prob.id, 'discussions', comment.id);
          const cSnap = await getDoc(cRef);
          if (!cSnap.exists()) {
            await setDoc(cRef, {
              problemId: prob.id,
              authorUid: user.uid,
              authorNickname: comment.authorNickname,
              authorRole: 'admin',
              body: comment.body,
              codeSnippet: comment.codeSnippet,
              language: comment.language,
              parentId: '',
              isMentorAnswer: comment.isMentorAnswer,
              isPinned: comment.isPinned,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }
      }
      for (const ws of SEED_WORKSHOPS) {
        const wsRef = doc(db, 'workshops', ws.id);
        const existing = await getDoc(wsRef);
        if (!existing.exists()) {
          await setDoc(wsRef, {
            issueNumber: ws.issueNumber,
            title: ws.title,
            summary: ws.summary,
            trackSlug: ws.trackSlug,
            startsAtIso: ws.startsAtIso,
            academyTimezone: ws.academyTimezone,
            prerequisites: ws.prerequisites,
            locationUrl: ws.locationUrl,
            isUpcoming: ws.isUpcoming,
            resources: ws.resources,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }
      // Remove legacy past starter workshops from Firestore if they were previously seeded
      for (const legacyId of ['workshop-05', 'workshop-06', 'workshop-07']) {
        const legacyRef = doc(db, 'workshops', legacyId);
        const legacySnap = await getDoc(legacyRef);
        if (legacySnap.exists()) {
          await deleteDoc(legacyRef);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'curriculum-seed');
    }
  }, [user, isAdmin]);

  // Auto-sync starter curriculum into Firestore once when verified Admin unlocks admin mode
  useEffect(() => {
    if (!authReady || !user || !isAdmin || seededOnceRef.current) return;
    seededOnceRef.current = true;
    void (async () => {
      try {
        const [probSnap, wsSnap] = await Promise.all([
          getDocs(collection(db, 'problems')),
          getDocs(collection(db, 'workshops')),
        ]);
        const existingProbIds = new Set(probSnap.docs.map((d) => d.id));
        const hasMissingSeed = SEED_PROBLEMS.some((p) => !existingProbIds.has(p.id));
        const hasLegacyPastWorkshop = wsSnap.docs.some((d) =>
          ['workshop-05', 'workshop-06', 'workshop-07'].includes(d.id)
        );
        if (probSnap.empty || hasMissingSeed || hasLegacyPastWorkshop) {
          await syncStarterCurriculum();
        }
      } catch {
        // Ignore silent auto-seed check
      }
    })();
  }, [authReady, user, isAdmin, syncStarterCurriculum]);

  const firestoreProblemIds = useMemo(
    () => new Set(cloudProblems.map((p) => p.id)),
    [cloudProblems]
  );

  const firestoreWorkshopIds = useMemo(
    () => new Set(cloudWorkshops.map((w) => w.id)),
    [cloudWorkshops]
  );

  // Merge Firestore documents with canonical starter curriculum so first-visit experience is always rich
  const tracks = useMemo(() => {
    if (cloudTracks.length === 0) return SEED_TRACKS;
    const map = new Map<string, Track>();
    for (const t of SEED_TRACKS) map.set(t.id, t);
    for (const t of cloudTracks) map.set(t.id, t);
    return Array.from(map.values()).sort((a, b) => a.order - b.order);
  }, [cloudTracks]);

  const problems = useMemo(() => {
    if (cloudProblems.length === 0) return SEED_PROBLEMS;
    const map = new Map<string, Problem>();
    for (const p of SEED_PROBLEMS) map.set(p.id, p);
    for (const p of cloudProblems) map.set(p.id, p);
    return Array.from(map.values());
  }, [cloudProblems]);

  const workshops = useMemo(() => {
    const map = new Map<string, Workshop>();
    for (const w of SEED_WORKSHOPS) {
      if (w.isUpcoming) map.set(w.id, w);
    }
    for (const w of cloudWorkshops) {
      if (w.isUpcoming) {
        map.set(w.id, w);
      } else {
        map.delete(w.id);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => Number(b.issueNumber) - Number(a.issueNumber)
    );
  }, [cloudWorkshops]);

  const leaderboard = useMemo(() => {
    return cloudProfiles
      .filter((entry) => !entry.uid.startsWith('seed-'))
      .sort((a, b) => b.xp - a.xp);
  }, [cloudProfiles]);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.';
      setAuthError(msg);
    }
  };

  const signInWithGithub = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, githubAuthProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'GitHub sign-in failed.';
      if (msg.includes('operation-not-allowed') || msg.includes('auth/configuration-not-found')) {
        setAuthError(
          'GitHub OAuth is not yet enabled in Firebase Console -> Authentication -> Sign-in method. Use Google Sign-In now or enable GitHub in your project console.'
        );
      } else {
        setAuthError(msg);
      }
    }
  };

  const signOut = async () => {
    setAdminUnlocked(false);
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
      });
    } catch {
      // Ignore network errors when clearing cookie on sign-out
    }
    await firebaseSignOut(auth);
  };

  const unlockAdmin = async (passcode: string): Promise<{ ok: boolean; error?: string }> => {
    if (!user) {
      return { ok: false, error: 'Sign in before entering the admin passcode.' };
    }
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/admin/verify-passcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({ passcode }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        return { ok: false, error: data.error || 'Invalid admin passcode.' };
      }

      setAdminUnlocked(true);

      // Best-effort Firestore admin record sync when permitted by security rules
      try {
        await setDoc(doc(db, 'admins', user.uid), {
          uid: user.uid,
          email: user.email || `${user.uid}@thinkcode.local`,
          role: 'admin',
          grantedAt: serverTimestamp(),
        });
        await updateDoc(doc(db, 'publicProfiles', user.uid), {
          role: 'admin',
          updatedAt: serverTimestamp(),
        });
      } catch {
        // Non-bootstrap accounts keep session-verified UI elevation
      }

      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Unable to verify admin passcode.',
      };
    }
  };

  const updateProfileDetails = async (data: {
    nickname: string;
    githubHandle: string;
    telegramHandle: string;
  }) => {
    if (!user || !publicProfile) return;
    const cleanNick = data.nickname.trim().slice(0, 40);
    if (cleanNick.length < 2) {
      throw new Error('Nickname must be at least 2 characters.');
    }
    try {
      await updateDoc(doc(db, 'publicProfiles', user.uid), {
        nickname: cleanNick,
        avatarInitials: computeInitials(cleanNick),
        githubHandle: data.githubHandle.trim().replace(/^@/, '').slice(0, 40),
        telegramHandle: data.telegramHandle.trim().replace(/^@/, '').slice(0, 40),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `publicProfiles/${user.uid}`);
    }
  };

  const completeModule = async (moduleId: string, xpReward: number) => {
    if (!user || !publicProfile || !userPrivate) return;
    if (userPrivate.completedModuleIds.includes(moduleId)) return;

    const cappedXp = Math.min(Math.max(0, Math.round(xpReward)), 200);
    try {
      await updateDoc(doc(db, 'usersPrivate', user.uid), {
        completedModuleIds: [...userPrivate.completedModuleIds, moduleId],
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'publicProfiles', user.uid), {
        xp: publicProfile.xp + cappedXp,
        weeklyXp: publicProfile.weeklyXp + cappedXp,
        completedModulesCount: publicProfile.completedModulesCount + 1,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `usersPrivate/${user.uid}`);
    }
  };

  const markThinkPassed = async (problemId: string) => {
    if (!user || !publicProfile || !userPrivate) return;
    if (userPrivate.thinkPassedProblemIds.includes(problemId)) return;

    try {
      await updateDoc(doc(db, 'usersPrivate', user.uid), {
        thinkPassedProblemIds: [...userPrivate.thinkPassedProblemIds, problemId],
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'publicProfiles', user.uid), {
        xp: publicProfile.xp + 15,
        weeklyXp: publicProfile.weeklyXp + 15,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `usersPrivate/${user.uid}`);
    }
  };

  const recordSubmission = async ({
    problem,
    language,
    code,
    status,
    runtimeMs,
    passedCount,
    totalCount,
    thinkPassed,
  }: {
    problem: Problem;
    language: Language;
    code: string;
    status: SubmissionStatus;
    runtimeMs: number;
    passedCount: number;
    totalCount: number;
    thinkPassed: boolean;
  }): Promise<{ xpAwarded: number; syncedToCloud: boolean }> => {
    if (!user || !publicProfile || !userPrivate) {
      return { xpAwarded: 0, syncedToCloud: false };
    }

    // If Firestore doesn't yet have this problem doc (e.g. before admin first sync), skip cloud submission doc cleanly
    if (!firestoreProblemIds.has(problem.id)) {
      return { xpAwarded: 0, syncedToCloud: false };
    }

    const alreadySolved = userPrivate.solvedProblemIds.includes(problem.id);
    const isAccepted = status === 'Accepted';
    const xpAwarded = isAccepted && !alreadySolved ? Math.min(problem.xpReward, 500) : 0;

    const subId = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    try {
      await setDoc(doc(db, 'usersPrivate', user.uid, 'submissions', subId), {
        userUid: user.uid,
        problemId: problem.id,
        problemTitle: problem.title.slice(0, 120),
        language,
        code: code.slice(0, 25000),
        status,
        runtimeMs: Math.min(Math.max(0, Math.round(runtimeMs)), 60000),
        passedCount: Math.max(0, passedCount),
        totalCount: Math.max(1, totalCount),
        thinkPassed,
        xpAwarded,
        createdAt: serverTimestamp(),
      });

      if (isAccepted) {
        const today = todayUtcDate();
        const yesterday = yesterdayUtcDate();
        let nextStreak = publicProfile.currentStreak;
        if (userPrivate.lastSolvedDate !== today) {
          nextStreak =
            userPrivate.lastSolvedDate === yesterday ? publicProfile.currentStreak + 1 : 1;
        }
        const nextLongest = Math.max(publicProfile.longestStreak, nextStreak);

        const nextSolvedIds = alreadySolved
          ? userPrivate.solvedProblemIds
          : [...userPrivate.solvedProblemIds, problem.id];

        await updateDoc(doc(db, 'usersPrivate', user.uid), {
          lastSolvedDate: today,
          solvedProblemIds: nextSolvedIds,
          updatedAt: serverTimestamp(),
        });

        const diffField: Record<Difficulty, 'solvedEasy' | 'solvedMedium' | 'solvedHard'> = {
          easy: 'solvedEasy',
          medium: 'solvedMedium',
          hard: 'solvedHard',
        };
        const targetDiffField = diffField[problem.difficulty];

        await updateDoc(doc(db, 'publicProfiles', user.uid), {
          xp: publicProfile.xp + xpAwarded,
          weeklyXp: publicProfile.weeklyXp + xpAwarded,
          currentStreak: nextStreak,
          longestStreak: nextLongest,
          [targetDiffField]: alreadySolved
            ? publicProfile[targetDiffField]
            : publicProfile[targetDiffField] + 1,
          updatedAt: serverTimestamp(),
        });
      }
      return { xpAwarded, syncedToCloud: true };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `usersPrivate/${user.uid}/submissions`);
    }
  };

  const subscribeDiscussions = useCallback(
    (problemId: string, onChange: (items: DiscussionComment[]) => void) => {
      const q = query(
        collection(db, 'problems', problemId, 'discussions'),
        orderBy('createdAt', 'desc')
      );
      return onSnapshot(
        q,
        (snap) => {
          const live = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<DiscussionComment, 'id'>),
          }));
          if (live.length > 0) {
            live.sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
            onChange(live);
          } else {
            onChange(SEED_DISCUSSIONS[problemId] || []);
          }
        },
        () => {
          onChange(SEED_DISCUSSIONS[problemId] || []);
        }
      );
    },
    []
  );

  const postDiscussion = async ({
    problemId,
    body,
    codeSnippet,
    language,
    parentId = '',
  }: {
    problemId: string;
    body: string;
    codeSnippet: string;
    language: Language | 'none';
    parentId?: string;
  }) => {
    if (!user || !publicProfile) {
      throw new Error('Sign in to post in the mentor discussion.');
    }
    if (!firestoreProblemIds.has(problemId)) {
      throw new Error(
        'This starter problem has not been synced to Firestore yet. Ask an admin to run Sync Starter Curriculum in Compose.'
      );
    }
    const commentId = `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const authorRole = isAdmin ? (publicProfile.role === 'admin' ? 'admin' : 'mentor') : 'learner';
    try {
      await setDoc(doc(db, 'problems', problemId, 'discussions', commentId), {
        problemId,
        authorUid: user.uid,
        authorNickname: publicProfile.nickname,
        authorRole,
        body: body.trim().slice(0, 4000),
        codeSnippet: codeSnippet.trim().slice(0, 4000),
        language,
        parentId,
        isMentorAnswer: isAdmin,
        isPinned: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `problems/${problemId}/discussions/${commentId}`);
    }
  };

  const toggleMentorAnnotation = async (
    problemId: string,
    comment: DiscussionComment,
    field: 'isMentorAnswer' | 'isPinned'
  ) => {
    if (!user || !isAdmin) return;
    try {
      await updateDoc(doc(db, 'problems', problemId, 'discussions', comment.id), {
        [field]: !comment[field],
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `problems/${problemId}/discussions/${comment.id}`);
    }
  };

  const subscribeWorkshopRsvps = useCallback(
    (workshopId: string, onChange: (items: WorkshopRsvp[]) => void) => {
      return onSnapshot(
        collection(db, 'workshops', workshopId, 'rsvps'),
        (snap) => {
          onChange(snap.docs.map((d) => d.data() as WorkshopRsvp));
        },
        () => {
          onChange([]);
        }
      );
    },
    []
  );

  const toggleWorkshopRsvp = async (workshopId: string, currentlyRsvped: boolean) => {
    if (!user || !publicProfile) {
      throw new Error('Sign in to RSVP for live workshops.');
    }
    if (!firestoreWorkshopIds.has(workshopId)) {
      throw new Error(
        'This starter workshop has not been synced to Firestore yet. Ask an admin to run Sync Starter Curriculum in Compose.'
      );
    }
    const rsvpRef = doc(db, 'workshops', workshopId, 'rsvps', user.uid);
    try {
      if (currentlyRsvped) {
        await deleteDoc(rsvpRef);
      } else {
        await setDoc(rsvpRef, {
          uid: user.uid,
          nickname: publicProfile.nickname,
          rsvpedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `workshops/${workshopId}/rsvps/${user.uid}`);
    }
  };

  const saveAdminProblem = async (
    problem: Omit<Problem, 'createdAt' | 'updatedAt' | 'createdByUid'>
  ) => {
    if (!user || !isAdmin) {
      throw new Error('Admin permissions required.');
    }
    const probRef = doc(db, 'problems', problem.id);
    try {
      const snap = await getDoc(probRef);
      if (snap.exists()) {
        await updateDoc(probRef, {
          slug: problem.slug,
          title: problem.title,
          difficulty: problem.difficulty,
          trackSlug: problem.trackSlug,
          isDaily: problem.isDaily,
          dailyDate: problem.dailyDate || '',
          xpReward: problem.xpReward,
          description: problem.description,
          constraints: problem.constraints,
          editorial: problem.editorial,
          examples: problem.examples,
          starterCode: problem.starterCode,
          thinkPrompt: problem.thinkPrompt,
          testCases: problem.testCases,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(probRef, {
          slug: problem.slug,
          title: problem.title,
          difficulty: problem.difficulty,
          trackSlug: problem.trackSlug,
          isDaily: problem.isDaily,
          dailyDate: problem.dailyDate || '',
          xpReward: problem.xpReward,
          description: problem.description,
          constraints: problem.constraints,
          editorial: problem.editorial,
          examples: problem.examples,
          starterCode: problem.starterCode,
          thinkPrompt: problem.thinkPrompt,
          testCases: problem.testCases,
          createdByUid: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `problems/${problem.id}`);
    }
  };

  const saveAdminWorkshop = async (
    workshop: Omit<Workshop, 'createdAt' | 'updatedAt'>
  ) => {
    if (!user || !isAdmin) {
      throw new Error('Admin permissions required.');
    }
    const wsRef = doc(db, 'workshops', workshop.id);
    try {
      const snap = await getDoc(wsRef);
      if (snap.exists()) {
        await updateDoc(wsRef, {
          issueNumber: workshop.issueNumber,
          title: workshop.title,
          summary: workshop.summary,
          trackSlug: workshop.trackSlug,
          startsAtIso: workshop.startsAtIso,
          academyTimezone: workshop.academyTimezone,
          prerequisites: workshop.prerequisites,
          locationUrl: workshop.locationUrl,
          isUpcoming: workshop.isUpcoming,
          resources: workshop.resources,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(wsRef, {
          issueNumber: workshop.issueNumber,
          title: workshop.title,
          summary: workshop.summary,
          trackSlug: workshop.trackSlug,
          startsAtIso: workshop.startsAtIso,
          academyTimezone: workshop.academyTimezone,
          prerequisites: workshop.prerequisites,
          locationUrl: workshop.locationUrl,
          isUpcoming: workshop.isUpcoming,
          resources: workshop.resources,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `workshops/${workshop.id}`);
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        authReady,
        isAdmin,
        publicProfile,
        userPrivate,
        tracks,
        problems,
        workshops,
        leaderboard,
        submissions,
        firestoreProblemIds,
        firestoreWorkshopIds,
        authError,
        clearAuthError: () => setAuthError(null),
        signInWithGoogle,
        signInWithGithub,
        signOut,
        updateProfileDetails,
        completeModule,
        markThinkPassed,
        recordSubmission,
        subscribeDiscussions,
        postDiscussion,
        toggleMentorAnnotation,
        subscribeWorkshopRsvps,
        toggleWorkshopRsvp,
        saveAdminProblem,
        saveAdminWorkshop,
        syncStarterCurriculum,
        unlockAdmin,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error('useFirebase must be used inside FirebaseProvider');
  }
  return ctx;
}
