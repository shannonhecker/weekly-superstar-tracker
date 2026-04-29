import { describe, it, expect } from 'vitest'
import { RARE_STICKERS } from './stickers'

// Single-source-of-truth check (audit Q6, PR #47). RARE_STICKERS used to
// be inlined in 3 components — two as Sets, one as an array, with no
// guarantee they'd stay in sync. Now there's one array.
describe('RARE_STICKERS', () => {
  it('exports an array of unique emoji strings', () => {
    expect(Array.isArray(RARE_STICKERS)).toBe(true)
    expect(RARE_STICKERS.length).toBeGreaterThan(0)
    const unique = new Set(RARE_STICKERS)
    expect(unique.size).toBe(RARE_STICKERS.length)
    for (const emoji of RARE_STICKERS) {
      expect(typeof emoji).toBe('string')
      expect(emoji.length).toBeGreaterThan(0)
    }
  })

  it('is the same set the previous duplicates encoded (8 rares)', () => {
    // The pre-#47 inline copies in ActivityGrid, WeeklySummary, PetGallery
    // all contained these 8 emoji. If a future change adds or removes one,
    // verify the rare-drop probability + WeeklySummary's "rare-found" count
    // still tell the story you want — this assertion is the canary.
    expect(RARE_STICKERS).toEqual(['🌈', '🦄', '🧚', '🪄', '🎆', '💎', '🎇', '🌠'])
  })
})
