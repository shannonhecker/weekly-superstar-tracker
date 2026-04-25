import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { doc, onSnapshot, collection, query, orderBy, updateDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { auth, db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { THEMES } from '../lib/themes'
import { getCurrentWeek, formatWeekRange, getWeekKey } from '../lib/week'
import KidSwitcher from '../components/KidSwitcher'
import ActivityGrid from '../components/ActivityGrid'
import ShareModal from '../components/ShareModal'
import MysteryPet from '../components/MysteryPet'
import StreakCounter from '../components/StreakCounter'
import BadgeShelf from '../components/BadgeShelf'
import RewardGoal from '../components/RewardGoal'
import ScoreBar from '../components/ScoreBar'
import OfflineBanner from '../components/OfflineBanner'
import KidEditModal from '../components/KidEditModal'
import WeeklySummary from '../components/WeeklySummary'
import { KidAvatar } from '../components/KidAvatar'
import { BirthdayBanner } from '../components/BirthdayBanner'
import { isMuted, setMuted } from '../lib/sounds'
import { assignChainsForBoard, pickFreshChain, PET_CHAINS, stageToChainIdx } from '../lib/themes'
import Logo from '../components/Logo'
import ThemeScene from '../components/ThemeScene'
import EmptyStateScene from '../components/EmptyStateScene'

const HATCH_GOAL = 50

function progressToStage(stars, goal) {
  if (goal <= 0) return 0
  const pct = stars / goal
  if (pct >= 1) return 6
  if (pct >= 5 / 6) return 5
  if (pct >= 4 / 6) return 4
  if (pct >= 3 / 6) return 3
  if (pct >= 2 / 6) return 2
  if (pct >= 1 / 6) return 1
  return 0
}

function emojiForStaged(chainKey, totalStars) {
  const chain = PET_CHAINS[chainKey] || PET_CHAINS.cats
  const stage = progressToStage(totalStars, HATCH_GOAL)
  const idx = stageToChainIdx(stage, chain.stages.length)
  return chain.stages[idx]
}

function totalStarsFor(kid) {
  if (!kid) return 0
  const checks = kid.checks || {}
  const activities = kid.activities || []
  const bonus = kid.bonusStars || {}
  const { days } = getCurrentWeek()
  const checked = activities.reduce(
    (sum, a) => sum + days.filter((d) => checks[`${a.id}-${d.key}`]).length,
    0
  )
  const bonusSum = Object.values(bonus).reduce((s, v) => s + (v || 0), 0)
  return checked + bonusSum
}

export default function Board() {
  const { boardId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [board, setBoard] = useState(null)
  const [kids, setKids] = useState([])
  const [loading, setLoading] = useState(true)
  const [shareOpen, setShareOpen] = useState(false)
  const [editKidOpen, setEditKidOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [muted, setMutedState] = useState(isMuted())
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null) // { kid, archive, weekKey } or null
  const mysteryPetRef = useRef(null)

  const toggleMute = () => {
    const next = !muted
    setMutedState(next)
    setMuted(next)
  }

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'boards', boardId),
      (snap) => {
        if (!snap.exists()) {
          setError('Board not found.')
          setLoading(false)
          return
        }
        setBoard({ id: snap.id, ...snap.data() })
        setLoading(false)
      },
      (err) => { setError(err.code || err.message); setLoading(false) }
    )
    return unsub
  }, [boardId])

  useEffect(() => {
    const q = query(collection(db, 'boards', boardId, 'kids'), orderBy('order'))
    const unsub = onSnapshot(q, (snap) => {
      setKids(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [boardId])

  // Active kid comes from URL — Firestore updates can't reset it.
  const activeKidId = searchParams.get('kid')
  const activeKid = useMemo(
    () => kids.find((k) => k.id === activeKidId) || kids[0] || null,
    [kids, activeKidId]
  )

  const thisWeekKey = getWeekKey()
  // Board-wide unique chain assignment so no two kids share a chain this week.
  const chainAssignment = useMemo(
    () => assignChainsForBoard(kids.map((k) => k.id), thisWeekKey),
    [kids, thisWeekKey]
  )

  useEffect(() => {
    if (!loading && kids.length > 0 && !activeKidId) {
      setSearchParams({ kid: kids[0].id }, { replace: true })
    }
  }, [loading, kids, activeKidId, setSearchParams])

  // Auto-rollover on Monday: when the calendar advances to a new week, archive
  // the outgoing week's pet into weekHistory, reset progress, and assign a fresh
  // chain via pickFreshChain — random but avoids each kid's recent chains AND
  // chains already picked for siblings this week. Preserves last week's pet in
  // weekHistory. When only chainKey is missing (brand-new kid), just set it —
  // no archive.
  useEffect(() => {
    if (loading || kids.length === 0) return
    const usedThisWeek = new Set()
    for (const kid of kids) {
      const weekChanged = kid.weekKey && kid.weekKey !== thisWeekKey
      const chainMissing = !kid.chainKey
      if (!weekChanged && !chainMissing) {
        if (kid.chainKey) usedThisWeek.add(kid.chainKey)
        continue
      }
      const recent = []
      if (kid.chainKey) recent.push(kid.chainKey)
      const history = kid.weekHistory || {}
      const pastKeys = Object.keys(history).sort().slice(-4)
      for (const k of pastKeys) {
        const c = history[k]?.chainKey
        if (c) recent.push(c)
      }
      for (const used of usedThisWeek) recent.push(used)
      const picked = pickFreshChain(recent)
      usedThisWeek.add(picked)
      if (weekChanged) {
        const oldKey = kid.weekKey
        const oldChainKey = kid.chainKey || 'cats'
        const oldStars = totalStarsFor(kid)
        const archive = {
          checks: kid.checks || {},
          stickers: kid.stickers || {},
          totalStars: oldStars,
          petName: kid.petName || null,
          petEmoji: emojiForStaged(oldChainKey, oldStars),
          chainKey: oldChainKey,
        }
        updateDoc(doc(db, 'boards', boardId, 'kids', kid.id), {
          [`weekHistory.${oldKey}`]: archive,
          checks: {},
          stickers: {},
          bonusStars: {},
          petName: null,
          petNameDeclined: false,
          weekKey: thisWeekKey,
          chainKey: picked,
        }).catch(() => {})
      } else {
        updateDoc(doc(db, 'boards', boardId, 'kids', kid.id), {
          chainKey: picked,
          weekKey: thisWeekKey,
        }).catch(() => {})
      }
    }
  }, [loading, kids, thisWeekKey, boardId])

  const onSignOut = async () => {
    await signOut(auth)
    navigate('/', { replace: true })
  }

  // End-of-week summary: when a rollover has just happened, show each kid's recap
  // modal once. We detect "just happened" by looking at the most recent weekHistory
  // entry whose weekKey is BEFORE the current week, and remember the shown entry
  // per (board, kid) in localStorage so it doesn't re-appear on subsequent loads.
  useEffect(() => {
    if (!activeKid || summary) return
    const history = activeKid.weekHistory || {}
    const pastKeys = Object.keys(history).filter((k) => k < thisWeekKey).sort()
    const mostRecent = pastKeys[pastKeys.length - 1]
    if (!mostRecent) return
    const storageKey = `summary-shown-${boardId}-${activeKid.id}`
    let alreadyShown = null
    try { alreadyShown = localStorage.getItem(storageKey) } catch {}
    if (alreadyShown === mostRecent) return
    setSummary({ kid: activeKid, archive: history[mostRecent], weekKey: mostRecent })
  }, [activeKid, thisWeekKey, boardId, summary])

  const dismissSummary = () => {
    // Only record "already-shown" for the auto-fired recap (not replays).
    if (summary && !summary.replay && summary.kid && summary.weekKey) {
      try {
        localStorage.setItem(`summary-shown-${boardId}-${summary.kid.id}`, summary.weekKey)
      } catch {}
    }
    setSummary(null)
  }

  // Replay a past-week recap from the Pet Collection — skips the big fireworks
  // and ignores the "already shown" localStorage guard.
  const replaySummary = (weekKey, archive) => {
    if (!activeKid || !archive || !weekKey) return
    setSummary({ kid: activeKid, archive, weekKey, replay: true })
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse"><Logo size={48} /></div></div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error}</div>
  if (!board) return null

  const activeTheme = activeKid ? (THEMES[activeKid.theme] || THEMES.football) : THEMES.football
  const activeStars = activeKid ? totalStarsFor(activeKid) : 0
  const activeMax = activeKid ? (activeKid.activities || []).length * 7 : 0
  const { monday, sunday } = getCurrentWeek()

  return (
    <div className="relative min-h-screen bg-earthy-ivory px-3 sm:px-4 py-3 sm:py-4 pb-10 font-jakarta">
      {/* Per-kid bg wash — subtle ~8% accent overlay over ivory, fades when switching kids. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 transition-colors duration-500"
        style={{ backgroundColor: `${activeTheme.accent}14` }}
      />
      <div className="relative z-10">
      <OfflineBanner />
      {/* Header */}
      <div className="max-w-2xl lg:max-w-4xl mx-auto flex items-center justify-between gap-2 mb-4">
        <h1 className="text-base sm:text-xl font-extrabold flex items-center gap-2 min-w-0">
          <Logo size={36} className="shrink-0" />
          <span className="text-earthy-cocoa truncate">
            {board.name}
          </span>
        </h1>
        <div className="flex gap-1.5 sm:gap-2 shrink-0 items-center">
          <button
            onClick={() => setShareOpen(true)}
            aria-label="Share"
            className="px-3 sm:px-4 py-1.5 rounded-pill bg-earthy-cream border border-earthy-divider text-xs font-bold text-earthy-cocoa hover:border-earthy-cocoaSoft active:scale-[0.98] transition-all flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-earthy-terracotta"
          >
            🔗<span className="hidden sm:inline"> Share</span>
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="More options"
              aria-expanded={menuOpen}
              style={{ color: '#FFFAF0', backgroundColor: '#5A3A2E' }}
              className="w-9 h-9 rounded-full text-sm font-bold hover:bg-[#4A2E25] active:scale-[0.98] transition-all flex items-center justify-center focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-earthy-terracotta"
            >
              ⋯
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-[90]" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-[100] bg-white rounded-2xl shadow-earthy-pop py-1 min-w-[220px]">
                  {activeKid && (
                    <button
                      onClick={() => { setMenuOpen(false); mysteryPetRef.current?.openGallery() }}
                      className="w-full text-left px-3 py-2.5 text-sm font-bold text-earthy-cocoa hover:bg-earthy-cream flex items-center gap-2"
                    >
                      <span>🏆</span>
                      <span>Pet collection</span>
                    </button>
                  )}
                  {activeKid && (
                    <Link
                      to={`/board/${boardId}/print/${activeKid.id}`}
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-left px-3 py-2.5 text-sm font-bold text-earthy-cocoa hover:bg-earthy-cream flex items-center gap-2"
                    >
                      <span>🖨️</span>
                      <span>Print this week's sheet</span>
                    </Link>
                  )}
                  <button
                    onClick={() => { setMenuOpen(false); toggleMute() }}
                    className="w-full text-left px-3 py-2.5 text-sm font-bold text-earthy-cocoa hover:bg-earthy-cream flex items-center gap-2"
                  >
                    <span>{muted ? '🔇' : '🔊'}</span>
                    <span>{muted ? 'Unmute sounds' : 'Mute sounds'}</span>
                  </button>
                  {user && !user.isAnonymous && (
                    <button
                      onClick={() => { setMenuOpen(false); onSignOut() }}
                      className="w-full text-left px-3 py-2.5 text-sm font-bold text-earthy-cocoa hover:bg-earthy-cream flex items-center gap-2"
                    >
                      <span>↩︎</span>
                      <span>Sign out</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl lg:max-w-4xl mx-auto">
        {kids.length === 0 ? (
          <EmptyState boardId={boardId} />
        ) : (
          <>
            <KidSwitcher kids={kids} activeKidId={activeKid?.id} boardId={boardId} />

            {activeKid && (
              <div
                className="relative overflow-hidden rounded-3xl bg-earthy-cream"
                style={{
                  boxShadow: `inset 0 0 0 1px ${activeTheme.accent}55`,
                }}
              >
                {/* Per-theme illustrated scene — flat, rounded, soft palette
                    art (style references: Indonesian earthy mood board +
                    Learning Animals app). Sits at the top of the card as an
                    ambient backdrop for the kid's identity. */}
                <div
                  aria-hidden
                  className="pointer-events-none w-full"
                  style={{ aspectRatio: '24 / 5' }}
                >
                  <ThemeScene themeKey={activeKid.theme || 'football'} />
                </div>

                <div className="relative p-3 sm:p-4 pt-2 sm:pt-2">
                <BirthdayBanner kid={activeKid} />
                {/* Inner card header — 2-row on mobile, 1-row on sm+ */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <KidAvatar kid={activeKid} size={40} />
                    <h2
                      className="text-xl sm:text-2xl font-extrabold truncate text-earthy-cocoa tracking-tight"
                    >
                      {activeKid.name}
                    </h2>
                    <button
                      onClick={() => setEditKidOpen(true)}
                      aria-label={`Edit ${activeKid.name}`}
                      className="shrink-0 w-8 h-8 rounded-full bg-earthy-ivory text-xs hover:bg-earthy-cream active:scale-95 transition-all flex items-center justify-center"
                      style={{ border: `1px solid ${activeTheme.deeper}66` }}
                    >
                      ✏️
                    </button>
                    {activeKid.custodyLabel && (
                      <span
                        className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: `${activeTheme.accent}33`,
                          color: activeTheme.deeper,
                        }}
                        aria-label={`At ${activeKid.custodyLabel} this week`}
                      >
                        <span className="text-[12px]" aria-hidden>🏠</span>
                        <span className="text-[11px] font-bold truncate max-w-[120px]">
                          {activeKid.custodyLabel}
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="px-3 py-1.5 rounded-pill bg-earthy-ivory text-xs font-bold text-earthy-cocoaSoft shrink-0 border border-earthy-divider">
                    📅 {formatWeekRange(monday, sunday)}
                  </div>
                </div>

                {/* Status cards — 1/2/3-col at sm/md/lg. Badge Shelf joins the row on desktop. */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                  <MysteryPet ref={mysteryPetRef} kid={activeKid} totalStars={activeStars} boardId={boardId} assignedChain={chainAssignment[activeKid.id]} onOpenSummary={replaySummary} />
                  <StreakCounter kid={activeKid} />
                  <div className="hidden lg:block">
                    <BadgeShelf totalStars={activeStars} themeKey={activeKid.theme} kid={activeKid} />
                  </div>
                </div>

                {/* Score bar */}
                <ScoreBar total={activeStars} max={activeMax} theme={activeTheme} />

                {/* Below-fold cards — Badge Shelf shows here on sm/md only, Reward Goal spans on lg */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3 mb-4">
                  <div className="lg:hidden">
                    <BadgeShelf totalStars={activeStars} themeKey={activeKid.theme} kid={activeKid} />
                  </div>
                  <RewardGoal
                    kid={activeKid}
                    boardId={boardId}
                    totalStars={activeStars}
                  />
                </div>

                {/* Activity grid */}
                <ActivityGrid kid={activeKid} boardId={boardId} />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        shareCode={board.shareCode}
      />

      <KidEditModal
        open={editKidOpen}
        onClose={() => setEditKidOpen(false)}
        kid={activeKid}
        kids={kids}
        boardId={boardId}
        onDeleted={(deletedId) => {
          const remaining = kids.filter((k) => k.id !== deletedId)
          if (remaining.length > 0) {
            const next = [...remaining].sort((a, b) => (a.order || 0) - (b.order || 0))[0]
            setSearchParams({ kid: next.id }, { replace: true })
          } else {
            setSearchParams({}, { replace: true })
          }
        }}
      />

      <WeeklySummary
        open={!!summary}
        onClose={dismissSummary}
        kid={summary?.kid}
        archive={summary?.archive}
        weekKey={summary?.weekKey}
        replay={!!summary?.replay}
        onOpenCollection={summary?.replay ? undefined : () => mysteryPetRef.current?.openGallery()}
      />

      <p className="text-center text-earthy-cocoaSoft text-[12px] mt-6 font-semibold">
        💡 Tap a sticker square to mark it. Switch kids with the avatars above.
      </p>
      <p className="text-center text-earthy-cocoaSoft/70 text-[11px] mt-1 font-semibold">
        Pet art:{' '}
        <a href="https://github.com/microsoft/fluentui-emoji" target="_blank" rel="noreferrer" className="underline hover:text-earthy-cocoa">Microsoft Fluent Emoji</a>
        {' '}(MIT)
      </p>
      </div>
    </div>
  )
}

function EmptyState({ boardId }) {
  return (
    <div className="text-center py-6">
      <div className="max-w-md mx-auto mb-4 rounded-3xl overflow-hidden ring-1 ring-earthy-divider bg-earthy-cream">
        <EmptyStateScene variant="no-kids" />
      </div>
      <p className="text-earthy-cocoa font-extrabold text-lg mb-1">
        No superstars yet
      </p>
      <p className="text-earthy-cocoaSoft font-bold mb-5 text-sm">
        Add your first one above using the “+ Add” button.
      </p>
      <KidSwitcher kids={[]} activeKidId={null} boardId={boardId} />
    </div>
  )
}
