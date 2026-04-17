// Client-side data export. No network calls; we just serialise the kid
// record into a blob and prompt a download. CSV is flattened per-week.

function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function slug(name) {
  return (name || 'kid').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function exportKidJson(kid) {
  const payload = {
    exportedAt: new Date().toISOString(),
    id: kid.id,
    name: kid.name,
    theme: kid.theme,
    currentWeekKey: kid.weekKey,
    currentScore: Object.values(kid.checks || {}).filter(Boolean).length,
    activities: kid.activities || [],
    checks: kid.checks || {},
    badges: kid.badges || [],
    weekHistory: kid.weekHistory || [],
    reward: kid.reward || null,
  }
  download(
    `${slug(kid.name)}-tracker-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify(payload, null, 2),
    'application/json'
  )
}

export function exportKidCsv(kid) {
  const rows = [
    ['weekKey', 'score', 'date'],
    ...(kid.weekHistory || []).map((h) => [
      h.weekKey || '',
      String(h.score ?? ''),
      h.date || '',
    ]),
  ]
  // Append current week if not already in history
  const currentScore = Object.values(kid.checks || {}).filter(Boolean).length
  if (kid.weekKey) rows.push([kid.weekKey, String(currentScore), '(in progress)'])
  const csv = rows
    .map((r) => r.map((cell) => {
      const s = String(cell)
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }).join(','))
    .join('\n')
  download(
    `${slug(kid.name)}-history-${new Date().toISOString().slice(0, 10)}.csv`,
    csv,
    'text/csv'
  )
}
