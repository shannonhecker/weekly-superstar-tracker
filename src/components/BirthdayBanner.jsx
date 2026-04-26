import { isBirthdayWeek } from '../lib/themes'
import AnimatedRasterBanner from './AnimatedRasterBanner'

const BIRTHDAY_BANNER = '/theme-banners/birthday.png'

export function BirthdayBanner({ kid }) {
  if (!isBirthdayWeek(kid?.birthday)) return null
  return (
    <AnimatedRasterBanner
      source={BIRTHDAY_BANNER}
      height={118}
      borderRadius={16}
      effect="confetti"
      accessibilityLabel={`Birthday week for ${kid?.name || 'someone'}.`}
      style={{ margin: '0 12px 8px' }}
    />
  )
}
