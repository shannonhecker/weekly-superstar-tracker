// Canonical 3-pill trust signal row for the onboarding journey.
// Same content + order on every onboarding surface (Landing / SignUp /
// SignIn / Join). Single source of copy — change here, change everywhere.
//
// Per spec section 7 + Q4: Ages 3 to 12 · No ads, ever · Free to try.

const TRUST_PILLS = [
  'Ages 3 to 12',
  'No ads, ever',
  'Free to try',
]

export default function TrustPills({ className = '' }) {
  return (
    <ul
      role="list"
      className={`grid grid-cols-3 gap-3 text-center ${className}`.trim()}
    >
      {TRUST_PILLS.map((label) => (
        <li
          key={label}
          role="listitem"
          data-testid="trust-pill"
          className="rounded-2xl border border-earthy-divider bg-earthy-ivory px-3 py-3 text-sm font-extrabold text-earthy-cocoa"
        >
          {label}
        </li>
      ))}
    </ul>
  )
}
