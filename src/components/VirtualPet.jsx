import { useEffect, useRef, useState } from 'react'
import { getPetStateByTier, getPetTier } from '../utils/randomPets'
import PetFace from './PetFace'

const PET_ANIMATIONS = [
  'animate-pet-sleep',
  'animate-pet-wiggle',
  'animate-pet-dance',
  'animate-pet-jump',
  'animate-pet-party',
]

const SPARKLES = ['✨', '💫', '⭐', '🌟']

// Fixed pseudo-random motif positions inside the egg oval (percentages).
const MOTIF_POSITIONS = [
  { top: '18%', left: '28%' },
  { top: '36%', left: '66%' },
  { top: '58%', left: '26%' },
  { top: '72%', left: '58%' },
]

const VirtualPet = ({ score, name, theme, petIdx, eggIdx, maxTotal = 0 }) => {
  const tier = getPetTier(score, maxTotal)
  const pet = getPetStateByTier(tier, petIdx ?? 0, eggIdx ?? 0, {
    score,
    maxTotal,
    theme,
  })
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

  const eggAnim = pet.isEgg
    ? pet.hatchProgress >= 0.75
      ? 'animate-egg-shake'
      : 'animate-pet-wiggle'
    : ''
  const showCrack = pet.isEgg && pet.hatchProgress >= 0.5
  const faceAnim = justAdvanced ? 'animate-hatch-pop' : anim

  const motifs = pet.isEgg
    ? Array.from({ length: Math.min(pet.eggMotifCount || 0, MOTIF_POSITIONS.length) })
    : []

  // Theme-tinted card background
  const cardBg = theme?.accentLight
    ? `${theme.accentLight}30`
    : pet.bg
  const cardBorder = theme?.accentLight
    ? `2px solid ${theme.accentLight}`
    : `2px solid ${theme?.accentLight || '#E5E7EB'}`

  return (
    <div
      className="flex items-center gap-2.5 sm:gap-3.5 rounded-2xl p-3 sm:p-3.5"
      style={{ background: cardBg, border: cardBorder }}
    >
      <div className="relative shrink-0">
        {pet.isEgg ? (
          <div
            className={`relative flex items-center justify-center ${eggAnim}`}
            style={{
              width: 56,
              height: 66,
              background: `radial-gradient(ellipse at 35% 25%, white, ${pet.eggColor}AA 45%, ${pet.eggColor})`,
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              boxShadow: `0 4px 16px ${pet.eggColor}55, inset 0 -8px 16px ${pet.eggColor}33`,
            }}
          >
            {motifs.map((_, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="absolute pointer-events-none select-none"
                style={{
                  ...MOTIF_POSITIONS[i],
                  color: pet.eggMotifColor,
                  fontSize: pet.eggMotif && pet.eggMotif.length > 1 ? 10 : 12,
                  fontWeight: 900,
                  opacity: 0.9,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {pet.eggMotif}
              </span>
            ))}
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
          <div className={`inline-block ${faceAnim}`}>
            <PetFace emoji={pet.face} />
          </div>
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
        <div className="text-[15px] sm:text-[17px] font-extrabold text-gray-800 leading-tight">
          {pet.mood}
        </div>
        <div
          className="text-[11px] sm:text-xs font-semibold italic truncate"
          style={{ color: theme.accent, opacity: 0.75 }}
        >
          {pet.isEgg ? pet.msg : `"${pet.msg}"`}
        </div>
      </div>
    </div>
  )
}

export default VirtualPet
