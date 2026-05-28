/**
 * Onboarding-art image optimisation pipeline.
 *
 * Reads portrait iOS source PNGs from `public/onboarding-art/_source/`,
 * crops them to landscape (top 600px, full width — captures the mascot +
 * top decorative corners while dropping the iOS empty-middle text-overlay
 * area), writes the cropped landscape PNG to `public/onboarding-art/<key>.png`,
 * and generates 376w + 768w WebP variants for responsive serving.
 *
 * Run via `npm run onboarding:build`.
 *
 * Per-image crop overrides live in CROP_OVERRIDES below — drop a key/value
 * to tune just one image without breaking the others.
 */
import sharp from 'sharp'
import { readdir, stat } from 'node:fs/promises'
import { join, basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const OUT_DIR = join(ROOT, 'public', 'onboarding-art')
const SRC_DIR = join(OUT_DIR, '_source')
const WIDTHS = [376, 768]
const WEBP_QUALITY = 78

// CLI flag parsing — backwards-compatible. Defaults preserve historical
// behaviour exactly (all sources, [376, 768] widths). Flags:
//   --widths 1440,2400   override WIDTHS for this run only
//   --only home-star-hero  process only the source whose basename matches
function parseArgs(argv) {
  const args = { widths: null, only: null }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--widths' && argv[i + 1]) {
      const parsed = argv[i + 1]
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => Number.isFinite(n) && n > 0)
      if (parsed.length > 0) args.widths = parsed
      i++
    } else if (a === '--only' && argv[i + 1]) {
      args.only = argv[i + 1].trim()
      i++
    }
  }
  return args
}

// iOS portrait sources are 941×1672. The mascot + framing decorations live in
// the top ~600px; the lower 1000px is empty negative space designed for iOS
// text overlay. Default crop preserves the framed top.
const DEFAULT_CROP = { left: 0, top: 0, width: 941, height: 600 }

// Per-image overrides — leave empty if DEFAULT_CROP is right for the source.
const CROP_OVERRIDES = {
  // home-star-hero is already a landscape banner (1672×941) — no portrait
  // crop needed, use full source dimensions.
  'home-star-hero': { left: 0, top: 0, width: 1672, height: 941 },
}

async function main() {
  const cli = parseArgs(process.argv.slice(2))
  const widths = cli.widths || WIDTHS

  const entries = await readdir(SRC_DIR)
  let sources = entries.filter((f) => f.endsWith('.png'))

  if (cli.only) {
    sources = sources.filter((f) => basename(f, extname(f)) === cli.only)
    if (sources.length === 0) {
      console.log(`[onboarding] --only "${cli.only}" matched no source PNGs in ${SRC_DIR}`)
      return
    }
  }

  if (sources.length === 0) {
    console.log('[onboarding] no source PNGs found in', SRC_DIR)
    return
  }

  const filterLabel = cli.only ? ` (filtered to "${cli.only}")` : ''
  console.log(`[onboarding] processing ${sources.length} sources from _source/${filterLabel} → landscape PNG + WebP variants at ${widths.join(', ')}w…`)

  let totalGenerated = 0

  for (const file of sources) {
    const srcPath = join(SRC_DIR, file)
    const key = basename(file, extname(file))
    const crop = CROP_OVERRIDES[key] || DEFAULT_CROP

    const meta = await sharp(srcPath).metadata()
    const srcW = meta.width || 0
    const srcH = meta.height || 0

    if (srcW < crop.left + crop.width || srcH < crop.top + crop.height) {
      console.log(`  skip ${key} — source ${srcW}×${srcH} smaller than crop ${crop.left + crop.width}×${crop.top + crop.height}`)
      continue
    }

    // Step 1: write the cropped landscape PNG as the <picture> fallback.
    const outPng = join(OUT_DIR, `${key}.png`)
    await sharp(srcPath)
      .extract(crop)
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(outPng)
    const pngStat = await stat(outPng)
    totalGenerated += pngStat.size
    console.log(`  ✓ ${key}.png  ${(pngStat.size / 1024).toFixed(0)} KB  (${crop.width}×${crop.height} landscape crop)`)

    // Step 2: WebP variants at responsive widths, all from the cropped source.
    for (const width of widths) {
      if (crop.width < width) {
        console.log(`    skip ${key}-${width}w (cropped is only ${crop.width}w)`)
        continue
      }
      const outWebp = join(OUT_DIR, `${key}-${width}w.webp`)
      await sharp(srcPath)
        .extract(crop)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY, effort: 6 })
        .toFile(outWebp)
      const webpStat = await stat(outWebp)
      totalGenerated += webpStat.size
      const pctSmaller = ((1 - webpStat.size / pngStat.size) * 100).toFixed(0)
      console.log(`    ✓ ${key}-${width}w.webp  ${(webpStat.size / 1024).toFixed(0)} KB  (-${pctSmaller}% vs cropped PNG)`)
    }
  }

  console.log()
  console.log(`[onboarding] generated total: ${(totalGenerated / 1024 / 1024).toFixed(2)} MB`)
}

main().catch((err) => {
  console.error('[onboarding] failed:', err)
  process.exit(1)
})
