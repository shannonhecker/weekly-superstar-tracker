import WizardHero from './WizardHero'

export default function WizardStepCard({
  illustration,
  children,
  heroHeight = 188,
  objectPosition = 'center',
  className = '',
  contentClassName = '',
}) {
  return (
    <section
      className={[
        'relative overflow-hidden rounded-[30px] border border-earthy-dividerCream bg-white shadow-earthy-soft',
        className,
      ].filter(Boolean).join(' ')}
    >
      <div className="relative">
        <WizardHero
          illustration={illustration}
          height={heroHeight}
          borderRadius={0}
        animated
        objectPosition={objectPosition}
        loading="eager"
      />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-b from-white/0 to-white/80" />
      </div>
      <div
        className={[
          'relative -mt-8 rounded-t-[30px] border-t border-earthy-dividerCream bg-white px-5 pb-6 pt-6 sm:px-6 sm:pb-7 sm:pt-7',
          contentClassName,
        ].filter(Boolean).join(' ')}
      >
        {children}
      </div>
    </section>
  )
}
