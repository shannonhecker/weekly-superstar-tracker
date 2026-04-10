export function getPetState(score, theme) {
  return theme.petStates.find((p) => score >= p.min && score <= p.max) || theme.petStates[0]
}

export function getBadge(score, theme) {
  const bi = theme.badgeIcons
  if (score >= 50) return { icon: bi.diamond, label: 'Diamond', color: '#B388FF', glow: '#B388FF55' }
  if (score >= 40) return { icon: bi.gold, label: 'Gold', color: '#FFD700', glow: '#FFD70055' }
  if (score >= 30) return { icon: bi.silver, label: 'Silver', color: '#C0C0C0', glow: '#C0C0C055' }
  if (score >= 15) return { icon: bi.bronze, label: 'Bronze', color: '#CD7F32', glow: '#CD7F3255' }
  return null
}

export function initChecks(activities, days) {
  const s = {}
  activities.forEach((a) => days.forEach((d) => (s[`${a.id}-${d}`] = false)))
  return s
}

export function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable
  }
}
