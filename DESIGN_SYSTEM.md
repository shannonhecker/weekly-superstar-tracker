# Design System

Single source of truth for visual decisions. If a value isn't here, it's a mistake — not a
new exception. Add the token first, then use it.

All values live in `tailwind.config.js`. React components reference them via utility
classes (`bg-brand-start`, `rounded-md`, `shadow-card`) or via CSS variables set at
per-kid scope for theme accent colors.

---

## Color

### Brand
- `brand.start` (#F59E0B, amber-400) — gradient start for primary CTAs + board title
- `brand.end` (#EC4899, pink-500) — gradient end
- Usage: `bg-gradient-to-r from-brand-start to-brand-end` on the New Week button and
  the board-name text gradient

### Favorite / accent chip
- `fav.bg` (#FFFBEB) — chip surface
- `fav.border` (#FCD34D) — chip border
- `fav.text` (#B45309) — label text inside chip

### Surface
- `surface.page` (#FBF7FF) — page background (combined with pastel radial gradients
  defined in `index.css`)
- `surface.card` (#FFFFFF) — card surfaces (no tinted backgrounds anymore)
- `surface.subtle` (#F9FAFB, gray-50) — nested surface (grid header, alt rows)
- `surface.divider` (#E5E7EB, gray-200) — dividers + rest-state borders

### Per-kid theme accents
Each kid has a `theme` (football, dinosaur, unicorn, animals, rocket, princess).
Each theme exposes `accent` (fill) + `deeper` (text/icon) pairs. These live in
`src/lib/themes.js` (THEMES) and are read via inline `style` at the per-kid scope
because they change based on the active kid. Do NOT promote them to Tailwind
tokens — they're runtime data, not design decisions.

---

## Typography

Two fonts. Two weights per screen, cap.

- **Fredoka** (`font-display`) — used ONLY for: board title, kid name, score numerals,
  stage titles. Weight 900.
- **Nunito** (`font-body`) — everything else. Weight 700 (bold) for labels, 400
  (normal) for body copy.

**Do not mix** `font-extrabold` (800) and `font-black` (900) on the same screen. Pick
one per role. This is the most common current violation in the codebase.

---

## Radius

- `rounded-sm` (Tailwind default: 2px) — dividers, thin lines
- `rounded-md` (6px) — not used, skip
- `rounded-lg` (8px) — small chips
- `rounded-xl` (12px) — buttons
- `rounded-2xl` (16px) — cards, mystery boxes
- `rounded-3xl` (24px) — kid card (outermost container)
- `rounded-full` / `rounded-pill` — pills, chips, avatars

---

## Elevation

Use shadow tokens, never inline shadows.

- `shadow-card` — default card resting state (very subtle, 2 stacked shadows)
- `shadow-pop` — hover / elevated / floating state (modals, menus)
- no shadow — flat surfaces nested inside cards

---

## Spacing

Default Tailwind scale. Use the 4pt rhythm:

- `p-2` (8px) — chip inner padding
- `p-3` (12px) — tight card padding
- `p-4` (16px) — standard card padding
- `gap-2` / `gap-3` between cards in a grid

Avoid `p-1.5`, `p-2.5`, `px-2 sm:px-3` mixes.

---

## Motion

- `ease-spring` (cubic-bezier(0.175, 0.885, 0.32, 1.275)) — card state changes,
  sticker reveals, entrance animations
- `duration-200` — hover/focus
- `duration-300` — state change
- `duration-700` — hatch / celebration

`active:scale-[0.98]` is the standard press response — use it consistently on every
tappable card and button.

---

## Focus

Every interactive element MUST have a visible focus ring for keyboard users:

```
focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-<color>-300
```

Color matches the button's family (amber for primary, purple for tertiary, gray
for neutral).

---

## Component patterns

### Primary button
```
bg-gradient-to-r from-brand-start to-brand-end text-white font-bold
rounded-xl px-4 py-2 shadow-card hover:shadow-pop
active:scale-[0.98] transition-all
focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-400
```

### Secondary / ghost button
```
bg-white border border-purple-200 text-purple-600 font-bold
rounded-xl px-4 py-2 hover:border-purple-400
active:scale-[0.98] transition-all
focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-300
```

### Overflow (⋯) button
```
bg-white border border-surface-divider text-gray-500
rounded-xl w-8 h-8 flex items-center justify-center
hover:border-gray-400 active:scale-[0.98] transition-all
```

### Card
```
rounded-2xl bg-surface-card border border-<theme>-accent/15
shadow-card p-3 sm:p-4
```
NOT: tinted backgrounds (`bg-theme-accent/14`) — white-only, accent lives in the
border and content (pet emoji, icons).

### Chip
```
inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1
bg-fav-bg border border-fav-border text-fav-text text-[11px] font-bold
```

---

## Responsive

Mobile first. Breakpoints:

- default (`<640px`): single column, condensed spacing
- `sm` (≥640px): labels appear on buttons, gap widens
- `md` (≥768px): 2-column card grids
- `lg` (≥1024px): 3-column card grid, `max-w-4xl` container

Activity grid stays at max-w-2xl (it's a table; wider isn't better).

---

## What's intentionally NOT in here

- Per-theme accent/deeper hex values — these are runtime data, live in themes.js
- Animation keyframes — live in index.css, not Tailwind
- Sticker emoji pool — it's content, not design tokens
