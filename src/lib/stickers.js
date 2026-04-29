// Rare sticker emojis — the celebratory ones that drop occasionally
// when a kid checks an activity. Single source of truth so the
// "is rare?" lookup in WeeklySummary / PetGallery and the random-pick
// in ActivityGrid agree on the set.
//
// Array form (not Set) because `randomRare()` indexes into it. Set
// lookup callers use `.includes()` — n=8, perf cost is negligible
// and the lower-API-surface is worth the readability.
export const RARE_STICKERS = ['🌈', '🦄', '🧚', '🪄', '🎆', '💎', '🎇', '🌠']
