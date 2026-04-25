// Winking Star — the brand mark for "Winking Star".
// Inline SVG so it scales crisply at any size. Path is constructed within
// viewBox 0 0 200 200 with comfortable breathing room around all 5 points
// — no clipping at small sizes, regardless of container shape.
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
      style={{ flexShrink: 0 }}
    >
      <path
        d="M123.5 76.7
           L176.1 80.3
           L133.3 116.4
           L147 169.1
           L100 140
           L53 169.1
           L66.7 116.4
           L23.9 80.3
           L76.5 76.7
           Q88 32 110 18
           Q132 30 123.5 76.7 Z"
        fill="#F5C72C"
      />
      <ellipse cx="82" cy="100" rx="6" ry="10" fill="white" />
      <path
        d="M114 96 Q128 108 144 96"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M86 124 Q108 140 130 124"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
