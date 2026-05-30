import AnimatedRasterBanner from '../AnimatedRasterBanner'

const BASE = '/onboarding-art'
const WIDTHS = [376, 768]

// Default sizes attribute: wizard hero stretches to viewport on phones, caps at
// 480px on tablet+ where the wizard container is centered. Matches the wizard
// max-w used in SignUp.jsx step containers.
const DEFAULT_SIZES = '(max-width: 480px) 100vw, 480px'

export default function WizardHero({
  illustration,
  alt = '',
  height = 200,
  borderRadius = 24,
  animated = false,
  effect,
  themeColors,
  objectPosition = 'center',
  loading = 'lazy',
  style,
}) {
  const src = `${BASE}/${illustration}.png`
  const webpSrcSet = WIDTHS.map((w) => `${BASE}/${illustration}-${w}w.webp ${w}w`).join(', ')

  return (
    <AnimatedRasterBanner
      source={src}
      webpSrcSet={webpSrcSet}
      sizes={DEFAULT_SIZES}
      loading={loading}
      accessibilityLabel={alt}
      height={height}
      borderRadius={borderRadius}
      animated={animated}
      effect={effect}
      themeColors={themeColors}
      objectPosition={objectPosition}
      style={style}
    />
  )
}
