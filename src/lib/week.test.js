import { describe, it, expect } from 'vitest'
import { getCurrentWeek, getWeekKey, formatWeekKey } from './week'

// Week math is the foundation of the streak counter, the activity grid,
// and the per-week pet history. Per audit P5, the streak bug from PR
// #29 was a memoization-induced staleness on top of these helpers — so
// pinning the helpers' contract here protects the data shape that the
// rest of the app builds on.

describe('getCurrentWeek', () => {
  it('returns 7 days, Monday → Sunday', () => {
    const { days } = getCurrentWeek()
    expect(days).toHaveLength(7)
    expect(days[0].label).toBe('Mon')
    expect(days[6].label).toBe('Sun')
  })

  it('uses unique day keys', () => {
    const { days } = getCurrentWeek()
    const keys = new Set(days.map((d) => d.key))
    expect(keys.size).toBe(7)
  })

  it('day.key matches day.label (the format ActivityGrid writes against)', () => {
    const { days } = getCurrentWeek()
    for (const d of days) {
      expect(d.key).toBe(d.label)
    }
  })

  it('exposes a Date for each day', () => {
    const { days } = getCurrentWeek()
    for (const d of days) {
      expect(d.date instanceof Date).toBe(true)
      expect(Number.isFinite(d.date.getTime())).toBe(true)
    }
  })

  it('Monday (days[0]) is on or before today; Sunday (days[6]) is on or after today', () => {
    const { days } = getCurrentWeek()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const mon = new Date(days[0].date)
    mon.setHours(0, 0, 0, 0)
    const sun = new Date(days[6].date)
    sun.setHours(0, 0, 0, 0)
    expect(mon.getTime()).toBeLessThanOrEqual(today.getTime())
    expect(sun.getTime()).toBeGreaterThanOrEqual(today.getTime())
  })

  it('exposes monday + sunday as Date objects', () => {
    const { monday, sunday } = getCurrentWeek()
    expect(monday instanceof Date).toBe(true)
    expect(sunday instanceof Date).toBe(true)
    // sunday is exactly 6 days after monday
    const diff = (sunday.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24)
    expect(diff).toBe(6)
  })
})

describe('getWeekKey', () => {
  it('returns YYYY-MM-DD format', () => {
    const key = getWeekKey()
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('matches the Monday of the current week', () => {
    const { monday } = getCurrentWeek()
    const expected = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
    expect(getWeekKey()).toBe(expected)
  })
})

// formatWeekKey wraps the shared `formatWeekRange` so we can pass a
// stored week key (the Monday's ISO date) and get back the same short
// "Mon D–D" / "Mon D – Mon D" label PetGallery shows on archived weeks.
describe('formatWeekKey', () => {
  it('returns the empty string for falsy keys', () => {
    expect(formatWeekKey(null)).toBe('')
    expect(formatWeekKey(undefined)).toBe('')
    expect(formatWeekKey('')).toBe('')
  })

  it('formats a same-month week as "Mon D–D"', () => {
    // 2026-04-13 (Mon) → 2026-04-19 (Sun) — both in April.
    expect(formatWeekKey('2026-04-13')).toBe('Apr 13–19')
  })

  it('formats a cross-month week as "Mon D – Mon D"', () => {
    // 2026-03-30 (Mon) → 2026-04-05 (Sun) — March → April.
    expect(formatWeekKey('2026-03-30')).toBe('Mar 30 – Apr 5')
  })
})
