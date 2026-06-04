import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { colors } from '@weekly-superstar/shared/tokens'
import { THEMES } from '../lib/themes'
import { useToast } from '../contexts/ToastContext'
import PromptModal from './PromptModal'
import { useI18n } from '../lib/i18n'

export default function RewardGoal({ kid, boardId, totalStars }) {
  const theme = THEMES[kid.theme] || THEMES.football
  const reward = kid.reward
  const [open, setOpen] = useState(false)
  const toast = useToast()
  const { t } = useI18n()

  const submit = async ({ label, goal }) => {
    setOpen(false)
    const cleanLabel = (label || '').trim() || t('reward.defaultLabel')
    const cleanGoal = Math.max(1, parseInt(goal, 10) || 30)
    try {
      await updateDoc(doc(db, 'boards', boardId, 'kids', kid.id), {
        reward: { label: cleanLabel, goal: cleanGoal },
      })
    } catch (e) {
      toast.error(t('reward.saveError'))
    }
  }

  const clearReward = async () => {
    try {
      await updateDoc(doc(db, 'boards', boardId, 'kids', kid.id), { reward: null })
    } catch (e) {
      toast.error(t('reward.clearError'))
    }
  }

  const modal = (
    <PromptModal
      open={open}
      onClose={() => setOpen(false)}
      onSubmit={submit}
      emoji="🎁"
      title={reward ? t('reward.editGoal') : t('reward.setGoal')}
      submitLabel={t('reward.save')}
      fields={[
        { name: 'label', label: t('reward.question'), placeholder: t('reward.placeholder'), defaultValue: reward?.label || t('reward.placeholder') },
        { name: 'goal', label: t('reward.starsToEarn'), type: 'number', placeholder: '30', defaultValue: String(reward?.goal || 30) },
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
            background: colors.earthy.card,
            border: `2px dashed ${colors.earthy.divider}`,
            color: theme.deeper,
          }}
        >
          🎁 {t('reward.setGoalEllipsis')}
        </button>
        {modal}
      </>
    )
  }

  const pct = Math.min(100, Math.round((totalStars / reward.goal) * 100))
  return (
    <div
      className="rounded-2xl p-3 h-full shadow-earthy-card font-jakarta"
      style={{ backgroundColor: colors.earthy.card, border: `1px solid ${colors.earthy.divider}` }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="font-bold text-xs truncate text-earthy-cocoa">🎁 {reward.label}</div>
        <button onClick={() => setOpen(true)} className="text-[10px] font-bold shrink-0 ml-2" style={{ color: theme.deeper }}>{t('reward.edit')}</button>
      </div>
      <div className="h-3 rounded-full overflow-hidden bg-earthy-cream border border-earthy-dividerCream">
        <div className="h-full transition-all duration-500" style={{ width: pct + '%', background: theme.deeper }} />
      </div>
      <div className="text-[10px] font-bold mt-1 flex justify-between" style={{ color: theme.deeper }}>
        <span>{t('reward.starsProgress', { done: totalStars, goal: reward.goal })}</span>
        <button onClick={clearReward} className="hover:text-earthy-cocoa">{t('reward.remove')}</button>
      </div>
      {modal}
    </div>
  )
}
