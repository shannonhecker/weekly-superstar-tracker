# Kids Achievement Tracker — Project Brief & PRD

## Overview
A fun, colourful weekly achievement tracker web app for two children (Leo, age 5–7, and Nathan, age 5–7). Parents use it to track daily habits/activities across a 7-day week. Each child has a personalised theme (football for Leo, dinosaurs for Nathan) with themed animations, stickers, pets, and badges.

**Live URL target:** GitHub Pages or Vercel  
**Repo:** https://github.com/shannonhecker/Kids-achievement-tracker-.git  
**Tech stack:** React 18 + Vite + Tailwind CSS v3  

---

## Target Users
- **Primary:** Parents (tracking & managing)
- **Secondary:** Children aged 5–7 (viewing, tapping stickers — with parental supervision)

## Design Principles
- **Fun & playful** — large emoji, bright colours, bouncy animations
- **Simple & readable** — minimal text, clear grid layout, large tap targets (44px+)
- **Themed per child** — each child's section feels like *their* world
- **Mobile-first** — works on phones and tablets; horizontally scrollable table

---

## Core Features

### 1. Weekly Calendar Grid
- Rows = activities, Columns = Mon–Sun + Total column
- 8 activity rows (7 fixed + 1 custom):

| # | Emoji | Activity | Default Colour |
|---|-------|----------|---------------|
| 1 | 😴 | Good Sleep | `#7C6FF7` |
| 2 | 🛁 | Good Bath | `#4ECDC4` |
| 3 | 🪥 | Brush Teeth | `#45B7D1` |
| 4 | 📖 | School Book | `#F7B731` |
| 5 | 📚 | Fun Book | `#FC5C65` |
| 6 | 🀄 | Mandarin | `#FF6348` |
| 7 | 🚶 | Walk Outside | `#26DE81` |
| 8 | ⭐ | Special! (custom) | `#FD9644` |

- Each cell is a tappable circle (44×44px) that toggles on/off
- When tapped ON → shows a random themed sticker with a pop animation
- When tapped OFF → shows a grey "○"
- **Total column** shows `X/7` per row; shows 🎉 when row is complete (7/7)
- **Overall score bar** at top shows `X/56` with a progress bar

### 2. Two Children with Themed Profiles
Each child has a tab at the top. Switching tabs shows that child's independent tracker.

#### ⚽ Leo — Football Theme
| Property | Value |
|----------|-------|
| Avatar | ⚽ (in green gradient circle) |
| Colour scheme | Greens (`#4CAF50`, `#C8E6C9`, `#2E7D32`) |
| Background | `linear-gradient(135deg, #E8F5E9, #F1F8E9, #FFFDE7)` |
| Sticker pool | ⚽ 🏆 🥅 🏅 💪 👟 🎯 🌟 🔥 ⭐ 🏟️ 🦁 💚 ✨ 🎉 👑 |
| Pet evolution | 🦁→🏃→⚽→🥅→🏆 |
| Pet moods | Warming Up → In Training → Match Ready → Scoring Goals → CHAMPION! |
| Streak icon | ⚽ |
| Badge icons | 🥉 🥈 🥇 🏆 |
| Reset button | "🔄 Next Match" |
| Confetti extras | ⚽ 🥅 👟 |

#### 🦕 Nathan — Dinosaur Theme
| Property | Value |
|----------|-------|
| Avatar | 🦕 (in purple gradient circle) |
| Colour scheme | Purples (`#7E57C2`, `#D1C4E9`, `#4527A0`) |
| Background | `linear-gradient(135deg, #EDE7F6, #E8EAF6, #E1F5FE)` |
| Sticker pool | 🦕 🦖 🌋 🥚 🦴 🌿 💎 ⭐ 🔥 🌟 🪨 🌴 💜 ✨ 🎉 👑 |
| Pet evolution | 🥚→🐣→🦕→🦖→👑 |
| Pet moods | Egg Stage → Baby Dino → Getting Big → T-REX Mode → DINO KING! |
| Streak icon | 🦖 |
| Badge icons | 🥚 🦕 🦖 👑 |
| Reset button | "🔄 Next Era" |
| Confetti extras | 🦕 🌋 🦴 |

### 3. Virtual Pet
- Displayed in a card above the grid
- Pet emoji + mood label + speech bubble message
- Pet state determined by total score:
  - 0–10: Sad/sleeping state
  - 11–20: Awake
  - 21–35: Happy (starts bouncing animation)
  - 36–49: Excited
  - 50–56: SUPERSTAR / maximum happiness

### 4. Daily Streak Counter
- Counts consecutive days (from Monday) where ALL 8 activities are checked
- Visual: streak icon × streak count (e.g. ⚽⚽ for 2-day streak)
- Flames pulse animation at 4+ day streak
- "PERFECT WEEK!" message at 7-day streak

### 5. Badge System
- Earned based on weekly star total:
  - 15+ stars → Bronze badge
  - 30+ stars → Silver badge
  - 40+ stars → Gold badge
  - 50+ stars → Diamond badge
- Current week shows as a dashed/pulsing "in progress" badge
- When "New Week" is pressed, the earned badge is saved to the **Badge Shelf**
- Badge shelf displays all past badges as small circles

### 6. Reward Unlock
- Parents set a custom reward (text label + star target via slider 10–56)
- Shows progress bar toward the target
- Displays "🎊 UNLOCKED!" with wiggle animation when target is met
- Can be cleared (×) and re-set

### 7. Weekly History Chart
- Simple bar chart showing scores from past weeks (up to 8 weeks)
- Each bar is colour-coded by badge tier
- Shows badge icon above each bar
- Only appears after at least one "New Week" reset

### 8. New Week Reset
- Confirmation dialog before resetting
- Saves current score to weekly history
- Saves earned badge to badge shelf
- Clears all checkboxes and custom label
- Triggers confetti celebration

### 9. Editable Names & Custom Activity
- Child names are editable (click to edit inline)
- "Special!" activity label is editable (click to type a custom one-off goal)

---

## Animations
| Animation | Trigger | CSS |
|-----------|---------|-----|
| `confettiFall` | All 56 stars checked, or New Week reset | `translateY(0→100vh) rotate(0→720deg)` over 2s |
| `petBounce` | Score > 20 | `translateY(0→-6px)` loop 1.2s |
| `flamePulse` | Streak ≥ 4 | `scale(1→1.2)` loop 0.8s |
| `badgePulse` | Current badge exists | `scale(1→1.1) opacity(1→0.8)` loop 1.5s |
| `rewardWiggle` | Row complete or reward unlocked | `rotate(0→-8°→8°)` loop 1s |
| Sticker pop | On tap | `scale(1→1.35→1.1)` 0.4s with cubic-bezier overshoot |

---

## Data Persistence (Future Enhancement)
Currently all state is in-memory (resets on page refresh). Future options:
- `localStorage` for offline persistence
- Firebase/Supabase for cross-device sync
- User authentication for family accounts

---

## File Structure
```
kids-tracker/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── App.jsx              # Root: tabs, layout, global styles
│   │   ├── ChildTracker.jsx     # Main tracker panel per child
│   │   ├── StickerCheck.jsx     # Tappable sticker button
│   │   ├── VirtualPet.jsx       # Pet card
│   │   ├── StreakCounter.jsx     # Streak display
│   │   ├── BadgeShelf.jsx       # Badge collection
│   │   ├── RewardUnlock.jsx     # Reward goal card
│   │   ├── WeeklyHistory.jsx    # Past weeks bar chart
│   │   └── ConfettiEffect.jsx   # Confetti overlay
│   ├── themes/
│   │   ├── football.js          # Leo's theme config
│   │   └── dinosaur.js          # Nathan's theme config
│   ├── utils/
│   │   ├── constants.js         # DAYS, DEFAULT_ACTIVITIES
│   │   └── helpers.js           # getPetState, getBadge
│   ├── index.css                # Tailwind + keyframe animations
│   └── main.jsx                 # Entry point
├── .cursor/
│   └── rules                    # Cursor AI rules
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
└── README.md
```

---

## Non-Functional Requirements
- **Performance:** < 2s first paint on 3G
- **Accessibility:** All buttons have aria-labels; min 44px touch targets
- **Browser support:** Chrome, Safari, Firefox (latest 2 versions)
- **Responsive:** Mobile-first, scrollable table on small screens
- **No external API calls** — fully client-side

---

## Success Metrics
- Both children can independently track and view their progress
- Parents can set rewards and reset weeks without confusion
- The app feels fun and game-like, not like a chore
