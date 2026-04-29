import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import AnimatedRasterBanner from './AnimatedRasterBanner'

describe('AnimatedRasterBanner', () => {
  it('wraps the img in <picture> when webpSrcSet is provided so the WebP source can be served', () => {
    const { container } = render(
      <AnimatedRasterBanner
        source="/theme-banners/garden.png"
        webpSrcSet="/theme-banners/garden-376w.webp 376w, /theme-banners/garden-768w.webp 768w"
        sizes="(max-width: 768px) 100vw, 768px"
        height={160}
        animated={false}
      />
    )

    const wrapper = container.querySelector('.ws-raster-banner')
    expect(wrapper).not.toBeNull()

    // PR #36 puts <picture> directly inside the wrapper. The CSS that
    // sizes the banner art must therefore target both the picture box
    // AND the img inside it — not just `.ws-raster-banner > img`.
    const directChildren = Array.from(wrapper.children)
    const picture = directChildren.find((el) => el.tagName === 'PICTURE')
    expect(picture, 'expected <picture> as direct child of .ws-raster-banner').not.toBeUndefined()

    const img = picture.querySelector('img')
    expect(img).not.toBeNull()
    expect(img.getAttribute('src')).toBe('/theme-banners/garden.png')

    // Regression guard: when WebP is in use, no <img> should be a direct
    // child of the wrapper — it must be inside <picture>.
    const directImg = directChildren.find((el) => el.tagName === 'IMG')
    expect(directImg, '<img> should be inside <picture>, not a direct child').toBeUndefined()
  })

  it('renders a plain <img> as direct child when webpSrcSet is omitted', () => {
    const { container } = render(
      <AnimatedRasterBanner
        source="/theme-banners/garden.png"
        height={160}
        animated={false}
      />
    )

    const wrapper = container.querySelector('.ws-raster-banner')
    const directChildren = Array.from(wrapper.children)
    const directImg = directChildren.find((el) => el.tagName === 'IMG')
    expect(directImg).not.toBeUndefined()
    expect(directImg.getAttribute('src')).toBe('/theme-banners/garden.png')
  })
})
