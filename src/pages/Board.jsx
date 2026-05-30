import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { doc, onSnapshot, collection, query, orderBy, updateDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { auth, db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { colors } from '@weekly-superstar/shared/tokens'
import { THEMES } from '../lib/themes'
import { getCurrentWeek, formatWeekRange, getWeekKey } from '../lib/week'
import KidSwitcher from '../components/KidSwitcher'
import ActivityGrid from '../components/ActivityGrid'
import ActivitiesModal from '../components/ActivitiesModal'
import ShareModal from '../components/ShareModal'
import MysteryPet from '../components/MysteryPet'
import StreakCounter from '../components/StreakCounter'
import BadgeShelf, { BADGE_TIERS } from '../components/BadgeShelf'
import RewardGoal from '../components/RewardGoal'
import ScoreBar from '../components/ScoreBar'
import OfflineBanner from '../components/OfflineBanner'
import KidEditModal from '../components/KidEditModal'
import Modal from '../components/Modal'
import Icon from '../components/Icon'
import { useToast } from '../contexts/ToastContext'
import { consumeUpgradeFlag } from '../lib/upgrade-flag'
import { deleteAccountCascade, deletionRequiresPassword } from '../lib/deleteAccount'
import { formatAuthError } from '../lib/authErrors'
import WeeklySummary from '../components/WeeklySummary'
import { KidAvatar } from '../components/KidAvatar'
import { BirthdayBanner } from '../components/BirthdayBanner'
import { isMuted, setMuted } from '../lib/sounds'
import { assignChainsForBoard, pickFreshChain, PET_CHAINS, stageToChainIdx } from '../lib/themes'
import Logo from '../components/Logo'
import LogoLoader from '../components/LogoLoader'
import ThemeScene from '../components/ThemeScene'
import EmptyStateScene from '../components/EmptyStateScene'
import { ACHIEVEMENTS, evaluateAchievements } from '../lib/achievements'

const HATCH_GOAL = 60

const BOARD_SECTIONS = [
  { id: 'top', label: 'Home', icon: 'home' },
  { id: 'activity', label: 'Activities', icon: 'tasks' },
  { id: 'treasure-progress', label: 'Stars & Pet', icon: 'reward' },
]

function boardSectionFromPath(pathname) {
  const section = pathname.split('/').filter(Boolean)[2]
  if (section === 'activity') return 'activity'
  if (section === 'treasure' || section === 'progress') return 'treasure-progress'
  if (section === 'more') return 'top'
  return 'top'
}

function boardSectionHref(boardId, sectionId, kidId) {
  const params = kidId ? `?kid=${encodeURIComponent(kidId)}` : ''
  const hash = sectionId && sectionId !== 'top' ? `#${sectionId}` : ''
  return `/board/${boardId}${params}${hash}`
}

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

function totalActivityCapFor(kid) {
  if (!kid) return 0
  return (kid.activities || []).reduce((sum, a) => {
    const scheduled = a.daysOfWeek
    return sum + (scheduled && scheduled.length > 0 ? scheduled.length : 7)
  }, 0)
}

function isActivityScheduledForDay(daysOfWeek, isoIndex) {
  return !daysOfWeek || daysOfWeek.length === 0 || daysOfWeek.includes(isoIndex)
}

function getTodayStats(kid) {
  const { days } = getCurrentWeek()
  const today = new Date()
  const todayIndex = days.findIndex((d) => d.date.toDateString() === today.toDateString())
  const safeTodayIndex = todayIndex >= 0 ? todayIndex : 0
  const day = days[safeTodayIndex]
  const isoIndex = safeTodayIndex + 1
  const checks = kid?.checks || {}
  const activities = kid?.activities || []
  const scheduledActivities = activities.filter((activity) => isActivityScheduledForDay(activity.daysOfWeek, isoIndex))
  const doneActivities = scheduledActivities.filter((activity) => checks[`${activity.id}-${day.key}`])

  return {
    day,
    done: doneActivities.length,
    total: scheduledActivities.length,
    scheduledActivities,
    doneActivities,
  }
}

function getWeeklyBreakdown(kid) {
  const { days } = getCurrentWeek()
  const checks = kid?.checks || {}
  const activities = kid?.activities || []
  return days.map((day, index) => {
    const scheduled = activities.filter((activity) => isActivityScheduledForDay(activity.daysOfWeek, index + 1))
    const done = scheduled.filter((activity) => checks[`${activity.id}-${day.key}`]).length
    return {
      day,
      done,
      total: scheduled.length,
    }
  })
}

function getRecentCelebrations(kid, limit = 6) {
  const { days } = getCurrentWeek()
  const checks = kid?.checks || {}
  const stickers = kid?.stickers || {}
  const activities = kid?.activities || []
  const items = []

  activities.forEach((activity) => {
    days.forEach((day, dayIndex) => {
      const key = `${activity.id}-${day.key}`
      if (!checks[key]) return
      items.push({
        key,
        dayIndex,
        dayLabel: day.label,
        label: activity.label || 'Activity',
        sticker: stickers[key] || activity.emoji || '⭐',
      })
    })
  })

  return items.sort((a, b) => b.dayIndex - a.dayIndex).slice(0, limit)
}

function getDiscoveryEntries(kid, limit = 4) {
  return Object.entries(kid?.weekHistory || {})
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, limit)
    .map(([weekKey, archive]) => ({ weekKey, archive }))
}

export default function Board() {
  const { boardId } = useParams()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [board, setBoard] = useState(null)
  const [kids, setKids] = useState([])
  const [loading, setLoading] = useState(true)
  const [shareOpen, setShareOpen] = useState(false)
  const [editKidOpen, setEditKidOpen] = useState(false)
  const [tasksOpen, setTasksOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [signOutOpen, setSignOutOpen] = useState(false)
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [shareGateOpen, setShareGateOpen] = useState(false)
  const toast = useToast()
  const isAnonymous = !!user?.isAnonymous

  // Show a one-shot success toast on the first Board render after a
  // successful guest-to-account upgrade. Flag is set in SignUp's upgrade
  // branches (linkWithCredential / linkWithPopup) and consumed exactly once
  // here. Empty deps — runs at mount only.
  useEffect(() => {
    if (consumeUpgradeFlag()) {
      toast.success('Your board is saved.')
    }
  }, [toast])
  const [muted, setMutedState] = useState(isMuted())
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null) // { kid, archive, weekKey } or null
  const [pendingGalleryOpen, setPendingGalleryOpen] = useState(false)
  const mysteryPetRef = useRef(null)
  const legacySection = boardSectionFromPath(location.pathname)

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
    if (loading || kids.length === 0) return
    const activeKidExists = activeKidId && kids.some((kid) => kid.id === activeKidId)
    if (activeKidExists) return
    const next = new URLSearchParams(searchParams)
    next.set('kid', kids[0].id)
    navigate(`${location.pathname}?${next.toString()}${location.hash}`, { replace: true })
  }, [loading, kids, activeKidId, searchParams, location.pathname, location.hash, navigate])

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
        const rolloverFields = {
          [`weekHistory.${oldKey}`]: archive,
          checks: {},
          stickers: {},
          bonusStars: {},
          petName: null,
          petNameDeclined: false,
          weekKey: thisWeekKey,
          chainKey: picked,
        }
        // Defensive log so we can confirm in browser devtools that a chain
        // transition actually writes `petName: null` + `petNameDeclined: false`
        // to Firestore. If the naming modal fails to re-fire after rollover,
        // check this log first — both fields must appear in the write.
        // Fires once per kid per week-change, so noise is minimal.
        // eslint-disable-next-line no-console
        console.log('[Board] rollover update', {
          kidId: kid.id,
          fromWeekKey: oldKey,
          toWeekKey: thisWeekKey,
          fromChainKey: oldChainKey,
          toChainKey: picked,
          fieldsWritten: {
            petName: rolloverFields.petName,
            petNameDeclined: rolloverFields.petNameDeclined,
            chainKey: rolloverFields.chainKey,
            weekKey: rolloverFields.weekKey,
          },
        })
        updateDoc(doc(db, 'boards', boardId, 'kids', kid.id), rolloverFields).catch((err) => {
          // eslint-disable-next-line no-console
          console.warn('[Board] rollover write failed (kid', kid.id + ')', err)
        })
      } else {
        updateDoc(doc(db, 'boards', boardId, 'kids', kid.id), {
          chainKey: picked,
          weekKey: thisWeekKey,
        }).catch((err) => {
          // eslint-disable-next-line no-console
          console.warn('[Board] chain/week update failed (kid', kid.id + ')', err)
        })
      }
    }
  }, [loading, kids, thisWeekKey, boardId])

  const onSignOut = async () => {
    await signOut(auth)
    navigate('/', { replace: true })
  }

  const needsDeletePassword = deletionRequiresPassword(user)
  const onDeleteAccount = async () => {
    if (!user || deleteBusy) return
    setDeleteError('')
    if (needsDeletePassword && !deletePassword) {
      setDeleteError('Enter your password to confirm.')
      return
    }
    setDeleteBusy(true)
    try {
      await deleteAccountCascade(user, deletePassword)
      toast.success('Your account and saved family data were deleted.')
      navigate('/', { replace: true })
    } catch (err) {
      setDeleteError(formatAuthError(err))
    } finally {
      setDeleteBusy(false)
    }
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
    // localStorage can throw in private mode / quota-full — losing the
    // "summary already shown" flag is harmless (worst case: the recap
    // shows once more on the next visit), so swallow silently.
    try { alreadyShown = localStorage.getItem(storageKey) } catch {}
    if (alreadyShown === mostRecent) return
    setSummary({ kid: activeKid, archive: history[mostRecent], weekKey: mostRecent })
  }, [activeKid, thisWeekKey, boardId, summary])

  const dismissSummary = () => {
    // Only record "already-shown" for the auto-fired recap (not replays).
    if (summary && !summary.replay && summary.kid && summary.weekKey) {
      // Same fire-and-forget rationale as the corresponding getItem above.
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

  const openShare = () => {
    if (isAnonymous) {
      setShareGateOpen(true)
      return
    }
    setShareOpen(true)
  }

  const requestDeleteAccount = () => {
    setDeletePassword('')
    setDeleteError('')
    setDeleteAccountOpen(true)
  }

  const scrollToSection = (sectionId, focus = true) => {
    const element = document.getElementById(sectionId)
    if (!element) return
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (focus) {
      requestAnimationFrame(() => element.focus({ preventScroll: true }))
    }
  }

  const openTreasureCollection = () => {
    if (location.hash === '#treasure-progress' && mysteryPetRef.current) {
      mysteryPetRef.current.openGallery()
      return
    }
    setPendingGalleryOpen(true)
    navigate(boardSectionHref(boardId, 'treasure-progress', activeKid?.id))
  }

  useEffect(() => {
    if (!pendingGalleryOpen || location.hash !== '#treasure-progress' || !mysteryPetRef.current) return
    mysteryPetRef.current.openGallery()
    setPendingGalleryOpen(false)
  }, [pendingGalleryOpen, location.hash])

  useEffect(() => {
    if (loading || kids.length === 0 || location.pathname === `/board/${boardId}`) return
    navigate(boardSectionHref(boardId, legacySection, activeKid?.id), { replace: true })
  }, [loading, kids.length, legacySection, location.pathname, boardId, activeKid?.id, navigate])

  useEffect(() => {
    if (loading || !activeKid) return
    const sectionId = location.hash ? location.hash.slice(1) : 'top'
    if (!BOARD_SECTIONS.some((section) => section.id === sectionId)) return
    requestAnimationFrame(() => scrollToSection(sectionId, false))
  }, [loading, activeKid, location.hash])

  if (loading) return <LogoLoader label="Loading board..." />
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error}</div>
  if (!board) return null

  const activeTheme = activeKid ? (THEMES[activeKid.theme] || THEMES.football) : THEMES.football
  const activeStars = activeKid ? totalStarsFor(activeKid) : 0
  const activeMax = activeKid ? totalActivityCapFor(activeKid) : 0
  const { monday, sunday } = getCurrentWeek()

  return (
    <div className="relative min-h-screen bg-earthy-ivory px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-10 font-jakarta">
      {/* Per-kid bg wash — subtle ~8% accent overlay over ivory, fades when switching kids. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 transition-colors duration-500"
        style={{ backgroundColor: `${activeTheme.accent}14` }}
      />
      <div className="relative z-10">
      <OfflineBanner />
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
          <h1 className="text-base sm:text-xl font-extrabold flex items-center gap-2 min-w-0">
            <Logo size={36} className="shrink-0" />
            <span className="text-earthy-cocoa truncate">
              {board.name}
            </span>
          </h1>
          {kids.length > 0 && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="Board menu"
                aria-expanded={menuOpen}
                style={{ color: '#FFFAF0', backgroundColor: '#5A3A2E' }}
                className="w-11 h-11 rounded-full text-sm font-bold hover:bg-earthy-cocoaDark active:scale-[0.98] transition-all flex items-center justify-center focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-earthy-terracotta"
              >
                <Icon name="menu-more" size={22} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-[90]" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-[100] bg-white rounded-2xl overflow-hidden shadow-earthy-pop py-1 min-w-[260px]">
                    {activeKid && (
                      <>
                        <button
                          type="button"
                          onClick={() => { setMenuOpen(false); setTasksOpen(true) }}
                          className="w-full text-left px-3 py-3 text-sm font-bold text-earthy-cocoa hover:bg-earthy-cream flex items-center gap-2"
                        >
                          <Icon name="tasks" size={18} />
                          <span className="flex-1">Edit tasks</span>
                          <span className="text-xs text-earthy-cocoaSoft">
                            {(activeKid.activities?.length ?? 0)} of 10
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setMenuOpen(false); setEditKidOpen(true) }}
                          className="w-full text-left px-3 py-3 text-sm font-bold text-earthy-cocoa hover:bg-earthy-cream flex items-center gap-2"
                        >
                          <Icon name="edit" size={18} />
                          <span className="flex-1">Edit kid</span>
                          <span className="text-xs text-earthy-cocoaSoft truncate max-w-[120px]">
                            {activeKid.name}
                          </span>
                        </button>
                        <Link
                          to={`/board/${boardId}/print/${activeKid.id}`}
                          onClick={() => setMenuOpen(false)}
                          className="w-full text-left px-3 py-3 text-sm font-bold text-earthy-cocoa hover:bg-earthy-cream flex items-center gap-2"
                        >
                          <Icon name="print" size={18} />
                          <span>Print sheet</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => { setMenuOpen(false); openTreasureCollection() }}
                          className="w-full text-left px-3 py-3 text-sm font-bold text-earthy-cocoa hover:bg-earthy-cream flex items-center gap-2"
                        >
                          <Icon name="reward" size={18} />
                          <span>Pet collection</span>
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); openShare() }}
                      className="w-full text-left px-3 py-3 text-sm font-bold text-earthy-cocoa hover:bg-earthy-cream flex items-center gap-2"
                    >
                      <Icon name="share" size={18} />
                      <span>Share board</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); toggleMute() }}
                      className="w-full text-left px-3 py-3 text-sm font-bold text-earthy-cocoa hover:bg-earthy-cream flex items-center gap-2"
                    >
                      <Icon name={muted ? 'volume-off' : 'volume-on'} size={18} />
                      <span>{muted ? 'Unmute sounds' : 'Mute sounds'}</span>
                    </button>
                    {user && (
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); setSignOutOpen(true) }}
                        className="w-full text-left px-3 py-3 text-sm font-bold text-earthy-cocoa hover:bg-earthy-cream flex items-center gap-2"
                      >
                        <Icon name="sign-out" size={18} />
                        <span>{isAnonymous ? 'Discard demo' : 'Sign out'}</span>
                      </button>
                    )}
                    {user && !isAnonymous && (
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); requestDeleteAccount() }}
                        className="w-full text-left px-3 py-3 text-sm font-bold text-semantic-danger hover:bg-semantic-errorBg flex items-center gap-2"
                      >
                        <Icon name="delete" size={18} />
                        <span>Delete account</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </header>

        <main id="main" className="min-w-0">
          {kids.length === 0 ? (
            <EmptyState boardId={boardId} />
          ) : (
            <>
              <KidSwitcher kids={kids} activeKidId={activeKid?.id} boardId={boardId} />

              {activeKid && (
                <BoardSinglePage
                  boardId={boardId}
                  kids={kids}
                  activeKid={activeKid}
                  activeTheme={activeTheme}
                  activeStars={activeStars}
                  activeMax={activeMax}
                  chainAssignment={chainAssignment}
                  monday={monday}
                  sunday={sunday}
                  mysteryPetRef={mysteryPetRef}
                  replaySummary={replaySummary}
                  onEditKid={() => setEditKidOpen(true)}
                  onEditTasks={() => setTasksOpen(true)}
                  onOpenCollection={openTreasureCollection}
                />
              )}
            </>
          )}
        </main>
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
          const nextParams = new URLSearchParams(searchParams)
          if (remaining.length > 0) {
            const next = [...remaining].sort((a, b) => (a.order || 0) - (b.order || 0))[0]
            nextParams.set('kid', next.id)
          } else {
            nextParams.delete('kid')
          }
          const nextSearch = nextParams.toString()
          navigate(`${location.pathname}${nextSearch ? `?${nextSearch}` : ''}${location.hash}`, { replace: true })
        }}
      />

      <ActivitiesModal
        open={tasksOpen}
        onClose={() => setTasksOpen(false)}
        kid={activeKid}
        boardId={boardId}
      />

      <WeeklySummary
        open={!!summary}
        onClose={dismissSummary}
        kid={summary?.kid}
        archive={summary?.archive}
        weekKey={summary?.weekKey}
        replay={!!summary?.replay}
        onOpenCollection={summary?.replay ? undefined : openTreasureCollection}
      />

      <Modal open={signOutOpen} onClose={() => setSignOutOpen(false)} emoji="↩︎" title="Sign out of Winking Star?">
        <div className="flex flex-col gap-2 mt-2">
          {isAnonymous && (
            <p className="text-sm text-earthy-cocoaSoft text-center font-bold mb-1">
              Your demo board will be discarded.
            </p>
          )}
          {isAnonymous && (
            <Link
              to="/?upgrade=1"
              onClick={() => setSignOutOpen(false)}
              style={{ color: '#FFFAF0', backgroundColor: '#5A3A2E' }}
              className="w-full py-3 rounded-pill font-bold hover:bg-earthy-cocoaDark active:scale-[0.99] transition-all text-center block"
            >
              Save with email
            </Link>
          )}
          <button
            type="button"
            onClick={async () => { setSignOutOpen(false); await onSignOut() }}
            className={`w-full py-3 rounded-pill font-bold active:scale-[0.99] transition-all ${
              isAnonymous
                ? 'bg-semantic-errorBg text-semantic-errorText'
                : 'bg-earthy-cocoa text-earthy-ivory'
            }`}
          >
            {isAnonymous ? 'Sign out and discard' : 'Sign out'}
          </button>
          <button
            type="button"
            onClick={() => setSignOutOpen(false)}
            className="w-full py-3 rounded-pill text-earthy-cocoaSoft font-bold hover:text-earthy-cocoa active:scale-[0.99] transition-all"
          >
            Cancel
          </button>
        </div>
      </Modal>

      <Modal
        open={deleteAccountOpen}
        onClose={deleteBusy ? undefined : () => setDeleteAccountOpen(false)}
        emoji="🗑️"
        title="Delete account?"
      >
        <div className="flex flex-col gap-3 mt-2">
          <p className="text-sm text-earthy-cocoaSoft text-center font-bold">
            This permanently removes your sign-in and family spaces you manage. Shared spaces stay with their admin.
          </p>
          {needsDeletePassword ? (
            <label className="text-left">
              <span className="text-xs font-bold text-earthy-cocoaSoft mb-2 block uppercase tracking-wide">
                Confirm with your password
              </span>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value)
                  if (deleteError) setDeleteError('')
                }}
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl bg-earthy-ivory border-2 border-earthy-divider focus:border-earthy-cocoa focus:ring-2 focus:ring-earthy-cocoa/20 outline-none font-bold text-earthy-cocoa transition-colors"
              />
            </label>
          ) : (
            <p className="text-xs text-earthy-cocoaSoft text-center font-bold">
              You will confirm once more with your sign-in provider.
            </p>
          )}
          {deleteError && (
            <div role="alert" className="px-4 py-3 rounded-xl bg-semantic-errorBg text-semantic-errorText text-sm font-bold">
              {deleteError}
            </div>
          )}
          <button
            type="button"
            onClick={onDeleteAccount}
            disabled={deleteBusy}
            className="w-full py-3 rounded-pill font-bold active:scale-[0.99] transition-all disabled:opacity-50 bg-semantic-danger text-earthy-ivory"
          >
            {deleteBusy ? 'Deleting…' : 'Delete my account'}
          </button>
          <button
            type="button"
            onClick={() => setDeleteAccountOpen(false)}
            disabled={deleteBusy}
            className="w-full py-3 rounded-pill text-earthy-cocoaSoft font-bold hover:text-earthy-cocoa active:scale-[0.99] transition-all"
          >
            Cancel
          </button>
        </div>
      </Modal>

      <Modal open={shareGateOpen} onClose={() => setShareGateOpen(false)} emoji="🔗" title="Share with your family">
        <div className="flex flex-col gap-2 mt-2">
          <p className="text-sm text-earthy-cocoaSoft text-center font-bold mb-1">
            Save your board first so the link still works when your family opens it.
          </p>
          <Link
            to="/?upgrade=1"
            onClick={() => setShareGateOpen(false)}
            style={{ color: '#FFFAF0', backgroundColor: '#5A3A2E' }}
            className="w-full py-3 rounded-pill font-bold hover:bg-earthy-cocoaDark active:scale-[0.99] transition-all text-center block"
          >
            Save with email
          </Link>
          <button
            type="button"
            onClick={() => setShareGateOpen(false)}
            className="w-full py-3 rounded-pill text-earthy-cocoaSoft font-bold hover:text-earthy-cocoa active:scale-[0.99] transition-all"
          >
            Cancel
          </button>
        </div>
      </Modal>

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

function BoardPanel({ activeTheme, children, className = '' }) {
  return (
    <div
      className={`relative rounded-3xl shadow-earthy-card ${className}`}
      style={{
        backgroundColor: colors.earthy.card,
        border: `1px solid ${activeTheme.accent}66`,
      }}
    >
      <div className="relative p-4 sm:p-6 lg:p-7">
        {children}
      </div>
    </div>
  )
}

function KidContextHeader({ activeKid, activeTheme, monday, sunday, onEditKid }) {
  return (
    <div className="mb-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <KidAvatar kid={activeKid} size={54} />
          <h2 className="text-3xl sm:text-4xl font-extrabold truncate text-earthy-cocoa">
            {activeKid.name}
          </h2>
          <button
            onClick={onEditKid}
            aria-label={`Edit ${activeKid.name}`}
            className="shrink-0 w-10 h-10 rounded-full bg-earthy-ivory hover:bg-earthy-cream active:scale-95 transition-all flex items-center justify-center text-earthy-cocoa"
            style={{ border: `1px solid ${activeTheme.deeper}66` }}
          >
            <Icon name="edit" size={17} />
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
    </div>
  )
}

function BoardSinglePage({
  boardId,
  kids,
  activeKid,
  activeTheme,
  activeStars,
  activeMax,
  chainAssignment,
  monday,
  sunday,
  mysteryPetRef,
  replaySummary,
  onEditKid,
  onEditTasks,
  onOpenCollection,
}) {
  const discoveries = getDiscoveryEntries(activeKid)
  const weekly = getWeeklyBreakdown(activeKid)
  const earnedAchievements = evaluateAchievements(activeKid || {}, { totalStars: activeStars, days: getCurrentWeek().days })
  const starBadgeCount = BADGE_TIERS.filter((tier) => activeStars >= tier.stars).length

  return (
    <BoardPanel activeTheme={activeTheme} className="overflow-hidden">
      <section id="top" tabIndex={-1} className="scroll-mt-6 outline-none">
        <div className="mb-5 overflow-hidden rounded-[24px]">
          <ThemeScene themeKey={activeKid.theme || 'animals'} height="clamp(156px, 24vw, 220px)" favoritePet={activeKid?.favoritePet} />
        </div>
        <KidContextHeader activeKid={activeKid} activeTheme={activeTheme} monday={monday} sunday={sunday} onEditKid={onEditKid} />
        <BirthdayBanner kid={activeKid} />
        <ScoreBar total={activeStars} max={activeMax} theme={activeTheme} />
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4 mt-5">
          <TodayCard kid={activeKid} activeTheme={activeTheme} />
          <MysteryPet ref={mysteryPetRef} kid={activeKid} totalStars={activeStars} boardId={boardId} assignedChain={chainAssignment[activeKid.id]} onOpenSummary={replaySummary} />
        </div>
      </section>

      <section id="activity" tabIndex={-1} className="mt-6 pt-6 border-t border-earthy-divider scroll-mt-6 outline-none">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <SectionHeading label="Activities" className="mb-0" />
          <button
            type="button"
            onClick={onEditTasks}
            className="min-h-11 px-4 rounded-pill bg-earthy-cocoa text-earthy-cream text-sm font-extrabold flex items-center justify-center gap-2 hover:bg-earthy-cocoaDark active:scale-[0.99] transition-all"
          >
            <Icon name="tasks" size={18} />
            <span>Edit tasks</span>
          </button>
        </div>
        <ActivityGrid kid={activeKid} boardId={boardId} />
      </section>

      <section id="treasure-progress" tabIndex={-1} className="mt-6 pt-6 border-t border-earthy-divider scroll-mt-6 outline-none">
        <SectionHeading label="Stars & Pet" />
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StreakCounter kid={activeKid} />
            <BadgeShelf totalStars={activeStars} themeKey={activeKid.theme} kid={activeKid} />
          </div>
          <TreasureProgressCard kid={activeKid} activeStars={activeStars} activeTheme={activeTheme} />
        </div>
        <div className="mt-5">
          <RewardGoal kid={activeKid} boardId={boardId} totalStars={activeStars} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <MiniStat label="Star badges" value={`${starBadgeCount}/${BADGE_TIERS.length}`} />
          <MiniStat label="Achievements" value={`${earnedAchievements.length}/${ACHIEVEMENTS.length}`} />
          <MiniStat label="Week total" value={`${activeStars}/${activeMax}`} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-4 mt-5">
          <DiscoveryList discoveries={discoveries} onReplay={replaySummary} />
          <WeeklyProgressList weekly={weekly} activeTheme={activeTheme} />
        </div>
        <button
          type="button"
          onClick={onOpenCollection}
          className="mt-4 min-h-11 w-full sm:w-auto px-5 rounded-pill bg-earthy-cocoa text-earthy-cream text-sm font-extrabold flex items-center justify-center gap-2 hover:bg-earthy-cocoaDark active:scale-[0.99] transition-all"
        >
          <Icon name="reward" size={18} />
          <span>Open pet collection</span>
        </button>
      </section>

    </BoardPanel>
  )
}

function TodayCard({ kid, activeTheme, actionHref }) {
  const today = getTodayStats(kid)
  const pct = today.total > 0 ? Math.round((today.done / today.total) * 100) : 0
  const body = (
    <div className="rounded-2xl p-4 bg-earthy-card shadow-earthy-card border border-earthy-divider">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide" style={{ color: activeTheme.deeper }}>
            Today
          </div>
          <div className="text-2xl font-extrabold text-earthy-cocoa mt-1">
            {today.done}/{today.total} done
          </div>
        </div>
        <div className="px-3 py-1 rounded-pill bg-earthy-ivory text-xs font-extrabold text-earthy-cocoaSoft shrink-0">
          {today.day?.label}
        </div>
      </div>
      <div className="h-3 rounded-full overflow-hidden mt-3 bg-earthy-cream border border-earthy-dividerCream">
        <div className="h-full transition-all" style={{ width: `${pct}%`, background: activeTheme.deeper }} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {today.scheduledActivities.length === 0 ? (
          <span className="text-sm font-bold text-earthy-cocoaSoft">No star spots today</span>
        ) : (
          today.scheduledActivities.slice(0, 5).map((activity) => {
            const done = today.doneActivities.some((item) => item.id === activity.id)
            return (
              <span
                key={activity.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-extrabold"
                style={{
                  backgroundColor: done ? `${activeTheme.accent}33` : '#FFF4DF',
                  color: done ? activeTheme.deeper : '#8B6651',
                }}
              >
                <span aria-hidden>{done ? '✓' : activity.emoji || '○'}</span>
                <span className="truncate max-w-[120px]">{activity.label || 'Activity'}</span>
              </span>
            )
          })
        )}
      </div>
    </div>
  )

  if (!actionHref) return body
  return (
    <Link to={actionHref} className="block active:scale-[0.99] transition-transform">
      {body}
    </Link>
  )
}

function FamilyTodayList({ boardId, kids, activeKidId }) {
  return (
    <div className="rounded-2xl p-4 bg-earthy-ivory border border-earthy-divider">
      <div className="text-xs font-bold uppercase tracking-wide text-earthy-cocoaSoft">Family today</div>
      <div className="mt-3 flex flex-col gap-2">
        {kids.map((kid) => {
          const stats = getTodayStats(kid)
          const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
          return (
            <Link
              key={kid.id}
              to={boardSectionHref(boardId, 'activity', kid.id)}
              className={`min-h-14 rounded-2xl flex items-center gap-3 px-3 py-2 transition-all ${
                kid.id === activeKidId ? 'bg-earthy-card shadow-earthy-card' : 'hover:bg-earthy-card'
              }`}
            >
              <KidAvatar kid={kid} size={40} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-earthy-cocoa truncate">{kid.name}</span>
                  <span className="text-xs font-extrabold text-earthy-cocoaSoft shrink-0">{stats.done}/{stats.total}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden mt-1 bg-earthy-cream">
                  <div className="h-full bg-earthy-cocoa" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function RecentCelebrations({ celebrations }) {
  return (
    <div className="rounded-2xl p-4 bg-earthy-ivory border border-earthy-divider">
      <div className="text-xs font-bold uppercase tracking-wide text-earthy-cocoaSoft">Recent celebrations</div>
      {celebrations.length === 0 ? (
        <div className="text-sm font-bold text-earthy-cocoaSoft mt-3">No stickers yet this week</div>
      ) : (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {celebrations.map((item) => (
            <div key={item.key} className="min-h-12 rounded-2xl bg-earthy-card px-3 py-2 flex items-center gap-2 border border-earthy-divider">
              <span className="text-xl shrink-0" aria-hidden>{item.sticker}</span>
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-earthy-cocoa truncate">{item.label}</div>
                <div className="text-xs font-bold text-earthy-cocoaSoft">{item.dayLabel}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TreasureProgressCard({ kid, activeStars, activeTheme }) {
  const remaining = Math.max(0, HATCH_GOAL - activeStars)
  const pct = Math.min(100, Math.round((activeStars / HATCH_GOAL) * 100))
  const historyCount = Object.keys(kid.weekHistory || {}).length

  return (
    <div className="rounded-2xl p-4 bg-earthy-ivory border border-earthy-divider">
      <div className="text-xs font-bold uppercase tracking-wide text-earthy-cocoaSoft">Mystery box</div>
      <div className="text-2xl font-extrabold text-earthy-cocoa mt-1">
        {remaining === 0 ? 'Ready' : `${remaining} to hatch`}
      </div>
      <div className="h-3 rounded-full overflow-hidden mt-3 bg-earthy-cream border border-earthy-dividerCream">
        <div className="h-full transition-all" style={{ width: `${pct}%`, background: activeTheme.deeper }} />
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        <MiniStat label="This week" value={`${activeStars}/${HATCH_GOAL}`} compact />
        <MiniStat label="Past pets" value={historyCount} compact />
      </div>
    </div>
  )
}

function DiscoveryList({ discoveries, onReplay }) {
  return (
    <div className="rounded-2xl p-4 bg-earthy-ivory border border-earthy-divider">
      <div className="text-xs font-bold uppercase tracking-wide text-earthy-cocoaSoft">Recent discoveries</div>
      {discoveries.length === 0 ? (
        <div className="text-sm font-bold text-earthy-cocoaSoft mt-3">No archived pets yet</div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {discoveries.map(({ weekKey, archive }) => (
            <button
              key={weekKey}
              type="button"
              onClick={() => onReplay(weekKey, archive)}
              className="min-h-14 rounded-2xl bg-earthy-card px-3 py-2 flex items-center gap-3 text-left border border-earthy-divider hover:bg-earthy-cream active:scale-[0.99] transition-all"
            >
              <span className="text-2xl shrink-0" aria-hidden>{archive.petEmoji || '⭐'}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-extrabold text-earthy-cocoa truncate">{archive.petName || 'Mystery friend'}</div>
                <div className="text-xs font-bold text-earthy-cocoaSoft">{weekKey}</div>
              </div>
              <span className="text-xs font-extrabold text-earthy-cocoaSoft shrink-0">{archive.totalStars || 0} stars</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function WeeklyProgressList({ weekly, activeTheme }) {
  return (
    <div className="rounded-2xl p-4 bg-earthy-ivory border border-earthy-divider">
      <div className="text-xs font-bold uppercase tracking-wide text-earthy-cocoaSoft">Weekly progress</div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
        {weekly.map(({ day, done, total }) => {
          const pct = total > 0 ? Math.round((done / total) * 100) : 0
          return (
            <div key={day.key} className="rounded-2xl bg-earthy-card border border-earthy-divider p-3 min-h-[112px]">
              <div className="font-extrabold text-earthy-cocoa">{day.label}</div>
              <div className="text-xs font-bold text-earthy-cocoaSoft mt-0.5">{done}/{total} done</div>
              <div className="h-2 rounded-full overflow-hidden mt-3 bg-earthy-cream">
                <div className="h-full transition-all" style={{ width: `${pct}%`, background: activeTheme.deeper }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SectionHeading({ label, className = 'mb-2' }) {
  return (
    <h3 className={`text-xs font-bold uppercase tracking-wide text-earthy-cocoaSoft ${className}`}>
      {label}
    </h3>
  )
}

function MiniStat({ label, value, compact = false }) {
  return (
    <div className={`rounded-2xl bg-earthy-ivory border border-earthy-divider ${compact ? 'p-3' : 'p-4'}`}>
      <div className="text-xs font-bold uppercase tracking-wide text-earthy-cocoaSoft">{label}</div>
      <div className={`${compact ? 'text-xl' : 'text-2xl'} font-extrabold text-earthy-cocoa mt-1`}>{value}</div>
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
      <KidSwitcher
        kids={[]}
        activeKidId={null}
        boardId={boardId}
        emptyAddLabel="Add your first superstar"
      />
    </div>
  )
}
