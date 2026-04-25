// Winking Star — the brand mark.
// Renders the actual /public/winking-star.png so the proportions match the
// authored asset exactly (the previous hand-built SVG path mis-positioned
// the eyes + smile and read as a "squashed" face at small sizes).
//
// The PNG is the original ChatGPT-authored mark. For non-React contexts
// (favicon, share previews) the same asset is referenced directly via
// /winking-star.png.
export default function Logo({ size = 32, className = '', title = 'Winking Star' }) {
  return (
    <img
      src="/winking-star.png"
      alt={title}
      width={size}
      height={size}
      draggable={false}
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        userSelect: 'none',
        objectFit: 'contain',
      }}
      className={className}
    />
  )
}
