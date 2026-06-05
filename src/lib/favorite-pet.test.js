import { describe, it, expect } from 'vitest'
import { nextFavoriteSync } from './favorite-pet'
import { PET_CHAINS, progressToStage, petAtStage, HATCH_GOAL } from './themes'

const WEEK = '2026-W18'

// Pick a chain with multiple stages so we can construct a stale-emoji case.
const CHAIN_KEY = 'cats'
const CHAIN = PET_CHAINS[CHAIN_KEY]
const STAGE_0_EMOJI = CHAIN.stages[0]
const LAST_EMOJI = CHAIN.stages[CHAIN.stages.length - 1]

function makeKid(overrides = {}) {
  return {
    id: 'kid-1',
    weekKey: WEEK,
    chainKey: CHAIN_KEY,
    petName: null,
    ...overrides,
  }
}

describe('nextFavoriteSync', () => {
  it('returns null when kid has no favoritePet', () => {
    expect(nextFavoriteSync(makeKid(), WEEK, 30)).toBeNull()
  })

  it('returns null when favorite is for a different week (past-week is frozen)', () => {
    const kid = makeKid({
      favoritePet: { emoji: STAGE_0_EMOJI, chainLabel: 'Cats', petName: null, weekKey: '2026-W17' },
    })
    expect(nextFavoriteSync(kid, WEEK, HATCH_GOAL)).toBeNull()
  })

  it('returns null when favorite already matches the live pet', () => {
    const stars = HATCH_GOAL
    const liveEmoji = petAtStage(CHAIN_KEY, progressToStage(stars, HATCH_GOAL)).emoji
    const kid = makeKid({
      petName: 'Socks',
      favoritePet: { emoji: liveEmoji, chainLabel: 'Cats', petName: 'Socks', weekKey: WEEK },
    })
    expect(nextFavoriteSync(kid, WEEK, stars)).toBeNull()
  })

  it('returns emoji delta only when emoji drifted (level-up)', () => {
    const stars = HATCH_GOAL
    const liveEmoji = petAtStage(CHAIN_KEY, progressToStage(stars, HATCH_GOAL)).emoji
    const kid = makeKid({
      petName: 'Socks',
      favoritePet: { emoji: STAGE_0_EMOJI, chainLabel: 'Cats', petName: 'Socks', weekKey: WEEK },
    })
    expect(nextFavoriteSync(kid, WEEK, stars)).toEqual({ 'favoritePet.emoji': liveEmoji })
    expect(liveEmoji).not.toBe(STAGE_0_EMOJI)
  })

  it('returns petName delta only when only name drifted (rename)', () => {
    const stars = HATCH_GOAL
    const liveEmoji = petAtStage(CHAIN_KEY, progressToStage(stars, HATCH_GOAL)).emoji
    const kid = makeKid({
      petName: 'Socks',
      favoritePet: { emoji: liveEmoji, chainLabel: 'Cats', petName: null, weekKey: WEEK },
    })
    expect(nextFavoriteSync(kid, WEEK, stars)).toEqual({ 'favoritePet.petName': 'Socks' })
  })

  it('returns both deltas when emoji and petName drift', () => {
    const stars = HATCH_GOAL
    const liveEmoji = petAtStage(CHAIN_KEY, progressToStage(stars, HATCH_GOAL)).emoji
    const kid = makeKid({
      petName: 'Socks',
      favoritePet: { emoji: STAGE_0_EMOJI, chainLabel: 'Cats', petName: 'Whiskers', weekKey: WEEK },
    })
    expect(nextFavoriteSync(kid, WEEK, stars)).toEqual({
      'favoritePet.emoji': liveEmoji,
      'favoritePet.petName': 'Socks',
    })
  })

  it('skips during pending rollover (kid.weekKey lags behind thisWeekKey)', () => {
    const kid = makeKid({
      weekKey: '2026-W17',
      favoritePet: { emoji: STAGE_0_EMOJI, chainLabel: 'Cats', petName: null, weekKey: WEEK },
    })
    expect(nextFavoriteSync(kid, WEEK, HATCH_GOAL)).toBeNull()
  })

  it('returns null when chainKey is missing', () => {
    const kid = makeKid({
      chainKey: undefined,
      favoritePet: { emoji: STAGE_0_EMOJI, chainLabel: 'Cats', petName: null, weekKey: WEEK },
    })
    expect(nextFavoriteSync(kid, WEEK, HATCH_GOAL)).toBeNull()
  })

  it('treats null and undefined petName as equivalent (no spurious write)', () => {
    const stars = HATCH_GOAL
    const liveEmoji = petAtStage(CHAIN_KEY, progressToStage(stars, HATCH_GOAL)).emoji
    const kid = makeKid({
      petName: undefined,
      favoritePet: { emoji: liveEmoji, chainLabel: 'Cats', petName: null, weekKey: WEEK },
    })
    expect(nextFavoriteSync(kid, WEEK, stars)).toBeNull()
  })

  it('uses adult-stage emoji when stars exceed HATCH_GOAL', () => {
    const stars = HATCH_GOAL * 2
    const liveEmoji = petAtStage(CHAIN_KEY, progressToStage(stars, HATCH_GOAL)).emoji
    const kid = makeKid({
      favoritePet: { emoji: STAGE_0_EMOJI, chainLabel: 'Cats', petName: null, weekKey: WEEK },
    })
    expect(liveEmoji).toBe(LAST_EMOJI)
    expect(nextFavoriteSync(kid, WEEK, stars)).toEqual({ 'favoritePet.emoji': LAST_EMOJI })
  })
})
