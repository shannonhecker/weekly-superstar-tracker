import { EFFECT_PROFILES, NEUTRAL_THEME } from './banner-effects'
import './AnimatedRasterBanner.css'

function shapeStyle(shape, size) {
  switch (shape) {
    case 'tall-rect':
      return { width: size * 0.7, height: size * 1.8, borderRadius: 1 }
    case 'oval':
      return { width: size, height: size * 1.4, borderRadius: size }
    case 'puff':
      return { width: size, height: size, borderRadius: size }
    case 'diamond':
      return { width: size, height: size, borderRadius: 1 }
    case 'round':
    default:
      return { width: size, height: size, borderRadius: size }
  }
}

export default function AnimatedRasterBanner({
  source,
  accessibilityLabel,
  height = 160,
  borderRadius = 24,
  animated = true,
  effect = 'petals',
  themeColors = NEUTRAL_THEME,
  style,
}) {
  const profile = EFFECT_PROFILES[effect] || EFFECT_PROFILES.petals
  const colors = profile.colorize(themeColors)
  const isBubble = effect === 'bubbles'

  const wrapperStyle = {
    height,
    borderRadius,
    ...style,
  }

  return (
    <div
      role="img"
      aria-label={accessibilityLabel}
      className="ws-raster-banner"
      style={wrapperStyle}
    >
      <img src={source} alt="" />
      {animated ? (
        <div className="ws-particle-layer" aria-hidden="true">
          {profile.positions.map((p, i) => {
            const color = colors[i % colors.length]
            const dims = shapeStyle(profile.shape, p.size)
            return (
              <div
                key={i}
                className={`ws-particle ws-effect-${effect} ws-shape-${profile.shape}`}
                style={{
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  ...dims,
                  backgroundColor: isBubble ? 'rgba(255,255,255,0.16)' : color,
                  border: isBubble ? `1.5px solid rgba(255,255,255,0.82)` : 'none',
                  '--ws-drift': `${p.drift}px`,
                  '--ws-rise': `${p.rise}px`,
                  '--ws-rotate': `${p.rotate}deg`,
                  animationDelay: `${i * -1.5}s`,
                }}
              />
            )
          })}
          {profile.hero ? (() => {
            const h = profile.hero
            const heroShape = h.shape || profile.shape
            const heroDims = shapeStyle(heroShape, h.position.size)
            const heroColor = h.color(themeColors)
            return (
              <div
                className={`ws-particle ws-hero ws-effect-${effect} ws-shape-${heroShape}`}
                style={{
                  left: `${h.position.left}%`,
                  top: `${h.position.top}%`,
                  ...heroDims,
                  backgroundColor: isBubble ? 'rgba(255,255,255,0.18)' : heroColor,
                  border: isBubble ? `2px solid rgba(255,255,255,0.92)` : 'none',
                  '--ws-drift': `${h.position.drift}px`,
                  '--ws-rise': `${h.position.rise}px`,
                  '--ws-rotate': `${h.position.rotate}deg`,
                }}
              />
            )
          })() : null}
        </div>
      ) : null}
    </div>
  )
}
