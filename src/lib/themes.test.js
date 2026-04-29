import { describe, it, expect } from 'vitest'
import {
  PET_CHAINS,
  PET_ASSET,
  KID_AVATARS,
  ACTIVE_CHAIN_KEYS,
  petAtStage,
  progressToStage,
  stageToChainIdx,
  animatedFluentUrl,
  HATCH_GOAL,
} from './themes'

// petAtStage + progressToStage are how every banner, modal, and
// PET HISTORY row figures out which emoji to show for a kid. The bug
// the user hit on 2026-04-28 (empty PetGallery thumbnail for the
// star pet) was caused by a missing PET_ASSET entry that
// petAtStage didn't surface — these tests pin the contract so the
// next missing entry surfaces as a test fail, not a silent empty box.

describe('progressToStage', () => {
  it('maps 0 stars to stage 0', () => {
    expect(progressToStage(0)).toBe(0)
  })

  it('maps full goal to stage 6 (adult)', () => {
    expect(progressToStage(HATCH_GOAL)).toBe(6)
  })

  it('maps over-goal to stage 6 (capped)', () => {
    expect(progressToStage(HATCH_GOAL * 2)).toBe(6)
  })

  it('maps midway progress to a middle stage', () => {
    const mid = progressToStage(Math.floor(HATCH_GOAL / 2))
    expect(mid).toBeGreaterThan(0)
    expect(mid).toBeLessThan(6)
  })

  it('respects custom goal', () => {
    expect(progressToStage(20, 20)).toBe(6)
    expect(progressToStage(0, 20)).toBe(0)
  })

  it('rejects negative input by clamping to 0', () => {
    expect(progressToStage(-5)).toBe(0)
  })
})

describe('stageToChainIdx', () => {
  it('stage 0 (egg) maps to index 0', () => {
    expect(stageToChainIdx(0, 4)).toBe(0)
  })

  it('stage 6 (adult) maps to last index', () => {
    expect(stageToChainIdx(6, 4)).toBe(3)
  })

  it('returns valid index for any stage 0..6 against typical 4-stage chains', () => {
    for (let s = 0; s <= 6; s++) {
      const idx = stageToChainIdx(s, 4)
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThan(4)
    }
  })
})

describe('petAtStage', () => {
  it('returns the chain stage 0 emoji for stage 1 (just hatched)', () => {
    const result = petAtStage('cats', 1)
    expect(result.emoji).toBe(PET_CHAINS.cats.stages[0])
    expect(result.name).toBe(PET_CHAINS.cats.names[0])
  })

  it('returns the chain final emoji for stage 6 (adult)', () => {
    const lastIdx = PET_CHAINS.cats.stages.length - 1
    const result = petAtStage('cats', 6)
    expect(result.emoji).toBe(PET_CHAINS.cats.stages[lastIdx])
  })

  it('returns chainLabel for the picked chain', () => {
    expect(petAtStage('cats', 1).chainLabel).toBe(PET_CHAINS.cats.label)
  })

  it('falls back gracefully for an unknown chainKey', () => {
    const result = petAtStage('nonsense-chain-name', 1)
    // Should not throw, should return something usable
    expect(result).toBeTruthy()
    expect(typeof result.emoji).toBe('string')
  })

  it('handles all defined chains without throwing', () => {
    for (const chainKey of Object.keys(PET_CHAINS)) {
      for (let stage = 0; stage <= 6; stage++) {
        const out = petAtStage(chainKey, stage)
        expect(out).toBeTruthy()
        expect(typeof out.emoji).toBe('string')
        expect(out.emoji.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('PET_CHAINS data integrity', () => {
  it('every chain has stages and names arrays of equal length', () => {
    for (const [key, chain] of Object.entries(PET_CHAINS)) {
      expect(chain.stages, `${key}.stages`).toBeDefined()
      expect(chain.names, `${key}.names`).toBeDefined()
      expect(chain.stages.length).toBe(chain.names.length)
    }
  })

  it('every chain has a label', () => {
    for (const [key, chain] of Object.entries(PET_CHAINS)) {
      expect(chain.label, `${key}.label`).toBeTruthy()
    }
  })

  it('every chain stage emoji is a non-empty string', () => {
    for (const [key, chain] of Object.entries(PET_CHAINS)) {
      for (const emoji of chain.stages) {
        expect(emoji, `${key}.stages emoji`).toBeTruthy()
        expect(typeof emoji).toBe('string')
      }
    }
  })
})

// PET_ASSET coverage — these tests exist because shared#7 claimed to add
// ⭐ and ✨ to PET_ASSET but the squash-merge dropped them, which silently
// turned Nathan's favourite-pet overlay (and PetGallery thumbnail) into
// empty boxes via the animatedFluentUrl null path. shared#10 restored
// the entries on 2026-04-29; these assertions guard the contract so the
// next squash-drop or chain addition fails CI instead of production.
describe('PET_ASSET coverage', () => {
  it('every active-chain stage emoji has a PET_ASSET entry', () => {
    const missing = []
    for (const chainKey of ACTIVE_CHAIN_KEYS) {
      const chain = PET_CHAINS[chainKey]
      if (!chain) continue
      for (const emoji of chain.stages) {
        if (!PET_ASSET[emoji]) missing.push(`${chainKey}: ${emoji}`)
      }
    }
    expect(missing, 'unmapped chain-stage emojis (would render as empty box)').toEqual([])
  })

  it('every KID_AVATAR emoji has a PET_ASSET entry', () => {
    const missing = (KID_AVATARS || []).filter((emoji) => !PET_ASSET[emoji])
    expect(missing, 'unmapped kid-avatar emojis (would fall back to plain text)').toEqual([])
  })

  it('animatedFluentUrl returns a non-null URL for every active-chain stage', () => {
    const broken = []
    for (const chainKey of ACTIVE_CHAIN_KEYS) {
      const chain = PET_CHAINS[chainKey]
      if (!chain) continue
      for (const emoji of chain.stages) {
        const url = animatedFluentUrl(emoji)
        if (!url) broken.push(`${chainKey}: ${emoji}`)
      }
    }
    expect(broken, 'animatedFluentUrl returned null — BannerPet + PetGallery would render empty').toEqual([])
  })

  it('explicit regression guard: the stars chain (⭐ 🌟 ✨ 💫) is fully mapped', () => {
    // Pin the exact emoji set from the bug report so a future "modernise
    // the stars chain" PR notices if it removes one of these entries.
    expect(PET_ASSET['⭐']).toBeDefined()
    expect(PET_ASSET['🌟']).toBeDefined()
    expect(PET_ASSET['✨']).toBeDefined()
    expect(PET_ASSET['💫']).toBeDefined()
  })
})
