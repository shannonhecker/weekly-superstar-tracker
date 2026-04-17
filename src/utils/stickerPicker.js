// Deterministic sticker picker. For a given (kidId, activityId, day,
// weekKey) tuple we hash into an index of the theme's sticker pool.
// This guarantees:
//   - Same cell shows the same sticker across reloads and devices.
//   - Two kids on the same theme get a different emoji pattern because
//     their kidIds differ in the hash.
//   - A new week (new weekKey) reshuffles naturally - the grid feels
//     fresh on Monday without any backend work.
//
// Uses FNV-1a because it's ~10 lines and good enough for balanced bucket
// distribution on short strings - we don't need cryptographic quality.

function fnv1a(str) {
  let h = 0x811c9dc5 >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

export function pickSticker(kidId, activityId, day, weekKey, pool) {
  if (!pool || pool.length === 0) return ''
  const key = `${kidId || ''}|${activityId || ''}|${day || ''}|${weekKey || ''}`
  return pool[fnv1a(key) % pool.length]
}
