import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import QRCode from 'react-qr-code'
import { colors } from '@weekly-superstar/shared/tokens'
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

const earthy = colors.earthy
const SHEET = {
  card: earthy.card || '#FFFDF7',
  cream: earthy.cream || '#FFFAF0',
  ivory: earthy.ivory || '#F8F1E4',
  cocoa: earthy.cocoa || '#5A3A2E',
  cocoaSoft: earthy.cocoaSoft || '#8B6651',
  divider: earthy.divider || '#E8DCC4',
  dividerCream: earthy.dividerCream || '#F1E5D4',
  sage: earthy.sage || '#9DAC85',
  terracottaSoft: earthy.terracottaSoft || '#F4C8A8',
}

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
      className="absolute left-0 right-0 top-0 flex flex-col gap-[1.4mm] px-[4mm] pt-[2.5mm]"
      style={{ height: `${GRID_TOP_PCT - 6}%` }}
    >
      <div
        className="absolute inset-x-[1.5mm] top-[1.5mm] bottom-[0.5mm] rounded-[5mm]"
        style={{
          background: `linear-gradient(180deg, ${theme.accent}26 0%, ${SHEET.card}00 76%)`,
          border: `1px solid ${SHEET.dividerCream}`,
        }}
      />
      {/* Banner strip — full-bleed theme art, panoramic crop. Animated={false}
          so the particle layer doesn't render at all in print, and the
          @media print rule in AnimatedRasterBanner.css kills the breath
          animation on the <img>. */}
      <div className="relative z-10 flex items-start gap-[3mm] shrink-0" style={{ height: '15.5mm' }}>
        <div
          className="flex-1 min-w-0 overflow-hidden rounded-[4mm]"
          style={{
            height: '100%',
            background: SHEET.cream,
            border: `1px solid ${SHEET.dividerCream}`,
            boxShadow: '0 1.4mm 3.2mm rgba(90, 58, 46, 0.08)',
          }}
        >
          <ThemeBannerArt
            themeKey={themeKey}
            animated={false}
            height="100%"
            objectPosition="center center"
            imageScale={1.08}
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
            border: `1px solid ${SHEET.divider}`,
            boxShadow: '0 1mm 2.6mm rgba(90, 58, 46, 0.10)',
          }}
        >
          <QRCode value={sheetUrl} size={256} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>

      <div
        className="relative z-10 flex-1 min-w-0 flex items-center gap-[2.5mm]"
        style={{ paddingRight: `${METADATA_QR_SIZE_MM + 5}mm` }}
      >
        <div
          className="flex h-[8.2mm] w-[8.2mm] shrink-0 items-center justify-center rounded-[2.6mm] text-[13pt]"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}66, ${SHEET.card})`,
            border: `1px solid ${theme.accent}88`,
            boxShadow: '0 0.7mm 1.4mm rgba(90, 58, 46, 0.08)',
          }}
          aria-hidden="true"
        >
          {theme.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-end gap-[2mm]">
            <div
              className="font-display text-[18pt] font-black leading-none tracking-normal truncate"
              style={{ color: SHEET.cocoa }}
            >
              {kid.name}
            </div>
            <span
              className="mb-[0.2mm] shrink-0 rounded-full px-[2mm] py-[0.6mm] font-body text-[6pt] font-black uppercase tracking-[0.08em]"
              style={{
                color: SHEET.cocoa,
                background: SHEET.cream,
                border: `1px solid ${SHEET.dividerCream}`,
              }}
            >
              Winking Star
            </span>
            <span
              className="h-[1.5mm] w-[1.5mm] rounded-full"
              style={{ background: SHEET.sage }}
              aria-hidden="true"
            />
          </div>
          <div className="mt-[1mm] flex items-center gap-[2.2mm] font-body text-[8.5pt]" style={{ color: SHEET.cocoaSoft }}>
            <span className="font-extrabold" style={{ color: SHEET.cocoa }}>Week of {weekRange}</span>
            <span style={{ color: SHEET.divider }}>·</span>
            <span className="font-bold">
              <span style={{ color: theme.deeper }}>{Math.round(hatchPercent)}%</span>{' '}
              of the way ({totalStarsCopy(hatchPercent)})
            </span>
          </div>
          <div
            className="mt-[1.3mm] h-[1.8mm] overflow-hidden rounded-full"
            style={{
              width: '55mm',
              background: SHEET.cream,
              border: `1px solid ${SHEET.dividerCream}`,
              boxShadow: 'inset 0 0 0 0.2mm rgba(90, 58, 46, 0.03)',
            }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(3, Math.round(hatchPercent))}%`,
                background: `linear-gradient(90deg, ${theme.accent}, ${theme.deeper})`,
              }}
            />
          </div>
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
      className="absolute flex overflow-hidden rounded-t-[3mm]"
      style={{
        top: `${GRID_TOP_PCT - 6}%`,
        left: `${GRID_LEFT_PCT}%`,
        right: `${GRID_RIGHT_PCT}%`,
        height: '6%',
        background: SHEET.card,
        border: `1px solid ${SHEET.dividerCream}`,
        borderBottom: 0,
      }}
    >
      {days.map((d, index) => (
        <div
          key={d.key}
          className="flex-1 flex flex-col items-center justify-center font-body"
          style={{
            color: d.isWeekend ? theme.deeper : SHEET.cocoa,
            background: d.isWeekend ? `${theme.accent}2B` : index % 2 === 0 ? SHEET.card : SHEET.cream,
            borderRight: index < days.length - 1 ? `1px solid ${SHEET.dividerCream}` : 'none',
          }}
        >
          <span className="text-[9pt] font-black leading-none">{d.label}</span>
          <span className="mt-[0.7mm] rounded-full px-[1.8mm] py-[0.4mm] text-[6.5pt] font-extrabold leading-none"
            style={{
              background: d.isWeekend ? SHEET.card : `${theme.accent}1E`,
              color: d.isWeekend ? theme.deeper : SHEET.cocoaSoft,
              border: `1px solid ${SHEET.dividerCream}`,
            }}
          >
            {d.dayNumber}
          </span>
        </div>
      ))}
    </div>
  )
}

function RowLabels({ activities, theme }) {
  return (
    <div
      className="absolute flex flex-col overflow-hidden rounded-l-[3mm]"
      style={{
        top: `${GRID_TOP_PCT}%`,
        left: 0,
        width: `${GRID_LEFT_PCT}%`,
        bottom: `${GRID_BOTTOM_PCT}%`,
        background: SHEET.card,
        border: `1px solid ${SHEET.dividerCream}`,
        borderRight: 0,
      }}
    >
      {activities.map((a, index) => (
        <div
          key={a.id}
          className="flex-1 flex items-center gap-[2mm] px-[3mm]"
          style={{
            minHeight: 0,
            background: index % 2 === 0 ? SHEET.card : SHEET.cream,
            borderBottom: index < activities.length - 1 ? `1px solid ${SHEET.divider}` : 'none',
          }}
        >
          <span
            className="flex h-[7.2mm] w-[7.2mm] flex-shrink-0 items-center justify-center rounded-full text-[12pt]"
            style={{
              background: `${theme.accent}2B`,
              border: `1px solid ${theme.accent}66`,
            }}
          >
            {a.emoji || '⭐'}
          </span>
          <span
            className="font-body font-black text-[9.5pt] leading-tight truncate"
            style={{ color: SHEET.cocoa }}
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
      className="absolute overflow-hidden rounded-br-[3mm]"
      style={{
        top: `${GRID_TOP_PCT}%`,
        left: `${GRID_LEFT_PCT}%`,
        right: `${GRID_RIGHT_PCT}%`,
        bottom: `${GRID_BOTTOM_PCT}%`,
        background: SHEET.card,
      }}
    >
      <div className="grid h-full" style={{ gridTemplateRows: `repeat(${activities.length}, 1fr)` }}>
        {activities.map((a, rowIndex) => (
          <div
            key={a.id}
            className="grid"
            style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
          >
            {days.map((d, dayIndex) => (
              <div
                key={d.key}
                className="relative flex items-center justify-center"
                style={{
                  background: d.isWeekend ? `${theme.accent}22` : rowIndex % 2 === 0 ? '#FFFFFF' : `${SHEET.cream}B3`,
                  borderBottom: rowIndex < activities.length - 1 ? `1px solid ${SHEET.divider}` : 'none',
                  borderRight: dayIndex < days.length - 1 ? `1px solid ${SHEET.divider}` : 'none',
                }}
              >
                <span
                  className="absolute rounded-[2.4mm]"
                  style={{
                    inset: '1.5mm',
                    background: '#FFFFFFCC',
                    border: `1px solid ${d.isWeekend ? `${theme.accent}55` : SHEET.dividerCream}`,
                    boxShadow: 'inset 0 0 0 0.25mm rgba(255, 255, 255, 0.55)',
                  }}
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* Top border for the grid (below day headers) */}
      <div className="absolute inset-0 pointer-events-none border-t-[0.6mm] border-l-[0.6mm]"
        style={{ borderColor: theme.deeper, opacity: 0.86 }}
      />
    </div>
  )
}

function FootCaption() {
  return (
    <div
      className="absolute flex items-center justify-center rounded-full font-body text-[7pt] font-extrabold"
      style={{
        left: '4mm',
        right: '4mm',
        bottom: '0.8mm',
        height: '5.4mm',
        color: SHEET.cocoaSoft,
        background: SHEET.cream,
        border: `1px solid ${SHEET.dividerCream}`,
      }}
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
    <main id="main" className="print-shell min-h-screen flex flex-col items-center gap-6 py-8" style={{ background: SHEET.ivory }}>
      {/* Toolbar — hidden on print */}
      <div className="print-hide flex items-center gap-3 text-sm font-body">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 rounded-pill border font-extrabold transition-colors"
          style={{ color: SHEET.cocoa, background: SHEET.card, borderColor: SHEET.dividerCream }}
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
        className="print-page relative font-body shadow-earthy-lifted"
        style={{
          width: '210mm',
          height: '297mm',
          padding: '8mm',
          background: SHEET.card,
          border: `1px solid ${SHEET.dividerCream}`,
        }}
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-[6mm]"
          style={{
            background: SHEET.card,
            border: `1px solid ${SHEET.dividerCream}`,
            boxShadow: 'inset 0 0 0 1.5mm rgba(255, 250, 240, 0.62)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(180deg, ${SHEET.cream} 0%, ${SHEET.card} 34%, #FFFFFF 100%)`,
            }}
          />
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
