export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const DEFAULT_ACTIVITIES = [
  { id: 'sleep', emoji: '😴', label: 'Good Sleep', color: '#7C6FF7' },
  { id: 'bath', emoji: '🛁', label: 'Good Bath', color: '#4ECDC4' },
  { id: 'teeth', emoji: '🪥', label: 'Brush Teeth', color: '#45B7D1' },
  { id: 'breakfast', emoji: '🍳', label: 'Eat Breakfast Nicely', color: '#FF9F43' },
  { id: 'shoes', emoji: '👟', label: 'Shoes On Quickly', color: '#EE5A24' },
  { id: 'school-book', emoji: '📖', label: 'School Book', color: '#F7B731' },
  { id: 'fun-book', emoji: '📚', label: 'Fun Book', color: '#FC5C65' },
  { id: 'mandarin', emoji: '🀄', label: 'Mandarin', color: '#FF6348' },
  { id: 'walk', emoji: '🚶', label: 'Walk Outside', color: '#26DE81' },
  { id: 'custom', emoji: '⭐', label: 'Special!', color: '#FD9644', isCustom: true },
]

export const MAX_TOTAL = DEFAULT_ACTIVITIES.length * DAYS.length // 56

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function getCurrentWeekDates() {
  const now = new Date()
  const day = now.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset)

  return DAYS.map((label, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return {
      key: label,
      label,
      date: d.getDate(),
      month: MONTH_NAMES[d.getMonth()],
      monthNum: d.getMonth() + 1,
      full: d,
    }
  })
}

export function getWeekKey() {
  const dates = getCurrentWeekDates()
  const mon = dates[0].full
  return `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, '0')}-${String(mon.getDate()).padStart(2, '0')}`
}

export function getWeekRangeLabel() {
  const dates = getCurrentWeekDates()
  const mon = dates[0]
  const sun = dates[6]
  if (mon.monthNum === sun.monthNum) {
    return `${mon.month} ${mon.date}–${sun.date}`
  }
  return `${mon.month} ${mon.date} – ${sun.month} ${sun.date}`
}
