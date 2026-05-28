# Web signup-wizard art uplift — design spec

**Date:** 2026-05-28
**Author:** brainstormed with Claude (Opus 4.7)
**Scope:** `src/pages/SignUp.jsx` 4-step wizard + parental consent gate
**Status:** Spec ready · Phase 1 starting

## Context

Web's signup wizard never received the v1.1 art uplift that the iOS app got
(per `~/.claude/projects/-Users-shannonhecker/memory/project_winkingstar_v11_roadmap.md`).

Evidence:

- `src/pages/SignUp.jsx:530-536` `StepTheme` renders `{t.emoji}` in a 40px
  colored circle — falls back to emoji instead of using illustration assets.
- The illustration assets exist (`public/theme-banners/<theme>.png`
  + 376w/768w/1500w WebP variants) and `ThemeCardArt` / `ThemeScene`
  components are already wired into Landing, SignIn, and Board.
- iOS has 5 art directories the web does NOT have (`onboarding-art`,
  `illustrated-emoji`, `header-art`, `graphics`, `ui-icons`).
- iOS uses richer treatments: full-bleed banner hero per step, sparkle +
  smoke accents (PR #116 Tier-2), IllustratedEmoji component (PR #127).

## Decisions locked in via brainstorm

| Dimension | Choice |
|---|---|
| Reference | iOS design LANGUAGE, web-appropriate translation (not 1:1) |
| Scope | All 4 wizard steps + consent gate |
| Asset strategy | Port iOS PNGs as-is; run through web's existing WebP pipeline (376/768/1500w variants) |
| Art weight | Full hero illustration each step |
| Approach | Polish-then-port — design audit + typography FIRST, then port art, then sparkles |

## Phased plan

### Phase 1 — Layout + type pass (no new assets)

Goal: Get the wizard layout to a polished baseline before any hero art lands.
Why first: hero art on top of a misaligned grid amplifies the misalignment.

Tools: `design-audit`, `typography`, `accesslint:contrast-checker`.

In scope:

- Spacing rhythm across all 4 steps + consent gate
- Typography scale + hierarchy
- Color usage vs `earthy-*` token palette
- Focus-visible states on all interactive controls
- Layout grid breakpoints (compare to Landing.jsx's already-polished grid)
- Motion vestigials (any leftover transitions that don't fit the new direction)

Out of scope (Phase 2+):

- New illustrations
- Sparkle / smoke accents
- Component restructuring beyond minor JSX cleanup

Deliverable: 1 PR.
Estimate: ~1-2 days.
Risk: Low — typically safe, incremental.

### Phase 2 — Asset port + WizardHero component

Goal: Wire illustrated art into the polished layout from Phase 1.

Tasks:

1. Port iOS hero PNGs to web `public/onboarding-art/`:
   - `intro-welcome.png` → step 1 hero
   - `intro-house.png` or `family-board.png` → consent gate
   - `intro-friend.png` → kid form
   - `intro-cake.png` or `intro-rest.png` → step 4
2. Run them through the existing WebP pipeline (376/768/1500w variants).
3. Wire `<ThemeCardArt themeKey={key} />` into `StepTheme` tiles
   (replace the `{t.emoji}` in colored circle at SignUp.jsx:530-536).
4. New `<WizardHero illustration={...} alt="" />` component with
   `loading="lazy"` and `<picture>` element for WebP-first.
5. Lazy-load each step's hero (only the active step's hero loads).
6. Decorative `alt=""` on heroes since headings already describe the step.

Deliverable: 4-5 PRs (theme picker first as smallest highest-ROI win,
then 1 PR per step hero so any regression is bisectable).
Estimate: ~3-5 days.
Risk: Medium — page weight; layout regressions if hero proportions differ
across steps. Mitigate with consistent aspect ratio per hero.

### Phase 3 — Tier-2 sparkle + smoke accents

Goal: Port the iOS PR #116 sparkle/smoke polish CSS-only.

Tasks:

1. Author CSS-only sparkle + smoke accents tuned for cream background
   (lighter than iOS's darker bg; no clash on `earthy-cream`).
2. Apply per step where the iOS version uses them.
3. `prefers-reduced-motion` guard — accents fade in once, no loops if
   user has reduced-motion enabled.
4. No JavaScript animation libraries — keep bundle weight low.

Deliverable: 1-2 PRs.
Estimate: ~2-3 days.
Risk: Medium — sparkles can clash visually; needs design judgment to
tune. Reduced-motion guard is a hard a11y requirement.

### Phase 4 — A11y verification

Goal: Comprehensive a11y pass across the new wizard.

Tasks:

- Contrast: every text-on-illustration pairing meets WCAG 2.2 AA.
- Focus visible: every interactive control has a visible focus ring on
  keyboard navigation.
- Motion guards: every animation respects `prefers-reduced-motion`.
- Screen reader narration: decorative heroes have `alt=""`; meaningful
  illustrations get a descriptive `alt`.
- Tab order: confirms left-to-right reading order on the theme grid.

Tools: `accesslint:audit`, manual keyboard navigation, screen reader
walkthrough.

Deliverable: 1 PR.
Estimate: ~1 day.
Risk: Low.

## Sequencing + ship rules

- Each phase ships as its own PR set. Each PR is reviewable on its own.
- Phase 2's first PR is the theme picker swap (lowest risk, highest visual ROI).
- Per `feedback_squash_merge_unknown_state` — wait for CLEAN before merging.
- Per `feedback_no_em_dashes` — every PR includes a copy grep before push.
- Each PR includes a screenshot before/after for the touched step.

## Success criteria

- Web wizard visual feels of-a-piece with iOS app (same warmth + illustration
  language) when a user switches between them.
- Lighthouse perf score on `/signup` stays ≥85 (currently passes; baseline
  to measure against before Phase 2).
- All copy still em/en-dash clean post-uplift.
- No new keyboard-trap or contrast violations introduced.
- Test plan: each PR ships with the manual smoke test (the Playwright
  script at `/tmp/winkingstar-test.py` is a good template).

## Open questions deferred to per-phase planning

- Whether `WizardHero` lives in `src/components/` (used elsewhere) or
  `src/components/wizard/` (wizard-only).
- Whether to extract the wizard into its own route bundle (currently
  shares the `SignUp.jsx` chunk).
- Whether the Landing hero is in scope (currently uses `<ThemeCardArt
  themeKey="animals" />` — already on-brand, may not need uplift).

These get resolved when each phase's writing-plans pass runs.
