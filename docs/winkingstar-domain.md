# winkingstar.com domain — handover

Status snapshot taken **2026-04-27**. Domain is **fully live** on Firebase Hosting; both apex and `www` resolve over HTTPS with valid SSL.

## TL;DR

| Hostname | Status | Notes |
|---|---|---|
| `winkingstar.com` (apex) | LIVE — HTTP/2 200 | Serves the build from `dist/` |
| `www.winkingstar.com` | LIVE — 301 → apex | Correct redirect to canonical apex |
| `http://...` | 301 → `https://` | Firebase auto-redirect |
| HSTS | On | `max-age=31556926` (~1 year) |
| SSL cert | Valid | Google Trust Services WR3, shared SAN cert; `winkingstar.com` is in the SAN list |

Nothing pending. Both subdomains are connected, verified, and serving traffic.

## Pieces and where they live

- **Registrar:** GoDaddy (nameservers `ns57/ns58.domaincontrol.com`)
- **Hosting:** Firebase Hosting, project `weekly-superstar-tracker`
- **Repo:** this one (`Kids-achievement-tracker`) — `.firebaserc` → `weekly-superstar-tracker`
- **Build target:** `dist/` (per `firebase.json` → `hosting.public`)
- **Deploy command:** `npm run deploy` (build + `firebase deploy --only hosting`)

## DNS records currently set (GoDaddy → public DNS, verified via `dig @1.1.1.1`)

```
winkingstar.com.       A      199.36.158.100
www.winkingstar.com.   CNAME  winkingstar.com.
winkingstar.com.       TXT    "hosting-site=weekly-superstar-tracker"
winkingstar.com.       NS     ns57.domaincontrol.com.
                              ns58.domaincontrol.com.
```

Notes:
- The single `A` record is sufficient. Firebase typically asks for two `A` records (`151.101.1.195` + `151.101.65.195`) when you connect a custom domain via the console. The single `199.36.158.100` we have is also a Firebase Hosting frontend IP and is responding correctly. Leave as-is unless the console flags it.
- No `AAAA` record is set. Optional — Firebase serves IPv6 if added, but absence is not blocking.
- `www` is a `CNAME` to the apex (best practice for Firebase Hosting; the redirect is handled by Hosting itself).
- TXT record is the Firebase site-verification token. **Do not delete it** — removing it can cause Firebase to revoke the custom domain.

## How to verify it's still working

```bash
# Should return HTTP/2 200 with last-modified date matching your last deploy
curl -sI https://winkingstar.com | head -5

# Should return 301 → https://winkingstar.com/
curl -sI https://www.winkingstar.com | head -3

# Cert validity + SAN coverage
echo | openssl s_client -servername winkingstar.com -connect winkingstar.com:443 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```

## Common follow-ups

### Deploy a new build

```bash
cd ~/Documents/Cursor/Kids-achievement-tracker
npm run deploy
```

(Also deploys to `https://weekly-superstar-tracker.web.app` — same hosting site, multiple connected domains.)

### Check Firebase-side state

Login is interactive; run yourself if needed:

```bash
firebase login                              # if not authenticated
firebase hosting:sites:list                 # confirm the site
firebase hosting:channel:list               # any preview channels
```

The Firebase console for connected custom domains:
`https://console.firebase.google.com/project/weekly-superstar-tracker/hosting/sites`

### Rotating the SSL cert

Firebase manages SSL automatically (Google Trust Services). No action needed — certs auto-renew well before the `notAfter` date.

### If the domain ever stops serving

In rough order of likelihood:
1. **TXT verify record removed** in GoDaddy → Firebase revokes the domain. Re-add it. Token is `hosting-site=weekly-superstar-tracker`.
2. **A record edited** to a non-Firebase IP. Restore `199.36.158.100` (or use the canonical pair `151.101.1.195` + `151.101.65.195` if Firebase console asks).
3. **Domain expired or auto-renew off** at GoDaddy. Renew.
4. **Firebase project paused / billing issue.** Check console.

## What changed today (2026-04-27)

- DNS records placed in GoDaddy in the morning.
- Firebase verified the apex by EOD (TXT record lookup succeeded).
- SSL cert issued for both apex and `www` (Google Trust Services WR3).
- `www` subdomain configured with the canonical-redirect-to-apex behavior.

Memory entry `reference_winkingstar_domain.md` should be updated from "awaiting verify + SSL; www subdomain not yet added" → "LIVE; apex + www both serving HTTPS as of 2026-04-27".
