import { colors } from '@weekly-superstar/shared/tokens'

/**
 * PhoneBezel — dev-only screenshot frame.
 *
 * Wraps a 390×844 viewport in a black gradient bezel matching the look of
 * `public/onboarding-art/peek/welcome-stub.svg` so the captured PNG can drop
 * straight into the wizard banner peek slot without further compositing.
 *
 * - Outer frame: 32px radius, linear gradient earthy.bezelDeep → earthy.bezelDeepest
 * - Camera dot: small circle, top-center
 * - Screen: rounded 26px, slight inset so the bezel "rim" reads
 */
export default function PhoneBezel({ children, screenBg = colors.earthy.ivory }) {
  const W = 390
  const H = 844
  const bezelInset = 8
  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.earthy.ivory,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        fontFamily: 'Plus Jakarta Sans, system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          width: W,
          height: H,
          borderRadius: 32,
          background: `linear-gradient(180deg, ${colors.earthy.bezelDeep} 0%, ${colors.earthy.bezelDeepest} 100%)`,
          boxShadow: `0 24px 64px ${colors.earthy.bezelDeep}59`,
          padding: bezelInset,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {/* Camera dot, top-center */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: colors.earthy.bezelDeepest,
            boxShadow: 'inset 0 0 2px rgba(255,255,255,0.1)',
            zIndex: 2,
          }}
        />
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 26,
            overflow: 'hidden',
            background: screenBg,
            position: 'relative',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
