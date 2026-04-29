Place exact exported banner artwork in this folder. Theme banners must come
from these raster files, not recreated SVG/code art.

Current exact files available to the app:

- `animals.png` (bunny on lavender hills)
- `bear.png`
- `birthday.png`
- `dinosaur.png`
- `fairy.png`
- `football.png`
- `garden.png`
- `magic.png` (stargazing astronaut)
- `ocean.png` (penguin beach)
- `princess.png`
- `robot.png`
- `rocket.png`
- `rugby.png`
- `train.png`
- `unicorn.png`

All 14 themes covered.

Theme-to-image choices:

- `football.png`: soccer pitch / scoreboard / football
- `dinosaur.png`: dinosaur land / volcano / dinosaur
- `unicorn.png`: unicorn castle / waterfall
- `animals.png`: woodland animal scene
- `bear.png`: bear or closest supplied woodland animal scene
- `rocket.png`: space / astronaut / rocket
- `robot.png`: robot / lunar lab
- `ocean.png`: underwater ocean scene
- `garden.png`: garden / bees / flowers
- `train.png`: train station
- `princess.png`: princess castle
- `fairy.png`: fairy village
- `magic.png`: moonlit magic / stargazing scene
- `rugby.png`: rugby field

After adding a PNG, add its static `require` to `BANNER_IMAGES` in
`components/ThemeBannerArt.tsx`. Do not add generated placeholders or fallback
banner drawings.
