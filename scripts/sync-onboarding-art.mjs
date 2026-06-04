// scripts/sync-onboarding-art.mjs
//
// One-way sync: iOS canonical onboarding mood assets → web public hero folder.
//
// Usage:
//   npm run sync:art
//
// Sources from ~/Documents/Cursor/weekly-superstar-ios/assets/. For each
// mood asset listed in MANIFEST below, copies the PNG and generates
// responsive WebP variants (376w + 768w + 1200w, quality 78) alongside.
//
// Why a script? So iOS asset refreshes can sync to web in one command —
// nobody has to remember the exact paths or recompress manually.

import sharp from 'sharp'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const IOS_ROOT = path.resolve(
  process.env.HOME,
  'Documents/Cursor/weekly-superstar-ios/assets'
)
const WEB_DEST = path.join(ROOT, 'public/onboarding-art/hero')

// Mood-asset manifest. Each entry copies one iOS PNG to one web target
// and produces WebP variants at the listed widths.
//
// To add a new asset: add an entry. Both `from` and `to` are relative.
const MANIFEST = []

const QUALITY = 78
const EFFORT = 6

async function exists(p) {
  try { await fs.access(p); return true } catch { return false }
}

async function resolveSource(entry) {
  const primary = path.join(IOS_ROOT, entry.from)
  if (await exists(primary)) return primary
  for (const candidate of entry.fallbackChain || []) {
    const p = path.join(IOS_ROOT, candidate)
    if (await exists(p)) {
      console.warn(`[sync:art] WARN: primary missing for ${entry.to}; using fallback ${candidate}`)
      return p
    }
  }
  throw new Error(`[sync:art] No source found for ${entry.to} — checked ${primary} and ${(entry.fallbackChain || []).length} fallbacks`)
}

async function main() {
  await fs.mkdir(WEB_DEST, { recursive: true })

  for (const entry of MANIFEST) {
    const src = await resolveSource(entry)
    const outPng = path.join(WEB_DEST, entry.to)
    const baseName = path.basename(entry.to, '.png')

    // Copy the source PNG verbatim (no re-encode — preserves authoring fidelity).
    await fs.copyFile(src, outPng)
    const { size } = await fs.stat(outPng)
    console.log(`[sync:art] ${entry.to}  ${Math.round(size / 1024)} KB`)

    // Generate WebP variants.
    for (const w of entry.widths) {
      const outWebp = path.join(WEB_DEST, `${baseName}-${w}w.webp`)
      await sharp(src)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: EFFORT })
        .toFile(outWebp)
      const stat = await fs.stat(outWebp)
      console.log(`[sync:art]   ${path.basename(outWebp)}  ${Math.round(stat.size / 1024)} KB`)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
