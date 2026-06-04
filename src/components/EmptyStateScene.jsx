// EmptyStateScene uses the real iOS splash artwork. Keep this as a raster
// crop instead of recreating the illustration in SVG so web and iOS stay aligned.

const SPLASH_ART = '/onboarding-art/winkingstar-splash.png?v=20260531'

const FRAMES = {
  'no-kids': { aspectRatio: '2 / 1', objectPosition: '50% 48%' },
  welcome: { aspectRatio: '2 / 1', objectPosition: '50% 48%' },
  joining: { aspectRatio: '2 / 1', objectPosition: '50% 48%' },
  'no-weeks': { aspectRatio: '1.55 / 1', objectPosition: '50% 47%' },
}

export default function EmptyStateScene({ variant = 'no-kids', className = '', height }) {
  const frame = FRAMES[variant] || FRAMES['no-kids']

  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: height ?? undefined,
        aspectRatio: height ? undefined : frame.aspectRatio,
        overflow: 'hidden',
        display: 'block',
        backgroundColor: '#F7F5EF',
      }}
    >
      <img
        src={SPLASH_ART}
        alt=""
        draggable={false}
        loading="lazy"
        decoding="async"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: frame.objectPosition,
          userSelect: 'none',
        }}
      />
    </div>
  )
}
