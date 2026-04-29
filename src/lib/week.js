import { formatWeekRange } from '@weekly-superstar/shared/week'

export { getCurrentWeek, getWeekKey, formatWeekRange } from '@weekly-superstar/shared/week'

// Format a `weekKey` (the Monday's ISO date stored on archived weeks)
// into the same `Mon 1–7` / `Mon 30 – Apr 5` short range that the live
// week display uses. Wraps the shared `formatWeekRange` so both the
// archive list and the current-week header read identically.
export function formatWeekKey(key) {
  if (!key) return ''
  try {
    const monday = new Date(key + 'T00:00:00')
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return formatWeekRange(monday, sunday)
  } catch {
    return key
  }
}
