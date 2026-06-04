# Codex Handover — SignIn doodle hero swap

## Context

Winking Star web app. The SignIn page (`/signin`) just shipped with a photographic
family-board hero on the left card (PR-B, commit `ef2f203`). User flagged it as "out of place"
because the rest of the planned onboarding journey uses an illustrated kawaii-doodle style
already on disk (iOS `intro-*` set, already partially synced to `public/onboarding-art/`).

The job: swap SignIn's left-card hero from the photographic `family-hero` to the
illustrated `intro-house` doodle. Single-file edit + asset cleanup + branch + PR.

## Repo

- Path: `/Users/shannonhecker/Documents/Cursor/Kids-achievement-tracker`
- GitHub: `shannonhecker/weekly-superstar-tracker` (asymmetric to local folder name)
- Stack: Vite 6 + React 18 + Tailwind 3, Vitest 4 (threads pool, not forks), ESM
- Tokens live in shared sibling `~/Documents/Cursor/weekly-superstar-shared`
- Hosting auto-deploys on push to `main` via GitHub Actions

## Hard rules (from `~/.claude/CLAUDE.md` + repo `CLAUDE.md`)

1. **Never push direct to `main`.** Always feature branch + `gh pr create`.
2. **Never auto-merge.** Open the PR, do not run `gh pr merge`. User runs it.
3. **No `firestore.rules` / `storage.rules` / IAM changes** — out of scope here anyway.
4. **No em-dashes (`—`) or en-dashes (`–`) in display copy.**
5. **Tokens-over-literals.** No hex literals — use `colors.earthy.*` via Tailwind aliases (`bg-earthy-*`).
6. **Squash-merge can silently drop changes** — after merge, user verifies on main by `grep`.

## The change

### File 1: `src/pages/SignIn.jsx`

**Line 24** — change the constant:

```diff
-const HERO_BASE = '/onboarding-art/hero/family-hero'
+const HERO_BASE = '/onboarding-art/intro-house'
```

**Line 165** — drop 1200w from srcset (no 1200w variant exists for intro-house, and
the source PNG is only 941px wide so generating one would just upscale). Replace:

```diff
-                srcSet={`${HERO_BASE}-376w.webp 376w, ${HERO_BASE}-768w.webp 768w, ${HERO_BASE}-1200w.webp 1200w`}
+                srcSet={`${HERO_BASE}-376w.webp 376w, ${HERO_BASE}-768w.webp 768w`}
```

**Line 170** — update alt text to match the new image (house + hot-air balloon + tree
illustration, not a board with stars). Replace:

```diff
-                alt="Winking Star family achievement board with stars and pets"
+                alt="Illustrated cozy house with a hot-air balloon floating above"
```

### File 2: `scripts/sync-onboarding-art.mjs`

Remove the manifest entry that copies family-board.png → family-hero.png. Find this entry
in the `MANIFEST` array (around line 30-40):

```js
  {
    from: 'header-art/family-board.png',
    to: 'family-hero.png',
    ...
  },
```

Delete the entire entry (including its `widths`, `subdir` if any). Leave the
rest of the manifest untouched.

### Asset cleanup

Delete the now-orphaned family-hero asset files:

```bash
rm public/onboarding-art/hero/family-hero.png
rm public/onboarding-art/hero/family-hero-376w.webp
rm public/onboarding-art/hero/family-hero-768w.webp
rm public/onboarding-art/hero/family-hero-1200w.webp
rmdir public/onboarding-art/hero/  # only if empty after removals
```

These are the only references to `family-hero` in the repo (already verified via
`grep -rn "family-hero" src/ scripts/`). The PeekBoard.jsx dev route does NOT reference
them.

## Validation

Before pushing:

```bash
cd /Users/shannonhecker/Documents/Cursor/Kids-achievement-tracker
npm run test -- --pool=threads --run    # full suite, should still pass
npm run build                            # vite build, must succeed
```

If a test snapshot or test that asserts the family-hero alt text fails, **update the test**
to match the new alt text — do not revert the swap.

Optional but recommended: spin up `npm run dev`, visit `http://localhost:5173/signin`,
visually confirm:

- Left card shows the illustrated house+balloon on cream background
- No broken image / no 404 in network panel
- Right card (Apple/Google/email toggle) unchanged
- Responsive: at viewport < 1024px the left card hides (it's `hidden lg:flex`)

## Branch + PR

```bash
git checkout -b feat/signin-doodle-house-hero
git add -A
git commit -m "$(cat <<'EOF'
feat(signin): swap family photo hero to illustrated intro-house doodle

User feedback: photographic family-hero on /signin felt out of place against
the rest of the planned onboarding journey's illustrated kawaii-doodle direction.
The iOS intro-* set is the canonical match — same artist, same face grammar,
same earthy palette.

- Point HERO_BASE at /onboarding-art/intro-house
- Drop 1200w from srcset (source PNG is 941px wide; no upscale)
- Update alt text to describe the new illustration
- Remove family-hero entry from sync-onboarding-art manifest
- Delete orphaned family-hero PNG + webp variants

Co-Authored-By: Codex <noreply@openai.com>
EOF
)"
git push -u origin feat/signin-doodle-house-hero

gh pr create --base main --title "feat(signin): swap family photo hero to illustrated intro-house doodle" --body "$(cat <<'EOF'
## Summary

- Swap SignIn left-card hero from photographic `family-hero` to illustrated `intro-house` (iOS canonical doodle set)
- Drop 1200w from srcset (no upscale of 941px source)
- Update alt text + remove orphaned assets

## Why

User feedback on PR-B (#123 / ef2f203): the photographic hero read as "out of place"
against the rest of the onboarding journey's illustrated direction. The four reference
doodles user sent match the iOS `intro-*` set exactly — same artist, same kawaii face
grammar (two-dot eyes + arc mouth + rosy cheeks), same muted earthy palette.

`intro-house` (house + hot-air balloon + tree) is the natural fit for "back to your
family board" register.

## Test plan

- [ ] `npm run test` — full suite green
- [ ] `npm run build` — succeeds
- [ ] Visual: `/signin` left card shows house+balloon doodle on cream BG
- [ ] No 404 in network panel for the hero PNG / WebP variants
- [ ] Right card (Apple/Google/email toggle) unchanged
EOF
)"
```

**Do not merge.** Drop the PR URL back to the user — they merge it.

## Out of scope

- Other onboarding surfaces (Landing, SignUp wizard, Join, ParentConsentGate) — those
  are planned as PR-C/D/E/F per `docs/superpowers/specs/2026-05-29-onboarding-redesign-design.md`.
- Generating new doodle art — using existing on-disk assets only.
- Any change to shared package, firestore.rules, storage.rules, or Functions.
