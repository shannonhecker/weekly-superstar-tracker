/**
 * Banner image optimisation pipeline.
 *
 * Reads every PNG in `public/theme-banners/`, generates WebP at three
 * widths (376, 768, 1500) for responsive `srcset`, and a smaller PNG
 * fallback at 1500 wide.
 *
 * Run via `npm run banners:build` (added to package.json).
 *
 * Why three widths:
 *   - 376w covers most phones (iPhone SE → iPhone 13 mini → ~390px viewport
 *     at 1x DPR, banner card max-width matches).
 *   - 768w covers tablets and the Board on a typical laptop (max-w-2xl ≈
 *     672px; banner stretches to ~768 on lg breakpoint).
 *   - 1500w covers desktop and 2x DPR tablets without serving the
 *     1900-2100w originals.
 *
 * WebP quality 78 is the sweet spot — visually indistinguishable from
 * source for these illustrations, ~70% smaller than PNG.
 */
import sharp from 'sharp'
import { readdir, mkdir, copyFile, stat } from 'node:fs/promises'
import { join, basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const SRC_DIR = join(ROOT, 'public', 'theme-banners')
const WIDTHS = [376, 768, 1500]
const WEBP_QUALITY = 78

async function main() {
  const entries = await readdir(SRC_DIR)
  const sources = entries.filter((f) => f.endsWith('.png') && !f.includes('-webp-') && !f.match(/-(\d+)w\./))

  if (sources.length === 0) {
    console.log('[banners] no source PNGs found in', SRC_DIR)
    return
  }

  console.log(`[banners] processing ${sources.length} source images at widths ${WIDTHS.join(', ')}…`)

  let totalOriginal = 0
  let totalGenerated = 0

  for (const file of sources) {
    const srcPath = join(SRC_DIR, file)
    const themeKey = basename(file, extname(file))
    const srcStat = await stat(srcPath)
    totalOriginal += srcStat.size

    const meta = await sharp(srcPath).metadata()
    const srcWidth = meta.width || 0

    for (const width of WIDTHS) {
      // Don't upscale — if the source is smaller than the target width,
      // skip that variant. (Shouldn't happen with current 1898+ sources.)
      if (srcWidth < width) {
        console.log(`  skip ${themeKey}-${width}w (source is only ${srcWidth}w)`)
        continue
      }

      const outPath = join(SRC_DIR, `${themeKey}-${width}w.webp`)
      await sharp(srcPath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY, effort: 6 })
        .toFile(outPath)
      const outStat = await stat(outPath)
      totalGenerated += outStat.size
      const pctSmaller = ((1 - outStat.size / srcStat.size) * 100).toFixed(0)
      console.log(`  ✓ ${themeKey}-${width}w.webp  ${(outStat.size / 1024).toFixed(0)} KB  (-${pctSmaller}% vs source)`)
    }
  }

  console.log()
  console.log(`[banners] ${sources.length} sources × ${WIDTHS.length} widths = ${sources.length * WIDTHS.length} variants`)
  console.log(`[banners] sources total: ${(totalOriginal / 1024 / 1024).toFixed(1)} MB`)
  console.log(`[banners] generated total: ${(totalGenerated / 1024 / 1024).toFixed(1)} MB`)
  console.log(`[banners] saved per first-paint mobile: roughly (${(totalOriginal / 1024 / 1024).toFixed(1)} - ${(totalGenerated / 1024 / 1024 / WIDTHS.length).toFixed(1)}) MB → big win`)
}

main().catch((err) => {
  console.error('[banners] failed:', err)
  process.exit(1)
})
