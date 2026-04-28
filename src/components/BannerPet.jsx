import { animatedFluentUrl } from '../lib/themes'

// Favorite-pet overlay for the theme banner. Sits absolute bottom-right of
// whatever wrapper renders it (caller must give the wrapper position:relative).
//
// Renders nothing when:
//   - no emoji is supplied (kid hasn't favorited a pet yet),
//   - animated === false (PrintSheet uses this to keep the print output static),
//   - size < 32 (banner is too tiny to host a recognisable pet — birthday strip,
//     thumbnails, etc.)
//
// The bobbing motion lives in src/components/AnimatedRasterBanner.css under
// the `.ws-banner-pet` / `@keyframes ws-pet-bob` rules — already gated by the
// reduced-motion media query in that stylesheet.
export default function BannerPet({ emoji, animated = true, size = 56 }) {
  if (!emoji || !animated) return null
  if (size < 32) return null
  const src = animatedFluentUrl(emoji)
  if (!src) return null
  return (
    <div
      className="absolute bottom-3 right-3 pointer-events-none"
      aria-hidden="true"
    >
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        draggable={false}
        className="ws-banner-pet"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(90, 58, 46, 0.18))' }}
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
    </div>
  )
}
