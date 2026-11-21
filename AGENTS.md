# Agent Guidelines

## Read project context first

Before making product or UI changes, read `PRD.md` and `DESIGN.md`, then inspect the relevant implementation. The PRD describes product intent and separates it from the current repository state; the code is the evidence for what is implemented. DESIGN.md is the visual and interaction direction.

If the code, docs, or request disagree, do not silently choose a product direction. Preserve unrelated behavior and ask the product owner when the choice affects scope, UX, or data. Record unresolved decisions instead of presenting guesses as facts.

## Keep product context current

- Update `PRD.md` whenever a change adds, removes, or materially changes user-facing behavior. Keep implemented, planned, out-of-scope, and unresolved items distinct. Only describe behavior as implemented after checking the relevant code; do not imply that code has been deployed or verified in production.
- Update `DESIGN.md` when a change establishes or changes a reusable visual, interaction, content, or responsive rule. Keep it aligned with the product owner's latest direction and the actual design tokens.
- Do not add a build log entry for routine work. If a historical note becomes stale, correct or remove it rather than appending another contradictory claim.
- Keep both documents concise and actionable. Do not copy implementation details into product requirements unless they affect user-visible behavior or an agreed constraint.

## Product guardrails

- Build a warm, peer-supported coding practice hub for beginners and early-career learners. The goal is independent algorithmic problem solving and interview readiness, not a school/course-center feel.
- Encourage deliberate thinking and human mentoring. A guided AI tutor may be considered later, but do not add an AI assistant, code generator, or answer-giving feature without an explicit product brief and approval.
- Keep the existing per-problem mentor Q&A distinct from a general-purpose community chat. The main community channels are Telegram and Discord; do not introduce a new in-app chat.
- Preserve the current core unless the request changes it: Google/GitHub sign-in, syllabus and challenges, trace checks, coding workspace, progress/leaderboard, workshops, profiles, and admin content tools.
- Product plans such as competitions, badges, profile expansion, bilingual UI, and workshop feedback are not evidence that those features exist. Confirm status in code before changing their PRD status.

## Implementation practices

- Follow the existing Next.js App Router, TypeScript, Tailwind CSS, Firebase, and component patterns. Prefer small, focused changes; avoid adding dependencies or abstractions without need.
- Treat user-facing code execution, authentication, Firestore access, and admin actions as sensitive boundaries. Never expose secrets, read or copy values from local environment files, or claim security properties that have not been verified.
- Preserve useful responsive behavior, but prioritize desktop workflows unless the task specifically targets mobile. Do not add custom keyboard shortcuts unless requested.
- Run the smallest relevant existing check after code changes. Documentation-only changes do not need a build or test run.
