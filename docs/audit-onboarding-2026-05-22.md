# Onboarding heuristic evaluation — web · 2026-05-22

Reviewer: Claude (desk review, no participants). Companion file for iOS lives at `~/Documents/Cursor/weekly-superstar-ios/docs/audit-onboarding-2026-05-22.md`.

## Summary

The web onboarding wizard is structurally sound. The 4-step flow (Intro → Theme → Kid → Account) sequences PII collection AFTER a parental consent gate, theme-aware visual feedback is preserved across steps, and brute-force protection plus reduced-motion compliance are in place. The dominant issues are token drift (cocoa-dark hover + error-pill colors hardcoded 16+ times), a small but consistent typography rule violation (em-dashes and straight apostrophes in display copy), a privacy-policy link missing from the consent surface, and zero analytics instrumentation across the whole onboarding funnel — which means the eventual real-user test cannot be measured.

**Counts**: 0 catastrophic · 2 major · 6 minor-blocker · 5 minor · 0 cosmetic · 4 strengths.

**Top three to fix first**:
1. **F-W05** — add privacy-policy link inside `ParentConsentGate` (COPPA hygiene, S effort)
2. **F-W06** — wire Firebase Analytics across the onboarding funnel (so any future user test is measurable, M effort)
3. **F-W03** — add `earthy-cocoaDark` + `semantic-error-bg`/`semantic-error-text` tokens to the **shared package** (`weekly-superstar-shared/src/tokens/`) and sweep the 16+ literals (M effort, unlocks future token-audit CI)

## Methodology

Three lenses, applied in order to each screen:

1. **Nielsen's 10** — visibility of system status, match real world, user control & freedom, consistency & standards, error prevention, recognition over recall, flexibility & efficiency, aesthetic & minimalist, error recovery, help & docs.
2. **Project hard rules** from `~/.claude/CLAUDE.md` — tokens over literals, no em-dashes in display copy, COPPA gating before any kid PII, reading level ≤6th grade on kids surfaces.
3. **Cross-cutting** — typography (smart quotes, contractions), WCAG 2.2 AA contrast, focus indicators, aria labels, error messaging tone, instrumentation.

Severity scale: **0** cosmetic · **1** minor · **2** minor-blocker · **3** major · **4** catastrophic.

## Scope

| # | Surface | File | Lines |
|---|---|---|---|
| 1 | Landing entry + CTAs | `src/pages/Landing.jsx` | 31-82 |
| 2 | Sign-up wizard (4 steps + guest/upgrade/invite variants) | `src/pages/SignUp.jsx` | 40-685 |
| 3 | Parental consent gate | `src/components/ParentConsentGate.jsx` | 1-57 |
| 4 | Email verify + password reset handler | `src/pages/AuthAction.jsx` | 1-475 |
| 5 | Forgot password | `src/pages/ForgotPassword.jsx` | 1-150 |
| 6 | Invite join | `src/pages/Join.jsx` | 1-104 |
| 7 | First-board empty state | `src/pages/Board.jsx` | 1144-1159 |
| 8 | Post-board add-kid modal | `src/components/NewKidModal.jsx` | 1-187 |
| 9 | Sign-in (returning user) | `src/pages/SignIn.jsx` | 28-265 |

## Journey map

### Step 1 — Landing (`src/pages/Landing.jsx:31-82`)
Role: entry hero; detects authed users → board; otherwise shows 3 CTAs.
Copy: "Winking Star" / "A weekly achievement tracker the whole family can share. Track habits, earn badges, grow pets together." / Primary "Create a family board" / Secondary "Sign in" / Tertiary "or try it first — no signup".
Visual: cream bg, cocoa primary CTA, terracotta-soft secondary CTA, all `rounded-pill`. Inline-styled with hex literals (lines 50, 57). Hover states `hover:bg-[#4A2E25]` and `hover:bg-[#EAB892]`.
Findings: **F-W03**, **F-W10**, tertiary CTA copy hits **F-W14**.

### Step 2 — SignUp wizard intro (`src/pages/SignUp.jsx:414-436`)
Role: animated welcome card with "Start ▶" CTA. Step 1/4.
Copy: "meet your / weekly superstar." (lowercase intentional) / "a tiny ritual for kids who are crushing their week." / "Start ▶".
Findings: lowercase headline is a deliberate brand voice — call out as strength, but verify VoiceOver pronounces "weekly superstar" as two words (see iOS F-I09 — same concern applies on web).

### Step 3 — Theme (`src/pages/SignUp.jsx:438-505`)
Role: pick a theme for the kid. Step 2/4. `role="radiogroup"` + `aria-checked` on cards.
Copy: "Pick a theme / for them" / "You can change this anytime — it sets the vibe of their board." / "Continue ▶" / "Pick one to continue".
Findings: **F-W01** (em-dash in helper copy line 447 — verify on next read), **F-W15** (button switches between "Continue ▶" and "Pick one to continue" — good but the disabled state could use `aria-disabled` not just visual).

### Step 4 — Parental consent gate (`src/components/ParentConsentGate.jsx`)
Role: blocks `StepKid` until both checkboxes are ticked.
Copy: "Grown-up check." / "A parent or legal guardian needs to continue before we collect a child's name, birthday, or photo." / "I am the child's parent or legal guardian and I am at least 18." / "I consent to Winking Star saving family board data for app functionality." / "Continue".
Findings: **F-W04** ("photo" language misleading — web onboarding collects emoji avatars only, no photo upload), **F-W05** (no privacy-policy link), **F-W11** (straight apostrophes "child's" lines 14, 26).

### Step 5 — Kid name + birthday (`src/pages/SignUp.jsx:509-580`)
Role: collect first child's name (required, ≤30 char) and optional birthday. Step 3/4.
Copy: "Tell me about / them" / "For ages 3–12. You can add more kids after this." / Label "THEIR NAME" placeholder "What do they go by?" / Label "BIRTHDAY — optional" / Helper "We use this to celebrate their birthday-week with a special banner. Skip if you'd rather not." / "Skip birthday" + "Next ▶".
Findings: **F-W01** (em-dash in label `:543`), **F-W11** (straight apostrophe in helper `:554`), no avatar uploaded here (only emoji selected in NewKidModal post-board) → strength.

### Step 6 — Account (email/password or OAuth) (`src/pages/SignUp.jsx:583-685`)
Role: credentials or OAuth (Apple, Google). Step 4/4. Variants for `?upgrade=1` and `?next=/join/:code`.
Copy: "One last step." / "Create your account so we can save their board." / labels "EMAIL", "PASSWORD" / helper "At least 8 characters." / "Create →" / divider "or" / "Continue with Apple" / "Continue with Google" / footer "Need help?" / "Already have an account? Sign in".
Findings: **F-W02** (8-char rule here, mismatched with reset's 6-char rule), **F-W03** (error pill hex `:638`), **F-W11** (template `${trimmed}'s board` line 396 — straight apostrophe in guest-mode header).

### Step 7 — Email verify / password reset (`src/pages/AuthAction.jsx`)
Role: Firebase action-link handler (verify email, reset password). Skeleton/aria-busy on load.
Findings: **F-W02** (password rule 6-char min `:115` — should match signup's 8), **F-W03** (error pill hex `:456`).

### Step 8 — Forgot password (`src/pages/ForgotPassword.jsx`)
Role: send password-reset email. Error pill `bg-[#F8E5DF] text-[#8A3A2E]` at `:113`.
Findings: **F-W03**.

### Step 9 — Invite join (`src/pages/Join.jsx`)
Role: redeem `/join/{shareCode}` deep link. If signed out, show CTAs; if signed in, redeem and toast.
Copy: success "Joining the board… / Hang tight, we're getting you in." / error "Invite could not be redeemed."
Findings: **F-W09** (generic error doesn't distinguish expired / malformed / network), strength (`ensureBoardForOAuthUser` in SignIn prevents orphaned OAuth accounts).

### Step 10 — First-board empty state (`src/pages/Board.jsx:1144-1159`)
Role: render when `kids.length === 0`. Shows empty illustration + "No superstars yet" / "Add your first one above using the "+ Add" button." (uses curly quotes — strength).
Findings: **F-W07** (spatial "above" reference breaks on smaller viewports; no action button in the empty state itself — KidSwitcher renders separately).

### Step 11 — Post-board add-kid modal (`src/components/NewKidModal.jsx`)
Role: triggered from `KidSwitcher` "+ Add". Collects name + emoji avatar + theme + optional birthday. Parental consent gate re-fires per add.
Findings: **F-W01** (em-dashes in "AVATAR — optional" `:82` and "BIRTHDAY — optional" `:147`), strength (parental gate enforced on every kid add).

### Step 12 — Sign-in (returning user) (`src/pages/SignIn.jsx`)
Role: email/password or OAuth for users with existing boards. Brute-force lock 5 attempts / 60s.
Findings: **F-W08** (Firebase auth errors distinguish "user not found" from "wrong password" — email-enumeration risk), strength (brute-force lock in place).

## Findings (severity-rated, fix-paired)

### F-W01 [SEV-2] — Em-dashes in display copy
- **Heuristic**: project Copy hard rule #1 (no em-dashes in display copy)
- **Location**: `src/pages/SignUp.jsx:543` ("Birthday — optional"), `src/pages/SignUp.jsx:447` ("you can change this anytime — it sets the vibe"), `src/components/NewKidModal.jsx:82` ("AVATAR — optional"), `src/components/NewKidModal.jsx:147` ("BIRTHDAY — optional")
- **Issue**: Four em-dash occurrences in user-visible labels and helper copy. The rule applies repo-wide, not just to landing/marketing copy.
- **Fix**: Switch all four to parens — "Birthday (optional)", "Avatar (optional)", and split the helper into two sentences ("You can change this anytime. It sets the vibe of their board.").
- **Effort**: S (≤30 min)

### F-W02 [SEV-2] — Password length rule mismatch
- **Heuristic**: Nielsen #4 (consistency & standards)
- **Location**: `src/pages/SignUp.jsx:103` (signup requires 8 chars) vs `src/pages/AuthAction.jsx:115` (reset accepts 6 chars)
- **Issue**: A returning user could reset their password to a value that wouldn't pass the signup form, creating a confusing UX and a small security regression. Reset is the weaker gate of the two.
- **Fix**: Raise the reset rule to 8 (`AuthAction.jsx:115` + `:116` error string). Add a shared constant `MIN_PASSWORD_LENGTH = 8` in `src/lib/auth.js` (or similar) and import in both files.
- **Effort**: S (single value + error string + one constant)

### F-W03 [SEV-3] — Token drift: cocoa-dark hover + error-pill colors
- **Heuristic**: project Design hard rule #1 (tokens over literals)
- **Location**: 16+ occurrences spanning `Landing.jsx:50,51,57,58`, `SignUp.jsx:401,430,638`, `AuthAction.jsx:456`, `ForgotPassword.jsx:113`, `Board.jsx` (9 hover sites at lines 497, 585, 683, 740, 773, 899, 932 + delete CTA `:748` + progress `:961,1065`), `NewKidModal.jsx:163,167`, `KidEditModal.jsx:172,301,302,310,338`, `Join.jsx`
- **Issue**: Three patterns repeat as inline literals: `#4A2E25` (cocoa-dark hover, 9+ sites), `#F8E5DF`/`#8A3A2E` (error pill bg + text, 5 sites), `#EAB892` (terracotta-soft hover, `Landing.jsx:58`), `#B85450` and tints (danger color, 6 sites in delete flows), `#EFE1C8` (a divider variant on `Board.jsx:1065` not in the earthy palette).
- **Fix**: In **`~/Documents/Cursor/weekly-superstar-shared/src/tokens/colors.ts`** (the source of truth per Kids-achievement-tracker CLAUDE.md), add:
  - `earthy.cocoaDark` = `#4A2E25`
  - `earthy.terracottaSoftHover` = `#EAB892`
  - `earthy.dividerCream` = `#EFE1C8` (or audit whether this can be merged with existing `earthy.divider`)
  - `semantic.error.bg` = `#F8E5DF`, `semantic.error.text` = `#8A3A2E`
  - `semantic.danger.text` = `#B85450`
  Then sweep all 16+ call-sites. Rebuild shared, update Tailwind config to consume.
- **Effort**: M (token additions are 30 min in shared; sweep is mechanical; CI may need a follow-up `scripts/tokens-audit.mjs` entry — see Design Hub pattern for prior art)

### F-W04 [SEV-2] — "Photo" language in consent gate misleading
- **Heuristic**: Nielsen #2 (match real world / accurate framing)
- **Location**: `src/components/ParentConsentGate.jsx:14`
- **Issue**: "before we collect a child's name, birthday, or photo." The web onboarding never uploads a photo — kid avatars are emoji-only in `NewKidModal.jsx`. The language sets up an expectation that doesn't match the form. (Note: the iOS app DOES support photo avatars per `app.json` infoPlist `NSCameraUsageDescription` — so the shared consent copy needs platform-aware wording or a true superset list.)
- **Fix**: Reword to a platform-honest superset: "...your child's name, birthday, avatar, or photo." OR ship platform-specific copy by passing a prop into `ParentConsentGate`.
- **Effort**: S

### F-W05 [SEV-3] — Privacy policy link missing from consent gate
- **Heuristic**: COPPA hard rule (informed consent requires accessible policy at the consent moment)
- **Location**: `src/components/ParentConsentGate.jsx` — no `/privacy` link anywhere in the gate
- **Issue**: The user is asked to consent to "Winking Star saving family board data for app functionality" but the actual privacy policy isn't surfaced next to the checkbox. The privacy policy exists at `/privacy` (per `src/App.jsx`) but is only reachable from the Landing footer.
- **Fix**: Add an inline link directly under the second checkbox: `<a href="/privacy" target="_blank" rel="noopener" className="underline underline-offset-2">Read our privacy policy</a>`. Same change should land in iOS `ParentConsentPanel.tsx`.
- **Effort**: S

### F-W06 [SEV-3] — Zero onboarding analytics
- **Heuristic**: Nielsen #1 (visibility of system status — for the operator, not the user) + research hygiene
- **Location**: all onboarding files; no `firebase/analytics` import anywhere in `src/`
- **Issue**: There is no event tracking across the funnel. After launch, you will not be able to answer questions like: what % of starts complete? where do users drop? does the parental gate cause abandonment? what % select the guest path vs. signup? without this, the planned real-user test (the next phase after this heuristic eval) cannot be measured.
- **Fix**: Wire Firebase Analytics in `src/lib/firebase.js` (initialize `getAnalytics()`), then `logEvent` at minimum: `onboarding_start` (Landing CTA tap), `theme_selected`, `consent_accepted`, `kid_added`, `account_created`, `guest_started`, `oauth_started` (with provider). Add a thin wrapper `src/lib/analytics.js` so iOS can mirror the same event names. Document the funnel in `docs/onboarding-instrumentation.md`.
- **Effort**: M (1–2 days for full funnel + thin wrapper + dashboard config)

### F-W07 [SEV-2] — Empty-state CTA uses spatial reference
- **Heuristic**: Nielsen #6 (recognition over recall) + Nielsen #7 (flexibility)
- **Location**: `src/pages/Board.jsx:1154`
- **Issue**: "Add your first one above using the "+ Add" button." References UI position ("above"), which breaks when the user is on a narrow viewport or has the KidSwitcher hidden behind a collapsed nav. There's no actionable button inside the empty state itself.
- **Fix**: Render a `PrimaryButton` ("Add your first superstar") inside the empty state that opens the same `NewKidModal` the KidSwitcher "+ Add" opens. Drop the spatial reference from the copy entirely.
- **Effort**: S

### F-W08 [SEV-2] — Auth errors leak account existence
- **Heuristic**: Nielsen #9 (help users recover) + security best practice
- **Location**: `src/pages/SignIn.jsx` (errors flow through `formatAuthError()`)
- **Issue**: Firebase distinguishes `auth/user-not-found` from `auth/wrong-password` — when these are surfaced verbatim, an attacker can probe which emails have accounts (enumeration). On a kids app this is a privacy concern even before security.
- **Fix**: In `src/lib/auth.js` (where `formatAuthError` likely lives), collapse both errors to a single message: "Email or password is incorrect. Try again or reset your password." Keep the distinct codes for analytics/logging only.
- **Effort**: S

### F-W09 [SEV-1] — Invite error too generic
- **Heuristic**: Nielsen #9 (help users recover from errors)
- **Location**: `src/pages/Join.jsx:17,31` (or wherever the error string is constructed)
- **Issue**: "Invite could not be redeemed." Doesn't distinguish (a) expired/single-use, (b) malformed/typo'd, (c) network failure. A co-parent who got the link 2 weeks ago can't tell why it's not working.
- **Fix**: Branch the error: expired → "This invite has expired. Ask the family admin for a new link." Malformed → "This invite link doesn't look right. Check the URL or ask for a new one." Network → "We couldn't reach the server. Check your connection and try again." Add a retry button on network.
- **Effort**: S

### F-W10 [SEV-1] — Landing CTAs missing visible focus indicators
- **Heuristic**: WCAG 2.4.7 (focus visible) + Nielsen #4 (consistency)
- **Location**: `src/pages/Landing.jsx:48-65` (all three CTAs)
- **Issue**: The CTAs use `hover:` and `active:` states but no `focus-visible:` ring. Keyboard users tabbing through can't see which CTA is currently focused.
- **Fix**: Add `focus-visible:ring-2 focus-visible:ring-earthy-cocoa focus-visible:ring-offset-2 focus-visible:outline-none` to all three Links. Once F-W03 lands, swap to a token-based offset color.
- **Effort**: S

### F-W11 [SEV-1] — Straight apostrophes in display copy
- **Heuristic**: typography skill / project Copy hard rule
- **Location**: `src/components/ParentConsentGate.jsx:14,26,37`, `src/pages/SignUp.jsx:396,554`
- **Issue**: Five user-visible strings use straight `'` instead of curly `'`. The empty-state copy in `Board.jsx:1154` shows the correct pattern (`"+ Add"` with curly quotes).
- **Fix**: Convert each `'` to `'` in the visible JSX strings. The template literal at `SignUp.jsx:396` can either be `${trimmed}'s board` (Unicode escape) or rewritten to avoid the possessive: "Their board is set up. You can save it with an email any time."
- **Effort**: S (5-line `sed`-equivalent edit, but verify each match individually since some live in template literals)

### F-W12 [SEV-2] — Divider literal `#EFE1C8` not in token set
- **Heuristic**: project Design hard rule #1 (tokens over literals)
- **Location**: `src/pages/Board.jsx:1065` (progress-bar border) — and `:961` for the bg pair `#F8F1E4`
- **Issue**: Two cream-family colors used inline without a shared-tokens entry. The bg color `#F8F1E4` matches `earthy.cream` already; the border `#EFE1C8` doesn't have an exact match.
- **Fix**: Replace bg with the existing `earthy.cream` token and add `earthy.dividerCream = #EFE1C8` (or `#E8DCC4` if matching the production-readiness audit's retuned value — confirm against `weekly-superstar-shared/src/tokens/colors.ts`).
- **Effort**: S

### F-W13 [SEV-2] — Parental consent is checkbox-only, not identity-verified
- **Heuristic**: COPPA hard rule (verifiable parental consent — VPC)
- **Location**: `src/components/ParentConsentGate.jsx` (whole component)
- **Issue**: The user's CLAUDE.md hard rule explicitly calls out VPC. Current implementation is two checkboxes; no email-verification step, no parental-identity confirmation, no payment-card micro-charge, no signed form. This is a known gap (COPPA deadline passed 2026-04-22) — flagging here for completeness, not because Codex should fix it in a single PR.
- **Fix**: Either (a) add email verification as a hard gate before any kid PII is written to Firestore (lowest effort), or (b) implement a true VPC method per FTC-approved list (gov-ID, payment, signed consent). Talk to legal counsel before committing to an approach.
- **Effort**: L (potentially a multi-PR program)

### F-W14 [SEV-1] — Em-dash in Landing tertiary CTA
- **Heuristic**: project Copy hard rule #1
- **Location**: `src/pages/Landing.jsx:62-66` (the `/signup?guest=1` link copy "or try it first — no signup")
- **Issue**: Em-dash in user-visible CTA copy — same rule as F-W01.
- **Fix**: "or try it first, no sign-up needed" or split: "Try it first. No sign-up."
- **Effort**: S

### F-W15 [SEV-1] — Disabled CTA state lacks `aria-disabled`
- **Heuristic**: WCAG 4.1.2 (name, role, value)
- **Location**: `SignUp.jsx` theme-step Next button when no theme is selected (similar pattern in StepKid and StepAccount)
- **Issue**: The button text changes ("Pick one to continue") but `disabled` attribute alone may not surface to screen-readers the same way `aria-disabled="true"` does. Mobile assistive tech behavior varies.
- **Fix**: Add `aria-disabled={!themeSelected}` alongside the existing `disabled` attribute on the wizard's Next buttons.
- **Effort**: S

## Strengths (preserve these)

1. **Parental consent gate placement is correct** — fires BEFORE any kid PII (`StepKid` and `NewKidModal`). Dual-checkbox model (age + data-save consent) maps cleanly to COPPA's two-prong intent. Re-validates on every kid add, not just first.
2. **Reduced-motion compliance** — `SignUp.jsx:276-287` scopes the slide animations to `@media (prefers-reduced-motion: no-preference)`. Animations silently disable for users with the system preference set.
3. **Brute-force protection** — `SignIn.jsx:63-64` locks after 5 failed attempts for 60 seconds. Rare to see on a small-team app.
4. **Curly quotes in `Board.jsx:1154`** — proof that the typography rule IS being applied somewhere; F-W11 is drift, not unfamiliarity. The fix should mirror what `Board.jsx` already does.
5. **OAuth-orphan prevention** — `SignIn.jsx:20-26` `ensureBoardForOAuthUser()` blocks OAuth users without boards from completing sign-in, redirecting them to signup with explanatory copy. Avoids the "I signed up but my data is gone" support load.

## Open questions (need user input)

1. **F-W04** — Should the consent gate copy mention "photo" universally (matching iOS) or use platform-specific copy? If shared, will the web grow photo support too?
2. **F-W06** — Which analytics tool? Firebase Analytics is already wired implicitly by `firebase.js` but `getAnalytics()` is never called. Mixpanel? PostHog? Or stick with Firebase + a custom dashboard?
3. **F-W13** — Is COPPA VPC in scope for the next sprint, or is this a known accepted-risk item being tracked elsewhere? (CLAUDE.md notes the deadline passed 2026-04-22.)
4. **F-W11 SignUp.jsx:396** — for `${trimmed}'s board`, prefer Unicode escape, or rewrite to "Their board…"? The current copy personalizes the moment, which is a small but real warm-touch.
5. **Cross-reference**: should F-W03 be tracked as a follow-on to **audit Q4/Q5** (the existing inline-literal sweeps in `docs/production-readiness-audit-2026-04-28.md`), or as its own work item?

## Out of scope

- No live participants. The next stage (real moderated test) needs F-W06 instrumentation first.
- No code changes in this turn. Each finding is a candidate future PR; the user can stack them by severity.
- `/join/:code` security review (audit code S3) is being tracked separately.
- Banner image perf (audit code P1) is post-board, not onboarding.
- Modal focus-trap (audit code A1) is system-wide, not onboarding-scoped — but `NewKidModal` inherits the gap.
