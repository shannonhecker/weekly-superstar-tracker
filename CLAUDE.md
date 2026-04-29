# Kids-achievement-tracker

Project-scoped instructions for Claude Code working in this repo.

## Clarify-first

Global rule applies: ask one clarifying question per turn, every request (including in auto mode), until nothing is left to ask. Escape phrases: `"just do it"` / `"go"` / `"ship it"`. Full checklist in `~/.claude/skills/clarify-first/SKILL.md`.

Walk the 8-category checklist on every request:

1. Which project / where
2. Scope — in/out
3. Stakeholders / audience
4. References / examples
5. Design / visual decisions
6. Technical approach
7. Constraints / risks _(weighted heavier)_
8. Success criteria

**Kids-achievement-tracker-specific things to always clarify before building:**

- **Audience:** is the change for the child-facing surface, parent-facing surface, or shared? They need different tones, motion, and copy.
- **Data shape:** achievements, rewards, streaks — which entity is affected, and does the change require storage migration?
- **Motion/feedback:** celebratory moments (achievement unlocked, streak hit) are product-critical. Ask whether a change should preserve, replace, or extend existing animations.
- **Accessibility:** kids' interfaces have specific contrast, tap-target, and reading-level requirements. Reach for `accesslint:contrast-checker` and `typography` skills — don't leave these for a "later pass".

## Stack notes

Match the existing stack and patterns. Don't introduce new frameworks, state libraries, or build tools without asking.

- **Vite 6 + React 18 + Tailwind 3** (ESM, `"type": "module"`).
- **Vitest 4** for tests at `src/**/*.test.{js,jsx}` and `test/setup.js` for the jest-dom adapter. `npm run test` runs the full suite (≈60 tests as of 2026-04-29).
- **Firebase**: hosting + Firestore + Storage + Auth (email/Google/Apple). Firestore rules at `firestore.rules`, Storage rules at `storage.rules`. Functions live in `functions/`.
- **Shared package** `@weekly-superstar/shared` is a sibling repo at `~/Documents/Cursor/weekly-superstar-shared` linked via `"file:../weekly-superstar-shared"`. Three-repo coupling — CI checks out shared as a sibling and runs `npm run build` there before installing the web app.
- **Token source of truth** is the shared package's `src/tokens/`. Tailwind config consumes `colors.earthy` etc. Don't introduce new local color literals — extend the shared palette and consume.

## Structure

- `src/pages/` — top-level routes registered in `src/App.jsx` (lazy-loaded, single Suspense at the route boundary)
- `src/components/` — shared UI; the canonical CTA is `<PrimaryButton>`
- `src/lib/` — pure helpers (week math, themes re-export, sounds, firebase init, avatar upload, sticker constants)
- `src/contexts/` — React contexts (auth, toast, sound mute)
- `docs/` — production-readiness audit, onboarding plan, cross-platform-account plan, domain handover. **The audit doc at `docs/production-readiness-audit-2026-04-28.md` is the source of truth for what's open vs closed; reference its S/P/A/Q codes (e.g. "audit Q5") in PR titles.**
- `.github/workflows/deploy.yml` — auto-deploys hosting on push to `main`. Runs `firebase deploy --only hosting` **only** — does NOT deploy `firestore.rules` or `storage.rules`. Rules changes need Firebase Console publish. Skip-this-trap memory entry: `feedback_rules_class_files`.

## Workflow notes

- **Branch + PR + squash-merge.** Never push direct to main (policy blocks it). `gh pr create` then `gh pr merge --squash --delete-branch`.
- **Squash-merge can drop changes silently.** Verify a claimed fix on `main` by `grep`-ing the artefact, not just the commit message. See `feedback_squash_merge_drops` for the ⭐/✨ war story.
- **Tests + build before push.** `npm run test && npm run build`. CI runs hosting deploy on success but no test gate yet — locally is the gate.
- **The picture-tag CSS gotcha.** PR #36 wrapped `<img>` in `<picture>` for WebP variants and broke `.ws-raster-banner > img` (direct-child selector). Lesson: prefer descendant selectors for elements whose wrapper structure may change. PR #44 fix + DOM-shape test guards it.
- **Site is `https://winkingstar.com`** (Firebase Hosting on project `weekly-superstar-tracker`). Apex + www both serve HTTPS; auto-deploys via GitHub Actions on push to main (FIREBASE_TOKEN secret already set).
