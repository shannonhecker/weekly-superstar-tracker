export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const DEFAULT_ACTIVITIES = [
  { id: 'sleep', emoji: '😴', label: 'Good Sleep', color: '#7C6FF7' },
  { id: 'bath', emoji: '🛁', label: 'Good Bath', color: '#4ECDC4' },
  { id: 'teeth', emoji: '🪥', label: 'Brush Teeth', color: '#45B7D1' },
  { id: 'school-book', emoji: '📖', label: 'School Book', color: '#F7B731' },
  { id: 'fun-book', emoji: '📚', label: 'Fun Book', color: '#FC5C65' },
  { id: 'mandarin', emoji: '🀄', label: 'Mandarin', color: '#FF6348' },
  { id: 'walk', emoji: '🚶', label: 'Walk Outside', color: '#26DE81' },
  { id: 'custom', emoji: '⭐', label: 'Special!', color: '#FD9644', isCustom: true },
]

export const MAX_TOTAL = DEFAULT_ACTIVITIES.length * DAYS.length // 56
