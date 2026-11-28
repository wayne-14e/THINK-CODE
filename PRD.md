# THINK//CODE Product Requirements

**Status:** Pre-launch learning hub; community is active on Telegram  
**Product owner:** THINK//CODE Academy  
**Last aligned with:** Product-owner answers and repository inspection  
**Related guidance:** `AGENTS.md`, `DESIGN.md`

> This document distinguishes product direction from current implementation. “In the repository” does not mean deployed or verified in production. Confirm current behavior in code before changing a status.

## 1. Product and purpose

THINK//CODE helps beginners and early-career developers build real algorithmic problem-solving skill through curated lessons, coding practice, trace questions, and support from human mentors. It is a welcoming starting point for people who want stronger coding fundamentals and better preparation for technical interviews. The platform complements later practice on services such as LeetCode and Codeforces; it is not intended to replace every external resource.

The community already meets and shares daily coding quizzes through Telegram. The LMS is intended to become the main home for its lessons, challenges, workshop information and materials, progress, and member feedback.

**Learning principle:** think first, then run code. Encourage deliberate practice, useful hints, and human-to-human learning. The product is not anti-AI: a guided tutor may be considered later, but it must help learners reason rather than write or reveal the answer for them.

## 2. Audience and language

- Primary audience: beginner and early-career coders, generally age 14+, including people building skills for a future technology job or interview.
- Mentors and community admins curate learning materials and help members.
- The community communicates in English and Russian. The interface now has an English/Russian language toggle for UI chrome and primary screens; learning content, problem statements, editorials, and workshop copy remain authored content and are not machine-translated.
- Sign-up is open to learners. Google and GitHub are the intended sign-in providers.

## 3. Product principles and boundaries

- **Skill over shortcuts:** teach concepts and problem-solving; do not make one-shot code generation the learning loop.
- **People matter:** retain per-problem mentor Q&A and link learners to the Telegram and Discord communities. Do not build a general-purpose in-app chat.
- **Warm, capable, and welcoming:** communicate like a technically confident peer, not a school, a corporate course center, or an anti-AI campaign.
- **Curated before expansive:** improve the quality and usefulness of lessons and problems before growing the feature set. Use member feedback to guide expansion.
- **Desktop first:** the coding workspace is the priority. Keep existing responsive behavior, but mobile optimization is not the current focus.
- **No ads.**
- **AI tutor is a future possibility:** do not implement an assistant, code generator, or answer-giving behavior until the owner approves a clear tutor brief and learning rules.

## 4. Core learner journey

1. Sign in and choose a lesson or challenge.
2. Read a concise explanation that makes the concept interesting; work through a “Think Before You Run” trace when available.
3. Solve the coding problem and review the test result and editorial.
4. Ask a focused question in the problem's mentor Q&A, or continue the conversation with the community through Telegram or Discord.
5. Follow progress and find the next workshop, its agenda and join link, or materials from a past session.
6. Share feedback on the platform or community so future improvements reflect member needs.

## 5. Current implementation

The following describes the checked repository, not a production deployment claim. The owner reports that the current app works locally; authentication has been exercised on localhost.

| Area | Present in the repository |
|---|---|
| App shell and access | Next.js app with a public landing page and signed-in workspace; Firebase Google/GitHub sign-in; desktop sidebar and compact responsive navigation. |
| Syllabus | Four seeded tracks—Algorithmic Thinking, Python Internals & Memory, JavaScript Under the Hood, and Competitive Programming Basics—with three modules per track. Modules already contain Markdown theory and link to problems; editorial quality and richer context still need work. |
| Challenges | Twelve seeded coding problems with difficulty, examples, test cases, XP values, daily designation, and Think-Before-You-Run prompts. |
| Coding workspace | Monaco editor; Python, JavaScript, and C++; problem description, trace check, editorial, per-problem mentor Q&A, and execution results. Python and JavaScript have browser-worker fallbacks; C++ requires a configured Piston endpoint. |
| Progress | Module completion, trace-passed and solved state, XP, streaks, submission history, and weekly/all-time leaderboard views. |
| Member profile | Editable display name, optional GitHub/Telegram contact handles, technology stack, tags, badges, progress, solved counts, and completed tracks. Leaderboard member selection opens a public profile modal. |
| Workshops | Upcoming workshop information, agenda, RSVP/cancel RSVP, external session link, optional replay and supporting materials, topic feedback with a required alternative suggestion, and an archive UI for past workshop resources. |
| Admin content tools | Passcode-based admin elevation, a composer for problems and workshops (including agenda, replay, and materials), starter-curriculum sync, and manual XP/badge awards to individual members. |
| Community and feedback | Telegram, Discord, and feedback-form links render only when the owner configures their public environment variables; unset links are hidden rather than replaced with placeholders. |
| Visual system | Dark-indigo canvas with electric green as the primary accent and Blurple as the secondary accent. Space Grotesk display headings (all caps), Inter interface/body text, and JetBrains Mono for code and metrics. Compact radii with darker surfaces. Animated GIFs appear full-bleed with rounded corners in the landing hero, trace-check section, and workshop showcase; see `DESIGN.md`. |

### Known implementation gaps

- Enrich and quality-check lesson material with clear explanations and engaging context such as useful facts or history.
- Localize the remaining error-state and edge-case copy, and decide how authored learning content should be localized.
- Configure the owner-provided Telegram, Discord, and Airtable feedback destinations in the environment; links are hidden until configured.
- Add more workshop records with real agenda, replay, and materials as sessions happen.
- Define automatic badge criteria, referral attribution, and competition rules before implementing them.

## 6. Core product requirements

### 6.1 Lessons and problem practice

- Organize learning into curated tracks and modules, initially covering algorithmic thinking, Python, JavaScript, and competitive-programming basics.
- Modules should explain the idea in an approachable, technically correct way. Add useful examples, facts, or history where they genuinely aid learning; avoid filler.
- Link lessons to coding problems. Support difficulty levels, examples, constraints, test cases, editorials, and a daily challenge.
- Keep “Think Before You Run” as a reasoning exercise. Explain the answer; do not turn it into a gotcha quiz.
- Python and JavaScript are the initial required coding languages. C++ is currently present in the code and may be offered when the execution service is configured. Future language choices—including TypeScript, C, or others—will be decided with member input.

### 6.2 Coding workspace

- Provide a focused problem-and-editor workspace with visible run/submit outcomes and test feedback.
- Preserve the current distinction between Python/JavaScript browser-worker fallback and C++'s configured Piston requirement; do not imply all languages work in every deployment.
- Keep problem statements, examples, constraints, trace explanations, and editorials clear and complete.
- Keep the existing per-problem mentor Q&A. It is a focused question-and-answer feature, not a general community chat or replacement for Telegram/Discord.

### 6.3 Workshops and community

- Show each upcoming workshop's date, time, topic, agenda, and join link.
- Workshops are usually on Sunday around 19:00 in Uzbekistan time (UTC+5), but the community may choose another time through a Telegram poll. Use the actual time for each event rather than assuming a fixed weekly schedule.
- Keep past sessions available with replay/video and related slides, code, notebooks, and problem materials where provided.
- Let members express whether an upcoming topic works for them. If a member dislikes it, require a suggested topic before submitting that response. Members can update their own response; other members' suggestions are shown without contact details.
- Provide clear links to the Telegram and Discord communities. No general-purpose in-app chat is in scope.
- Add the owner-provided Airtable form for feedback about the LMS and community. The form URL must come from the owner; do not invent one.

### 6.4 Accounts, profiles, and rankings

- Support Google and GitHub sign-in.
- Use one platform username as the member's identity; GitHub and Telegram remain optional contact links, not alternate identity labels.
- Let members add up to five technology-stack items and up to five profile tags.
- Keep XP, streaks, solved totals by difficulty, and weekly/all-time rankings. Weekly XP resets when a new ISO week begins; all-time XP is preserved.
- Selecting a leaderboard member opens a profile view/modal with username, stack, tags, XP, badges, solved counts by difficulty, and completed tracks.
- Public member information is limited to the intended profile and ranking details. Account email is never exposed as public profile information.
- Keep open learner sign-up; admin publishing actions must remain admin-only.

### 6.5 XP, badges, referrals, and competitions

- Continue rewarding learning progress and recognize meaningful community participation, including workshop attendance.
- Let admins award XP and badges to individual members from an admin surface.
- Use a small predefined badge catalog: problem-solving contribution, workshop participation, community referral, streak keeping, and track completion. Criteria are manual; no badge is awarded automatically yet.
- Add member competitions with digital prizes as a later community feature. Competition format, schedule, scoring, and prize rules require a separate product decision.
- Referral links and referral attribution are not currently implemented.

### 6.6 AI and help

- There is no AI assistant in the current implementation.
- Keep deliberate practice, hints, human mentors, and community discussion central.
- A future AI tutor may guide reasoning in a Socratic manner and avoid directly supplying complete code or answers. Its behavior, boundaries, and privacy implications require an explicit owner-approved brief before implementation.

## 7. Roadmap and status

### Owner-stated near-term priorities

- Improve and review the existing lesson/problem content.
- Configure and verify the Telegram, Discord, and feedback-form destinations.
- Add more real workshop records with agendas, replays, and materials as sessions happen.
- Collect member feedback before committing to a broad feature expansion.

### Implemented in the repository

- English/Russian UI toggle for interface chrome and primary screens, with English as the default.
- Telegram, Discord, and feedback links driven by public environment variables.
- Single-username profiles with stack, tags, badges, completed tracks, and a leaderboard profile modal.
- Admin-issued XP and badges from a manual catalog.
- Workshop agenda, replay, materials, and topic feedback with required alternative suggestions.
- Weekly XP reset using an ISO week key while preserving all-time XP.

### Later product directions

- Complete Russian localization of authored learning content.
- Define automatic badge criteria and referral attribution.
- Member competitions with digital prizes.
- A carefully designed guided AI tutor, only after product definition and approval.
- Additional programming languages selected with member input.

This is a direction, not a promise of sequencing or delivery dates. Update it when the owner changes priorities.

## 8. Technical context

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, and Motion.
- Identity and data: Firebase Authentication and Cloud Firestore.
- Editor: Monaco.
- Code execution: server-side Piston proxy when configured; isolated browser workers for Python and JavaScript fallback.
- Do not copy secrets into docs or client code. Do not claim a deployment, security audit, or production capability based only on repository configuration.

## 9. Open decisions to resolve when relevant

- How deeply to localize authored learning content beyond the current English/Russian UI chrome.
- Exact Telegram/Discord destinations and Airtable feedback URL, supplied through environment variables.
- Automatic badge criteria and referral attribution rules.
- Competition format and prize rules.
- Tutor behavior, boundaries, and data handling.
- Final content priorities and which future languages members choose.
- How to measure learner confidence, skill growth, and whether the LMS is becoming the community's main learning hub.
