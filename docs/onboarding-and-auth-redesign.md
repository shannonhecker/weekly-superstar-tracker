# Onboarding + auth redesign — plan

Decided 2026-04-27. Web + iOS in parallel. Direction B ("Meet your first pet") with the **pet selection removed** (pets are a random surprise per kid — see memory).

## Surfaces in scope

1. **Onboarding flow** — replace the single-form `/signup` with a 4-screen guided flow
2. **Reset-password screen** — replace Firebase's bare hosted page with a branded `/auth/action` route
3. **Sign-in OAuth** — add Apple + Google buttons alongside email/password
4. **"Need help?" link** — add to login + reset-password screens

## Direction B (revised)

```
SCREEN 1                SCREEN 2                SCREEN 3                  SCREEN 4
┌──────────────┐       ┌──────────────┐       ┌──────────────┐         ┌──────────────┐
│  ✨          │       │ Pick a theme │       │ Tell me      │         │ One last     │
│              │       │  for them    │       │ about them   │         │ step.        │
│  meet your   │       │              │       │              │         │              │
│  weekly      │       │ ▢ ▢ ▢ ▢      │       │ name         │         │ [email]      │
│  superstar.  │       │ ▢ ▢ ▢ ▢      │       │ […………]       │         │ [password]   │
│              │       │              │       │              │         │              │
│  a tiny      │       │ (theme       │       │ birthday     │         │ or Apple /   │
│  ritual for  │       │  swatches —  │       │ [optional]   │         │ Google       │
│  kids who    │       │  earthy,     │       │              │         │              │
│  are crushing│       │  cosmic,     │       │ [skip]       │         │ [create →]   │
│  their week. │       │  garden…)    │       │ [continue]   │         │              │
│              │       │              │       │              │         │ Need help?   │
│  [start ▶]   │       │ [continue]   │       │              │         │              │
└──────────────┘       └──────────────┘       └──────────────┘         └──────────────┘
```

Pet hatch happens **after** signup, on the board, as the kid earns first stickers — using the existing `PET_CHAINS` mechanic. No design change there.

## Visual tokens

- Bg: `earthy-cream` page, white/cream cards if any
- Text: `earthy-cocoa` primary, `earthy-cocoaSoft` secondary
- Headlines: `font-display font-black` (already used in Board.jsx)
- Body: same default as rest of app
- Accent: keep existing accent style (no green-to-purple gradient — replace with on-brand tone)

## Decisions made

| Decision | Choice |
|---|---|
| Pet picker | **Removed.** Pets stay a surprise. |
| Theme picker | Yes, screen 2, per first kid. |
| Birthday | Optional, screen 3, with skip. |
| Step count | 4 (3 micro + form). |
| Form auth | Email/password + Apple + Google. |
| Last screen has "Need help?" link | Yes. |
| Platform order | Both in parallel. |

## Sequencing — 5 PRs

| # | Branch / repo | Scope | Backend deps |
|---|---|---|---|
| 1 | `feat/onboarding-direction-b` in `Kids-achievement-tracker` | Web onboarding flow. OAuth buttons rendered but stubbed (toast "configure provider in Firebase Console") until PR 4. | none |
| 2 | `feat/onboarding-direction-b` in `weekly-superstar-ios` | iOS onboarding flow, mirrors PR 1. OAuth buttons stubbed similarly. | none |
| 3 | `feat/auth-action-handler` in `Kids-achievement-tracker` | Branded `/auth/action` route handling `resetPassword`, `verifyEmail`, `recoverEmail`. Replaces Firebase's hosted page. | Firebase Console: Auth → Templates → Customize action URL → `https://winkingstar.com/auth/action` |
| 4 | `feat/oauth-providers-web` in `Kids-achievement-tracker` | Wire real Google + Apple sign-in via `signInWithPopup`. Replace stubs. | Firebase Console: Auth → Sign-in method → enable Google + Apple. Apple Developer: Service ID + key. |
| 5 | `feat/oauth-providers-ios` in `weekly-superstar-ios` | Wire real Google (`expo-auth-session/providers/google`) + Apple (`expo-apple-authentication` already installed). | Apple Developer: capability already on the iOS app. Google Cloud: OAuth client ID for iOS. |

PRs 1+2 ship first (visual draft, no backend). PR 3 next (branded reset). PRs 4+5 last (need backend setup).

## Backend checklist (your action)

When ready for PR 4+5:

**Firebase Console** (`https://console.firebase.google.com/project/weekly-superstar-tracker/authentication/providers`):
- [ ] Enable Google provider — copy Web client ID + Web client secret
- [ ] Enable Apple provider — needs Apple Service ID, Team ID, Key ID, private key
- [ ] Auth → Templates → "Customize action URL" → `https://winkingstar.com/auth/action`
- [ ] Auth → Templates → consider customizing the password-reset email subject/body to match brand

**Apple Developer Portal** (`https://developer.apple.com/account/`):
- [ ] Identifiers → Services IDs → create one for `com.winkingstar.web` (or similar) — needed for web Apple Sign-In
- [ ] Keys → create new "Sign in with Apple" key — download .p8, note key ID + team ID
- [ ] iOS app already has Sign-In with Apple capability (since `expo-apple-authentication` is installed)

**Google Cloud Console** (`https://console.cloud.google.com/`):
- [ ] OAuth consent screen → fill out (already may be done)
- [ ] Credentials → create OAuth 2.0 client → iOS (bundle id matches app.json)

## Out of scope

- Web magic-link / passwordless (parked — could revisit if conversion data wants it)
- Onboarding for the join-via-share-code flow (`/join/:code`) — separate flow; works fine today
- iOS App Store re-submission (PR 5 might trigger; coordinate with the existing Fri 2026-05-01 submission check)
- The deferred Phases 1–7 from `cross-platform-account-plan.md` (delete-account, IAP, Stripe, etc.)

## Acceptance criteria

PRs 1+2:
- [ ] User completing the 4-screen flow has a board + first kid (with theme + optional birthday) created in Firestore on signup
- [ ] Existing `/signin` and `/forgot-password` still work (only `/signup` flow changes initially)
- [ ] Earthy palette tokens used; no green-to-purple gradient remaining
- [ ] Apple/Google buttons present (stubbed); "Need help?" link present
- [ ] Web `npm run build` passes; iOS `npx tsc --noEmit` (or equivalent) passes
