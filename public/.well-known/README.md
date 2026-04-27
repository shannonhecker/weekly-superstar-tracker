# /.well-known/

Files in this directory are served at the root of the domain (e.g.
`https://winkingstar.com/.well-known/foo`).

## Files expected here

### `apple-developer-domain-association.txt`

Required by Apple to verify domain ownership for **Sign in with Apple**.

**How to obtain it:**

1. Apple Developer Portal → Identifiers → click your Services ID
   (e.g. `com.winkingstar.web`)
2. Sign In with Apple → Configure
3. Add `winkingstar.com` to "Domains and Subdomains"
4. Apple shows a `Download` button next to the domain — click it to
   get `apple-developer-domain-association.txt`
5. Save the file in this directory exactly as `apple-developer-domain-association.txt`
   (no extension change, no rename)
6. Commit + redeploy: `npm run deploy`
7. Verify it serves: `curl https://winkingstar.com/.well-known/apple-developer-domain-association.txt`
8. Back in Apple Developer Portal, click `Verify` on the domain

### `apple-app-site-association` (future)

Will be required for iOS Universal Links once those are wired up. Not
needed yet — see `docs/onboarding-and-auth-redesign.md` for the broader
auth + linking plan.

## Why this directory exists in `public/`

Vite copies everything in `public/` to `dist/` at build time. Firebase
Hosting then serves the contents of `dist/`. The `firebase.json` adds
explicit `Content-Type` headers for these files so Apple's HTTPS check
sees them as text, not as the SPA's `index.html`.

The previous `"ignore": ["**/.*"]` rule in `firebase.json` was hiding
all dotfile directories including `.well-known/` — that's been
removed.
