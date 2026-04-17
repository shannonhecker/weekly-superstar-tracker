import { useEffect, useRef, useState } from 'react'
import { getPetState, getPetStageIndex } from '../utils/helpers'

const SPARKLES = ['✨', '💫', '⭐', '🌟']

const VirtualPet = ({ score, name, theme }) => {
  const pet = getPetState(score, theme)
  const stageIndex = getPetStageIndex(score, theme)
  const prevStageRef = useRef(stageIndex)
  const [sparkle, setSparkle] = useState(false)
  const [justAdvanced, setJustAdvanced] = useState(false)

  useEffect(() => {
    const prev = prevStageRef.current
    prevStageRef.current = stageIndex
    if (stageIndex > prev) {
      setSparkle(true)
      setJustAdvanced(true)
      const sparkleT = setTimeout(() => setSparkle(false), 1200)
      const popT = setTimeout(() => setJustAdvanced(false), 700)
      return () => {
        clearTimeout(sparkleT)
        clearTimeout(popT)
      }
    }
  }, [stageIndex])

  const isEgg = stageIndex === 0
  const faceClass = [
    'inline-block text-[44px]',
    justAdvanced
      ? 'animate-stage-pop-in'
      : isEgg
        ? 'animate-egg-wobble'
        : score > 20
          ? 'animate-pet-bounce'
          : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className="relative flex items-center gap-3.5 rounded-2xl p-3.5 overflow-hidden"
      style={{ background: pet.bg, border: `2px solid ${theme.accentLight}` }}
    >
      <div className="relative">
        <span className={faceClass} aria-label={pet.mood}>
          {pet.face}
        </span>
        {sparkle && (
          <div className="pointer-events-none absolute inset-0 -top-2 flex justify-between">
            {SPARKLES.map((s, i) => (
              <span
                key={i}
                className="text-base animate-sparkle-float"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-extrabold mb-0.5" style={{ color: theme.accent }}>
          {name}'s Buddy
        </div>
        <div className="text-[15px] font-bold text-gray-800">{pet.mood}</div>
        <div className="text-xs font-semibold italic text-gray-400">"{pet.msg}"</div>
      </div>
    </div>
  )
}

export default VirtualPet
