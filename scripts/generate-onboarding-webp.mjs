/**
 * Onboarding-art image optimisation pipeline.
 *
 * Parallel to generate-banner-webp.mjs but for `public/onboarding-art/`.
 * Reads every PNG in that folder, generates WebP at three widths
 * (376, 768, 1500) for responsive srcset. Source PNGs are kept as the
 * final fallback in the <picture> tag.
 *
 * Run via `npm run onboarding:build`.
 *
 * Quality 78 + effort 6 matches the banner pipeline — visually
 * indistinguishable from source for these illustrations, ~70% smaller.
 */
import sharp from 'sharp'
import { readdir, stat } from 'node:fs/promises'
import { join, basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const SRC_DIR = join(ROOT, 'public', 'onboarding-art')
const WIDTHS = [376, 768, 1500]
const WEBP_QUALITY = 78

async function main() {
  const entries = await readdir(SRC_DIR)
  const sources = entries.filter((f) => f.endsWith('.png') && !f.match(/-(\d+)w\./))

  if (sources.length === 0) {
    console.log('[onboarding] no source PNGs found in', SRC_DIR)
    return
  }

  console.log(`[onboarding] processing ${sources.length} source images at widths ${WIDTHS.join(', ')}…`)

  let totalOriginal = 0
  let totalGenerated = 0

  for (const file of sources) {
    const srcPath = join(SRC_DIR, file)
    const key = basename(file, extname(file))
    const srcStat = await stat(srcPath)
    totalOriginal += srcStat.size

    const meta = await sharp(srcPath).metadata()
    const srcWidth = meta.width || 0

    for (const width of WIDTHS) {
      if (srcWidth < width) {
        console.log(`  skip ${key}-${width}w (source is only ${srcWidth}w)`)
        continue
      }

      const outPath = join(SRC_DIR, `${key}-${width}w.webp`)
      await sharp(srcPath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY, effort: 6 })
        .toFile(outPath)
      const outStat = await stat(outPath)
      totalGenerated += outStat.size
      const pctSmaller = ((1 - outStat.size / srcStat.size) * 100).toFixed(0)
      console.log(`  ✓ ${key}-${width}w.webp  ${(outStat.size / 1024).toFixed(0)} KB  (-${pctSmaller}% vs source)`)
    }
  }

  console.log()
  console.log(`[onboarding] ${sources.length} sources × ${WIDTHS.length} widths = ${sources.length * WIDTHS.length} variants`)
  console.log(`[onboarding] sources total: ${(totalOriginal / 1024 / 1024).toFixed(1)} MB`)
  console.log(`[onboarding] generated total: ${(totalGenerated / 1024 / 1024).toFixed(1)} MB`)
}

main().catch((err) => {
  console.error('[onboarding] failed:', err)
  process.exit(1)
})
