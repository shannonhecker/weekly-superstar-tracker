import { getPetState } from '../utils/helpers'

const VirtualPet = ({ score, name, theme }) => {
  const pet = getPetState(score, theme)

  return (
    <div
      className="flex items-center gap-3.5 rounded-2xl p-3.5"
      style={{ background: pet.bg, border: `2px solid ${theme.accentLight}` }}
    >
      <div
        className={`text-[44px] ${score > 20 ? 'animate-pet-bounce' : ''}`}
      >
        {pet.face}
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
