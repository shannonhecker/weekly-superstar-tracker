import { useState, useEffect } from 'react'
import { DAYS, DEFAULT_ACTIVITIES, MAX_TOTAL } from '../utils/constants'
import { getBadge, initChecks, loadFromStorage, saveToStorage } from '../utils/helpers'
import ConfettiEffect from './ConfettiEffect'
import StickerCheck from './StickerCheck'
import VirtualPet from './VirtualPet'
import StreakCounter from './StreakCounter'
import BadgeShelf from './BadgeShelf'
import RewardUnlock from './RewardUnlock'
import WeeklyHistory from './WeeklyHistory'

const ChildTracker = ({ theme, onScoreChange }) => {
  const storageKey = (k) => `tracker-${theme.key}-${k}`

  const [checks, setChecks] = useState(() => loadFromStorage(storageKey('checks'), initChecks(DEFAULT_ACTIVITIES, DAYS)))
  const [customLabel, setCustomLabel] = useState(() => loadFromStorage(storageKey('customLabel'), ''))
  const [editingCustom, setEditingCustom] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [childName, setChildName] = useState(() => loadFromStorage(storageKey('name'), theme.name))
  const [editingName, setEditingName] = useState(false)
  const [badges, setBadges] = useState(() => loadFromStorage(storageKey('badges'), []))
  const [weekHistory, setWeekHistory] = useState(() => loadFromStorage(storageKey('history'), []))
  const [reward, setReward] = useState(() => loadFromStorage(storageKey('reward'), null))

  const totalChecked = Object.values(checks).filter(Boolean).length
  const currentBadge = getBadge(totalChecked, theme)

  // Persist to localStorage
  useEffect(() => { saveToStorage(storageKey('checks'), checks) }, [checks])
  useEffect(() => { saveToStorage(storageKey('customLabel'), customLabel) }, [customLabel])
  useEffect(() => { saveToStorage(storageKey('name'), childName) }, [childName])
  useEffect(() => { saveToStorage(storageKey('badges'), badges) }, [badges])
  useEffect(() => { saveToStorage(storageKey('history'), weekHistory) }, [weekHistory])
  useEffect(() => { saveToStorage(storageKey('reward'), reward) }, [reward])

  useEffect(() => { onScoreChange(totalChecked) }, [totalChecked, onScoreChange])

  const toggle = (key) => {
    setChecks((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      if (!prev[key] && Object.values(next).filter(Boolean).length === MAX_TOTAL) {
        setShowConfetti(true)
      }
      return next
    })
  }

  useEffect(() => {
    if (showConfetti) {
      const t = setTimeout(() => setShowConfetti(false), 2500)
      return () => clearTimeout(t)
    }
  }, [showConfetti])

  const getRowTotal = (actId) => DAYS.reduce((s, d) => s + (checks[`${actId}-${d}`] ? 1 : 0), 0)

  const reset = () => {
    if (window.confirm(`Save ${childName}'s progress and start a new week?`)) {
      const badge = getBadge(totalChecked, theme)
      if (badge) setBadges((prev) => [...prev, badge])
      setWeekHistory((prev) => [...prev, { score: totalChecked }])
      setChecks(initChecks(DEFAULT_ACTIVITIES, DAYS))
      setCustomLabel('')
      setShowConfetti(true)
    }
  }

  return (
    <div
      className="rounded-3xl p-4 pb-6 relative overflow-hidden"
      style={{ background: theme.bgStyle, boxShadow: '0 4px 28px rgba(0,0,0,0.06)' }}
    >
      <ConfettiEffect show={showConfetti} theme={theme} />

      {/* Floating decoration */}
      <div className="absolute top-3 right-4 text-[40px] opacity-[0.08] pointer-events-none select-none">
        {theme.decorEmojis.join(' ')}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-[26px]"
            style={{ background: theme.headerGradient, boxShadow: `0 3px 12px ${theme.accent}44` }}
          >
            {theme.avatar}
          </div>
          {editingName ? (
            <input
              autoFocus
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
              className="text-[22px] font-extrabold border-none bg-transparent outline-none w-36 font-body text-gray-800"
              style={{ borderBottom: `2px dashed ${theme.accent}` }}
            />
          ) : (
            <h2
              onClick={() => setEditingName(true)}
              className="text-[22px] font-extrabold text-gray-800 m-0 cursor-pointer"
              title="Click to rename"
            >
              {childName}
            </h2>
          )}
        </div>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-xl bg-white font-bold text-[13px] cursor-pointer font-body transition-all duration-200 hover:scale-105"
          style={{ border: `2px solid ${theme.accentLight}`, color: theme.accent }}
        >
          {theme.resetLabel}
        </button>
      </div>

      {/* Pet + Streak */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <VirtualPet score={totalChecked} name={childName} theme={theme} />
        <StreakCounter checks={checks} theme={theme} />
      </div>

      {/* Score bar */}
      <div className="bg-white rounded-xl px-4 py-2.5 mb-2.5 flex items-center gap-3 shadow-sm">
        <span className="text-xl">{theme.avatar}</span>
        <div className="flex-1">
          <div className="h-3.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-400"
              style={{
                background: totalChecked === MAX_TOTAL
                  ? `linear-gradient(90deg, ${theme.accent}, #F7B731, #FC5C65, ${theme.accent})`
                  : `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                width: `${(totalChecked / MAX_TOTAL) * 100}%`,
              }}
            />
          </div>
        </div>
        <span className="font-extrabold text-lg text-gray-800 min-w-[60px] text-right">
          {totalChecked}/{MAX_TOTAL}
        </span>
      </div>

      {/* Badges + Reward */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <div className="bg-white rounded-2xl p-3 border-2 border-black/[0.04]">
          <div className="text-xs font-extrabold mb-2" style={{ color: theme.accent }}>🏅 Badge Shelf</div>
          <BadgeShelf badges={badges} currentBadge={currentBadge} />
        </div>
        <RewardUnlock score={totalChecked} reward={reward} onSetReward={setReward} theme={theme} />
      </div>

      {/* Weekly History */}
      {weekHistory.length > 0 && (
        <div className="mb-3">
          <WeeklyHistory history={weekHistory} theme={theme} />
        </div>
      )}

      {/* Activity Table */}
      <div className="overflow-x-auto rounded-2xl">
        <table className="w-full border-separate border-spacing-0 rounded-2xl overflow-hidden bg-white/75">
          <thead>
            <tr>
              <th
                className="text-left px-3 py-2.5 text-[13px] font-bold text-gray-400 sticky left-0 z-[2] bg-white/[0.97] min-w-[130px]"
                style={{ borderBottom: `2px solid ${theme.accentLight}66` }}
              >
                Activity
              </th>
              {DAYS.map((d) => (
                <th
                  key={d}
                  className="px-1.5 py-2.5 text-[13px] font-bold text-gray-400 text-center min-w-[50px]"
                  style={{ borderBottom: `2px solid ${theme.accentLight}66` }}
                >
                  {d}
                </th>
              ))}
              <th
                className="px-3 py-2.5 text-[13px] font-bold text-center min-w-[55px]"
                style={{ color: theme.accent, borderBottom: `2px solid ${theme.accentLight}66` }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {DEFAULT_ACTIVITIES.map((act, ri) => {
              const rowTotal = getRowTotal(act.id)
              const isComplete = rowTotal === 7
              return (
                <tr key={act.id} style={{ background: ri % 2 === 0 ? 'transparent' : `${theme.accentLight}15` }}>
                  <td
                    className="px-3 py-2 sticky left-0 z-[1] border-b border-gray-100"
                    style={{ background: ri % 2 === 0 ? 'rgba(255,255,255,0.97)' : 'rgba(248,248,248,0.97)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[22px]">{act.emoji}</span>
                      {act.isCustom && editingCustom ? (
                        <input
                          autoFocus
                          value={customLabel}
                          placeholder="Type here..."
                          onChange={(e) => setCustomLabel(e.target.value)}
                          onBlur={() => setEditingCustom(false)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingCustom(false)}
                          className="text-sm font-semibold border-none bg-transparent outline-none w-[90px] font-body text-gray-800"
                          style={{ borderBottom: `2px dashed ${act.color}` }}
                        />
                      ) : (
                        <span
                          onClick={act.isCustom ? () => setEditingCustom(true) : undefined}
                          className="text-sm font-semibold text-gray-700"
                          style={{
                            cursor: act.isCustom ? 'pointer' : 'default',
                            borderBottom: act.isCustom ? `2px dashed ${act.color}44` : 'none',
                          }}
                        >
                          {act.isCustom && customLabel ? customLabel : act.label}
                        </span>
                      )}
                    </div>
                  </td>
                  {DAYS.map((d) => (
                    <td key={d} className="text-center px-0.5 py-1.5 border-b border-gray-100">
                      <StickerCheck
                        checked={checks[`${act.id}-${d}`]}
                        onClick={() => toggle(`${act.id}-${d}`)}
                        color={act.color}
                        stickers={theme.stickers}
                      />
                    </td>
                  ))}
                  <td className="text-center px-3 py-1.5 border-b border-gray-100">
                    <span
                      className="inline-flex items-center gap-1 font-extrabold text-lg"
                      style={{ color: isComplete ? '#26DE81' : '#999' }}
                    >
                      {rowTotal}/7
                      {isComplete && <span className="text-base animate-reward-wiggle">🎉</span>}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ChildTracker
