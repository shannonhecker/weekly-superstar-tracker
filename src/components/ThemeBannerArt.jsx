import { THEMES } from '../lib/themes'
import AnimatedRasterBanner from './AnimatedRasterBanner'
import { EFFECT_BY_THEME } from './banner-effects'

const BANNER_IMAGES = {
  rugby: '/theme-banners/rugby.png',
  ocean: '/theme-banners/ocean.png',
  animals: '/theme-banners/animals.png',
  football: '/theme-banners/football.png',
  dinosaur: '/theme-banners/dinosaur.png',
  unicorn: '/theme-banners/unicorn.png',
  rocket: '/theme-banners/rocket.png',
  princess: '/theme-banners/princess.png',
  garden: '/theme-banners/garden.png',
  robot: '/theme-banners/robot.png',
  magic: '/theme-banners/magic.png',
  train: '/theme-banners/train.png',
  fairy: '/theme-banners/fairy.png',
  bear: '/theme-banners/bear.png',
}

export default function ThemeBannerArt({ themeKey = 'animals', height, animated = true }) {
  const image = BANNER_IMAGES[themeKey]
  const theme = THEMES[themeKey] || THEMES.animals
  const label = theme?.label || 'Animals'
  const effect = EFFECT_BY_THEME[themeKey] || 'petals'

  if (!image) return null

  return (
    <AnimatedRasterBanner
      source={image}
      height={height ?? 160}
      borderRadius={24}
      animated={animated}
      effect={effect}
      themeColors={{ accent: theme.accent, deeper: theme.deeper }}
      accessibilityLabel={`${label} theme banner`}
    />
  )
}
