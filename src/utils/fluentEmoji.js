// Microsoft Fluent UI Emoji 3D PNGs, served via jsDelivr from the
// shuding/fluentui-emoji-unicode mirror (MIT license). Assets are
// addressable by the emoji's unicode codepoints joined with '-', e.g.
// 🐶 -> 1f436_3d.png, 🐾 -> 1f43e_3d.png.
// Variation selectors (U+FE0F) are stripped because the mirror files
// do not include them in their filenames.

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets'

export function emojiToCodepoints(emoji) {
  if (!emoji) return ''
  const cps = []
  for (const char of emoji) {
    const cp = char.codePointAt(0)
    if (cp !== 0xFE0F) {
      cps.push(cp.toString(16).toLowerCase())
    }
  }
  return cps.join('-')
}

export function fluentEmojiUrl(emoji) {
  const cps = emojiToCodepoints(emoji)
  if (!cps) return ''
  return `${CDN_BASE}/${cps}_3d.png`
}
