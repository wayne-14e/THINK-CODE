# Product Requirements Document (PRD): THINK//CODE Academy LMS

**Document Status:** v2.1 (Beta Scope Confirmed & Active Build Log)  
**Target Platform:** Web Application (Desktop-first for coding sandbox, mobile-responsive for reading & daily challenges)  
**Design System:** Serious, clutter-free Coding Academy aesthetic (`DESIGN.md` — dark-only workstation, restrained lime accents, and `2+1` typography)  
**Core Motto:** *Think. Code. Repeat.*

---

## 1. Executive Summary & Vision

**THINK//CODE** is a coding community and academy dedicated to teaching algorithmic thinking, problem-solving, logic, and competitive programming. Following lessons learned from our initial prototype (`think-code-learn.vercel.app`), this new platform is built from the ground up as a **serious, focused coding academy**—free of ads, visual clutter, and AI shortcuts.

The **THINK//CODE LMS** combines a structured academic syllabus with LeetCode-style hands-on coding challenges, **"Think Before You Run"** output-prediction checks, and live Sunday workshop hubs. Instead of relying on AI hints, learners get direct feedback and mentorship from **real, experienced coders** in our community.

---

## 2. Target Audience (User Personas)

1. **The Dedicated Learner (Student / Self-Taught):** Wants a clear, structured syllabus to master algorithmic thinking and language fundamentals (Python, JS, C++) through daily practice.
2. **The Aspiring Competitive Programmer:** Wants a distraction-free, ad-free LeetCode-style environment to write, test, and optimize code against real test cases, backed by live workshop discussions.
3. **The Mentor / Founder (Admin):** Experienced coders who run weekly workshops, review member solutions, answer questions directly, and curate new problems and sessions via the Beta Admin Composer.

---

## 3. Core Philosophy & Guardrails

* **Serious Academy, Not a Toy:** Clean, authoritative, high-focus UI (`DESIGN.md`). Gamification exists to drive discipline (streaks, syllabus progression, leaderboard consistency), not childish distractions.
* **Zero AI in Beta:** No AI chatbots, AI code generators, or automated AI hints. When members get stuck, they ask real experienced coders via integrated discussion threads or our Discord/Telegram channels.
* **Zero Ads:** 100% clean learning environment focused purely on engineering and problem-solving.
* **Dual-Purpose Core Loop:** Seamlessly connects asynchronous **daily syllabus challenges** with synchronous **Sunday live workshops**.

---

## 4. Functional Requirements

### 4.1. Authentication & User Profiles
* **One-Click OAuth Login:** Firebase Authentication supporting **Google** and **GitHub** sign-in (with Telegram and GitHub handle linking on member profiles).
* **Academic Profile:**
  * Editable readable nickname (consistent with Discord/Telegram).
  * Syllabus completion progress bar & current module.
  * Daily challenge streak counter, longest streak, XP total, and solved problem breakdown (Easy / Medium / Hard).
  * Submission history log and links to GitHub and Telegram handles.

### 4.2. Structured Academic Syllabus, Think-Before-You-Run & Daily Challenges
* **Curated Syllabus Tracks:** Organized modules covering core engineering tracks (*Algorithmic Thinking*, *Python Internals & Memory*, *JavaScript Under the Hood*, *Competitive Programming Basics*) with theory lessons and linked coding problems.
* **Combined Academic Daily Challenges:**
  * Each challenge pairs a **"Think Before You Run"** output-prediction / trace check with a full multi-language coding task.
  * Answering the mental-trace check reveals an engineering explanation before or alongside code implementation.
* **Gamification & Public Leaderboard:**
  * **Daily Streaks:** Tracks consecutive days of solving challenges.
  * **XP & Academy Ranks:** Earned by completing syllabus modules, passing Think-Before-You-Run checks, and solving daily/track problems.
  * **Public Leaderboard:** Weekly and all-time rankings with tabular numerals (`tabular-nums`), streak counts, solved totals, and rank tiers.

### 4.3. LeetCode-Style Coding Sandbox (No AI, Human Mentorship)
* **Resizable Split-Screen Workspace:**
  * **Left Panel:** Problem description, input/output formats, constraints, examples, **Think Before You Run** check, official editorial tab, and **"Mentor Discussion"** tab.
  * **Right Panel:** Clean Monaco Editor supporting Python, JavaScript, and C++ with per-problem draft preservation.
* **Dual-Mode Code Execution Engine:**
  * **External Piston API (`PISTON_API_URL`)** via server-side `/api/execute` proxy when configured (enabling Python, JavaScript, and C++).
  * **Automatic Local Sandbox Fallback:** Isolated browser Web Worker execution for JavaScript and Pyodide WebAssembly (`CPython`) for Python—delivering real test-case evaluation with strict timeout guards and zero server shell exposure even without an external Piston key.
  * Displays execution status (`Accepted`, `Wrong Answer`, `Time Limit Exceeded`, `Runtime Error`), runtime (ms), and per-test diff output.
* **Human Mentorship & Discussion:**
  * Direct per-problem Q&A threads where founders and experienced members review code, pin mentor-verified explanations, and guide learners (zero AI).

### 4.4. Workshop Hub (Live Sessions & Archive)
* **Upcoming Workshop Banner:** Displays the next Sunday Discord workshop topic, time in both the member's local timezone and academy `UTC+5`, prerequisites, meeting link, and persistent one-click **RSVP** / **Cancel RSVP**.
* **Workshop Archive:** Centralized repository for all past workshops—filterable by track and containing problem sets, reference code, presentation slides, and Google Colab/Jupyter notebooks.

### 4.5. Beta Admin Composer & Content Pipeline
* **Seeded Starter Curriculum:** Initial syllabus tracks, problems (with Think-Before-You-Run checks and sample/hidden test cases), and workshops automatically populate on first run.
* **Lightweight Beta Admin Composer:** Role-gated workspace (accessible to verified Admins/Mentors) to create and edit coding problems (title, difficulty, track, description, starter code, Think-Before-You-Run quiz, sample & hidden test cases) and publish/manage workshops directly in the database.

---

## 5. Non-Functional Requirements

* **Strict Adherence to `DESIGN.md`:** Every component, dark-only CSS variable token, `2+1` typography pairing (`Plus Jakarta Sans`, `DM Sans`, `JetBrains Mono`), and zero-pill metadata rule follows `DESIGN.md`.
* **Performance:** Instant navigation and fast code execution feedback (< 3s turnaround for sandbox runs).
* **Security:** Verified Firebase Auth identity, hardened Firestore security rules (`firestore.rules`) validated via ESLint security plugin, parameterized queries/strict schema blueprints, server-side Piston proxy keeping secrets out of client bundles, and zero shell execution of user code.
* **Responsiveness:** Desktop-optimized resizable split-screen code editor; clean mobile tabbed workspace (`Problem`, `Editor`, `Tests`) with `>= 44px` touch targets.

---

## 6. Tech Stack (Beta Architecture)

* **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 (dark-only semantic tokens) + `motion/react`.
* **Code Editor:** `@monaco-editor/react` (dark workstation theme).
* **Auth & Persistence:** Firebase Authentication (Google & GitHub providers) + Cloud Firestore (with hardened `firestore.rules` and `firebase-blueprint.json`).
* **Sandboxed Code Execution:** Server-side Piston v2 API proxy (`PISTON_API_URL`) with automatic isolated Web Worker fallback for JavaScript and Pyodide WASM for Python.

---

## 7. Phased Roadmap

### Phase 1: Beta Launch (Core Academy, Sandbox & Admin Composer)
* Dark-only workstation UI strictly following `DESIGN.md`.
* Firebase Authentication (Google & GitHub) + Academic Profile with GitHub/Telegram handles.
* LeetCode-style Code Sandbox (Python, JS, C++) with sample & hidden test cases + Think-Before-You-Run quizzes.
* Structured Syllabus Tracks + Daily Academic Challenge + Streak, XP & Public Leaderboard.
* Workshop Hub (upcoming session timezone-aware RSVP + archive of slides/notebooks/repos).
* Mentor Discussion Tab on every problem (zero AI).
* Lightweight Beta Admin Problem & Workshop Composer.

### Phase 2: Community Expansion
* Official Video Walkthroughs unlocked after solving a problem.
* Member Project Showcase (featuring community-built tools like *FFClass* and *Pyxel* projects).
* Telegram Bot sync (notifying members of daily challenges and streak reminders).

---

## 8. Build Progress & Changelog

- **[Completed] Planning & Architecture Alignment:** Reviewed `PRD_c3f775e9.md` and `DESIGN_e77d04d9.md`, incorporated Phase 1 product & UI decisions, and finalized the dual-theme workstation + hybrid sandbox architecture.
- **[Completed] Firebase Project Provisioning:** Provisioned Firebase project and Firestore database instance (`firebase-applet-config.json` active).
- **[Completed] Package Installation & Spec Refinement:** Installed `firebase`, `@monaco-editor/react`, `react-markdown`, and `@firebase/eslint-plugin-security-rules`; updated `DESIGN.md` and `PRD.md` to v2.1.
- **[Completed] Security Blueprint & Firestore Rules:** Defined `firebase-blueprint.json` and `security_spec.md`, validated hardened `firestore.rules` with ESLint security plugin (0 errors), and deployed rules to Firestore.
- **[Completed] Dual-Theme Design System & Shell:** Implemented Tailwind v4 `@custom-variant dark` tokens, `Plus Jakarta Sans` / `DM Sans` / `JetBrains Mono` typography, slim desktop sidebar, 3-zone top bar, mobile navigation, and Light/Dark theme toggle.
- **[Completed] Curriculum Seed, Sandbox & Workers:** Built 4 syllabus tracks, 6 coding challenges with Think-Before-You-Run trace checks, `/api/execute` Piston v2 proxy, isolated JS & Pyodide WebAssembly Web Workers, and resizable Monaco split-screen workspace.
- **[Completed] Workshops, Leaderboard, Mentor Discussions & Admin Composer:** Implemented timezone-aware Sunday Workshop Hub with persistent RSVPs, Weekly/All-Time XP Leaderboard, per-problem Human Mentor Discussion threads, Academic Profile with handle linking, and role-gated Beta Admin Composer.
- **[Completed] Build & Lint Verification:** Refactored client state hooks for React 19 compliance, validated zero ESLint issues across source and Firestore security rules, and verified production Next.js compilation.
- **[Completed] Hydration Mismatch Fix:** Added `useIsClient` via `useSyncExternalStore` to format workshop timestamps deterministically in UTC during SSR/initial hydration before switching to the learner's browser timezone.
- **[Completed] Collapsible Navigation Sidebar:** Added a persistent collapse/expand side panel toggle in `AppShell` with an icon-only rail mode and hover/focus tooltips showing each page name.
- **[Completed] Official Brand Header Logo:** Replaced the top header slash and breadcrumb text with the official `THINK//CODE` SVG logo asset alongside the wordmark.
- **[Completed] Public Community Landing Page & Auth Gate:** Built a dedicated landing page for unsigned visitors communicating THINK//CODE's competitive programming and anti-AI-slop mission; signed-in members enter the LMS directly and only return to the landing page upon signing out.
- **[Completed] Secret Passcode Admin Elevation:** Restricted automatic admin privileges across all members; added a click-to-reveal admin passcode input on the Profile page verified server-side against `ADMIN_PASSCODE` with an HMAC-signed `HttpOnly` session cookie before unlocking the Compose workspace.
- **[Completed] Visual-First Apple-Minimal Redesign:** Replaced verbose marketing and LMS prose with 4 bespoke studio photography visuals, SVG progress rings, proportional difficulty/track completion bars, a Top 3 XP podium bar comparison, and a live interactive Trace Check demo on the landing page—while keeping coding challenge specifications, constraints, examples, and editorials in the Sandbox crystal clear.
- **[Completed] Curriculum Expansion & Production Cleanup:** Placed the sidebar collapse toggle at the bottom of the sticky desktop rail, expanded every track to 3 balanced Easy/Medium/Hard problems (12 total challenges & 12 modules across 4 tracks), removed all test/seed users from the leaderboard, and removed past workshops so only live upcoming sessions remain.
- **[Completed] Dark-Only Visual Refresh & Public Asset Cleanup:** Removed the light theme, the appearance toggle, and the dual-theme token layer so the academy ships dark-only; moved all illustrations to `public/images/` with standard kebab-case names and replaced the retired studio photography across Landing, Overview, Syllabus, and Workshops.