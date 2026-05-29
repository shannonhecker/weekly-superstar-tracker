function DoodleImage({ name, alt, className = '', sizes = '(max-width: 768px) 80vw, 420px' }) {
  return (
    <picture className={className}>
      <source
        type="image/webp"
        srcSet={`/onboarding-art/${name}-376w.webp 376w, /onboarding-art/${name}-768w.webp 768w`}
        sizes={sizes}
      />
      <img
        src={`/onboarding-art/${name}.png`}
        alt={alt}
        loading="eager"
        decoding="async"
        className="h-full w-full object-contain"
      />
    </picture>
  )
}

function StarDot({ className = '', delay = '0ms' }) {
  return (
    <span
      aria-hidden="true"
      className={`marketing-star-twinkle absolute rounded-full bg-earthy-sun ${className}`}
      style={{ animationDelay: delay }}
    />
  )
}

function MiniBoard() {
  return (
    <div
      aria-hidden="true"
      className="absolute bottom-6 left-6 hidden w-44 rounded-2xl border border-earthy-divider bg-earthy-card/95 p-3 shadow-earthy-card sm:block"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="h-3 w-16 rounded-pill bg-earthy-cocoa/20" />
        <span className="h-7 w-7 rounded-full bg-earthy-terracottaSoft" />
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 21 }).map((_, index) => (
          <span
            key={index}
            className={[
              'h-3 rounded-full',
              index % 5 === 0 ? 'bg-earthy-sun' : index % 3 === 0 ? 'bg-earthy-sage' : 'bg-earthy-divider',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  )
}

export default function MarketingDoodleStage({ className = '', compact = false }) {
  return (
    <div
      role="img"
      aria-label="A child friendly weekly star board with a cozy house, friendly character, and celebration doodles"
      className={[
        'relative overflow-hidden rounded-3xl border border-earthy-divider bg-earthy-cream shadow-earthy-lifted',
        compact ? 'min-h-[320px]' : 'min-h-[420px] sm:min-h-[500px]',
        className,
      ].filter(Boolean).join(' ')}
    >
      <div className="absolute inset-0 bg-earthy-ivory/50" aria-hidden="true" />
      <DoodleImage
        name="intro-house"
        alt=""
        sizes="(max-width: 768px) 70vw, 440px"
        className={[
          'onboarding-drift-slow absolute right-2 top-5 block w-[70%] max-w-[430px] sm:right-8 sm:top-8',
          compact ? 'w-[62%]' : '',
        ].join(' ')}
      />
      <DoodleImage
        name="intro-friend"
        alt=""
        sizes="(max-width: 768px) 42vw, 260px"
        className="onboarding-float absolute bottom-8 right-7 block w-[38%] max-w-[250px] sm:right-12"
      />
      <DoodleImage
        name="intro-cake"
        alt=""
        sizes="(max-width: 768px) 38vw, 220px"
        className="onboarding-bob absolute left-4 top-16 block w-[34%] max-w-[220px] opacity-95 sm:left-10 sm:top-20"
      />
      <MiniBoard />
      <StarDot className="left-[18%] top-[14%] h-3 w-3" />
      <StarDot className="right-[18%] top-[30%] h-2.5 w-2.5 bg-earthy-sage" delay="260ms" />
      <StarDot className="bottom-[26%] left-[48%] h-2 w-2 bg-earthy-terracottaSoft" delay="520ms" />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-24 bg-earthy-card/55"
      />
    </div>
  )
}
