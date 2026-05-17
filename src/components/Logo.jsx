// Winking Star brand mark.
// Keep this aligned with the browser/PWA icons in /public.
export default function Logo({ size = 32, className = '', title = 'Winking Star' }) {
  const cornerRadius = typeof size === 'number' ? Math.max(6, Math.round(size * 0.22)) : '22%'

  return (
    <img
      src="/winking-star.png?v=20260516"
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
        borderRadius: cornerRadius,
      }}
      className={className}
    />
  )
}
