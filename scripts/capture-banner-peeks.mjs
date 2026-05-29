// Captures dev/peek/* routes at 1200×640 (web hero target size) with
// deviceScaleFactor 2. Output goes to public/onboarding-art/peek/{name}.png
// without further cropping — PeekBoard renders raw UI filling the viewport
// (no phone bezel per spec Q3).

/**
 * Wizard banner peek capture pipeline.
 *
 * Drives a headless Chromium against the dev-only peek routes
 * (`/dev/peek/board`, `/dev/peek/pet`, `/dev/peek/reward`), screenshots
 * each at 2× DPR, and writes a 2400×1280 PNG to
 * `public/onboarding-art/peek/<name>.png`. The downstream sharp pipeline
 * (`scripts/regen-banner-peek-webp.mjs`) handles the responsive WebP
 * variants — this script's only job is the raw raster capture.
 *
 * Each dev peek route renders PeekBoard — raw web UI filling the viewport
 * at 1200×640 logical (no phone bezel per spec Q3). The route MUST set
 * `[data-peek-ready]` on `<body>` (or a top-level element) once layout +
 * assets are settled — this script waits for that attribute before
 * screenshotting.
 *
 * Capture geometry:
 *   - Viewport: 1200×640 logical (web hero target size)
 *   - DPR: 2 (Retina; output PNGs are 2400×1280 raw pixels)
 *   - No clip — full-viewport screenshot, PeekBoard fills the frame
 *
 * MANUAL FLOW (concurrently is not a project dep, so there's no combined
 * `banner-peeks` script):
 *
 *   1. Start the dev server in a separate terminal:    npm run dev
 *   2. Once Vite is serving on http://localhost:5173:  npm run capture:peeks
 *   3. Then generate the responsive WebP variants:     npm run regen:peek-webp
 *
 * This script assumes the dev server is already running. It will fail
 * fast with a clear error if `localhost:5173` isn't responding.
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const OUT_DIR = join(ROOT, 'public', 'onboarding-art', 'peek')

const PEEKS = ['board', 'pet', 'reward']
const BASE_URL = 'http://localhost:5173/dev/peek'

// Viewport: 1200×640 web hero target size. PeekBoard renders raw UI
// filling the viewport (no phone bezel per spec Q3).
const VIEWPORT = { width: 1200, height: 640 }
const DEVICE_SCALE_FACTOR = 2

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  console.log(`[peeks] launching headless chromium (viewport ${VIEWPORT.width}×${VIEWPORT.height}, DPR ${DEVICE_SCALE_FACTOR}, full-viewport)…`)
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
  })

  try {
    for (const name of PEEKS) {
      const url = `${BASE_URL}/${name}`
      const outPath = join(OUT_DIR, `${name}.png`)

      const page = await context.newPage()
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded' })

        // The dev peek route signals readiness by setting [data-peek-ready]
        // on the body (or any element) once layout + assets are settled.
        await page.waitForSelector('[data-peek-ready]', { timeout: 10_000 })

        // Extra settle for any opening/idle animations.
        await page.waitForTimeout(500)

        await page.screenshot({
          path: outPath,
          fullPage: false,
        })
        console.log(`  ✓ ${name}.png  (${VIEWPORT.width * DEVICE_SCALE_FACTOR}×${VIEWPORT.height * DEVICE_SCALE_FACTOR}px full-viewport)`)
      } finally {
        await page.close()
      }
    }
  } finally {
    await context.close()
    await browser.close()
  }

  console.log(`[peeks] ${PEEKS.length} captures written to ${OUT_DIR}`)
}

main().catch((err) => {
  console.error('[peeks] failed:', err)
  process.exit(1)
})
