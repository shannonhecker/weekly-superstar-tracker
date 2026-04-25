// Winking Star — the brand mark for "Winking Star".
// Inline SVG so it scales crisply at any size. Path is sized to fill the
// viewBox tightly (~85%) so the star reads clearly even at 16×16 favicon
// scale — the previous version left too much empty space inside the box
// and the star looked tiny / squashed at small sizes.
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
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d="M122.3 69.3
           L178 74.7
           L136.1 111.7
           L148.2 167.7
           L100 138
           L51.8 167.7
           L63.9 111.7
           L22 74.7
           L77.7 69.3
           Q88 22 115 8
           Q130 22 122.3 69.3 Z"
        fill="#F5C72C"
      />
      <ellipse cx="80" cy="98" rx="7" ry="12" fill="white" />
      <path
        d="M112 95 Q128 108 144 95"
        stroke="white"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M84 122 Q108 142 132 122"
        stroke="white"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
