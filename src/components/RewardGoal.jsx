import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { THEMES } from '../lib/themes'
import { useToast } from '../contexts/ToastContext'
import PromptModal from './PromptModal'

export default function RewardGoal({ kid, boardId, totalStars }) {
  const theme = THEMES[kid.theme] || THEMES.football
  const reward = kid.reward
  const [open, setOpen] = useState(false)
  const toast = useToast()

  const submit = async ({ label, goal }) => {
    setOpen(false)
    const cleanLabel = (label || '').trim() || 'Surprise!'
    const cleanGoal = Math.max(1, parseInt(goal, 10) || 30)
    try {
      await updateDoc(doc(db, 'boards', boardId, 'kids', kid.id), {
        reward: { label: cleanLabel, goal: cleanGoal },
      })
    } catch (e) {
      toast.error('Could not save reward — try again')
    }
  }

  const clearReward = async () => {
    try {
      await updateDoc(doc(db, 'boards', boardId, 'kids', kid.id), { reward: null })
    } catch (e) {
      toast.error('Could not clear reward — try again')
    }
  }

  const modal = (
    <PromptModal
      open={open}
      onClose={() => setOpen(false)}
      onSubmit={submit}
      emoji="🎁"
      title={reward ? 'Edit reward goal' : 'Set a reward goal'}
      submitLabel="Save"
      fields={[
        { name: 'label', label: "What's the reward?", placeholder: 'Ice cream! 🍦', defaultValue: reward?.label || 'Ice cream! 🍦' },
        { name: 'goal', label: 'Stars to earn it', type: 'number', placeholder: '30', defaultValue: String(reward?.goal || 30) },
      ]}
    />
  )

  if (!reward) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="w-full h-full text-left rounded-2xl p-3 font-bold text-xs font-jakarta"
          style={{
            background: 'transparent',
            border: `2px dashed ${theme.accent}99`,
            color: theme.deeper,
          }}
        >
          🎁 Set a reward goal...
        </button>
        {modal}
      </>
    )
  }

  const pct = Math.min(100, Math.round((totalStars / reward.goal) * 100))
  return (
    <div
      className="rounded-2xl p-3 h-full bg-earthy-ivory shadow-earthy-soft font-jakarta"
      style={{
        border: `1px solid ${theme.accent}55`,
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="font-bold text-xs truncate text-earthy-cocoa">🎁 {reward.label}</div>
        <button onClick={() => setOpen(true)} className="text-[10px] font-bold shrink-0 ml-2" style={{ color: theme.deeper }}>Edit</button>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden bg-earthy-divider">
        <div className="h-full transition-all duration-500" style={{ width: pct + '%', background: theme.deeper }} />
      </div>
      <div className="text-[10px] font-bold mt-1 flex justify-between" style={{ color: theme.deeper }}>
        <span>{totalStars}/{reward.goal} stars</span>
        <button onClick={clearReward} className="hover:text-earthy-cocoa">Remove</button>
      </div>
      {modal}
    </div>
  )
}
