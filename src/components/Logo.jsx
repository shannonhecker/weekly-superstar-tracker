// Winking Star — the brand mark for "Winking Star" (web tracker + iOS app).
// Inline SVG so it can scale crisply at any size and inherit currentColor
// where needed. The fill is locked to the brand yellow; the inner face
// elements stay white. If a future need arises to recolour the body for a
// monochrome / dark-mode variant, swap the path fill to currentColor and
// pass a colour through className.
export default function Logo({ size = 32, className = '', title = 'Winking Star' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
    >
      <path
        d="M117.6 75.7
           L166.6 78.4
           L128.5 109.3
           L141.1 156.6
           L100 130
           L58.9 156.6
           L71.5 109.3
           L33.4 78.4
           L82.4 75.7
           C80 50, 88 30, 95 10
           C100 -2, 120 0, 125 15
           C122 35, 116 55, 117.6 75.7
           Z"
        fill="#F5C72C"
      />
      <ellipse cx="78" cy="98" rx="6" ry="11" fill="white" />
      <path
        d="M115 96 Q130 108 144 96"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M85 120 Q108 138 128 120"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
