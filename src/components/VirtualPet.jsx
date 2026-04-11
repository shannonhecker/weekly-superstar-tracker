import { useMemo } from 'react'
import { getRandomPetForWeek, getRandomPetState } from '../utils/randomPets'

const PET_ANIMATIONS = [
  'animate-pet-sleep',
  'animate-pet-wiggle',
  'animate-pet-dance',
  'animate-pet-jump',
  'animate-pet-party',
]

const VirtualPet = ({ score, name, theme }) => {
  const weekPet = useMemo(() => getRandomPetForWeek(theme.key), [theme.key])
  const pet = getRandomPetState(score, weekPet)
  const thresholds = [0, 11, 21, 33, 43]
  let tier = 0
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (score >= thresholds[i]) { tier = i; break }
  }
  const anim = PET_ANIMATIONS[tier]
  const isEgg = tier === 0

  return (
    <div
      className="flex items-center gap-2.5 sm:gap-3.5 rounded-2xl p-3 sm:p-3.5"
      style={{ background: pet.bg, border: `2px solid ${theme.accentLight}` }}
    >
      {isEgg ? (
        <div className="shrink-0 animate-pet-wiggle flex items-center justify-center"
          style={{
            width: 56,
            height: 66,
            background: `radial-gradient(ellipse at 35% 25%, white, ${pet.eggColor}88 40%, ${pet.eggColor})`,
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            boxShadow: `0 4px 16px ${pet.eggColor}55, inset 0 -8px 16px ${pet.eggColor}33`,
            fontSize: 24,
            fontWeight: 900,
            color: 'white',
            textShadow: `0 2px 4px ${pet.eggColor}`,
          }}
        >
          ?
        </div>
      ) : (
        <div className={`text-[52px] sm:text-[64px] shrink-0 ${anim}`}>
          {pet.face}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[11px] sm:text-[13px] font-extrabold mb-0.5" style={{ color: theme.accent }}>
          {name}'s {isEgg ? 'Mystery Pet' : weekPet.name}
        </div>
        <div className="text-[13px] sm:text-[15px] font-bold text-gray-800">{pet.mood}</div>
        <div className="text-[10px] sm:text-xs font-semibold italic text-gray-400 truncate">"{pet.msg}"</div>
      </div>
    </div>
  )
}

export default VirtualPet
