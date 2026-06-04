# 2026-05-31 Codex Print Sheet Live Log

## Summary

Today we polished the weekly printable sheet visual design and shipped it live to Firebase Hosting.

User feedback: the print sheet looked too plain and needed the same warm Winking Star feel as the current UI.

## Shipped Changes

1. `src/pages/PrintSheet.jsx`
   - Reworked the sheet from a plain grid into a warmer Winking Star printable.
   - Added shared earthy design tokens from `@weekly-superstar/shared/tokens`.
   - Improved the top banner treatment so theme art fills the banner area more confidently.
   - Added a softer paper/card shell, rounded inner panel, and subtle print-safe borders.
   - Redesigned the kid/week/progress header with theme badge, Winking Star chip, QR card, and progress bar.
   - Restyled day headers with rounded top band, date chips, and weekend tinting.
   - Restyled activity rows with emoji badges, alternating warm backgrounds, and stronger label hierarchy.
   - Restyled sticker cells with rounded target boxes while preserving the printable grid.
   - Added a footer instruction pill.

2. Scanner-sensitive layout
   - Kept the canonical scan geometry constants unchanged:
     - `GRID_TOP_PCT = 18`
     - `GRID_BOTTOM_PCT = 4`
     - `GRID_LEFT_PCT = 18`
     - `GRID_RIGHT_PCT = 4`
   - Kept QR sizing constants unchanged.
   - Toned down the grid scan marker to avoid creating a heavy visual false-positive.

3. Visual reference
   - Used the built-in image generation skill to create a polished A4 Winking Star printable reference.
   - Local generated reference:
     - `/Users/shannonhecker/.codex/generated_images/019e7aa3-ffad-74e1-b1a9-970deab71e40/ig_0704987a2b1b8f30016a1b71a64e948191b563cdaca6a17c64.png`
   - Local Playwright visual check:
     - `output/playwright/print-sheet-visual-check.png`

## Commits

1. `59c828e` - `Polish printable sheet visual design`
   - Changed `src/pages/PrintSheet.jsx`.
   - Diff size: 190 insertions, 56 deletions.

2. `2705399` - `Merge print sheet visual polish`
   - Merged the print sheet polish into `main`.
   - `origin/main` now points at this merge commit.

## Validation

- `npm run build` passed on the feature branch after the print-sheet changes.
- `npm run build` passed again on `main` after the merge.
- `npm run deploy` completed successfully:
  - Firebase project: `weekly-superstar-tracker`
  - Hosting target: `weekly-superstar-tracker`
  - Files found in `dist`: 145
  - New files uploaded: 47
  - Release completed.
- Live URL check returned `HTTP/2 200`:
  - https://weekly-superstar-tracker.web.app

## Deployment

Live Firebase Hosting URL:

- https://weekly-superstar-tracker.web.app

Deploy completed at approximately `2026-05-31 01:10 BST`.

## Current Local State

After deployment, the working branch was restored to:

- `feat/signin-doodle-house-hero`

Unrelated local files were temporarily stashed before the merge/deploy, then restored afterward. They were not included in the live release:

- Deleted local onboarding hero assets under `public/onboarding-art/hero/family-hero*`
- Modified `scripts/sync-onboarding-art.mjs`
- Untracked `docs/superpowers/handovers/`
- Untracked `output/`

## Notes

- The sign-in/onboarding polish was already merged before today, on `2026-05-30`.
- Today's git history only includes the print-sheet visual polish and its merge to `main`.
- No scanner regression test suite was run; the implementation intentionally preserved the existing scan geometry constants.
