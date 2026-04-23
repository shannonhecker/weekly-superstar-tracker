import { useState } from 'react'

import { PET_ASSET, THEMES } from '../lib/themes'

function fluentUrl(emoji) {
  const asset = PET_ASSET[emoji]
  if (!asset) return null
  return `https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/${encodeURIComponent(asset[0])}/${encodeURIComponent(asset[1])}.png`
}

/**
 * Web mirror of iOS components/KidAvatar.tsx. Priority:
 *   photo (avatarUrl) → preset (Fluent Emoji PNG of avatarEmoji) → theme emoji.
 *
 * Background is always the kid's theme accent at 33 alpha so shape stays
 * consistent across the 3 states. borderColor optional — callers set it to
 * mark the active kid in the switcher.
 */
export function KidAvatar({ kid, size = 48, borderColor }) {
  const theme = THEMES[kid?.theme || 'football'] || THEMES.football
  const bg = `${theme.accent}33`
  const [photoFailed, setPhotoFailed] = useState(false)
  const [presetFailed, setPresetFailed] = useState(false)

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: borderColor ?? 'transparent',
    flexShrink: 0,
  }

  if (kid?.avatarKind === 'photo' && kid.avatarUrl && !photoFailed) {
    return (
      <div style={containerStyle}>
        <img
          src={kid.avatarUrl}
          alt=""
          style={{ width: size, height: size, objectFit: 'cover' }}
          onError={() => setPhotoFailed(true)}
        />
      </div>
    )
  }

  if (kid?.avatarKind === 'preset' && kid.avatarEmoji) {
    const url = fluentUrl(kid.avatarEmoji)
    if (url && !presetFailed) {
      return (
        <div style={containerStyle}>
          <img
            src={url}
            alt=""
            style={{ width: size * 0.75, height: size * 0.75 }}
            onError={() => setPresetFailed(true)}
          />
        </div>
      )
    }
    return (
      <div style={containerStyle}>
        <span style={{ fontSize: size * 0.55 }}>{kid.avatarEmoji}</span>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <span style={{ fontSize: size * 0.55 }}>{theme.emoji}</span>
    </div>
  )
}
