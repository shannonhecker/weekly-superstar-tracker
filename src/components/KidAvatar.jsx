import { useState } from 'react'

import { colors } from '@weekly-superstar/shared/tokens'
import { THEMES } from '../lib/themes'
import FluentEmoji from './FluentEmoji'

/**
 * Web mirror of iOS components/KidAvatar.tsx. Priority:
 *   photo (avatarUrl) → preset Fluent emoji → theme Fluent emoji.
 *
 * Background is always the kid's theme accent at 33 alpha so shape stays
 * consistent across the 3 states. borderColor optional — callers set it to
 * mark the active kid in the switcher.
 */
export function KidAvatar({ kid, size = 48, borderColor }) {
  const theme = THEMES[kid?.theme || 'football'] || THEMES.football
  const bg = `${theme.accent}38`
  const [photoFailed, setPhotoFailed] = useState(false)

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
    return (
      <div style={containerStyle}>
        <div style={stickerStyle}>
          <FluentEmoji emoji={kid.avatarEmoji} size={size * 0.66} />
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={stickerStyle}>
        <FluentEmoji emoji={theme.emoji} size={size * 0.66} />
      </div>
    </div>
  )
}
