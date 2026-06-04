import { animatedFluentUrl } from './themes'

function staticFluentUrl(emoji) {
  const first = Array.from(String(emoji || ''))[0]
  if (!first) return null
  const cp = first.codePointAt(0).toString(16).toLowerCase().padStart(4, '0')
  return `https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/${cp}_3d.png`
}

export function fluentEmojiSources(emoji) {
  const sources = [animatedFluentUrl(emoji), staticFluentUrl(emoji)].filter(Boolean)
  return [...new Set(sources)]
}
