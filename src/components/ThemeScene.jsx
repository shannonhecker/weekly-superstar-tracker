import ThemeCardArt from './ThemeCardArt'
import ThemeBannerArt from './ThemeBannerArt'

export default function ThemeScene({ layout = 'banner', ...props }) {
  if (layout === 'banner') {
    return <ThemeBannerArt {...props} />
  }
  return <ThemeCardArt {...props} layout={layout} />
}
