import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import QRCode from 'react-qr-code'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import LogoLoader from '../components/LogoLoader'
import ThemeBannerArt from '../components/ThemeBannerArt'
import {
  THEMES,
  PET_CHAINS,
  HATCH_GOAL,
  stageToChainIdx,
  progressToStage,
} from '../lib/themes'
import { formatWeekRange, getWeekKey } from '../lib/week'

// Canonical sheet padding inside the printable page. These percentages MUST
// match GRID_TOP_PADDING / BOTTOM / LEFT / RIGHT in functions/src/sheet-scan.ts
// — the CV pipeline uses them to crop each cell back out of a captured photo.
// Change here ⇒ amend there in the same branch chain.
//
// GRID_TOP_PCT carries: banner (12mm) + title row + subtitle, plus a 6%
// strip below for the day-of-week column headers (ColumnHeaders is absolutely
// positioned at top: GRID_TOP_PCT - 6%).
const GRID_TOP_PCT = 18
const GRID_BOTTOM_PCT = 4
const GRID_LEFT_PCT = 18
const GRID_RIGHT_PCT = 4

// Single metadata QR sized for reliable detection from a phone photo. Its
// canonical position on the sheet (top-right corner of the header band) is
// fixed so the CV pipeline can bootstrap the sheet's bounding box from the
// QR's own four detected corners + this known position.
const METADATA_QR_SIZE_MM = 24
const METADATA_QR_QUIET_MM = 2

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function weekKeyToDays(weekKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekKey)) return []
  const monday = new Date(`${weekKey}T00:00:00Z`)
  if (Number.isNaN(monday.getTime())) return []
  return DAY_LABELS.map((label, i) => {
    const d = new Date(monday)
    d.setUTCDate(monday.getUTCDate() + i)
    return {
      label,
      date: d,
      key: d.toISOString().slice(0, 10),
      dayNumber: d.getUTCDate(),
      isWeekend: i >= 5,
    }
  })
}

// QR payload — uses the live https URL of the print page itself so any
// camera or scanner shows a clickable, human-readable target. The previous
// custom `weeklysuperstar://` scheme failed in generic camera apps (they
// reported "no data") because the OS can't open an unknown scheme. The CV
// pipeline parses boardId / kidId / weekKey out of the URL path + query,
// so functionality is preserved while gaining universal scannability.
const PRINT_SHEET_BASE_URL = 'https://weekly-superstar-tracker.web.app'

function buildSheetUrl(boardId, kidId, weekKey) {
  const params = new URLSearchParams({ week: weekKey })
  return `${PRINT_SHEET_BASE_URL}/board/${boardId}/print/${kidId}?${params.toString()}`
}

function Header({ kid, theme, weekRange, hatchPercent, sheetUrl, themeKey }) {
  return (
    <div
      className="absolute left-0 right-0 top-0 flex flex-col gap-[2mm] px-[4mm] pt-[3mm]"
      style={{ height: `${GRID_TOP_PCT - 6}%` }}
    >
      {/* Banner strip — full-bleed theme art, panoramic crop. Animated={false}
          so the particle layer doesn't render at all in print, and the
          @media print rule in AnimatedRasterBanner.css kills the breath
          animation on the <img>. */}
      <div className="flex items-stretch gap-[3mm] shrink-0" style={{ height: '12mm' }}>
        <div className="flex-1 min-w-0 rounded-[1.5mm] overflow-hidden">
          <ThemeBannerArt
            themeKey={themeKey}
            animated={false}
            height="100%"
            objectPosition="center top"
          />
        </div>
        {/* Single metadata QR — encodes board / kid / week. The CV pipeline
            (functions/src/sheet-scan.ts) uses jsqr's corner detection from
            this one QR + its canonical position to bootstrap the sheet's
            bounding box. No corner fiducials. Sized 24mm but reaches wider
            via padding so it always sits flush right. */}
        <div
          className="bg-white flex flex-col items-center justify-center shrink-0 rounded-[2mm]"
          style={{
            width: `${METADATA_QR_SIZE_MM}mm`,
            height: `${METADATA_QR_SIZE_MM}mm`,
            padding: `${METADATA_QR_QUIET_MM}mm`,
            border: '1px solid #E8DCC4', // earthy-divider
          }}
        >
          <QRCode value={sheetUrl} size={256} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>

      {/* Title row beneath the banner — softer gradient (theme accent → deeper),
          no amber/pink. Hatch progress sits inline with the week range. */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div
          className="font-display text-[22pt] leading-none truncate"
          style={{
            // backgroundImage (NOT background shorthand) — the shorthand
            // resets background-clip, which silently kills the text mask
            // and leaves the heading invisible.
            backgroundImage: `linear-gradient(90deg, ${theme.accent} 0%, ${theme.deeper} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: theme.deeper,
          }}
        >
          {theme.emoji} {kid.name}
        </div>
        <div className="font-body text-[9pt] mt-[1mm] flex items-center gap-[3mm]" style={{ color: '#5A3A2E' /* earthy-cocoa */ }}>
          <span>Week of {weekRange}</span>
          <span style={{ color: '#E8DCC4' /* earthy-divider */ }}>·</span>
          <span>
            <span className="font-bold" style={{ color: theme.deeper }}>
              {Math.round(hatchPercent)}%
            </span>{' '}
            of the way to a new pet ({totalStarsCopy(hatchPercent)})
          </span>
        </div>
      </div>
    </div>
  )
}

// Tiny helper so the copy reads "23 / 60 stars" alongside the percent. Pulls
// HATCH_GOAL from shared so today's bump 50→60 reflects automatically.
function totalStarsCopy(hatchPercent) {
  const stars = Math.round((hatchPercent / 100) * HATCH_GOAL)
  return `${stars} / ${HATCH_GOAL} stickers`
}

function ColumnHeaders({ days, theme }) {
  return (
    <div
      className="absolute flex"
      style={{
        top: `${GRID_TOP_PCT - 6}%`,
        left: `${GRID_LEFT_PCT}%`,
        right: `${GRID_RIGHT_PCT}%`,
        height: '6%',
      }}
    >
      {days.map((d) => (
        <div
          key={d.key}
          className="flex-1 flex flex-col items-center justify-end pb-[1.5mm] font-body"
          style={{ color: d.isWeekend ? theme.deeper : '#5A3A2E' /* earthy-cocoa */ }}
        >
          <span className="text-[9pt] font-bold leading-none">{d.label}</span>
          <span className="text-[7pt] leading-none mt-[0.5mm] opacity-70">{d.dayNumber}</span>
        </div>
      ))}
    </div>
  )
}

function RowLabels({ activities, theme }) {
  return (
    <div
      className="absolute flex flex-col"
      style={{
        top: `${GRID_TOP_PCT}%`,
        left: 0,
        width: `${GRID_LEFT_PCT}%`,
        bottom: `${GRID_BOTTOM_PCT}%`,
      }}
    >
      {activities.map((a) => (
        <div
          key={a.id}
          className="flex-1 flex items-center gap-[1.5mm] px-[3mm]"
          style={{ minHeight: 0, borderBottom: '1px solid #E8DCC4' /* earthy-divider */ }}
        >
          <span className="text-[14pt] flex-shrink-0">{a.emoji || '⭐'}</span>
          <span
            className="font-body font-bold text-[10pt] leading-tight truncate"
            style={{ color: theme.deeper }}
          >
            {a.label || 'Activity'}
          </span>
        </div>
      ))}
    </div>
  )
}

function CellGrid({ activities, days, theme }) {
  return (
    <div
      className="absolute"
      style={{
        top: `${GRID_TOP_PCT}%`,
        left: `${GRID_LEFT_PCT}%`,
        right: `${GRID_RIGHT_PCT}%`,
        bottom: `${GRID_BOTTOM_PCT}%`,
      }}
    >
      <div className="grid h-full" style={{ gridTemplateRows: `repeat(${activities.length}, 1fr)` }}>
        {activities.map((a) => (
          <div
            key={a.id}
            className="grid"
            style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
          >
            {days.map((d) => (
              <div
                key={d.key}
                className="flex items-center justify-center"
                style={{
                  background: d.isWeekend ? `${theme.accent}22` : `${theme.accent}0A`,
                  borderBottom: '1px solid #E8DCC4' /* earthy-divider */,
                  borderRight: '1px solid #E8DCC4',
                }}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Top border for the grid (below day headers) */}
      <div className="absolute inset-0 pointer-events-none border-t-2 border-l-2"
        style={{ borderColor: theme.deeper }}
      />
    </div>
  )
}

function FootCaption() {
  return (
    <div
      className="absolute left-0 right-0 flex items-center justify-center font-body text-[7pt]"
      style={{ bottom: '0.5mm', height: '4mm', color: '#8B6651' /* earthy-cocoaSoft */ }}
    >
      Stick a sticker, draw a star, or colour the box — every {HATCH_GOAL} earns a new pet.
    </div>
  )
}

export default function PrintSheet() {
  const { boardId, kidId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const weekKey = searchParams.get('week') || getWeekKey()

  const [board, setBoard] = useState(null)
  const [kid, setKid] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!boardId) return
    const unsub = onSnapshot(
      doc(db, 'boards', boardId),
      (snap) => {
        if (!snap.exists()) {
          setError('Board not found.')
          setLoading(false)
          return
        }
        setBoard({ id: snap.id, ...snap.data() })
      },
      (err) => {
        setError(err.code || err.message)
        setLoading(false)
      },
    )
    return unsub
  }, [boardId])

  useEffect(() => {
    if (!boardId || !kidId) return
    const unsub = onSnapshot(
      doc(db, 'boards', boardId, 'kids', kidId),
      (snap) => {
        if (!snap.exists()) {
          setError('Kid not found on this board.')
          setLoading(false)
          return
        }
        setKid({ id: snap.id, ...snap.data() })
        setLoading(false)
      },
      (err) => {
        setError(err.code || err.message)
        setLoading(false)
      },
    )
    return unsub
  }, [boardId, kidId])

  const days = useMemo(() => weekKeyToDays(weekKey), [weekKey])
  const weekRange = useMemo(() => {
    if (days.length !== 7) return ''
    return formatWeekRange(days[0].date, days[6].date)
  }, [days])

  const theme = useMemo(() => {
    if (!kid) return THEMES.unicorn
    return THEMES[kid.theme] || THEMES.unicorn
  }, [kid])

  const totalStars = useMemo(() => {
    if (!kid) return 0
    const checks = kid.checks || {}
    const activities = kid.activities || []
    const bonus = kid.bonusStars || {}
    const checked = activities.reduce(
      (sum, a) => sum + days.filter((d) => checks[`${a.id}-${d.key}`]).length,
      0,
    )
    const bonusSum = Object.values(bonus).reduce((s, v) => s + (v || 0), 0)
    return checked + bonusSum
  }, [kid, days])

  const hatchPercent = Math.min(100, (totalStars / HATCH_GOAL) * 100)

  if (authLoading || loading) {
    return <LogoLoader label="Loading sheet..." />
  }
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 font-body text-gray-700">
        <div>{error}</div>
        <button onClick={() => navigate(-1)} className="text-sm underline">
          Go back
        </button>
      </div>
    )
  }
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center font-body">
        <Link to="/signin" className="underline">Sign in to print this sheet</Link>
      </div>
    )
  }
  if (!kid || !board) return null

  const activities = (kid.activities || []).slice(0, 10)
  const sheetUrl = buildSheetUrl(boardId, kidId, weekKey)

  return (
    <main id="main" className="print-shell bg-gray-100 min-h-screen flex flex-col items-center gap-6 py-8">
      {/* Toolbar — hidden on print */}
      <div className="print-hide flex items-center gap-3 text-sm font-body">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-1.5 rounded-xl text-white font-bold shadow-card"
          style={{ background: theme.deeper }}
        >
          Print this week
        </button>
      </div>

      {/* The actual A4 sheet — sized in mm so print fidelity matches preview */}
      <div
        className="print-page bg-white shadow-pop relative font-body"
        style={{
          width: '210mm',
          height: '297mm',
          padding: '8mm',
        }}
      >
        <div className="relative w-full h-full">
          <Header
            kid={kid}
            theme={theme}
            themeKey={kid.theme || 'animals'}
            weekRange={weekRange}
            hatchPercent={hatchPercent}
            sheetUrl={sheetUrl}
          />

          {activities.length > 0 ? (
            <>
              <ColumnHeaders days={days} theme={theme} />
              <RowLabels activities={activities} theme={theme} />
              <CellGrid activities={activities} days={days} theme={theme} />
            </>
          ) : (
            <div
              className="absolute font-body flex items-center justify-center"
              style={{
                top: `${GRID_TOP_PCT}%`,
                left: `${GRID_LEFT_PCT}%`,
                right: `${GRID_RIGHT_PCT}%`,
                bottom: `${GRID_BOTTOM_PCT}%`,
                color: '#8B6651' /* earthy-cocoaSoft */,
              }}
            >
              Add activities to {kid.name}'s board first.
            </div>
          )}

          <FootCaption />
        </div>
      </div>
    </main>
  )
}
