# Production-readiness audit — winkingstar.com

**Date:** 2026-04-28
**Scope:** Web app at `Kids-achievement-tracker/src/`, Firebase rules, Cloud Functions, hosting config, build output. iOS + shared package out of scope this round.
**Method:** Three parallel evidence-only audits — security, performance, accessibility + code quality. Source reports archived at `/tmp/audit-{security,performance,a11y-quality}.md`.

This audit happened the day after the new auth flow + onboarding + auto-deploy shipped, and **the same day a real user experienced a near-data-loss incident** (board not visibly accessible after Google sign-in — separate PR #30 patched that root cause). The findings below are ordered by leverage: which single fix protects the most users, fastest.

---

## 🔴 Tier 1 — Critical security (must fix before any new user signs up)

These are exploitable RIGHT NOW by any signed-in user against any other user's board.

### S1 — Any authed user can join any board by guessing the boardId
**File:** `firestore.rules:19-22`
**What:** The board `update` rule contains an OR clause `request.auth.uid in request.resource.data.memberIds` — meaning a user who isn't currently a member can write themselves into a board's `memberIds` array (without proving share-code possession) and instantly gain access to all kids data.
**Fix:** Replace the join branch with a Cloud Function `joinByShareCode(code)` that validates the code, then writes memberIds server-side. Tighten rules so client-side `update` requires `request.auth.uid in resource.data.memberIds` (already-member only). One PR, surgical.

### S2 — Members can rewrite adminId, drop other members, rotate shareCode
**File:** `firestore.rules:14-22` (no field-level diff guards)
**What:** Once a user is in `memberIds`, `update` on the board doc is broad — they can change `adminId`, remove other `memberIds` entries, or rotate `shareCode` without restriction.
**Fix:** In the `update` rule, use `request.resource.data.diff(resource.data).affectedKeys()` to gate which fields each role can modify. Only admin should change `adminId`/`shareCode`; only self can remove self from `memberIds`.

### S3 — Anonymous Join via shared link grants permanent kid-data access
**File:** `src/pages/Join.jsx`
**What:** A share-link forwarded to a stranger lets that stranger sign in anonymously and gain permanent access to all kids on the board. There's no one-time-use, no expiry, no revocation.
**Fix:** Convert join to a server-side function that requires authenticated email/Google/Apple identity AND validates a TTL'd code. Block anonymous auth at the Firebase Console level (Authentication → Sign-in method → Anonymous: disable).

### S4 — Open enumeration of all boards
**File:** `firestore.rules:10` (`allow list: if request.auth != null`)
**What:** Any authed user can list the entire `boards` collection. They can't *read* docs they're not in, but they can enumerate boardIds and shareCodes.
**Fix:** Drop `allow list`. Replace with explicit `where('memberIds', 'array-contains', auth.uid)` queries on the client and a `allow list: if request.auth.uid in resource.data.memberIds` rule (won't actually allow unrestricted listing — use `getDocs(query(...))` pattern that respects per-doc rules).

### S5 — Functions deps have 9 moderate prod CVEs
**File:** `functions/package.json` (`firebase-admin@13` pulls vulnerable transitives: uuid<14, gaxios, teeny-request)
**Fix:** `cd functions && npm audit fix` (and bump firebase-admin if needed).

---

## 🟠 Tier 2 — Critical performance + a11y blockers

### P1 — Banners ship as 1.5–2 MB PNGs, no responsive serving
**Files:** `public/theme-banners/*.png` (15 files, ~17 MB total)
**Impact:** Mobile users on 4G download up to ~2 MB to render at 188 px wide. Cold-load TTI is gated on this.
**Fix (one PR):** Generate `<theme>.webp` (1500w) + `<theme>-768w.webp` + `<theme>-376w.webp` per banner via `sharp` (one-time script). Update `ThemeBannerArt` to render `<picture>` with `<source srcset>`. Add `loading="lazy"` to off-screen banners (PetGallery row backgrounds). **Estimated win:** 6–10 MB shaved per first paint, mobile TTI ~3s → ~1s.

### P2 — Single 224 KB-gzip JS bundle, no code splitting
**File:** `vite.config.js` (no `manualChunks`)
**Impact:** Every route loads the full Firebase SDK + react-router + canvas-confetti + react-qr-code on first paint. The `/auth/action` page should be ~30 KB but ships with everything.
**Fix:** Add `build.rollupOptions.output.manualChunks` splitting `firebase`, `react-router`, and `canvas-confetti` into vendor chunks. Convert `App.jsx` static imports to `React.lazy()` per route. **Estimated win:** main chunk 224 → ~100 KB gzip.

### P3 — Zero `Cache-Control` headers — returning visits re-download 17 MB
**File:** `firebase.json` (no `headers` for `/assets/*`)
**Impact:** Hashed Vite assets get the Firebase default 1-hour cache. After an hour, returning visits cold-fetch everything.
**Fix:** Add to `firebase.json`:
```json
{
  "source": "**/assets/**",
  "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
}
```
**Estimated win:** Returning-visit cold load 6s → <1s.

### A1 — Modal.jsx has no focus trap, no role=dialog, no focus restoration
**File:** `src/components/Modal.jsx`
**Impact:** 7+ modals (Pet Gallery, Activities, Kid Edit, Weekly Summary, Mystery Box, Prompt, Share) are inaccessible via keyboard alone. WCAG 2.4.3 + 2.4.7 violations.
**Fix:** One PR fixing `Modal.jsx` unblocks all 7 surfaces. Add `role="dialog"`, `aria-modal="true"`, focus the first focusable element on open, restore focus to the trigger on close, ESC closes, click-outside closes.

### A2 — `ActivityGrid` 49 check-cells all share `aria-label="Check activity"`
**File:** `src/components/ActivityGrid.jsx`
**Impact:** Screen-reader user hears "Check activity, button" 49 times with no context — can't tell which activity / which day.
**Fix:** Interpolate: `aria-label={\`\${activity.label} on \${day.key}, \${checked ? 'completed' : 'not completed'}\`}`. One-line change, huge AT win.

### A3 — `ForgotPassword.jsx` is off-brand purple/grey, no proper labels
**File:** `src/pages/ForgotPassword.jsx`
**Impact:** Only auth screen not migrated to earthy tokens. Missing `htmlFor`, no focus indicator, no `role="alert"` on errors.
**Fix:** Port to the earthy + role-tagged pattern used by SignIn/SignUp.

### A4 — Cocoa-on-terracotta CTA fails 4.5:1 (actual 3.32:1)
**File:** `weekly-superstar-shared/src/tokens/colors.ts` (token doc claims 5.7:1 — wrong)
**Impact:** Some primary CTAs across the app fail WCAG AA contrast. Documentation lies about the ratio.
**Fix:** Either darken the terracotta or pair with white text. Re-measure all token pairs; update doc to match measurement.

---

## 🟡 Tier 3 — High-impact mediums

### S6 — `continueUrl` is a sleeping open-redirect
**File:** `src/pages/AuthAction.jsx`
**What:** `continueUrl` query param read but currently unused. The day someone wires it into a `navigate()` or `<a href>` without an allowlist, that's a phishing primitive.
**Fix:** Add a comment + helper `isInternalUrl()` allowlisting only `winkingstar.com` paths.

### S7 — Reset-password reveals email; no second-factor email after reset
**File:** `src/pages/AuthAction.jsx`
**Fix:** Don't display the email after `verifyPasswordResetCode` — just say "Set a new password for the account". After successful reset, send a confirmation email via Cloud Function + ask Firebase Auth to revoke other sessions.

### S8 — Email enumeration via `auth/user-not-found`
**File:** `src/lib/authErrors.js` + `ForgotPassword.jsx`
**Fix:** Always show generic "If that email exists, we sent a reset link" copy; don't expose the specific Firebase error code.

### P4 — No preconnect to Fluent Emoji CDN
**File:** `index.html`
**Fix:** Add `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` + `<link rel="dns-prefetch" href="https://cdn.jsdelivr.net">`. Saves 150–300 ms on first emoji load.

### P5 — `weekHistory` over-fetch in Firestore listener
**File:** `src/pages/Board.jsx` `onSnapshot(collection(db, 'boards/{id}/kids'))`
**What:** Fetches full kid docs including unbounded `weekHistory` map every snapshot.
**Fix:** Move `weekHistory` to a subcollection `kids/{id}/weekHistory` so PetGallery loads it lazily on demand.

### A5 — No skip-to-main-content link, no landmark roles
**File:** `src/App.jsx` + `src/pages/Board.jsx`
**Fix:** Add `<a href="#main">Skip to content</a>` as the first focusable element. Wrap Board content in `<main id="main">`, KidSwitcher in `<header>`.

### Q1 — Three duplicate Firestore "memberIds contains uid" queries
**Files:** `SignIn.jsx ensureBoardForOAuthUser`, `SignUp.jsx onOAuth` (PR #30), `Landing.jsx`
**Fix:** Extract `findUserBoards(uid)` into `src/lib/boards.js`. Use everywhere.

### Q2 — Silent `catch {}` in 5 locations including rollover effect
**Files:** `Board.jsx:189`, `MysteryPet.jsx`, others
**What:** Real Firestore errors get swallowed silently; users see "my pet vanished" with zero telemetry.
**Fix:** At minimum `console.warn(...)` and a `useToast` notification. Ideally route through a single `reportError(err, context)` helper.

### Q3 — Zero test infrastructure
**Fix:** Set up Vitest + React Testing Library. First tests should cover: `findUserBoards`, `petAtStage`, `getCurrentWeek`, `formatAuthError`, `ActivityGrid` keyboard nav. Critical-path-first.

---

## 🟢 Tier 4 — Polish + tech debt

### P6 — No service worker / PWA shell caching
**Status:** `manifest.webmanifest` exists, no SW registered.
**Fix:** Adopt `vite-plugin-pwa` once the bigger perf wins land.

### Q4 — Same brown CTA inline-styled in 12+ places
**Fix:** Promote `<PrimaryButton>` from `AuthAction.jsx` to `src/components/PrimaryButton.jsx`. Replace inline CTAs across SignIn, SignUp, Board, KidEditModal, etc.

### Q5 — `'#FFFDF7'` card surface used as a literal 14×
**Fix:** Add `surface.card` to tokens, replace literals.

### Q6 — `RARE_STICKERS`, `formatWeekKey`, `animatedFluentUrl` duplicated
**Fix:** Single source of truth in shared package or `src/lib/`.

### A6 — Reduced-motion gap on inline SignUp slide-in keyframes
**File:** `src/pages/SignUp.jsx` lines with `<style>{...keyframes...}</style>`
**Fix:** Wrap the inline `@keyframes` in `@media (prefers-reduced-motion: no-preference)`.

### S9 — No rate limit on `scanSheet` callable
**File:** `functions/src/sheet-scan.ts`
**Fix:** Add a per-uid rate limit using Firestore `rate_limits/{uid}_scanSheet` with timestamp check.

### S10 — `storage.rules` doesn't cover `avatars/{boardId}/{kidId}.jpg`
**File:** `storage.rules`
**Fix:** Add explicit rule for the avatar path.

---

## ✅ What's already solid (positive findings)

These were checked and found clean — no action needed, just don't regress:

- No `dangerouslySetInnerHTML`, no `innerHTML`, no `eval`, no `Function()`
- No committed secrets (`.p8`, `.pem`, `serviceAccount*`, `*_SECRET`)
- React JSX auto-escaping covers all user-string interpolation
- `confirmPasswordReset` correctly gated by `verifyPasswordResetCode`
- All `onSnapshot` subscriptions return their `unsub` cleanly — no listener leaks
- `prefers-reduced-motion` respected on 23 keyframes (one gap noted in A6)
- `<html lang="en">` set
- `AnimatedRasterBanner` uses correct `role="img"` + inner `alt=""` pattern
- Auth screens (SignIn, SignUp, AuthAction) use proper `role="alert"`, `aria-busy`, `aria-live`, `htmlFor`, `autocomplete`
- All animations use GPU-friendly `transform` + `opacity` with `will-change`
- Firebase singleton pattern correct
- Tailwind purge working (47 KB CSS, proportional)
- `npm audit --omit=dev` on web app: 0 vulnerabilities

---

## Recommended PR sequence

1. **PR A — Firestore rules hardening + Join refactor** (S1, S2, S3, S4) — single biggest user-protection win. Risk: changing live security rules — needs careful test plan + staging.
2. **PR B — Cache-Control + preconnect** (P3, P4) — 1-hour fix, immediate measurable improvement.
3. **PR C — Modal focus trap + ARIA** (A1, A2, A6) — unblocks 7 modals at once + screen-reader contextual labels.
4. **PR D — Banner WebP + lazy-load + responsive srcset** (P1) — biggest visible perf win for mobile users.
5. **PR E — Bundle code-splitting** (P2) — second-tier perf win.
6. **PR F — Functions npm audit fix** (S5) — small dep bump.
7. **PR G — Continue-URL allowlist + email enumeration tighten** (S6, S7, S8) — sleeping bugs.
8. **PR H — Code quality consolidation** (Q1, Q2, Q4, Q5, Q6) — refactor pass once everything else lands.
9. **PR I — Test infrastructure + critical-path tests** (Q3) — multi-PR effort.
10. **PR J — ForgotPassword brand migration** (A3, A4) — cosmetic + a11y.

I'll open these as separate PRs in the order above, smallest/safest first. Each will reference this audit doc for context. After each merges, GitHub Actions auto-deploys; we verify before opening the next.

## Out of scope this round

- iOS app (`weekly-superstar-ios`)
- Shared package internals (`weekly-superstar-shared`) beyond the PET_ASSET fix already shipped today
- Full SAST/DAST scan
- Penetration testing
- Lighthouse CI integration
- Firestore index review
- Cloud Functions cold-start optimization
- Internationalization
