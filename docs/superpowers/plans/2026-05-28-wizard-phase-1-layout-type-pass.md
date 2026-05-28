# Wizard art uplift — Phase 1: layout + type pass

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the signup wizard's layout, typography, and ARIA state to a baseline so Phase 2's hero illustrations land on a clean surface — no new assets in this PR.

**Architecture:** Surgical text + class changes in `src/pages/SignUp.jsx` only. Heading-voice unification, theme-grid balance, step-counter prominence, focus + ARIA across wizard advance buttons. One PR, ≤200 LOC net diff.

**Tech Stack:** Vite 6 + React 18 + Tailwind 3 · existing `earthy-*` token palette · no new packages.

---

## Spec coverage

This plan implements Phase 1 of `docs/superpowers/specs/2026-05-28-wizard-art-uplift-design.md`. The other phases (asset port, sparkle accents, a11y verification) get their own plans when Phase 1 lands.

## File structure

| File | Action | Responsibility |
|---|---|---|
| `src/pages/SignUp.jsx` | Modify | All wizard step components + parent layout. ~7 surgical edits. |
| `/tmp/winkingstar-phase1-before/*.png` | Create (artefact, gitignored) | Baseline screenshots |
| `/tmp/winkingstar-phase1-after/*.png` | Create (artefact, gitignored) | After-fix screenshots |

No new components in Phase 1. The wizard JSX is already laid out cleanly enough that touching component boundaries would scope-creep.

## Findings being fixed

Cross-referenced against the 2026-05-22 onboarding audit (`docs/audit-onboarding-2026-05-22.md`) — these are the wizard-scoped layout/typography findings still open after that audit's already-merged fixes (PRs #78, #81, #86, #87, #88, #92, #93, #103):

| ID | Finding | Sev |
|---|---|---|
| **P1-A** | Step-heading voice drifts across 5 screens — "meet your weekly superstar." (lowercase) vs "Pick a theme for them" (title case, no period) vs "Grown-up check." vs "Tell me about them" vs "One last step." | 2 |
| **P1-B** | Step counter `1 / 4` is muted 12px text top-right — easy to miss, no progress affordance | 2 |
| **P1-C** | Theme picker has 17 tiles in a 4-col grid → row 5 has 1 orphan tile ("Fox" alone) | 1 |
| **P1-D** | Wizard advance buttons use `disabled` only, no `aria-disabled` (F-W15 from 2026-05-22 audit, never actioned) | 1 |
| **P1-E** | Birthday helper p tag uses `text-sm` while sibling helpers use `text-xs` — type-scale drift | 1 |
| **P1-F** | "Already have an account? Sign in" footer link lacks `focus-visible:` ring (F-W10-adjacent — landing CTAs got the fix in PR #93, the wizard footer didn't) | 1 |

## Out of scope (explicit non-goals)

- New illustrations / hero art (Phase 2)
- Sparkle / smoke accents (Phase 3)
- Token sweep — that's PR #91 already open, separate work
- Date-picker custom UI (Phase 2 candidate)
- Analytics instrumentation (separate effort, F-W06)
- ParentConsentGate restructure (Phase 2 territory if any change is needed)

---

## Task 1: Capture baseline screenshots

**Files:**
- Create: `/tmp/winkingstar-phase1-before/*.png`

- [ ] **Step 1: Re-use the existing Playwright smoke test to capture baseline.**

```bash
mkdir -p /tmp/winkingstar-phase1-before
cp /tmp/winkingstar-test/01-landing.png /tmp/winkingstar-phase1-before/01-landing.png
cp /tmp/winkingstar-test/02-step1.png /tmp/winkingstar-phase1-before/02-step1.png
cp /tmp/winkingstar-test/03-step2-themes.png /tmp/winkingstar-phase1-before/03-step2-themes.png
cp /tmp/winkingstar-test/v3-04-kid-form.png /tmp/winkingstar-phase1-before/04-kid-form.png
cp /tmp/winkingstar-test/v4-step4-credentials.png /tmp/winkingstar-phase1-before/05-credentials.png
```

Expected: 5 PNG files in `/tmp/winkingstar-phase1-before/`. These are the "before" state from the prod smoke test we ran earlier.

- [ ] **Step 2: Note the live wizard URL for after-screenshots.**

After we run dev server (`npm run dev`), local URL is `http://localhost:5173/signup`. After-screenshots will hit this local URL via Playwright once edits land. No artifact yet — just remembering the URL.

---

## Task 2: P1-A — Unify step heading voice

**Files:**
- Modify: `src/pages/SignUp.jsx` — 5 heading sites

**Decision:** Sentence case + period across all step headings. Reasoning: 2 of 5 headings already use that pattern ("Grown-up check.", "One last step."), and it pairs with the brand's calm warm tone. The lowercase Step 1 headline is a deliberate brand choice — convert to sentence case for consistency, drop "meet your" framing since the new pattern doesn't need the greeting beat.

| Current | New |
|---|---|
| "meet your / weekly superstar." | "Meet your weekly superstar." |
| "Pick a theme / for them" | "Pick a theme for them." |
| "Tell me about / them" | "Tell me about them." |
| "One last step." | "One last step." (no change) |
| "Grown-up check." | "Grown-up check." (no change) |

- [ ] **Step 1: Locate the StepIntro heading.**

Read `src/pages/SignUp.jsx` around line 470-490 to find `StepIntro`'s heading.

- [ ] **Step 2: Edit StepIntro heading.**

Find the JSX rendering `meet your / weekly superstar.` (lowercase, with `<br />`) and replace with sentence case, single line + period.

Before:
```jsx
meet your<br />weekly superstar.
```

After:
```jsx
Meet your weekly superstar.
```

(Remove the `<br />` — the modern type scale can handle the single line; if it wraps on narrow viewports, that's a natural break.)

- [ ] **Step 3: Edit StepTheme heading.**

Find `Pick a theme<br />for them` and replace.

Before:
```jsx
Pick a theme<br />for them
```

After:
```jsx
Pick a theme for them.
```

- [ ] **Step 4: Edit StepKid heading.**

Find `Tell me about<br />them` and replace.

Before:
```jsx
Tell me about<br />them
```

After:
```jsx
Tell me about them.
```

- [ ] **Step 5: Verify the wizard still renders.**

Run: `cd ~/Documents/Cursor/Kids-achievement-tracker && npm run build`
Expected: build succeeds, no JSX errors.

- [ ] **Step 6: Commit Task 2.**

```bash
git add src/pages/SignUp.jsx
git commit -m "$(cat <<'EOF'
refactor(wizard): unify step-heading voice to sentence case + period

Three of five wizard step headings drifted from the sentence-case
pattern set by "Grown-up check." and "One last step." Bring all
five into the same voice. Removes the manual <br /> in step 1, 2, 3
since the new single-line headings wrap naturally on narrow viewports.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: P1-B — Step counter to progress dots

**Files:**
- Modify: `src/pages/SignUp.jsx:347-349` — the top-bar step counter span

**Decision:** Replace muted "1 / 4" text with a row of 4 progress dots. Dots fill in cocoa for completed/current, sit hollow for upcoming. More glanceable, more emotionally satisfying ("you're 3 of 4 in"), no new tokens needed.

- [ ] **Step 1: Replace the counter span.**

Find at `src/pages/SignUp.jsx` around line 347-349:

```jsx
<span className="text-xs font-bold tracking-wider uppercase text-earthy-cocoaSoft">
  {step} / {TOTAL_STEPS}
</span>
```

Replace with:

```jsx
<div
  className="flex items-center gap-1.5"
  role="progressbar"
  aria-label={`Step ${step} of ${TOTAL_STEPS}`}
  aria-valuenow={step}
  aria-valuemin={1}
  aria-valuemax={TOTAL_STEPS}
>
  {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
    <span
      key={i}
      aria-hidden="true"
      className={[
        'block h-1.5 rounded-full transition-all',
        i + 1 <= step ? 'w-6 bg-earthy-cocoa' : 'w-1.5 bg-earthy-divider',
      ].join(' ')}
    />
  ))}
</div>
```

This renders 4 dots: current and prior are wide pills (24px) filled cocoa; upcoming are 6px dots in divider color.

- [ ] **Step 2: Verify visually in dev.**

Run: `npm run dev` then load `http://localhost:5173/signup`.
Expected: top-right shows a 4-dot progress affordance, first dot is the cocoa pill.

- [ ] **Step 3: Verify a11y.**

In Chrome DevTools, inspect the progressbar element.
Expected: `role="progressbar"`, `aria-valuenow="1"`, `aria-valuemin="1"`, `aria-valuemax="4"`, `aria-label="Step 1 of 4"`. Tabbing through doesn't focus the indicator (it's decorative for sighted users + announced for screen readers via the role).

- [ ] **Step 4: Commit Task 3.**

```bash
git add src/pages/SignUp.jsx
git commit -m "$(cat <<'EOF'
feat(wizard): replace text step counter with progress dots

Tiny '1 / 4' text was easy to miss. Four-dot progress row gives
glanceable orientation and a small emotional cue of advancement.
Same wizard-top placement so layout below is unchanged. Includes
ARIA progressbar role with valuenow/min/max + aria-label so screen
readers narrate the step.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: P1-C — Theme grid balance (17 tiles, no orphan row)

**Files:**
- Modify: `src/pages/SignUp.jsx` — `StepTheme` grid classes (around line 510)

**Decision:** 17 themes ÷ 4 cols = 4 rows + 1 orphan. Switch to: 2 cols on `<sm`, 3 cols on `sm-md`, **4 cols on `lg+` but centered when row is incomplete**. The cleanest fix is the same 4-col grid but use `justify-items-center` + center the last row when count % 4 ≠ 0. CSS-only — no JS gymnastics.

- [ ] **Step 1: Find the grid container.**

Around `src/pages/SignUp.jsx:510`:

```jsx
<div
  role="radiogroup"
  aria-label="Choose a theme"
  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8"
>
```

- [ ] **Step 2: Update grid container classes.**

Replace with the same grid but add `mx-auto max-w-2xl` so the grid centers within the wider hero card. Keep the 2/3/4 col responsive breakpoints. The orphan tile centering happens via the next step.

```jsx
<div
  role="radiogroup"
  aria-label="Choose a theme"
  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8 mx-auto max-w-2xl"
>
```

- [ ] **Step 3: Add `last:` orphan-centering to the last tile.**

After the `entries.map(([key, t]) => { ... })` block, find the last `<button>` and wrap the map to compute `isLast` + apply a `lg:col-span-1` baseline. Then for orphan rows, add `last:lg:col-start-2 last:sm:col-start-1` so the lone tile centers when there's no neighbor.

Concretely, change the map's button to take `isLast` into account:

```jsx
{entries.map(([key, t], idx) => {
  const isSelected = selected === key
  const isLast = idx === entries.length - 1
  const orphanLg = entries.length % 4 === 1 && isLast
  const orphanSm = entries.length % 3 === 1 && isLast
  return (
    <button
      key={key}
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => onSelect(key)}
      className={[
        'group relative flex flex-col items-center justify-center gap-2 rounded-2xl px-3 py-4 min-h-[112px]',
        'bg-earthy-ivory border-2 transition-all',
        'hover:-translate-y-0.5 active:translate-y-0',
        orphanLg && 'lg:col-start-2 lg:col-span-2 lg:justify-self-center lg:max-w-[180px]',
        orphanSm && 'sm:col-start-2',
        isSelected
          ? 'border-earthy-cocoa ring-2 ring-earthy-cocoa shadow-earthy-card'
          : 'border-earthy-divider hover:border-earthy-cocoaSoft',
      ].filter(Boolean).join(' ')}
    >
      ...rest unchanged...
    </button>
  )
})}
```

The `orphanLg` rule centers the lone tile in column 2 (of 4) by spanning 2 cols + `justify-self-center` + capping its visual width. The `orphanSm` rule centers in middle of 3.

- [ ] **Step 4: Verify visually at 1280×900 (lg) + 768×1024 (sm) + 375×667 (mobile).**

Run: `npm run dev` then in DevTools toggle device emulation.
Expected: at lg, last row has Fox centered; at sm, Fox centered in middle col of 3; at mobile, 2-col grid stays even (17 % 2 = 1, so Fox is alone on row 9 — centering rule covers this via a third condition below).

- [ ] **Step 5: Handle the 2-col mobile orphan too.**

If the mobile (2-col) orphan also lands lonely, add another condition. 17 % 2 = 1 so yes. Add:
```jsx
const orphanMobile = entries.length % 2 === 1 && isLast
// in className:
orphanMobile && 'col-span-2 max-w-[180px] mx-auto',
```

Re-verify at 375px width.
Expected: Fox tile centers under the previous row instead of sitting in the left column alone.

- [ ] **Step 6: Commit Task 4.**

```bash
git add src/pages/SignUp.jsx
git commit -m "$(cat <<'EOF'
fix(wizard): center orphan theme tile across mobile/tablet/desktop grids

17 themes don't divide evenly into 2/3/4-col grids, leaving the last
tile alone on its own row. Add responsive col-start/col-span/justify-self
rules so the orphan centers in the visual middle of its row at every
breakpoint. Pure CSS — no JS, no new tokens.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: P1-D — aria-disabled on wizard advance buttons

**Files:**
- Modify: `src/pages/SignUp.jsx` — Continue, Next, Pick-one-to-continue, Create buttons

**Decision:** Add `aria-disabled={!canContinue}` alongside existing `disabled` attribute on every step's advance button. Some screen readers narrate `aria-disabled="true"` as "dimmed" or "unavailable" more reliably than `disabled`. Costs ~6 attribute additions, zero visual change.

- [ ] **Step 1: Audit every advance button in SignUp.jsx.**

Find each button with a `disabled={!something}` pattern. Likely sites: StepTheme Continue (around 548-559), StepKid Next (around 626), StepAccount Create (around 660), and any others.

Run: `grep -n "disabled={" src/pages/SignUp.jsx` to enumerate.

- [ ] **Step 2: Add aria-disabled to StepTheme CTA.**

In the existing button (around line 549-558):

```jsx
<button
  type="button"
  onClick={onContinue}
  disabled={!selected}
  className={...}
>
```

Add the new attribute:

```jsx
<button
  type="button"
  onClick={onContinue}
  disabled={!selected}
  aria-disabled={!selected}
  className={...}
>
```

- [ ] **Step 3: Repeat for every other advance button found in Step 1's grep.**

For each match, add `aria-disabled={<same condition as disabled>}` immediately after the `disabled={...}` line.

- [ ] **Step 4: Verify with a screen reader (or DevTools accessibility tree).**

In Chrome DevTools → Accessibility panel → inspect each disabled button.
Expected: AXNode shows `aria-disabled: true` AND `disabled: true`.

- [ ] **Step 5: Commit Task 5.**

```bash
git add src/pages/SignUp.jsx
git commit -m "$(cat <<'EOF'
a11y(wizard): add aria-disabled alongside disabled on advance buttons

Mobile screen-readers vary in how they narrate the disabled attribute
on <button>. aria-disabled is the reliable signal. Belt-and-braces on
StepTheme/StepKid/StepAccount/StepGuestStart advance CTAs. Zero visual
change. Addresses F-W15 from the 2026-05-22 onboarding audit.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: P1-E + P1-F — Type-scale + focus-visible cleanup

**Files:**
- Modify: `src/pages/SignUp.jsx` — birthday helper p tag + sign-in escape hatch Link

**Decision:** Two small drift fixes in one task because both are 1-line changes.

- [ ] **Step 1: Find the birthday helper p.**

Around `src/pages/SignUp.jsx:554`:

```jsx
<p className="text-xs text-earthy-cocoaSoft mt-2">
  We use this to celebrate their birthday-week with a special banner. Skip if you'd rather not.
</p>
```

Verify it uses `text-xs`. If it's `text-sm` it should match `text-xs` to align with the other helper/footnote sizes in the wizard.

If it's already `text-xs`: no change here, skip to Step 2.

If it's `text-sm`: change to `text-xs`.

- [ ] **Step 2: Find the wizard-footer "Already have an account?" link.**

Around `src/pages/SignUp.jsx:406-415`:

```jsx
<Link to="/signin" className="text-earthy-cocoa font-bold underline underline-offset-2">
  Use your existing account →
</Link>
```

(plus the non-upgrade version that says "Sign in").

- [ ] **Step 3: Add focus-visible classes to both Link variants.**

Add to each Link's className:

```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earthy-cocoa focus-visible:ring-offset-2 rounded-pill
```

(Matches the pattern from PR #93 landing CTAs.)

After:

```jsx
<Link
  to="/signin"
  className="text-earthy-cocoa font-bold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earthy-cocoa focus-visible:ring-offset-2 rounded-pill"
>
  Use your existing account →
</Link>
```

(And the same for the non-upgrade "Sign in" link.)

- [ ] **Step 4: Verify Tab navigation.**

Run: `npm run dev`, open `/signup`, press Tab repeatedly.
Expected: focus ring appears on the wizard-footer Sign in link when tabbed.

- [ ] **Step 5: Commit Task 6.**

```bash
git add src/pages/SignUp.jsx
git commit -m "$(cat <<'EOF'
fix(wizard): type-scale + focus-visible cleanup on footer link

Birthday helper text aligned to text-xs to match other wizard helpers.
Wizard-footer 'Sign in' / 'Use your existing account' link gets the
focus-visible ring pattern landed on landing CTAs in PR #93 — keeps
keyboard navigation visible throughout the wizard, not just landing.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: After-screenshots + Playwright re-smoke

**Files:**
- Create: `/tmp/winkingstar-phase1-after/*.png`
- Modify: `/tmp/winkingstar-phase1-smoke.py` (NEW)

- [ ] **Step 1: Run dev server.**

```bash
cd ~/Documents/Cursor/Kids-achievement-tracker && npm run dev
```

Expected: Vite reports "Local: http://localhost:5173/".

- [ ] **Step 2: Re-run the existing Playwright smoke script against localhost.**

Copy `/tmp/winkingstar-test.py` to `/tmp/winkingstar-phase1-smoke.py`, sed-replace `https://winkingstar.com` → `http://localhost:5173`, run it, capture screenshots.

```bash
sed 's|https://winkingstar.com|http://localhost:5173|g' /tmp/winkingstar-test.py > /tmp/winkingstar-phase1-smoke.py
mkdir -p /tmp/winkingstar-phase1-after
sed -i '' 's|/tmp/winkingstar-test|/tmp/winkingstar-phase1-after|g' /tmp/winkingstar-phase1-smoke.py
/tmp/playwright-venv/bin/python /tmp/winkingstar-phase1-smoke.py
```

Expected: 7 screenshots in `/tmp/winkingstar-phase1-after/`, all functional checks still pass (build dev should be feature-equivalent to prod for these copy-only changes).

- [ ] **Step 3: Diff before vs after visually.**

Open both folders side-by-side (Finder / file manager). For each step screenshot, compare before vs after.

Expected diffs:
- 01-landing: no change (we didn't touch Landing).
- 02-step1: heading now reads "Meet your weekly superstar." on one line, no `<br />`.
- 03-step2-themes: heading now "Pick a theme for them." (period). Progress dots in top-right. Fox tile centered on its own row.
- 04-kid-form: heading now "Tell me about them." (period).
- 05-credentials: progress dots show 4 filled (current step is 4).
- 06-signin + 07-signin-error: no change (we didn't touch signin).

If any diff is unexpected or regressive: STOP, debug.

- [ ] **Step 4: Run the smoke-test functional asserts.**

The Playwright script's checks (page loads, has signin link, no em-dashes, password hint present, etc.) should all still pass against the local dev server.

Run: `/tmp/playwright-venv/bin/python /tmp/winkingstar-phase1-smoke.py 2>&1 | tail -30`
Expected: same "Total: N passed, 0 failed" pattern as before.

---

## Task 8: Push branch + open PR

**Files:**
- New branch: `feat/wizard-phase-1-layout-type-pass`

- [ ] **Step 1: Create the feature branch from current `spec/wizard-art-uplift`.**

```bash
cd ~/Documents/Cursor/Kids-achievement-tracker
git checkout -b feat/wizard-phase-1-layout-type-pass
```

(All Phase 1 commits live here. The spec branch stays as the design-doc PR #104.)

- [ ] **Step 2: Push.**

```bash
git push -u origin feat/wizard-phase-1-layout-type-pass
```

- [ ] **Step 3: Wait for mergeStateStatus = CLEAN, then open PR.**

```bash
sleep 6
gh pr view --json mergeStateStatus,mergeable || true
gh pr create --base main --title "feat(wizard): Phase 1 — heading voice, progress dots, grid balance, a11y" --body "$(cat <<'EOF'
## Summary

Phase 1 of the signup-wizard art uplift (spec at `docs/superpowers/specs/2026-05-28-wizard-art-uplift-design.md`).
**No new assets in this PR** — pure layout, typography, and a11y polish so Phase 2's hero illustrations land on a clean surface.

## Changes

| Finding | Fix |
|---|---|
| P1-A — voice drift | Unify step headings to sentence case + period |
| P1-B — muted step counter | Replace with 4-dot progressbar (role + ARIA) |
| P1-C — theme grid orphan tile | Center the 17th tile in its row at every breakpoint |
| P1-D — disabled buttons no aria-disabled | Add aria-disabled on every wizard advance button |
| P1-E — birthday helper type drift | Align to text-xs |
| P1-F — wizard footer link no focus ring | Add focus-visible ring (matches PR #93 landing pattern) |

## Test plan

- [ ] Visual: `npm run dev`, walk all 4 wizard steps + consent gate at 1280×900, 768×1024, 375×667
- [ ] Visual: confirm 17th theme tile centers cleanly at every breakpoint
- [ ] A11y: tab navigation reaches every interactive element with a visible focus ring
- [ ] A11y: DevTools accessibility tree shows progressbar role + aria-disabled correctly
- [ ] Smoke: `npm run test && npm run build` pass
- [ ] Smoke: Playwright script at /tmp/winkingstar-phase1-smoke.py passes all assertions

## Before / after

Screenshots in `/tmp/winkingstar-phase1-{before,after}/`. (Local artefact, not in repo.)

Closes: Phase 1 of \`docs/superpowers/specs/2026-05-28-wizard-art-uplift-design.md\`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 4: Confirm PR URL is returned + record in conversation.**

---

## Self-review

**Spec coverage:** Every Phase 1 item from the spec is covered:
- Spacing rhythm → Task 4 (grid centering)
- Typography scale + hierarchy → Tasks 2, 6
- Color usage → out of Phase 1 (PR #91 separately)
- Focus-visible states → Task 6
- Layout grid breakpoints → Task 4
- Motion vestigials → none found in audit; skipped explicitly

**Placeholder scan:** None. Every step has a concrete file path, before/after, or shell command.

**Type consistency:** All edits land in `src/pages/SignUp.jsx`. No new functions or props introduced; existing component signatures preserved. The new `<div role="progressbar">` in Task 3 is purely JSX/aria — no TS types.

**Ambiguity check:** The orphan-centering in Task 4 has three responsive cases (mobile/sm/lg). I made each explicit so the engineer doesn't have to guess.

Plan complete.
