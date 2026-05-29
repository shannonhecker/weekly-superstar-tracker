/**
 * Wizard banner peek WebP pipeline.
 *
 * Reads the raw 2400×1280 PNG captures from
 * `public/onboarding-art/peek/<name>.png` (produced by
 * `scripts/capture-banner-peeks.mjs`) and generates responsive WebP
 * variants at 376w + 768w + 1200w alongside them — matching the
 * onboarding hero srcset convention for downstream `<picture>` srcset use.
 *
 * Run via `npm run regen:peek-webp` (after `npm run capture:peeks`).
 *
 * Why 376w + 768w + 1200w:
 *   - 376w covers mobile viewports.
 *   - 768w covers tablets + 2× DPR phones serving the same column.
 *   - 1200w covers desktop and is the full-width hero target.
 *   - Source captures are 2400px wide (1200 logical × DPR 2), so all
 *     three variants downscale cleanly with no upscaling fuzz.
 *
 * WebP quality 78 matches the rest of the project's image pipeline.
 */
import sharp from 'sharp'
import { stat } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const PEEK_DIR = join(ROOT, 'public', 'onboarding-art', 'peek')

const PEEKS = ['board', 'pet', 'reward']
const WIDTHS = [376, 768, 1200]
const WEBP_QUALITY = 78

async function main() {
  console.log(`[peek-webp] generating WebP variants at ${WIDTHS.join(', ')}w for ${PEEKS.length} peek images…`)

  let totalGenerated = 0

  for (const name of PEEKS) {
    const srcPath = join(PEEK_DIR, `${name}.png`)

    let srcStat
    try {
      srcStat = await stat(srcPath)
    } catch (err) {
      console.log(`  skip ${name} — source PNG not found at ${srcPath} (did you run npm run capture:peeks?)`)
      continue
    }

    const meta = await sharp(srcPath).metadata()
    const srcWidth = meta.width || 0

    for (const width of WIDTHS) {
      const outPath = join(PEEK_DIR, `${name}-${width}w.webp`)
      await sharp(srcPath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY, effort: 6 })
        .toFile(outPath)
      const outStat = await stat(outPath)
      totalGenerated += outStat.size
      const note = srcWidth < width ? ` (source ${srcWidth}w, not upscaled)` : ''
      const pctSmaller = ((1 - outStat.size / srcStat.size) * 100).toFixed(0)
      console.log(`  ✓ ${name}-${width}w.webp  ${(outStat.size / 1024).toFixed(0)} KB  (-${pctSmaller}% vs source PNG)${note}`)
    }
  }

  console.log()
  console.log(`[peek-webp] generated total: ${(totalGenerated / 1024).toFixed(0)} KB`)
}

main().catch((err) => {
  console.error('[peek-webp] failed:', err)
  process.exit(1)
})
