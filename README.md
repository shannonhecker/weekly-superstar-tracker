# ⭐ Weekly Superstar Tracker

A fun, colourful weekly achievement tracker for kids aged 5–7. Track daily habits with themed stickers, virtual pets, badges, and rewards.

## Features

- **Weekly calendar grid** — 8 activities × 7 days with tappable sticker checks
- **Themed profiles** — ⚽ Football theme for Leo, 🦕 Dinosaur theme for Nathan
- **Virtual pet** — evolves based on weekly score (egg → baby → grown → champion!)
- **Daily streak counter** — tracks consecutive perfect days with themed icons
- **Badge system** — earn bronze/silver/gold/diamond badges each week
- **Reward unlock** — parents set custom reward goals with progress tracking
- **Weekly history** — bar chart of past weeks' scores
- **Persistent data** — saves progress in localStorage

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- React 18 + Vite
- Tailwind CSS v3
- No backend — fully client-side with localStorage persistence

## Project Structure

```
src/
├── components/     # React components
├── themes/         # Per-child theme configs (football, dinosaur)
├── utils/          # Constants and helper functions
├── index.css       # Tailwind + custom styles
└── main.jsx        # Entry point
```

See `PROJECT_BRIEF.md` for the full product requirements document.
