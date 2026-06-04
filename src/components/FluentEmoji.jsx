import { useEffect, useMemo, useState } from 'react'
import { fluentEmojiSources } from '../lib/emojiAssets'

export default function FluentEmoji({
  emoji,
  size,
  className = '',
  style,
  nativeScale = 0.82,
  loading = 'lazy',
}) {
  const sources = useMemo(() => fluentEmojiSources(emoji), [emoji])
  const [sourceIndex, setSourceIndex] = useState(0)

  useEffect(() => {
    setSourceIndex(0)
  }, [emoji])

  if (!emoji) return null

  const numericSize = Number(size) || 24
  const src = sources[sourceIndex]

  if (!src) {
    return (
      <span
        aria-hidden="true"
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: numericSize,
          height: numericSize,
          fontSize: numericSize * nativeScale,
          lineHeight: 1,
          ...style,
        }}
      >
        {emoji}
      </span>
    )
  }

  return (
    <img
      src={src}
      alt=""
      width={numericSize}
      height={numericSize}
      loading={loading}
      decoding="async"
      draggable={false}
      className={className}
      style={{
        width: numericSize,
        height: numericSize,
        objectFit: 'contain',
        display: 'block',
        ...style,
      }}
      onError={() => setSourceIndex((idx) => idx + 1)}
    />
  )
}
