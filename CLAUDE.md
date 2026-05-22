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

## Operational notes (from memory, added 2026-05-09)

Project-specific facts surfaced from memory after burns or hard-won discoveries.

### iOS / ASC identity
- **Bundle ID:** `com.winkingstar.app` (rebranded 2026-05-01 from `com.happy.weeklysuperstar`).
- **ASC App ID:** `6765767262`.
- **EAS credentials:** cached in EAS state. See `reference_winkingstar_ios_appid.md`.

### EAS dev-client ≠ production
- Dev-client builds skip JS bundling; `file:../sibling` deps appear to work but production builds trip with `Cannot find module`.
- Fix: `eas-build-pre-install` hook in package.json to clone the sibling at build time. See `feedback_eas_dev_client_vs_production.md`.
- Real error from prod build is in the EAS web log, not stderr — CLI hides it as "Unknown error."

### Firebase Auth — Authorized domains
- Custom domains MUST be added at Firebase Console → Authentication → Settings → Authorized domains, OR OAuth fails silently.
- Add **both** apex (`winkingstar.com`) and www — origin check happens BEFORE redirect.
- Debug check: `curl "https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=<webApiKey>"` returns the `authorizedDomains` array.

### Rules-class files require explicit ship
- `firestore.rules`, `storage.rules`, IAM policies — never auto-PR-and-merge on "next" / "go" alone. See `feedback_rules_class_files.md`.
- Workflow `deploy.yml` only runs `firebase deploy --only hosting`. Rules changes need manual Console publish.

### v1.1 redesign roadmap
- 6 PRs · ~6 dev days · cosmic theme + bottom tabs + daily goals + Pet Pals + decorative names. Treasure Chest cut 2026-05-22 — redundant with pet + mystery boxes (see plan `i-think-the-treasure-rustling-perlis.md`).
- User chose "ship v1.0 thin first, v1.1 in 2 weeks" 2026-05-08. See `project_winkingstar_v11_roadmap.md`.
- PR-2 (daily goals + day-of-week scheduling) has the strongest family validation.

### Behavioural skills (this machine)
- `clarify-first` — every request, cat-7 gate before any tool call.
- `before-shipping` — fires on merge/push/deploy. Catches rules-class diffs, em-dashes, stacked-PR retarget, squash-merge drops.
- `session-handover` — at end of multi-PR sessions (Winking Star sessions average 5–11 PRs/day) generate handover memo to memory/.
- `decision-archaeology` — monthly behavioural audit.
