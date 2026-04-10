# 🚀 Building Kids Achievement Tracker in Cursor — Step-by-Step Guide

## Prerequisites
- [Cursor IDE](https://cursor.com) installed
- [Node.js](https://nodejs.org) v18+ installed
- [Git](https://git-scm.com) installed
- A GitHub account

---

## Step 1: Clone the Repo & Open in Cursor

Open your **terminal** (or Cursor's built-in terminal) and run:

```bash
git clone https://github.com/shannonhecker/Kids-achievement-tracker.git
cd Kids-achievement-tracker
```

Then open the folder in Cursor:
- **File → Open Folder** → select the `Kids-achievement-tracker` folder
- Or from terminal: `cursor .`

---

## Step 2: Unzip the Project Files

Download the `kids-achievement-tracker.zip` from Claude and extract it into the project folder.

**On Mac/Linux:**
```bash
unzip ~/Downloads/kids-achievement-tracker.zip -d .
```

**On Windows:**
Right-click the zip → Extract All → choose the `Kids-achievement-tracker` folder.

Your folder should now look like this:
```
Kids-achievement-tracker/
├── .cursor/
│   └── rules                  ← Cursor AI rules (auto-loaded)
├── PROJECT_BRIEF.md           ← Full product spec
├── README.md
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx
    ├── index.css
    ├── components/
    │   ├── App.jsx
    │   ├── ChildTracker.jsx
    │   ├── StickerCheck.jsx
    │   ├── VirtualPet.jsx
    │   ├── StreakCounter.jsx
    │   ├── BadgeShelf.jsx
    │   ├── RewardUnlock.jsx
    │   ├── WeeklyHistory.jsx
    │   └── ConfettiEffect.jsx
    ├── themes/
    │   ├── football.js        ← Leo's ⚽ theme
    │   └── dinosaur.js        ← Nathan's 🦕 theme
    └── utils/
        ├── constants.js
        └── helpers.js
```

---

## Step 3: Install Dependencies

In Cursor's terminal (`Ctrl+`` ` or `Cmd+`` `):

```bash
npm install
```

This installs React, Vite, and Tailwind CSS.

---

## Step 4: Start the Dev Server

```bash
npm run dev
```

You should see:
```
  VITE v6.x.x  ready in XXXms

  ➜  Local:   http://localhost:5173/
```

**Open http://localhost:5173 in your browser** — you should see the tracker!

---

## Step 5: Push to GitHub

```bash
git add -A
git commit -m "feat: initial project setup with themed tracker"
git push origin main
```

If `main` fails, try: `git push origin master`

---

## Step 6: Using Cursor AI to Make Changes

The `.cursor/rules` file is already set up and will automatically guide Cursor's AI.
Here are example prompts you can type in Cursor's AI chat (`Cmd+L` or `Ctrl+L`):

### Styling & Theme Changes
```
Read PROJECT_BRIEF.md. Change Nathan's theme from dinosaurs to space/rockets.
```

```
Make the sticker buttons bigger on mobile (56px instead of 44px).
```

```
Add a dark mode toggle to the app.
```

### New Features
```
Read PROJECT_BRIEF.md. Add sound effects when tapping stickers.
Use the Tone.js library for short chime sounds.
```

```
Add a "print this week" button that opens a print-friendly version.
```

```
Add a parent lock — require a 4-digit PIN to access the reward settings
and reset button.
```

### Bug Fixes
```
The streak counter should count from the latest completed day backwards,
not just from Monday forward. Fix StreakCounter.jsx.
```

### Adding a Third Child
```
Read the theme files in src/themes/. Create a new unicorn theme for a
child called "Emma" with pink/rainbow colours, and add her as a third
tab in App.jsx.
```

---

## Step 7: Build for Production

When ready to deploy:

```bash
npm run build
```

This creates a `dist/` folder with static files you can deploy to:
- **Vercel**: `npm i -g vercel && vercel`
- **Netlify**: drag the `dist` folder to netlify.com/drop
- **GitHub Pages**: use the `gh-pages` package

---

## Quick Reference: Key Files to Edit

| What you want to change | File to edit |
|--------------------------|--------------|
| Activities list | `src/utils/constants.js` |
| Leo's theme (colours, pet, stickers) | `src/themes/football.js` |
| Nathan's theme | `src/themes/dinosaur.js` |
| Main tracker layout | `src/components/ChildTracker.jsx` |
| Sticker button behaviour | `src/components/StickerCheck.jsx` |
| Pet evolution logic | `src/utils/helpers.js` → `getPetState` |
| Badge thresholds | `src/utils/helpers.js` → `getBadge` |
| Tab switcher & app shell | `src/components/App.jsx` |
| Animations | `tailwind.config.js` → `keyframes` |
| Global styles | `src/index.css` |
| Cursor AI behaviour | `.cursor/rules` |

---

## Troubleshooting

**"command not found: npm"**
→ Install Node.js from https://nodejs.org (v18 or newer)

**"Module not found" errors**
→ Run `npm install` again

**Blank page in browser**
→ Check terminal for errors. Common fix: restart with `npm run dev`

**Tailwind classes not working**
→ Make sure `postcss.config.js` and `tailwind.config.js` exist.
   Run `npm install` to ensure Tailwind is installed.

**Can't push to GitHub**
→ Make sure you're logged into GitHub:
   `gh auth login` or set up SSH keys
