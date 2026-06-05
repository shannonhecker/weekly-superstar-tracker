import { petAtStage, progressToStage, HATCH_GOAL } from './themes'

// Decide whether a kid's favoritePet snapshot is stale relative to the live
// current-week pet, and if so return the Firestore field-delta to write.
// When favoritePet.weekKey === thisWeekKey, the favorite IS the current pet,
// so it must follow level-ups (emoji) and renames (petName). Past-week
// favorites are frozen by design.
export function nextFavoriteSync(kid, thisWeekKey, totalStars) {
  const fav = kid?.favoritePet
  if (!fav) return null
  if (fav.weekKey !== thisWeekKey) return null
  if (kid.weekKey !== thisWeekKey) return null
  const chainKey = kid.chainKey
  if (!chainKey) return null
  const stage = progressToStage(totalStars, HATCH_GOAL)
  const liveEmoji = petAtStage(chainKey, stage).emoji
  if (!liveEmoji) return null
  const livePetName = kid.petName ?? null
  const delta = {}
  if (liveEmoji !== fav.emoji) delta['favoritePet.emoji'] = liveEmoji
  if (livePetName !== (fav.petName ?? null)) delta['favoritePet.petName'] = livePetName
  return Object.keys(delta).length ? delta : null
}
