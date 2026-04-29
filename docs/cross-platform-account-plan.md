# Cross-platform account & plan sync — implementation plan

Goal: a single user account that works identically on web (`winkingstar.com`) and iOS (`weekly-superstar-ios`), including paid plan / premium entitlement.

Audit completed 2026-04-27. Three gaps were checked.

## Audit summary

### Gap 1 — Account & data linkage: ALIGNED ✅

Both apps already use the same Firebase project (`weekly-superstar-tracker`), same `firebaseConfig`, same Firestore. Sign up on iOS → sign in on web → same boards/kids/data. Verified.

- Firestore paths identical: `boards/{id}`, `boards/{id}/kids/{id}`, weekHistory subcollection
- Family invite via `shareCode` works the same on both
- `firestore.rules` is platform-agnostic; iOS-written docs satisfy web's rules
- No `users/{uid}` profile doc is created (settings live device-local) — minor, not blocking

**Action required: none.** Just smoke-test it.

### Gap 2 — Plan / premium sync: NOT BUILT ❌

- **iOS:** `lib/iap.ts` is a `MockPurchaseController` — `isPremium()` always returns `false`. `react-native-iap` not installed yet. `usePremium()` hook exists but is referenced nowhere in UI (no feature gates).
- **Web:** Zero premium concept. No billing code, no Stripe, no paywall, no `premium` field read.
- **Cloud Functions:** Only `scanSheet`. No IAP receipt validator, no entitlement endpoint.
- **Architecture intent (per `iap.ts:9` comment):** entitlement persists as `premium: true` on the **board doc** (family-shared unlock), not per-user. Good design — keep it.

### Gap 3 — Auth provider parity: ONE CRITICAL GAP ⚠️

- Both apps: email + password + forgot-password ✓
- iOS: `expo-apple-authentication` installed but **not wired** (zero imports)
- **Web is missing delete-account entirely.** iOS has full cascade (re-auth → remove from boards → `deleteUser()`). Web has no UI, no logic. **Apple App Store requires any app with sign-in to offer in-app account deletion** — so the iOS app already complies, but a web account created on iOS has no deletion path.
- Neither app implements `linkWithCredential()` — strictly one-provider-per-account today.

## Phased plan — sequenced by risk

Each phase is one PR. Branch off `main`, open via `gh pr create`. Don't push to main directly.

### Phase 0 — Smoke test (no code) · 10 min

Verify the existing linkage works in real life:
1. Sign up on web at `https://winkingstar.com`. Note email.
2. Sign in on iOS dev build with same credentials.
3. Confirm board, kids, achievements appear.
4. Create a kid on iOS → confirm shows on web within seconds.
5. Document any drift in this file.

### Phase 1 — Web delete-account parity · 1 PR · low risk

**Branch:** `feat/web-delete-account`
**Repo:** `Kids-achievement-tracker`

- Lift the cascade logic from `weekly-superstar-ios/lib/deleteAccount.ts` into `weekly-superstar-shared` (the existing shared package) so both apps consume the same helper. This is the right home — it already holds shared logic.
- Add web settings page (or section): re-auth modal → confirm → call shared `deleteAccountCascade()`.
- Update Firestore rules if needed (current rules already permit member to leave / admin to delete board).
- Update `firestore.rules` test if any exists.

**Done when:** a web user can delete their account end-to-end; iOS continues working unchanged.

### Phase 2 — Account linking foundation · 1 PR · low risk

**Branch:** `feat/account-linking-helpers`
**Repos:** both, via `weekly-superstar-shared`

- Add a `linkEmailPasswordToCurrentUser(email, password)` helper to `weekly-superstar-shared` using `linkWithCredential` + `EmailAuthProvider.credential`.
- Add corresponding `linkAppleToCurrentUser()` stub (no UI yet — just the helper).
- Don't surface UI yet. Just have the helpers ready for when Apple Sign-In ships.

**Done when:** both apps export the helpers; no behavior change yet.

### Phase 3 — Premium feature surface · 1 PR · low risk

**Branch:** `feat/premium-feature-surface`
**Repos:** both

Decisions needed before this phase:
- **What does premium unlock?** Currently undefined. Candidates: extra theme packs, ad-free (no ads currently), snapshot/PDF exports, custom pet packs, unlimited kids per board (currently no limit), printable fridge sheet (already free?). **Need user input.**
- **Price point + free trial?** Apple-side decision.

Implementation:
- Add `board.premium: boolean` field (defaults false on existing boards via security-rule fallback).
- Add `usePremium(boardId)` hook on web mirroring iOS. Reads `boards/{id}.premium`.
- Both apps gate the chosen feature with `if (!premium) showPaywall()` placeholder.
- Paywall is a non-functional CTA in this phase ("Coming soon — premium").

**Done when:** field is read on both platforms; chosen feature is gated with a placeholder paywall on both.

### Phase 4 — iOS IAP wiring (real purchases) · 1 PR · medium risk

**Branch:** `feat/ios-iap-real`
**Repo:** `weekly-superstar-ios`

Blockers (need user action):
- App Store Connect: create non-consumable product `weekly_superstar_premium_unlock` (already named in `iap.ts`), set price, fill metadata.
- Decide: TestFlight-only first, or push to App Store review immediately.

Implementation:
- `npm install react-native-iap` (requires development build — won't work in Expo Go).
- Replace `MockPurchaseController` with `RealController` calling `requestPurchase`, `getProducts`, `getAvailablePurchases`.
- On successful purchase, optimistically write `boards/{boardId}.premium = true` (security rules must permit this — see Phase 5 for server-side validation).
- Update settings page upgrade button to call real `purchase()`.

**Done when:** sandbox purchase on TestFlight unlocks the gated feature on iOS AND on web for the same board.

### Phase 5 — Server-side receipt validation · 1 PR · medium risk

**Branch:** `feat/iap-receipt-validation`
**Repo:** `Kids-achievement-tracker/functions/`

Blockers (need user action):
- Generate Apple App Store Server API key in App Store Connect (Users and Access → Keys → In-App Purchase). Store in Firebase Functions config: `firebase functions:config:set apple.key_id=... apple.issuer_id=... apple.private_key=...`.

Implementation:
- New callable function `validateApplePurchase({ receipt, boardId })` in `functions/src/iap.ts`.
- Validate via Apple's verifyReceipt or App Store Server API.
- On valid receipt, write `boards/{boardId}.premium = true` server-side. Tighten Firestore rules so only Cloud Functions service account (or admin SDK) can write `premium` field — clients can only read.
- iOS calls this function instead of writing directly. Replace optimistic write from Phase 4.

**Done when:** premium can only be set via valid Apple receipt; security rules forbid client writes to `board.premium`.

### Phase 6 — Web purchase via Stripe · 1 PR · medium risk · OPTIONAL

Skip for now if iOS-first launch is fine.

**Branch:** `feat/stripe-web-purchase`
**Repo:** `Kids-achievement-tracker` + `functions/`

Blockers:
- Stripe account, product, price, webhook secret.
- Decision on whether iOS premium price ↔ Stripe price match (Apple takes 15-30%).

Implementation:
- Web checkout page → Stripe Checkout Session.
- Webhook `functions/src/stripe.ts` handling `checkout.session.completed` → write `boards/{boardId}.premium = true`.
- Same entitlement field as iOS — no fragmentation.

**Done when:** a web user can pay → entitlement appears on iOS for the same board.

### Phase 7 — Apple Sign-In · 1 PR · medium risk · OPTIONAL

Only if you want OAuth parity.

**Branch:** `feat/apple-signin`
**Repos:** both

- iOS: wire the already-installed `expo-apple-authentication` into `signin.tsx` and `signup.tsx`. Use `signInWithCredential(auth, OAuthProvider.credentialFromResult(...))`.
- Web: add Apple as a Firebase Auth provider (Sign in with Apple JS button). Apple Developer Portal: configure web auth domain.
- Use the linking helpers from Phase 2 to merge an Apple-only iOS account with an email account on web.

**Done when:** a user can sign in with Apple on either platform and end up at the same Firebase user record.

## Decisions needed before coding

1. **Phase 3:** What does premium unlock? Pick 1–2 features from the candidate list above (or propose new ones).
2. **Phase 4:** TestFlight-first, or straight to App Store?
3. **Phase 6:** Add Stripe web purchase now, or iOS-only at launch?
4. **Phase 7:** Add Apple Sign-In, or stay email-only?
5. **Pricing:** $/month? One-time? Free trial duration?

## Risks & mitigations

- **`weekly-superstar-shared` is a `file:` link.** When you add helpers there, both repos must be re-installed (`npm install --legacy-peer-deps`) and the iOS dev build re-run. Coordinate.
- **Optimistic IAP write (Phase 4) before Phase 5 ships.** A user could spoof the write briefly. Mitigation: ship Phase 5 quickly after Phase 4, or merge them into one PR.
- **Apple's account-deletion requirement.** iOS already complies. But ANY new auth provider (Apple Sign-In) added to iOS triggers re-review — make sure delete-account still works for Apple-linked accounts.
- **Stripe + Apple coexistence.** If both exist, you need a "current source of entitlement" tag on the board doc to know who can revoke it. Defer this complexity — ship one purchase platform first.

## Out of scope (for now)

- Per-user paid plans (current design is per-board / family-shared — keep it)
- Refund handling (Apple/Stripe webhooks both have refund events; revisit when active)
- Multi-currency pricing
- Promotional codes
