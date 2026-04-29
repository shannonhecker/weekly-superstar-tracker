# Pet art commission spec — Winking Star

A hand-off doc for whoever produces the custom illustrated pet artwork that will replace the current Microsoft Fluent Emoji set. Out of scope for code-only work; this captures everything needed to brief an illustrator (or AI-image pipeline + cleanup pass).

---

## 1. Why we're commissioning

We currently render every pet via Microsoft Fluent Emoji — broad, recognisable, free, but visually unrelated to our brand. The earthy brand sweep (`shared#3` and downstream) gave us a coherent palette, scene illustrations, and empty-state art. The pets are now the loudest off-brand surface left: they pull the eye away from the cocoa-and-sage system every time a kid opens the app.

Goal: replace the Fluent Emoji pet set with custom illustrated mascots that match the same flat, earthy art language as `src/components/ThemeScene.jsx` and `src/components/EmptyStateScene.jsx`.

---

## 2. Style spec

Match the existing in-app illustration language exactly. Visual references:

- `src/components/ThemeScene.jsx` — the per-theme card-top scenes (football field, dino volcano, ocean waves, etc.)
- `src/components/EmptyStateScene.jsx` — the four onboarding/empty heroes (welcome characters, joining house scene, etc.)
- The brand mood-board image saved at `public/brand/earthy-reference.png` *(pending hand-off)*
- The "Learning Animals" card-style reference at `public/brand/card-style-reference.png` *(pending hand-off)* — the tiger / polar bear / bear / koala mascots in that image are the closest existing analog to what we want.

### Hard rules

- **Flat colour fills.** No outlines. No gradients. No textures.
- **Rounded silhouettes.** Soft blobby bodies, no sharp corners.
- **Eye-dots only.** Two small cocoa circles for eyes. No pupils, no irises, no eyelashes.
- **Optional cheek blush.** A single soft cream circle on each cheek at ~60% opacity is allowed but not required. Use sparingly — a few characters, not all.
- **No mouths by default.** Some characters (e.g. the dragon, the mermaid) may get a single soft cream "smile shape" but most should be face-mute. The reference children's-app mascots almost universally skip mouths.
- **Single composition, no scene.** The pet is the *whole* asset — no background landscape baked in. The app composes scenes around it.
- **Earthy palette only.** Use the cocoa / sage / terracotta / cream / ivory family. See §3 for exact hexes. No pure black, no pure white, no saturated brand colours from the legacy palette.

### Soft preferences

- Feet/legs are usually implied or skipped, not drawn — most characters should look like a soft "blob with a face" not a stylised animal with anatomy.
- Where a feature is iconic to the species (elephant trunk, giraffe neck, peacock tail), include it minimally, in the same flat fill style.
- Body proportions should be cute-leaning: head ≈ 60% of total height, body soft and short.

---

## 3. Palette

Pull all colours from `weekly-superstar-shared/src/tokens/colors.ts` → `colors.earthy`:

| Token | Hex | Use for |
|---|---|---|
| `cocoa` | `#5A3A2E` | Eye-dots, tiny accent details. Never a body fill. |
| `cocoaSoft` | `#8B6651` | Brown body fill (bears, dogs, sloths, owls). |
| `terracotta` | `#D87C4A` | Warm body fill (foxes, lions, deer-tones, dragons). |
| `terracottaSoft` | `#F4C8A8` | Soft warm body fill (kittens, cubs, pink-leaning chars). |
| `sage` | `#9DAC85` | Cool/green body fill (lizards, frogs, turtles, dinos). |
| `sageDeep` | `#6B8060` | Darker green body fill, accents. |
| `cream` | `#F8F1E4` | Highlights, optional cheek blush, white-leaning chars (swan, polar bear, sheep). |
| `ivory` | `#FFFAF0` | Background only — never a body fill (would disappear on the cream cards). |
| `divider` | `#E8DCC4` | Subtle outline accents if absolutely needed. |

Per-character primary colour can be picked by the artist within this palette. Aim for variety across each chain so the four stages don't all read the same colour.

---

## 4. Asset inventory

Source of truth: `weekly-superstar-shared/src/themes.ts` → `PET_CHAINS`.

26 chains × 4 stages = **104 pet illustrations**, plus **10 themed eggs** = **114 total assets**.

### Pet chains (26)

Each chain has 4 stages, ordered hatchling → adult.

| Chain key | Label | Stage 1 | Stage 2 | Stage 3 | Stage 4 |
|---|---|---|---|---|---|
| `cats` | Cat family | kitten | cat | tiger | lion |
| `dogs` | Dog family | puppy | dog | fox | wolf |
| `birds` | Bird family | chick | fledgling | duck | swan |
| `dinos` | Dino family | lizard | croc | T-rex | dragon |
| `sea` | Sea family | fish | dolphin | shark | whale |
| `bugs` | Garden family | caterpillar | snail | bee | butterfly |
| `bears` | Bear family | koala | panda | bear | polar bear |
| `royal` | Royal family | frog prince | princess | crown | castle |
| `space` | Space family | alien | UFO | rocket | star |
| `plants` | Plant family | seedling | herb | blossom | tree |
| `sweets` | Sweet family | cookie | cupcake | cake | slice |
| `weather` | Weather family | droplet | rain cloud | rainbow | sunshine |
| `mythic` | Mythic family | wand | crystal ball | fairy | wizard |
| `robots` | Robot family | gear | robot | mech arm | satellite |
| `vehicles` | Vehicle family | scooter | bike | motorbike | race car |
| `gems` | Treasure family | rock | gem | ring | trophy |
| `balls` | Ball family | soccer ball | basketball | football | rugby |
| `trains` | Train family | steam engine | wagon | tram | bullet train |
| `planes` | Sky family | kite | balloon | plane | helicopter |
| `moons` | Moon family | new moon | crescent | half moon | full moon |
| `sun` | Sunny family | cloudy | partly sunny | smiling sun | sunshine |
| `stars` | Star family | star | glowing star | sparkles | dizzy |
| `phoenix` | Phoenix family | egg | ember | firebird | phoenix |
| `celestial` | Celestial family | galaxy | comet | shooting star | star |
| `mermaid` | Mermaid family | shell | coral | mermaid | ocean |
| `ninja` | Ninja family | ninja | swords | castle | crown |

### Eggs (10)

One themed egg per `THEMES` key — see `EGG_NAMES` in `themes.ts`:

| Theme | Egg name |
|---|---|
| football | Pitch Egg |
| dinosaur | Mint Egg |
| unicorn | Rainbow Egg |
| animals | Cozy Egg |
| rocket | Cosmic Egg |
| princess | Crystal Egg |
| ocean | Tide Egg |
| garden | Bloom Egg |
| robot | Circuit Egg |
| magic | Moonlit Egg |

Each egg is a single illustration: an oval body in the theme's accent colour with one or two small cocoa accent marks (a single squiggle, a tiny crack, two dots). Match the simplicity of the pet asset style — don't over-decorate the eggs.

---

## 5. Technical spec

| Property | Value |
|---|---|
| Format | **SVG** (vector — required so we can recolour and resize without raster artefacts). PNG fallback at 2× density (256×256) optional. |
| Canvas | 256 × 256 viewBox |
| Padding | ~10% of canvas on all sides — character should not touch the edge |
| Transparent background | Yes. The character is the only paint; no background fill. |
| Naming | `pets/<chain-key>/<stage-index>-<name>.svg` (e.g. `pets/cats/0-kitten.svg`, `pets/cats/3-lion.svg`) |
| Eggs | `pets/eggs/<theme-key>.svg` (e.g. `pets/eggs/football.svg`) |
| Optimisation | Run through SVGO before delivery (preserve viewBox, remove metadata). |

Keep paths semantically named where possible (`<g id="body">`, `<g id="eyes">`) so we can target them for theming if needed later.

---

## 6. Where the assets get used in the app

### Current code paths to update once art lands

- `weekly-superstar-shared/src/themes.ts` — `PET_CHAINS` currently stores stage emojis. Add a parallel `assetPath` field per stage so consumers can resolve `pets/cats/0-kitten.svg` instead of `'🐱'`.
- `weekly-superstar-shared/src/themes.ts` — `PET_ASSET` map (emoji → animated Fluent URL) and `animatedFluentUrl()` become deprecated; keep them for one release as a fallback, then remove.
- Tracker (`src/components/MysteryPet.jsx`, `src/components/PetGallery.jsx`, `src/components/WeeklySummary.jsx`, `src/components/Egg.jsx`) — swap `<span>{emoji}</span>` / `<img src={animatedFluentUrl(emoji)}/>` for an `<img src={assetPath}/>` (or a `<Pet>` component that handles the lookup).
- iOS (`weekly-superstar-ios/components/MysteryPet.tsx`, `Egg.tsx`, etc.) — same swap. SVGs render via `react-native-svg` which is already on `15.12.1`.

The egg art slots into the existing `Egg.jsx` / iOS `Egg.tsx` component used at week start.

### Surfaces the assets appear on (so the artist knows the context)

- **MysteryPet card** — large hero on the active-kid card top. ~80×80 visible size, on `cream` (`#F8F1E4`) surface. This is the most-seen surface.
- **PetGallery modal** — past-week pets in a vertical list. ~48×48 thumbnails on `ivory` (`#FFFAF0`) rows.
- **WeeklySummary modal / replay** — celebration moment when a week completes. ~120×120 hero, on `cream` with the per-theme accent border.
- **Print sheet** — printed weekly fridge sheet. Black-and-white friendly is a plus but not required (we can rasterise + grayscale for print).

---

## 7. Delivery checklist

- [ ] 104 pet SVGs delivered at the paths in §4
- [ ] 10 egg SVGs delivered at the paths in §5
- [ ] All assets reviewed against the style rules in §2
- [ ] All assets stay inside the §3 palette (no off-palette colours)
- [ ] All assets pass the §5 technical spec (SVG, 256×256, transparent, optimised)
- [ ] One sample chain delivered first for sign-off (suggest `cats` — kitten/cat/tiger/lion — covers small-to-large body shapes and warm tones) before the full set is produced

---

## 8. Production sequencing (if going incremental)

If 114 assets in one drop is too big a single commission, ship in waves:

1. **Wave A — most-visible chains (24 assets, 6 chains).** `cats`, `dogs`, `bears`, `dinos`, `sea`, `bugs`. Covers the most child-recognisable groups. Land + dogfood for a week.
2. **Wave B — next 10 chains (40 assets).** `birds`, `royal`, `space`, `plants`, `sweets`, `weather`, `mythic`, `robots`, `vehicles`, `gems`.
3. **Wave C — remaining 10 chains (40 assets).** `balls`, `trains`, `planes`, `moons`, `sun`, `stars`, `phoenix`, `celestial`, `mermaid`, `ninja`.
4. **Wave D — 10 eggs.** Can ship in parallel with any wave once the style is locked.

The code can fall back to the existing Fluent emoji rendering for any chain that hasn't received custom art yet, so partial waves don't break the app.

---

## 9. Open questions for the brief

- Do we want any of the chains to share characters (e.g. should the "tiger" stage in `cats` look different from a "tiger" sticker elsewhere)? Default: yes, every chain stage is its own asset.
- Animated variants? The current Fluent set animates on hatch. For now, ship static SVGs + a small CSS-driven "wobble" on hatch is enough.
- Print/B&W version? Default: skip; we'll greyscale at render time.
- Right-to-left mirror needed? Default: no, characters face forward.
