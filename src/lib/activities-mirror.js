// Mirror a source kid's activities array onto a target kid while preserving
// the target's existing activity IDs where labels match. Activity IDs key
// `checks` and `stickers` (`${activityId}-${dayKey}`), so swapping IDs blindly
// would orphan the target kid's current-week star history. Matching by
// case-insensitive trimmed label keeps history intact for tasks that exist
// on both kids; new-to-target tasks adopt the source's IDs.
//
// Returns a fresh array — does not mutate inputs.
export function mirrorActivitiesForKid(targetActivities, sourceActivities) {
  const target = Array.isArray(targetActivities) ? targetActivities : []
  const source = Array.isArray(sourceActivities) ? sourceActivities : []

  const targetByLabel = new Map()
  for (const a of target) {
    const key = normalizeLabel(a?.label)
    if (!key) continue
    if (!targetByLabel.has(key)) targetByLabel.set(key, a)
  }

  return source.map((src) => {
    const key = normalizeLabel(src?.label)
    const existing = key ? targetByLabel.get(key) : null
    return {
      ...src,
      id: existing?.id ?? src.id,
    }
  })
}

function normalizeLabel(label) {
  if (typeof label !== 'string') return ''
  return label.trim().toLowerCase()
}
