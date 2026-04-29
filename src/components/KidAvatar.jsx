import { useState } from 'react'

import { colors } from '@weekly-superstar/shared/tokens'
import { THEMES, animatedFluentUrl } from '../lib/themes'

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
  const bg = `${theme.accent}38`
  const [photoFailed, setPhotoFailed] = useState(false)
  const [presetFailed, setPresetFailed] = useState(false)

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: colors.earthy.card,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderStyle: 'solid',
    // Note: this is `#F0E1C8`, not the `#E8DCC4` earthy.divider token —
    // a slightly warmer hairline that reads as a soft frame around the
    // kid avatar. Out of Q5 scope; keep as a literal until the token
    // system grows a `dividerWarm` or similar.
    borderColor: borderColor ?? '#F0E1C8',
    flexShrink: 0,
    boxShadow: '0 6px 16px rgba(90, 58, 46, 0.10)',
  }

  const stickerStyle = {
    width: size * 0.78,
    height: size * 0.78,
    borderRadius: size * 0.39,
    backgroundColor: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    const url = animatedFluentUrl(kid.avatarEmoji)
    if (url && !presetFailed) {
      return (
        <div style={containerStyle}>
          <div style={stickerStyle}>
            <img
              src={url}
              alt=""
              style={{ width: size * 0.66, height: size * 0.66 }}
              onError={() => setPresetFailed(true)}
            />
          </div>
        </div>
      )
    }
    return (
      <div style={containerStyle}>
        <div style={stickerStyle}>
          <span style={{ fontSize: size * 0.5 }}>{kid.avatarEmoji}</span>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={stickerStyle}>
        <span style={{ fontSize: size * 0.5 }}>{theme.emoji}</span>
      </div>
    </div>
  )
}
