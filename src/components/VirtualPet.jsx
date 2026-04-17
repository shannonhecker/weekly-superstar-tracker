import { useEffect, useRef, useState } from 'react'
import { getPetStateByTier, getPetTier } from '../utils/randomPets'

const PET_ANIMATIONS = [
  'animate-pet-sleep',
  'animate-pet-wiggle',
  'animate-pet-dance',
  'animate-pet-jump',
  'animate-pet-party',
]

const SPARKLES = ['✨', '💫', '⭐', '🌟']

const VirtualPet = ({ score, name, theme, petIdx, eggIdx, maxTotal = 0 }) => {
  const tier = getPetTier(score, maxTotal)
  const pet = getPetStateByTier(tier, petIdx ?? 0, eggIdx ?? 0, { score, maxTotal })
  const anim = PET_ANIMATIONS[tier]

  const prevTierRef = useRef(tier)
  const [sparkle, setSparkle] = useState(false)
  const [justAdvanced, setJustAdvanced] = useState(false)

  useEffect(() => {
    const prev = prevTierRef.current
    prevTierRef.current = tier
    if (tier > prev) {
      setSparkle(true)
      setJustAdvanced(true)
      const sparkleT = setTimeout(() => setSparkle(false), 1300)
      const popT = setTimeout(() => setJustAdvanced(false), 700)
      return () => {
        clearTimeout(sparkleT)
        clearTimeout(popT)
      }
    }
  }, [tier])

  // Egg wiggles more the closer it is to hatching
  const eggAnim = pet.isEgg
    ? pet.hatchProgress >= 0.75
      ? 'animate-egg-shake'
      : 'animate-pet-wiggle'
    : ''
  const showCrack = pet.isEgg && pet.hatchProgress >= 0.5
  const faceAnim = justAdvanced ? 'animate-hatch-pop' : anim

  return (
    <div
      className="flex items-center gap-2.5 sm:gap-3.5 rounded-2xl p-3 sm:p-3.5"
      style={{ background: pet.bg, border: `2px solid ${theme.accentLight}` }}
    >
      <div className="relative shrink-0">
        {pet.isEgg ? (
          <div
            className={`relative flex items-center justify-center ${eggAnim}`}
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
            {showCrack && (
              <svg
                viewBox="0 0 56 66"
                className="absolute inset-0 w-full h-full pointer-events-none"
                aria-hidden="true"
              >
                <path
                  d="M 30 6 L 26 16 L 32 22 L 24 30 L 30 38 L 22 46 L 30 54"
                  stroke="rgba(0,0,0,0.4)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  fill="none"
                />
                {pet.hatchProgress >= 0.8 && (
                  <path
                    d="M 20 22 L 18 28 L 24 32"
                    stroke="rgba(0,0,0,0.35)"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    fill="none"
                  />
                )}
              </svg>
            )}
          </div>
        ) : (
          <div className={`text-[52px] sm:text-[64px] ${faceAnim}`}>{pet.face}</div>
        )}
        {sparkle && (
          <div className="pointer-events-none absolute -top-3 left-0 right-0 flex justify-between">
            {SPARKLES.map((s, i) => (
              <span
                key={i}
                className="text-sm sm:text-base animate-sparkle-float"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-[11px] sm:text-[13px] font-extrabold mb-0.5"
          style={{ color: theme.accent }}
        >
          {name}'s {pet.isEgg ? 'Mystery Pet' : pet.petName}
        </div>
        <div className="text-[13px] sm:text-[15px] font-bold text-gray-800">{pet.mood}</div>
        <div className="text-[10px] sm:text-xs font-semibold italic text-gray-400 truncate">
          "{pet.msg}"
        </div>
      </div>
    </div>
  )
}

export default VirtualPet
