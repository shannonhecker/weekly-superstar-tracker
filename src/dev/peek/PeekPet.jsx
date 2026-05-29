import { colors } from '@weekly-superstar/shared/tokens'
import { THEMES, PET_CHAINS, petAtStage, stageToChainIdx } from '../../lib/themes'
import PhoneBezel from './PhoneBezel'

/**
 * PeekPet — dev-only mock of the MysteryPet surface, framed for a wizard
 * banner screenshot. Big portrait + stage label, no Firestore/auth.
 *
 * Hardcoded fixture per task spec:
 *   theme="garden", stage 3 ("Happy 😊"), pet name "Sprout"
 */
const KID_NAME = 'Nathan'
const THEME_KEY = 'garden'
const PET_NAME = 'Sprout'
const STAGE = 3
// Garden theme uses bugs chain; pick a chain that reads as "garden-y".
// `petAtStage` will resolve emoji + species name from the chain.
const CHAIN_KEY = 'bugs'

function stageMessage(stage) {
  switch (stage) {
    case 0: return 'still hatching'
    case 1: return 'Snoozing 💤'
    case 2: return 'Growing 🌱'
    case 3: return 'Happy 😊'
    case 4: return 'Buzzing ✨'
    case 5: return 'Getting cool 😎'
    case 6: return '🎉 All grown!'
    default: return 'Happy 😊'
  }
}

export default function PeekPet() {
  const theme = THEMES[THEME_KEY] || THEMES.football
  // petAtStage handles unknown chains — falls back to cats — so even if a
  // future shared-package edit drops `bugs`, this still renders something.
  const chain = PET_CHAINS[CHAIN_KEY] || PET_CHAINS.cats
  const idx = stageToChainIdx(STAGE, chain.stages.length)
  const { emoji: petEmoji, name: petSpecies } = petAtStage(CHAIN_KEY, STAGE)

  return (
    <PhoneBezel screenBg={colors.earthy.ivory}>
      <div
        style={{
          width: '100%',
          height: '100%',
          padding: '64px 28px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          background: `linear-gradient(180deg, ${colors.earthy.ivory} 0%, ${theme.accent}22 100%)`,
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: theme.deeper,
          }}
        >
          {KID_NAME}'s Mystery Pet
        </div>

        {/* Big pet portrait — bezel-friendly proportions. The radial
            background echoes the inner-grid bubble inside MysteryPet.jsx
            (lines 187–201) but scaled up for hero use. */}
        <div
          style={{
            position: 'relative',
            width: 260,
            height: 260,
            borderRadius: 64,
            background: `${theme.accent}33`,
            border: `2px solid ${theme.accent}66`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 18px 40px rgba(26, 14, 7, 0.12)',
            overflow: 'hidden',
          }}
        >
          {/* Ground bubble — same trick as the real MysteryPet card */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: -40,
              right: -40,
              bottom: -60,
              height: 120,
              borderRadius: '50%',
              background: `${theme.accent}55`,
            }}
          />
          {/* Sparkle */}
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: 18,
              right: 22,
              fontSize: 18,
              color: theme.deeper,
            }}
          >
            ✦
          </span>
          <span
            style={{
              fontSize: 160,
              lineHeight: 1,
              position: 'relative',
              filter: 'drop-shadow(0 8px 12px rgba(26,14,7,0.18))',
            }}
          >
            {petEmoji}
          </span>
        </div>

        {/* Pet name + stage */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: colors.earthy.cocoa,
              lineHeight: 1.1,
            }}
          >
            {PET_NAME}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: theme.deeper,
              marginTop: 6,
              textTransform: 'capitalize',
            }}
          >
            Young {petSpecies}
          </div>
          <div
            style={{
              fontSize: 13,
              fontStyle: 'italic',
              color: theme.deeper,
              opacity: 0.85,
              marginTop: 4,
            }}
          >
            {stageMessage(STAGE)}
          </div>
        </div>

        {/* Stage chip */}
        <div
          style={{
            marginTop: 'auto',
            background: colors.earthy.card,
            border: `1px solid ${theme.accent}55`,
            borderRadius: 999,
            padding: '10px 18px',
            fontSize: 12,
            fontWeight: 800,
            color: colors.earthy.cocoa,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {chain.stages.map((s, i) => (
            <span
              key={i}
              style={{
                fontSize: i === idx ? 20 : 14,
                opacity: i === idx ? 1 : i < idx ? 0.6 : 0.25,
                transition: 'none',
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </PhoneBezel>
  )
}
