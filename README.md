# Weekly Superstar Tracker — Web

Family-shared weekly habit tracker for kids. Live at https://weekly-superstar-tracker.web.app.

- **Web** (this repo) — Vite + React + Tailwind, Firebase Hosting
- **iOS / Android** — [weekly-superstar-ios](https://github.com/shannonhecker/weekly-superstar-ios) (Expo / React Native)
- **Shared tokens + domain** — [weekly-superstar-shared](https://github.com/shannonhecker/weekly-superstar-shared) (linked via `file:`)

## Develop

```bash
npm install --legacy-peer-deps
npm run dev        # localhost:5173
npm run build      # production bundle to dist/
npm run deploy     # build + firebase deploy --only hosting
```

Requires the sibling `weekly-superstar-shared` directory to be present alongside this one.
