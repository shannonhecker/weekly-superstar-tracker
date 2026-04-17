import { useState, useEffect, useMemo, useRef } from 'react'
import { DAYS, getCurrentWeekDates, getWeekRangeLabel, getWeekKey } from '../utils/constants'
import { getBadge } from '../utils/helpers'
import { useKidSync } from '../firebase/useFirestoreSync'
import { updateKid, deleteKid } from '../firebase/kids'
import { pickRandomPetIndex, pickRandomEggIndex } from '../utils/randomPets'
import ConfettiEffect from './ConfettiEffect'
import StickerCheck from './StickerCheck'
import VirtualPet from './VirtualPet'
import StreakCounter from './StreakCounter'
import BadgeShelf from './BadgeShelf'
import RewardUnlock from './RewardUnlock'
import WeeklyHistory from './WeeklyHistory'
import UndoToast from './UndoToast'
import ConfirmModal from './ConfirmModal'

const ChildTracker = ({ boardId, kid, theme }) => {
  const { kid: liveKid, update } = useKidSync(boardId, kid.id)
  const activeKid = liveKid || kid

  const activities = activeKid.activities || []
  const MAX_TOTAL = activities.length * DAYS.length
  const checks = activeKid.checks || {}
  const customLabel = activeKid.customLabel || ''
  const badges = activeKid.badges || []
  const weekHistory = activeKid.weekHistory || []
  const reward = activeKid.reward || null
  const childName = activeKid.name || 'Kid'

  const [editingCustom, setEditingCustom] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [undoTarget, setUndoTarget] = useState(null) // { key, wasChecked }
  const [confirmRemoval, setConfirmRemoval] = useState(false)
  const [removalToast, setRemovalToast] = useState('')

  const weekDates = useMemo(() => getCurrentWeekDates(), [])
  const weekLabel = useMemo(() => getWeekRangeLabel(), [])

  const totalChecked = Object.values(checks).filter(Boolean).length
  const currentBadge = getBadge(totalChecked, theme)

  const toggle = (key) => {
    const wasChecked = !!checks[key]
    const next = { ...checks, [key]: !wasChecked }
    update({ checks: next })
    if (!wasChecked && Object.values(next).filter(Boolean).length === MAX_TOTAL) {
      setShowConfetti(true)
    }
    // Offer undo only when removing a star (the more costly mis-tap).
    if (wasChecked) setUndoTarget({ key, wasChecked: true })
    else setUndoTarget(null)
  }

  const handleUndoToggle = () => {
    if (!undoTarget) return
    const restored = { ...checks, [undoTarget.key]: undoTarget.wasChecked }
    update({ checks: restored })
    setUndoTarget(null)
  }

  useEffect(() => {
    if (showConfetti) {
      const t = setTimeout(() => setShowConfetti(false), 2500)
      return () => clearTimeout(t)
    }
  }, [showConfetti])

  const getRowTotal = (actId) => DAYS.reduce((s, d) => s + (checks[`${actId}-${d}`] ? 1 : 0), 0)

  // Auto-reset + random-pet generation per week.
  //
  // The auto-reset observes Firestore state directly (weekKey) rather than a
  // client ref flag, so it survives unmounts and re-runs only when the saved
  // week actually differs from the current one. A small jitter de-syncs two
  // devices opening the same kid at the week boundary so the second one sees
  // the first one's write before attempting its own.
  const latestStateRef = useRef({ checks, weekHistory, badges })
  useEffect(() => {
    latestStateRef.current = { checks, weekHistory, badges }
  }, [checks, weekHistory, badges])

  useEffect(() => {
    if (!activeKid.id) return
    const currentWeek = getWeekKey()
    const savedWeek = activeKid.weekKey
    if (savedWeek === currentWeek) return

    const delay = 200 + Math.random() * 500
    const timer = setTimeout(() => {
      const { checks: c, weekHistory: wh, badges: b } = latestStateRef.current
      const updates = {}
      if (!savedWeek) {
        updates.weekKey = currentWeek
        updates.petIdx = pickRandomPetIndex()
        updates.eggIdx = pickRandomEggIndex()
      } else {
        const prevTotal = Object.values(c).filter(Boolean).length
        const newHistory = [...wh]
        const newBadges = [...b]
        if (prevTotal > 0) {
          const badge = getBadge(prevTotal, theme)
          if (badge) newBadges.push(badge)
          newHistory.push({ score: prevTotal, weekKey: savedWeek })
        }
        updates.weekKey = currentWeek
        updates.checks = {}
        updates.customLabel = ''
        updates.weekHistory = newHistory
        updates.badges = newBadges
        updates.petIdx = pickRandomPetIndex()
        updates.eggIdx = pickRandomEggIndex()
        if (prevTotal > 0) setShowConfetti(true)
      }
      update(updates)
    }, delay)
    return () => clearTimeout(timer)
  }, [activeKid.id, activeKid.weekKey, theme, update])

  const today = new Date().getDay()
  const todayKey = DAYS[today === 0 ? 6 : today - 1]

  const handleDelete = () => setConfirmRemoval(true)

  const performDelete = async () => {
    setConfirmRemoval(false)
    try {
      await deleteKid(boardId, kid.id)
      setRemovalToast(`${childName} was removed from the board`)
    } catch (err) {
      setRemovalToast(`Could not remove ${childName}: ${err.message || 'try again'}`)
    }
  }

  return (
    <div
      className="rounded-2xl sm:rounded-3xl p-3 sm:p-4 pb-5 sm:pb-6 relative overflow-hidden"
      style={{ background: theme.bgStyle, boxShadow: '0 4px 28px rgba(0,0,0,0.06)' }}
    >
      <ConfettiEffect show={showConfetti} theme={theme} />

      <div className="absolute top-3 right-4 text-[40px] opacity-[0.08] pointer-events-none select-none hidden sm:block">
        {theme.decorEmojis.join(' ')}
      </div>

      {/* Header */}
      <div className="flex items-center mb-3">
        <div className="flex items-center gap-2 flex-1">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-[22px] sm:text-[26px] shrink-0 overflow-hidden"
            style={{ background: theme.headerGradient, boxShadow: `0 3px 12px ${theme.accent}44` }}
          >
            {activeKid.photoUrl ? (
              <img src={activeKid.photoUrl} alt={childName} className="w-full h-full object-cover" />
            ) : (
              theme.avatar
            )}
          </div>
          <h2 className="text-lg sm:text-[22px] font-extrabold text-gray-800 m-0">{childName}</h2>
        </div>
        <div
          className="text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-lg shrink-0"
          style={{ color: theme.accent, background: `${theme.accentLight}33` }}
        >
          📅 {weekLabel}
        </div>
        <div className="flex-1 flex justify-end">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-full bg-white/70 text-gray-500 font-black focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              aria-label="Kid actions menu"
              aria-haspopup="menu"
              aria-expanded={showMenu}
            >
              ⋯
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} aria-hidden="true" />
                <div
                  role="menu"
                  aria-label="Kid actions"
                  onKeyDown={(e) => { if (e.key === 'Escape') setShowMenu(false) }}
                  className="absolute right-0 top-full mt-1 z-50 bg-white rounded-xl shadow-lg py-1 min-w-[140px] border border-gray-100"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { handleDelete(); setShowMenu(false) }}
                    className="w-full text-left px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 focus:outline-none focus:bg-red-50"
                  >
                    🗑 Remove kid
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pet + Streak */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 mb-2.5 sm:mb-3">
        <VirtualPet score={totalChecked} name={childName} theme={theme} petIdx={activeKid.petIdx} eggIdx={activeKid.eggIdx} maxTotal={MAX_TOTAL} />
        <StreakCounter checks={checks} activities={activities} theme={theme} />
      </div>

      {/* Score bar */}
      <div
        className="rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 mb-2 sm:mb-2.5 flex items-center gap-2 sm:gap-3 shadow-sm"
        style={{ background: `${theme.accentLight}30`, border: `2px solid ${theme.accentLight}` }}
      >
        <span className="text-lg sm:text-xl">{theme.avatar}</span>
        <div className="flex-1">
          <div className="h-3 sm:h-3.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                background: totalChecked === MAX_TOTAL
                  ? `linear-gradient(90deg, ${theme.accent}, #F7B731, #FC5C65, ${theme.accent})`
                  : `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                width: `${MAX_TOTAL ? (totalChecked / MAX_TOTAL) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
        <span className="font-extrabold text-base sm:text-lg text-gray-800 min-w-[50px] sm:min-w-[60px] text-right">
          {totalChecked}/{MAX_TOTAL}
        </span>
      </div>

      {/* Badges + Reward */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 mb-2.5 sm:mb-3">
        <div
          className="rounded-2xl p-3"
          style={{ background: `${theme.accentLight}30`, border: `2px solid ${theme.accentLight}` }}
        >
          <div className="text-xs font-extrabold mb-2" style={{ color: theme.accent }}>🏅 Badge Shelf</div>
          <BadgeShelf badges={badges} currentBadge={currentBadge} />
        </div>
        <RewardUnlock score={totalChecked} reward={reward} onSetReward={(r) => update({ reward: r })} theme={theme} />
      </div>

      {/* Activity Table */}
      <div className="overflow-x-auto rounded-2xl -mx-1 px-1">
        <table className="w-full border-separate border-spacing-0 rounded-2xl overflow-hidden bg-white/75">
          <thead>
            <tr>
              <th
                scope="col"
                className="text-left px-2 sm:px-3 py-2 text-[11px] sm:text-[13px] font-bold text-gray-400 sticky left-0 z-[2] bg-white/[0.97] min-w-[80px] sm:min-w-[130px]"
                style={{ borderBottom: `2px solid ${theme.accentLight}66` }}
              >
                Activity
              </th>
              {weekDates.map((wd) => (
                <th
                  key={wd.key}
                  scope="col"
                  className="px-0.5 sm:px-1.5 py-1.5 sm:py-2.5 text-center min-w-[40px] sm:min-w-[50px]"
                  style={{
                    borderBottom: `2px solid ${wd.key === todayKey ? theme.accent : theme.accentLight + '66'}`,
                    background: wd.key === todayKey ? `${theme.accentLight}22` : 'transparent',
                  }}
                >
                  <div className={`text-[11px] sm:text-[13px] font-bold ${wd.key === todayKey ? '' : 'text-gray-400'}`}
                    style={wd.key === todayKey ? { color: theme.accent } : undefined}
                  >
                    {wd.label}
                  </div>
                  <div className={`text-[10px] sm:text-[11px] font-semibold ${wd.key === todayKey ? '' : 'text-gray-300'}`}
                    style={wd.key === todayKey ? { color: theme.accent } : undefined}
                  >
                    {wd.month} {wd.date}
                  </div>
                </th>
              ))}
              <th
                className="px-2 sm:px-3 py-2 text-[11px] sm:text-[13px] font-bold text-center min-w-[42px] sm:min-w-[55px]"
                style={{ color: theme.accent, borderBottom: `2px solid ${theme.accentLight}66` }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {activities.map((act, ri) => {
              const rowTotal = getRowTotal(act.id)
              const isComplete = rowTotal === 7
              return (
                <tr key={act.id} style={{ background: ri % 2 === 0 ? 'transparent' : `${theme.accentLight}15` }}>
                  <td
                    className="px-2 sm:px-3 py-1.5 sm:py-2 sticky left-0 z-[1] border-b border-gray-100"
                    style={{ background: ri % 2 === 0 ? 'rgba(255,255,255,0.97)' : 'rgba(248,248,248,0.97)' }}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-lg sm:text-[22px]">{act.emoji}</span>
                      {act.isCustom && editingCustom ? (
                        <input
                          autoFocus
                          value={customLabel}
                          placeholder="Type here..."
                          onChange={(e) => update({ customLabel: e.target.value })}
                          onBlur={() => setEditingCustom(false)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingCustom(false)}
                          className="text-xs sm:text-sm font-semibold border-none bg-transparent outline-none w-[70px] sm:w-[90px] font-body text-gray-800"
                          style={{ borderBottom: `2px dashed ${act.color}` }}
                        />
                      ) : act.isCustom ? (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={() => setEditingCustom(true)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              setEditingCustom(true)
                            }
                          }}
                          aria-label={`Edit custom activity label${customLabel ? `: ${customLabel}` : ''}`}
                          className="text-xs sm:text-sm font-semibold text-gray-700 leading-tight cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded"
                          style={{ borderBottom: `2px dashed ${act.color}44` }}
                        >
                          {customLabel || act.label}
                        </span>
                      ) : (
                        <span className="text-xs sm:text-sm font-semibold text-gray-700 leading-tight">
                          {act.label}
                        </span>
                      )}
                    </div>
                  </td>
                  {DAYS.map((d) => (
                    <td
                      key={d}
                      className="text-center px-0 py-1 sm:py-1.5 border-b border-gray-100"
                      style={d === todayKey ? { background: `${theme.accentLight}11` } : undefined}
                    >
                      <StickerCheck
                        checked={checks[`${act.id}-${d}`]}
                        onClick={() => toggle(`${act.id}-${d}`)}
                        color={act.color}
                        stickers={theme.stickers}
                      />
                    </td>
                  ))}
                  <td className="text-center px-1 sm:px-3 py-1 sm:py-1.5 border-b border-gray-100">
                    <span
                      className="inline-flex items-center gap-0.5 sm:gap-1 font-extrabold text-sm sm:text-lg"
                      style={{ color: isComplete ? '#26DE81' : '#999' }}
                    >
                      {rowTotal}/7
                      {isComplete && <span className="text-xs sm:text-base animate-reward-wiggle">🎉</span>}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Weekly History */}
      {weekHistory.length > 0 && (
        <div className="mt-2.5 sm:mt-3">
          <WeeklyHistory history={weekHistory} theme={theme} />
        </div>
      )}

      <UndoToast
        show={!!undoTarget}
        message="Sticker removed"
        onUndo={handleUndoToggle}
        onDismiss={() => setUndoTarget(null)}
      />

      <ConfirmModal
        show={confirmRemoval}
        title={`Remove ${childName}?`}
        body="This permanently deletes all their stickers, badges, history, and photo. This can't be undone."
        confirmLabel="Yes, remove"
        cancelLabel="Keep them"
        danger
        onCancel={() => setConfirmRemoval(false)}
        onConfirm={performDelete}
      />

      <UndoToast
        show={!!removalToast}
        message={removalToast}
        onDismiss={() => setRemovalToast('')}
        duration={4000}
      />
    </div>
  )
}

export default ChildTracker
