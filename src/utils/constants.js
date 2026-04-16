export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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
