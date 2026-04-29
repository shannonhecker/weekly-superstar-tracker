import { useState } from 'react'
import { PET_ASSET, animatedFluentUrl } from '../lib/themes'

// Per-theme egg pattern (stage 0 only). Matches the original themed SVG egg design.
const EGG_PATTERNS = {
  football: { spots: '#FFFFFF', spotShape: 'hex' },
  dinosaur: { spots: '#1F8F87', spotShape: 'dot' },
  unicorn:  { spots: '#FFFFFF', spotShape: 'sparkle' },
  animals:  { spots: '#8B5E3C', spotShape: 'paw' },
  rocket:   { spots: '#FFD700', spotShape: 'star' },
  princess: { spots: '#FFFFFF', spotShape: 'heart' },
  ocean:    { spots: '#FFFFFF', spotShape: 'drop' },
  garden:   { spots: '#FFF7D1', spotShape: 'flower' },
  robot:    { spots: '#F4D35E', spotShape: 'bolt' },
  magic:    { spots: '#FFFFFF', spotShape: 'moon' },
}

function Spot({ shape, x, y, color, scale = 1 }) {
  const t = `translate(${x} ${y}) scale(${scale})`
  if (shape === 'hex') return <polygon transform={t} points="0,-6 5,-3 5,3 0,6 -5,3 -5,-3" fill={color} />
  if (shape === 'sparkle') return <path transform={t} d="M0,-7 L1.5,-1.5 L7,0 L1.5,1.5 L0,7 L-1.5,1.5 L-7,0 L-1.5,-1.5 Z" fill={color} />
  if (shape === 'star') return <path transform={t} d="M0,-6 L1.7,-1.8 L6,-1.8 L2.5,1 L3.8,5.5 L0,3 L-3.8,5.5 L-2.5,1 L-6,-1.8 L-1.7,-1.8 Z" fill={color} />
  if (shape === 'heart') return <path transform={t} d="M0,5 C-6,0 -6,-5 -3,-5 C-1,-5 0,-3 0,-2 C0,-3 1,-5 3,-5 C6,-5 6,0 0,5 Z" fill={color} />
  if (shape === 'paw') return (
    <g transform={t} fill={color}>
      <ellipse cx="0" cy="2" rx="3" ry="2.5" />
      <circle cx="-3" cy="-2" r="1.3" />
      <circle cx="0" cy="-3.5" r="1.3" />
      <circle cx="3" cy="-2" r="1.3" />
    </g>
  )
  if (shape === 'drop') return <path transform={t} d="M0,-6 C3,-2 4,1 4,3 C4,5.2 2.2,7 0,7 C-2.2,7 -4,5.2 -4,3 C-4,1 -3,-2 0,-6 Z" fill={color} />
  if (shape === 'flower') return (
    <g transform={t} fill={color}>
      <circle cx="0" cy="-4" r="2" />
      <circle cx="3.8" cy="-1.2" r="2" />
      <circle cx="2.4" cy="3.2" r="2" />
      <circle cx="-2.4" cy="3.2" r="2" />
      <circle cx="-3.8" cy="-1.2" r="2" />
      <circle cx="0" cy="0" r="1.3" fill="#FFD15C" />
    </g>
  )
  if (shape === 'bolt') return <path transform={t} d="M1,-7 L-3,1 L0,1 L-1,7 L3,-1 L0,-1 Z" fill={color} />
  if (shape === 'moon') return <path transform={t} d="M2,-6 C-2,-6 -5,-3 -5,1 C-5,5 -2,8 2,8 C0,7 -1,4 -1,1 C-1,-2 0,-5 2,-6 Z" fill={color} />
  return <circle transform={t} r="3" fill={color} />
}

function ThemedSvgEgg({ themeKey, accent, size }) {
  const pattern = EGG_PATTERNS[themeKey] || EGG_PATTERNS.dinosaur
  const gradId = `egg-grad-${themeKey || 'default'}`
  const shadowId = `egg-shadow-${themeKey || 'default'}`
  return (
    <svg
      viewBox="0 0 100 130"
      width={size}
      height={size * 1.3}
      style={{ maxHeight: size }}
      className="egg-float"
    >
      <defs>
        <radialGradient id={gradId} cx="35%" cy="35%">
          <stop offset="0%" stopColor="white" stopOpacity="0.9" />
          <stop offset="60%" stopColor={accent} stopOpacity="0.85" />
          <stop offset="100%" stopColor={accent} />
        </radialGradient>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="2" floodOpacity="0.18" />
        </filter>
      </defs>
      <g filter={`url(#${shadowId})`}>
        <ellipse cx="50" cy="70" rx="42" ry="55" fill={`url(#${gradId})`} />
        <Spot shape={pattern.spotShape} x={32} y={50} color={pattern.spots} scale={0.9} />
        <Spot shape={pattern.spotShape} x={68} y={60} color={pattern.spots} scale={1.1} />
        <Spot shape={pattern.spotShape} x={45} y={85} color={pattern.spots} scale={0.8} />
        <Spot shape={pattern.spotShape} x={62} y={95} color={pattern.spots} scale={1} />
        <Spot shape={pattern.spotShape} x={28} y={75} color={pattern.spots} scale={0.7} />
      </g>
    </svg>
  )
}

// 7-stage hatching: stage 0 is the egg; stages 1–6 are the kid's random pet
// growing from baby → adult. Art: Microsoft Fluent 3D animated PNGs via the
// Tarikul-Islam-Anik/Animated-Fluent-Emojis GitHub CDN (MIT).
// Each stage has a distinct mood: pet size + secondary "emotion" Fluent emoji
// overlay + background color + pose/animation. All emojis are Fluent-styled for
// visual consistency.
//
// Stage 0 (0–16%)   🥚 intact egg
// Stage 1 (17–33%)  baby pet + 💤 zzz overlay, soft blue bg, tilted pose
// Stage 2 (34–49%)  growing pet + 🌱 seedling overlay, green bg, gentle sway
// Stage 3 (50–66%)  happy pet + 😊 smile overlay, peach bg
// Stage 4 (67–82%)  sparkly pet + ✨ sparkle overlay, pink bg, wiggle
// Stage 5 (83–99%)  cool pet + 😎 shades overlay, lavender bg
// Stage 6 (100%)    party pet + 🥳 party overlay, rainbow bg, DANCE loop, halo, bounce, sparkles

const STAGE_EMOTION = {
  1: ['Smilies', 'Zzz'],
  2: ['Animals', 'Seedling'],
  3: ['Smilies', 'Smiling Face with Smiling Eyes'],
  4: ['Symbols', 'Sparkle'],
  5: ['Smilies', 'Smiling Face with Sunglasses'],
  6: ['Smilies', 'Partying Face'],
}

const STAGE_BG = {
  0: null,
  1: '#E6F0FF',
  2: '#E8F5E9',
  3: '#FFF3E0',
  4: '#FFE4F0',
  5: '#F3E8FF',
  6: 'rainbow',
}

const STAGE_POSE_CLASS = {
  1: 'pet-sway',
  2: 'pet-grow-bob',
  3: 'pet-hop',
  4: 'pet-excited',
  5: 'pet-strut',
  6: 'pet-dance',
}

function progressToStage(stars, goal) {
  if (goal <= 0) return 0
  const pct = stars / goal
  if (pct >= 1) return 6
  if (pct >= 5 / 6) return 5
  if (pct >= 4 / 6) return 4
  if (pct >= 3 / 6) return 3
  if (pct >= 2 / 6) return 2
  if (pct >= 1 / 6) return 1
  return 0
}

function emotionUrl(stage) {
  const asset = STAGE_EMOTION[stage]
  if (!asset) return null
  return `https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/${encodeURIComponent(asset[0])}/${encodeURIComponent(asset[1])}.png`
}

function staticFluentUrl(emoji) {
  const cp = emoji.codePointAt(0).toString(16).toLowerCase().padStart(4, '0')
  return `https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/${cp}_3d.png`
}

function openMojiUrl(emoji) {
  const cp = emoji.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')
  return `https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji/color/svg/${cp}.svg`
}

function Sparkles() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 pointer-events-none"
      width="100%"
      height="100%"
    >
      <g fill="#FFE066">
        <circle cx="16" cy="40" r="2.5" className="sparkle" style={{ animationDelay: '0s' }} />
        <circle cx="84" cy="36" r="2" className="sparkle" style={{ animationDelay: '0.3s' }} />
        <circle cx="20" cy="86" r="2" className="sparkle" style={{ animationDelay: '0.6s' }} />
        <circle cx="82" cy="82" r="2.5" className="sparkle" style={{ animationDelay: '0.9s' }} />
        <circle cx="50" cy="14" r="2" className="sparkle" style={{ animationDelay: '1.2s' }} />
      </g>
    </svg>
  )
}

function PetImage({ emoji, sizePx, className, style }) {
  const sources = [animatedFluentUrl(emoji), staticFluentUrl(emoji), openMojiUrl(emoji)].filter(Boolean)
  const [idx, setIdx] = useState(0)
  const [failed, setFailed] = useState(false)
  const src = sources[idx]
  if (failed || !src) {
    return (
      <span className={className} style={{ fontSize: sizePx * 0.85, lineHeight: 1, ...style }}>
        {emoji}
      </span>
    )
  }
  return (
    <img
      src={src}
      alt=""
      width={sizePx}
      height={sizePx}
      draggable={false}
      onError={() => {
        if (idx + 1 < sources.length) setIdx(idx + 1)
        else setFailed(true)
      }}
      className={className}
      style={style}
    />
  )
}

export default function Egg({ themeKey, accent, totalStars, max, petEmoji, size = 96 }) {
  const stage = progressToStage(totalStars, max)

  // Stage 0: themed SVG egg with dotted pattern & pastel gradient (original design)
  if (stage === 0) {
    return (
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <ThemedSvgEgg themeKey={themeKey} accent={accent} size={size} />
      </div>
    )
  }

  const emoji = petEmoji
  const scale = stage === 1 ? 0.5
    : stage === 2 ? 0.65
    : stage === 3 ? 0.78
    : stage === 4 ? 0.87
    : stage === 5 ? 0.94
    : 1
  const imgPx = Math.round(size * scale)

  const halo = stage === 6 || stage === 5
  const bounce = stage === 6
  const sparkle = stage >= 4
  const poseClass = STAGE_POSE_CLASS[stage]

  const bg = STAGE_BG[stage]
  const emotionSrc = emotionUrl(stage)
  const emotionSize = Math.round(size * 0.32)

  const petClassName = [
    poseClass,
    bounce && 'animate-bounce',
  ].filter(Boolean).join(' ')

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Background layer (pastel circle or rainbow) */}
      {bg === 'rainbow' ? (
        <div className="absolute inset-0 rounded-full bg-rainbow" />
      ) : bg ? (
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(circle, ${bg} 0%, transparent 70%)` }}
        />
      ) : null}

      {/* Themed accent halo at higher stages */}
      {halo && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${accent}${stage === 6 ? '44' : '22'} 40%, transparent 75%)`,
          }}
        />
      )}

      {/* Pet image */}
      <PetImage
        emoji={emoji}
        sizePx={imgPx}
        className={petClassName}
        style={bounce ? { animationDuration: '2s' } : undefined}
      />

      {/* Emotion overlay in bottom-right — bobs and rotates gently */}
      {emotionSrc && stage >= 1 && (
        <img
          key={`emotion-${stage}`}
          src={emotionSrc}
          alt=""
          width={emotionSize}
          height={emotionSize}
          draggable={false}
          className="absolute emotion-bob pop-in"
          style={{
            right: 0,
            bottom: 0,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
          }}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      )}

      {sparkle && <Sparkles />}
    </div>
  )
}
