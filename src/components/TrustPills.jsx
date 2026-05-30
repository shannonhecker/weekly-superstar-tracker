// Canonical 3-item trust signal row for the onboarding journey.
// Same content + order on every onboarding surface (Landing / SignUp /
// SignIn / Join). Single source of copy — change here, change everywhere.
//
// Static facts should not look like calls to action. Keep these as passive
// metadata labels, not bordered pills/buttons.

const TRUST_PILLS = [
  'Ages 3 to 12',
  'No ads, ever',
  'Free starter board',
]

export default function TrustPills({ className = '', align = 'center' }) {
  const alignmentClass = align === 'start'
    ? 'justify-start text-left'
    : 'justify-center text-center'

  return (
    <ul
      role="list"
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${alignmentClass} ${className}`.trim()}
    >
      {TRUST_PILLS.map((label) => (
        <li
          key={label}
          role="listitem"
          data-testid="trust-pill"
          className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-earthy-cocoaSoft sm:text-xs"
        >
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-earthy-sage" />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  )
}
