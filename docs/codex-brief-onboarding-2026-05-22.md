# Codex brief — onboarding cleanup · 2026-05-22

Source: `docs/audit-onboarding-2026-05-22.md` (web) + `weekly-superstar-ios/docs/audit-onboarding-2026-05-22.md` (iOS).

Read this top-down. Each task is self-contained with file + line + before/after + acceptance criteria + suggested PR title. Tasks are ordered by **effort, quick-wins first** so a single Codex session can knock out the first 8 without context-switching.

**Repos in play**
- `web` = `~/Documents/Cursor/Kids-achievement-tracker/`
- `iOS` = `~/Documents/Cursor/weekly-superstar-ios/`
- `shared` = `~/Documents/Cursor/weekly-superstar-shared/` (token source of truth, linked as `file:../weekly-superstar-shared`)

**Shipping rules (CLAUDE.md, do not break)**
- Branch + PR per task. Never direct to main.
- Squash-merge, then delete branch. Verify the artefact on main after merge (squash-merge has dropped chained data before).
- One PR = one finding. Stack only with `--base main` retarget before merge.
- No `gh pr merge` without my explicit go per PR. Open PRs freely.
- Rules-class files (`firestore.rules`, `storage.rules`, IAM, OAuth scopes) need explicit go — none of the tasks below touch these, but if you discover one in scope, STOP and ask.

---

## Quick wins (Codex: start here; each is ≤30 min)

### Task 1 — Strip em-dashes from onboarding labels and helper copy
**Repo**: web
**Files**:
- `src/pages/SignUp.jsx:447` — helper "you can change this anytime — it sets the vibe"
- `src/pages/SignUp.jsx:543` — label "Birthday — optional"
- `src/pages/Landing.jsx:62-66` — tertiary CTA "or try it first — no signup"
- `src/components/NewKidModal.jsx:82` — label "AVATAR — optional"
- `src/components/NewKidModal.jsx:147` — label "BIRTHDAY — optional"

**Change**: replace each em-dash with either parens or a period split. Examples:
- "Birthday — optional" → "Birthday (optional)"
- "Avatar — optional" → "Avatar (optional)"
- "you can change this anytime — it sets the vibe" → "You can change this anytime. It sets the vibe."
- "or try it first — no signup" → "Try it first. No sign-up."

**AC**:
- `grep -n "—" src/pages/SignUp.jsx src/pages/Landing.jsx src/components/NewKidModal.jsx` returns ZERO matches inside JSX text or string literals (matches inside code comments are fine).
- `npm run test` passes.
- Visual: Birthday, Avatar, helper, and tertiary CTA all render without em-dashes in dev server.

**PR title**: `fix(copy): remove em-dashes from onboarding labels and helper copy`

---

### Task 2 — Strip em-dashes from iOS onboarding [iOS]
**Repo**: iOS
**Files**: scan `app/(auth)/signup.tsx`, `components/ParentConsentPanel.tsx`, `app/index.tsx` for `—` in JSX `<Text>` children or string props. (None confirmed in audit, but a sweep matches the web change.)

**AC**: `grep -n "—" app/(auth)/*.tsx components/*.tsx app/index.tsx` returns zero matches inside JSX/strings.

**PR title**: `fix(copy): em-dash sweep on iOS onboarding surfaces`

---

### Task 3 — Convert straight apostrophes to curly in onboarding copy
**Repo**: web
**Files**:
- `src/components/ParentConsentGate.jsx:14` — "child's name"
- `src/components/ParentConsentGate.jsx:26` — "child's parent or legal guardian"
- `src/components/ParentConsentGate.jsx:37` — "child's parent" (verify by re-reading)
- `src/pages/SignUp.jsx:554` — helper "Skip if you'd rather not."
- `src/pages/SignUp.jsx:396` — template `${trimmed}'s board is set up.`

**Change**: convert `'` to `'` (U+2019). For the template at `:396` use `${trimmed}’s board` OR rewrite to avoid the possessive: "Their board is set up. You can save it with an email any time."

**Reference pattern**: `src/pages/Board.jsx:1154` already uses curly quotes correctly: `"+ Add"`. Match that style.

**AC**:
- All five occurrences render as `'` in the browser.
- `npm run test` passes.
- No regression in existing Board.jsx curly-quote pattern.

**PR title**: `fix(copy): curly apostrophes in onboarding consent + signup`

---

### Task 4 — Same apostrophe sweep on iOS consent panel [iOS]
**Repo**: iOS
**Files**: `components/ParentConsentPanel.tsx:36, 42` — `child's` × 3.
**AC**: lines render with `'`. App boots, gate renders correctly.
**PR title**: `fix(copy): curly apostrophes in iOS consent panel`

---

### Task 5 — Unify password length rule at 8 chars
**Repo**: web
**Files**:
- `src/pages/SignUp.jsx:103` — already 8 ✓ (do not change)
- `src/pages/AuthAction.jsx:115` — currently `pw.length < 6`; change to `< 8`
- `src/pages/AuthAction.jsx:116` — error string "Use at least 6 characters." → "Use at least 8 characters."

**Stretch (optional, only if quick)**: extract `MIN_PASSWORD_LENGTH = 8` into `src/lib/auth.js` (or wherever `formatAuthError` lives) and import in both files. Don't break the build for this; skip if `src/lib/auth.js` doesn't already exist.

**AC**:
- Setting a 6-char password via the password-reset flow shows the new error.
- Setting an 8+ char password via the reset flow succeeds.
- `npm run test` passes.

**PR title**: `fix(auth): unify password length minimum at 8 chars across signup and reset`

---

### Task 6 — Generic auth-failure messaging (no email enumeration)
**Repo**: web (and iOS in same PR if quick)
**Files**:
- web: wherever `formatAuthError` is defined (likely `src/lib/auth.js` or `src/lib/firebase.js` — grep first)
- iOS: `lib/authErrors.ts`

**Change**: For both `auth/user-not-found` and `auth/wrong-password`, return the SAME user-facing string: `"Email or password is incorrect. Try again or reset your password."` Keep the distinct Firebase codes available for console logging / future analytics.

**AC**:
- Attempting to sign in with an unknown email shows the unified string.
- Attempting to sign in with a known email + wrong password shows the unified string.
- Both surfaces (web SignIn.jsx + iOS signin.tsx) display the unified copy.
- `npm run test` passes.

**PR title**: `fix(auth): collapse user-not-found and wrong-password errors to prevent enumeration`

---

### Task 7 — Add privacy-policy link inside ParentConsentGate
**Repo**: web
**File**: `src/components/ParentConsentGate.jsx`
**Change**: under the second checkbox row (line ~39), add a short inline link:
```jsx
<p className="text-xs text-earthy-cocoaSoft mt-3">
  <a
    href="/privacy"
    target="_blank"
    rel="noopener noreferrer"
    className="underline underline-offset-2 hover:text-earthy-cocoa"
  >
    Read our privacy policy
  </a>
</p>
```

**AC**:
- Link is visible inside the consent gate (StepKid path + NewKidModal path).
- Clicking opens `/privacy` in a new tab.
- Keyboard tab-order reaches the link between the second checkbox and the Continue button.
- `npm run test` passes.

**PR title**: `feat(coppa): surface privacy policy link inside parental consent gate`

---

### Task 8 — Add privacy-policy link inside iOS ParentConsentPanel [iOS]
**Repo**: iOS
**File**: `components/ParentConsentPanel.tsx`
**Change**: under the second `ConsentRow` (line ~48), add:
```tsx
<Pressable
  onPress={() => Linking.openURL('https://winkingstar.com/privacy')}
  style={{ marginTop: spacing.sm }}
  accessibilityRole="link"
  accessibilityLabel="Read our privacy policy"
>
  <Text style={{ color: c.textSecondary, textDecorationLine: 'underline', fontSize: 13 }}>
    Read our privacy policy
  </Text>
</Pressable>
```
Import `Linking` from `react-native` and `spacing` (already imported).

**AC**:
- Tapping the link opens Safari to `winkingstar.com/privacy`.
- Link is keyboard/voiceover reachable.
- Build succeeds locally.

**PR title**: `feat(coppa): privacy policy link in iOS parental consent panel`

---

### Task 9 — Empty-state CTA: replace spatial reference with an action button
**Repo**: web
**File**: `src/pages/Board.jsx:1144-1159` (the `EmptyState` function)
**Change**: Replace the spatial-reference paragraph "Add your first one above using the "+ Add" button." with an actionable `<PrimaryButton>` that opens the same NewKidModal that KidSwitcher "+ Add" opens. The KidSwitcher render below the button can be removed from this empty state if it's redundant — verify by reading the surrounding component.

**Suggested copy**: "Add your first superstar" on the button.

**AC**:
- On the empty Board (zero kids), the user sees a primary CTA button.
- Tapping it opens NewKidModal.
- The flow to add the first kid works end-to-end.
- Mobile viewport at 375px wide does not require horizontal scrolling.

**PR title**: `fix(board): action button in empty-state, drop spatial-reference copy`

---

### Task 10 — Focus-visible outlines on Landing CTAs
**Repo**: web
**File**: `src/pages/Landing.jsx:48-65` (all three `<Link>` CTAs)
**Change**: add to each Link's `className`:
```
focus-visible:ring-2 focus-visible:ring-earthy-cocoa focus-visible:ring-offset-2 focus-visible:outline-none
```

**AC**:
- Tab-key navigation through Landing shows visible rings on each CTA in turn.
- Mouse click does not show a ring (verifies `:focus-visible` not `:focus`).
- `npm run test` passes.

**PR title**: `a11y(landing): focus-visible rings on primary CTAs`

---

### Task 11 — Distinguish invite-error reasons in Join.jsx
**Repo**: web
**File**: `src/pages/Join.jsx:17,31` (and the function that constructs the error string)
**Change**: branch the error based on the Firebase error code returned by the redeem call:
- expired / used → "This invite has expired. Ask the family admin for a new link."
- malformed / not-found → "This invite link doesn't look right. Check the URL or ask for a new one."
- network → "We couldn't reach the server. Check your connection and try again." + add a retry button.

**AC**:
- Manually testing each case shows the correct branch.
- Network failure shows a retry button that re-attempts the redeem.
- `npm run test` passes.

**PR title**: `fix(join): distinguish expired vs malformed vs network errors on invite redemption`

---

## Medium tasks (Codex: schedule for a focused half-day each)

### Task 12 — Tokenise the four repeat-offender literals in shared
**Repo**: shared → then sweep web (+ iOS where present)
**Step 1** (shared): in `~/Documents/Cursor/weekly-superstar-shared/src/tokens/colors.ts`, add:
- `earthy.cocoaDark` = `'#4A2E25'`
- `earthy.terracottaSoftHover` = `'#EAB892'`
- `earthy.dividerCream` = `'#EFE1C8'` (or reuse `earthy.divider` if values match after PR-#33 retune — read the current value first and decide)
- `semantic.error.bg` = `'#F8E5DF'`
- `semantic.error.text` = `'#8A3A2E'`
- `semantic.danger.text` = `'#B85450'`

Rebuild shared: `cd ~/Documents/Cursor/weekly-superstar-shared && npm run build`.

**Step 2** (web): update `tailwind.config.js` to consume the new tokens (look at the existing `colors.earthy.*` mappings for the pattern). Then sweep all 16+ call-sites:
- `Landing.jsx:50,51,57,58`
- `SignUp.jsx:401,430,638` (the inline-style + the hex-tagged classes)
- `AuthAction.jsx:456`
- `ForgotPassword.jsx:113`
- `Board.jsx:497,585,683,740,748,773,899,932,961,1065`
- `NewKidModal.jsx:163,167`
- `KidEditModal.jsx:172,301,302,310,338`
- `Join.jsx` (sign-in CTA inline style)

Replace `bg-[#4A2E25]` with `hover:bg-earthy-cocoaDark`, `bg-[#F8E5DF] text-[#8A3A2E]` with `bg-semantic-error-bg text-semantic-error-text`, etc.

**Step 3** (iOS): replace `RouterTabBar.tsx:41` `'#FBFAF6'` with a token from `useAppColors` (probably `c.surface`; if not, add a `c.tabBarBg` token). Replace `ParentConsentPanel.tsx:104` `'#FFFFFF'` with `VOY_PALETTE.white` (add to the palette if it doesn't exist).

**AC**:
- `grep -rn "bg-\[#" src/` returns zero matches.
- `grep -rn "#4A2E25\|#F8E5DF\|#8A3A2E\|#EFE1C8\|#EAB892\|#B85450" src/` returns zero matches inside JSX/strings (matches in `tokens/` files are expected).
- `npm run build` + `npm run test` pass.
- Visual diff: no perceptible color change on Landing, SignUp, AuthAction, Board.
- iOS `npm run lint` or equivalent passes.

**PR strategy**: shared package change is one PR; web sweep is a second PR (`--base main` after shared lands); iOS sweep is a third. Three PRs total — DO NOT bundle them.

**PR titles**:
- `feat(tokens): add cocoaDark, terracottaSoftHover, dividerCream, semantic.error, semantic.danger to shared palette`
- `refactor(web): sweep hex literals to new shared tokens (cocoaDark, error pair, dividerCream)`
- `refactor(ios): sweep RouterTabBar + ParentConsentPanel hex literals to tokens`

---

### Task 13 — Add Firebase Analytics across the onboarding funnel
**Repos**: web + iOS (mirror event names)
**Files**:
- web: `src/lib/firebase.js` (init analytics), `src/lib/analytics.js` NEW (thin wrapper), then call from `Landing.jsx`, `SignUp.jsx` (each step + submit), `ParentConsentGate.jsx` (accept), `Join.jsx`, `SignIn.jsx`
- iOS: `lib/firebase.ts` (init analytics with `expo-firebase-analytics` or `@react-native-firebase/analytics` — pick the one that's already in `package.json` if either is), `lib/analytics.ts` NEW

**Event names (use these EXACTLY — match across platforms)**:
- `onboarding_start` — Landing CTA tapped (param: `cta = 'create' | 'signin' | 'guest'`)
- `theme_selected` — Step 2 advance (param: `theme = string`)
- `consent_accepted` — ParentConsentGate Continue tapped
- `kid_added` — kid doc written (param: `is_first = bool`, `birthday_provided = bool`)
- `account_created` — credential created OR OAuth completed (param: `method = 'password' | 'apple' | 'google'`)
- `guest_started` — anonymous board created
- `oauth_started` — OAuth flow initiated (param: `provider`)
- `first_board_helper_step_completed` — iOS only, FirstBoardHelper checklist item ticked (param: `step = string`)

**AC**:
- Firebase Analytics console shows the events firing within 60 seconds of a desk-test run.
- Web `npm run test` passes; iOS build succeeds.
- Wrapper enforces consent-not-required for the events listed (they don't carry PII).
- A new doc `docs/onboarding-instrumentation.md` documents the event names + params for future writers.

**PR strategy**: shared event-name doc first (just `docs/onboarding-instrumentation.md`), then web wiring, then iOS wiring. Three PRs.

**PR titles**:
- `docs(analytics): cross-platform event-name schema for onboarding funnel`
- `feat(analytics): instrument onboarding funnel on web`
- `feat(analytics): instrument onboarding funnel on iOS`

---

## Hold — needs decision from Shannon before Codex touches

These are NOT for Codex to start without explicit go. Each requires a judgement call.

### Hold A — Email/password vs OAuth-only on iOS (was F-I01)
Question: Does Apple Kids-category review tolerate email/password alongside OAuth, or must we go OAuth-only? Action: read App Store Review Guidelines §1.3 and recent Kids-category rejection threads; then choose between (a) add email-verification gate before kid PII, or (b) hide email/password behind a "More ways to sign in" disclosure.

### Hold B — Icon library decision (was F-I03)
Question: Two iOS icon libraries in play (Material Symbols in tab bar, Lucide everywhere else); neither matches the stated default (Phosphor/Fluent Emoji/SF Symbols). Decide between consolidate-to-Lucide / move-to-Phosphor / document-the-split. Update CLAUDE.md to match the decision.

### Hold C — Where the guest "save your board" nudge should fire (was F-I05)
Question: First star? End of first day? After family-name entered? Pick one trigger, then Codex can implement.

### Hold D — COPPA VPC scope (was F-W13 / F-I11)
Question: Is verifiable parental consent in scope for v1.1, or accepted-risk? If in scope, decide on FTC-approved method (gov-ID / payment / signed form). Legal counsel before committing.

### Hold E — Voice for `${trimmed}'s board` template (was inside Task 3)
Question: Codex defaulted in Task 3 to a Unicode escape (`’s`) but the alternative is to drop the possessive entirely ("Their board is set up."). Pick voice — possessive is warmer, generic is safer. (Codex: default to Unicode escape if you don't hear back.)

---

## How to use this brief

- **Single PR rule**: one task = one PR. No bundling.
- **Test gate**: every web PR runs `npm run test && npm run build` locally before push. CI doesn't gate tests yet.
- **After-merge verification**: `grep` the change on `main` before considering a task done. Squash-merges have dropped artefacts before.
- **Ping me when stuck**: any task that needs a Firebase Console rule change, a shared-package version bump, or a CLAUDE.md update — STOP and ask.
- **When you finish a task**: tick it in PR body with `Closes: docs/codex-brief-onboarding-2026-05-22.md → Task N`. I'll mark this brief up at the end of the session.

---

## Out of scope (do NOT touch)

- `firestore.rules`, `storage.rules`, IAM/OAuth scopes — rules-class, needs explicit per-PR go.
- Banner image perf (audit P1) — not onboarding.
- `/join/:code` security review (audit S3) — tracked separately.
- Modal focus-trap (audit A1) — system-wide, not onboarding-scoped.
- The pet-vs-theme mechanic — design-locked, do not re-architect.
