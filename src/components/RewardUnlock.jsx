import { useState } from 'react'

const RewardUnlock = ({ score, reward, onSetReward, theme }) => {
  const [editing, setEditing] = useState(false)
  const [tempLabel, setTempLabel] = useState('')
  const [tempTarget, setTempTarget] = useState(40)

  const label = reward?.label
  const target = reward?.target || 40
  const progress = label ? Math.min(score / target, 1) : 0
  const unlocked = label && score >= target

  if (!label && !editing) {
    return (
      <button
        onClick={() => { setEditing(true); setTempLabel(''); setTempTarget(40) }}
        className="w-full h-full rounded-2xl cursor-pointer flex items-center justify-center gap-2 text-[13px] font-bold text-gray-400 font-body"
        style={{ border: `2px dashed ${theme.accentLight}`, background: 'transparent', padding: '12px 16px' }}
      >
        🎁 Set a reward goal...
      </button>
    )
  }

  if (editing) {
    return (
      <div
        className="rounded-2xl p-4 flex flex-col gap-2.5 bg-white"
        style={{ border: `2px solid ${theme.accent}` }}
      >
        <div className="text-[13px] font-extrabold" style={{ color: theme.accent }}>🎁 Set Reward</div>
        <input
          autoFocus
          value={tempLabel}
          onChange={(e) => setTempLabel(e.target.value)}
          placeholder="e.g. Ice cream trip!"
          className="px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-semibold font-body outline-none"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">Stars:</span>
          <input
            type="range" min={10} max={56} value={tempTarget}
            onChange={(e) => setTempTarget(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm font-extrabold min-w-[28px]" style={{ color: theme.accent }}>
            {tempTarget}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(false)}
            className="flex-1 py-2 rounded-xl border-2 border-gray-200 bg-white cursor-pointer font-bold text-[13px] font-body text-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (tempLabel.trim()) {
                onSetReward({ label: tempLabel.trim(), target: tempTarget })
                setEditing(false)
              }
            }}
            className="flex-1 py-2 rounded-xl border-none cursor-pointer font-bold text-[13px] font-body text-white"
            style={{ background: theme.accent }}
          >
            Save 🎉
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl p-3.5"
      style={{
        background: unlocked ? 'linear-gradient(135deg, #E8F5E9, #F1F8E9)' : 'white',
        border: unlocked ? '2px solid #66BB6A' : '2px solid rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xl ${unlocked ? 'animate-reward-wiggle' : ''}`}>🎁</span>
          <span className="text-sm font-bold" style={{ color: unlocked ? '#2E7D32' : '#555' }}>
            {label}
          </span>
        </div>
        <button
          onClick={() => onSetReward(null)}
          className="bg-transparent border-none text-base cursor-pointer text-gray-300 px-1"
          aria-label="Remove reward goal"
        >
          ×
        </button>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            background: unlocked
              ? 'linear-gradient(90deg, #66BB6A, #26DE81)'
              : `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
            width: `${progress * 100}%`,
          }}
        />
      </div>
      <div className="text-[11px] font-bold text-gray-400 mt-1.5 text-right">
        {unlocked ? '🎊 UNLOCKED!' : `${score}/${target} stars`}
      </div>
    </div>
  )
}

export default RewardUnlock
