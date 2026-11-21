# Firestore Security Specification (Phase 0 TDD)

## Data Invariants
1. **PII Isolation**: Emails and personal account progress arrays live strictly in `usersPrivate/{uid}` and are readable only by `request.auth.uid == uid` or verified admins. `publicProfiles/{uid}` never contains email or PII.
2. **Role Integrity**: Learners cannot self-assign `role: "admin"` or `role: "mentor"` in `publicProfiles/{uid}` or create documents in `admins/{uid}`. Only verified admins (including bootstrapped owner `sardieyeee08@gmail.com` with `email_verified == true`) can write `admins/*`, `tracks/*`, `problems/*`, or `workshops/*`.
3. **Discussion & Submission Ownership**: Every `discussions/{commentId}` write must have `authorUid == request.auth.uid`, valid parent `problemId` verified via `exists()`, and non-admins cannot set `isMentorAnswer: true` or `isPinned: true`. Every `submissions/{submissionId}` write belongs strictly under `usersPrivate/{uid}/submissions` and is immutable after creation.
4. **Temporal & Boundary Enforcement**: All `createdAt` / `updatedAt` / `rsvpedAt` fields enforce `== request.time`. All strings and arrays enforce explicit `.size()` bounds.

## Dirty Dozen Adversarial Payloads (Expected: PERMISSION_DENIED)
1. **Identity Spoof (Profile)**: User A attempts `setDoc('/publicProfiles/userB', { uid: 'userB', ... })` -> DENIED (`request.auth.uid != uid`).
2. **Privilege Escalation**: Learner attempts `create` on `/publicProfiles/userA` with `role: 'admin'` -> DENIED.
3. **Role Update Escalation**: Learner attempts `update` on `/publicProfiles/userA` modifying `role` -> DENIED (`affectedKeys` allowlist excludes `role`).
4. **XP Inflation Attack**: Learner attempts `update` on `/publicProfiles/userA` adding `+50000` XP in a single write -> DENIED (`xp <= existing().xp + 500`).
5. **PII Scraping**: User A attempts `get` or `list` on `/usersPrivate/userB` -> DENIED.
6. **Email Spoof Admin**: Unverified token (`email_verified: false`) with admin email attempts to create `/problems/p1` -> DENIED (`email_verified == true` required).
7. **Shadow Field Injection**: User A attempts `create` on `/publicProfiles/userA` with extra field `isVerified: true` -> DENIED (`hasOnly` check fails).
8. **Orphaned Discussion Write**: User A posts to `/problems/nonexistent-id/discussions/c1` -> DENIED (`exists(/problems/nonexistent-id)` fails).
9. **Fake Mentor Endorsement**: Learner creates `/problems/p1/discussions/c1` with `isMentorAnswer: true` -> DENIED.
10. **Submission Tampering**: User A attempts `update` or `delete` on `/usersPrivate/userA/submissions/s1` -> DENIED (submissions are immutable).
11. **Oversized ID Poisoning**: Attacker targets `/problems/1500-char-id/...` -> DENIED (`isValidId` rejects > 128 chars).
12. **Client Timestamp Forgery**: User A creates discussion with backdated `createdAt` (`!= request.time`) -> DENIED.
