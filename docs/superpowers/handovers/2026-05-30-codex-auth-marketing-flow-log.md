# 2026-05-30 Codex Auth Marketing Flow Log

## Summary

Today we merged the sign-in hero swap and the broader sign-in, sign-up, onboarding, and main website marketing refresh into `main`.

## Merged PRs

1. PR #124: `feat(signin): swap family photo hero for doodle house`
   - URL: https://github.com/shannonhecker/weekly-superstar-tracker/pull/124
   - Merge commit: `83c53776bc7985c39d51232a9bc9c4752babf548`
   - Changed `/signin` hero from `family-hero` to `intro-house`.
   - Removed orphaned `public/onboarding-art/hero/family-hero*` PNG and WebP assets.
   - Removed the obsolete manifest entry from `scripts/sync-onboarding-art.mjs`.

2. PR #125: `feat(onboarding): add marketing-led doodle auth flow`
   - URL: https://github.com/shannonhecker/weekly-superstar-tracker/pull/125
   - Merge commit: `89138491827c46ba1f78c40442a55499a285eb7b`
   - Added `src/components/MarketingDoodleStage.jsx`.
   - Updated `src/pages/Landing.jsx` so the main website opens with a marketing-led Winking Star hero and sample-board CTA.
   - Updated `src/components/wizard/WizardShell.jsx` so sign-up and onboarding use the new doodle marketing stage on desktop.
   - Updated `src/pages/SignIn.jsx` with stronger value copy and a visible "Try a sample board" CTA.
   - Updated `src/pages/Join.jsx` invite copy to match the new auth flow.
   - Added motion classes and reduced-motion handling in `src/index.css`.

## Live Deploy Status

- The repo has a Firebase Hosting GitHub Action at:
  - https://github.com/shannonhecker/weekly-superstar-tracker/actions/workflows/deploy.yml
- That workflow runs on pushes to `main` for changes under `src/**`, `public/**`, and related build files.
- PR #125 was squash-merged into `main`, so it should have triggered the production deploy workflow.
- I could not confirm the final workflow result from the local machine because the local shell stopped launching commands.

## Validation Notes

- Local `npm run build`, `npm run test`, Playwright visual smoke, and manual `firebase deploy` could not be completed after the shell began failing with immediate `Process exited with code -1` results.
- Earlier Vitest validation for PR #124 also failed at the worker infrastructure layer before app tests executed:
  - `[vitest-pool]: Failed to start threads worker`
  - `Timeout waiting for worker to respond`
- GitHub-side verification confirmed the merged `main` branch contains the PR #125 files and changes.

## After Mac Restart

1. Open the repo:
   - `/Users/shannonhecker/Documents/Cursor/Kids-achievement-tracker`
2. Check deploy workflow:
   - https://github.com/shannonhecker/weekly-superstar-tracker/actions/workflows/deploy.yml
3. Run local validation if the shell works again:
   - `npm run build`
   - `npm run test -- --pool=threads --run`
4. If the GitHub deploy did not run or failed, deploy manually:
   - `firebase deploy --only hosting --project weekly-superstar-tracker`

## Current Expected Product State

- Main website now sells the app first, not just the auth flow.
- Sign-in has the iOS-style doodle house artwork and try-first CTA.
- Sign-up and onboarding share the new doodle marketing stage.
- The flow points new parents toward trying a sample board before account creation.
