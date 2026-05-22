export const SUPPORT_EMAIL = 'winkingstarapp@gmail.com'

export function supportMailto(subject) {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`
}
