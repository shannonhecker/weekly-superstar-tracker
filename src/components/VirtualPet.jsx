import { getPetState } from '../utils/helpers'

const PET_ANIMATIONS = [
  'animate-pet-sleep',   // tier 0: sleeping/low
  'animate-pet-wiggle',  // tier 1: awake, wiggling
  'animate-pet-dance',   // tier 2: happy, dancing
  'animate-pet-jump',    // tier 3: excited, jumping
  'animate-pet-party',   // tier 4: superstar, full party
]

const VirtualPet = ({ score, name, theme }) => {
  const pet = getPetState(score, theme)
  const tier = theme.petStates.indexOf(pet)
  const anim = PET_ANIMATIONS[tier] || PET_ANIMATIONS[0]

  return (
    <div
      className="flex items-center gap-2.5 sm:gap-3.5 rounded-2xl p-3 sm:p-3.5"
      style={{ background: pet.bg, border: `2px solid ${theme.accentLight}` }}
    >
      <div className={`text-[36px] sm:text-[44px] shrink-0 ${anim}`}>
        {pet.face}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] sm:text-[13px] font-extrabold mb-0.5" style={{ color: theme.accent }}>
          {name}'s Buddy
        </div>
        <div className="text-[13px] sm:text-[15px] font-bold text-gray-800">{pet.mood}</div>
        <div className="text-[10px] sm:text-xs font-semibold italic text-gray-400 truncate">"{pet.msg}"</div>
      </div>
    </div>
  )
}

export default VirtualPet
