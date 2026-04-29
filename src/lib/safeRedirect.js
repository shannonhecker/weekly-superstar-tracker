// Allowlist for internal redirects. Anywhere we read a destination
// from a URL parameter (Firebase action `continueUrl`, post-login
// `next` params, share-redirects, etc.) MUST go through this helper —
// passing a user-controlled string straight to `navigate()` or
// `window.location` is an open-redirect primitive (the kind of
// phishing surface where attacker.com can craft `winkingstar.com/...?next=//evil.com`
// and trick users post-auth).
//
// Audit S6 — currently nothing on the live site uses continueUrl, but
// the moment it does, this helper catches it. Defensive on purpose.

const ALLOWED_INTERNAL_HOSTS = new Set([
  'winkingstar.com',
  'www.winkingstar.com',
  'weekly-superstar-tracker.firebaseapp.com',
  'weekly-superstar-tracker.web.app',
  'localhost',
])

/**
 * Returns a safe redirect path (relative URL) extracted from `target`,
 * or `fallback` if the target is missing/external/malformed.
 *
 * Always returns a path that starts with `/` — never a full URL,
 * never a protocol-relative `//evil.com`, never a `javascript:` URI.
 *
 * Examples:
 *   safeRedirect('/board/abc')                        → '/board/abc'
 *   safeRedirect('https://winkingstar.com/board/abc') → '/board/abc'
 *   safeRedirect('https://evil.com/board/abc')        → fallback
 *   safeRedirect('//evil.com/board/abc')              → fallback
 *   safeRedirect('javascript:alert(1)')               → fallback
 *   safeRedirect(null)                                → fallback
 */
export function safeRedirect(target, fallback = '/') {
  if (!target || typeof target !== 'string') return fallback

  // Reject obvious bad shapes before any URL parsing — `//evil.com` is
  // protocol-relative (browser interprets as full URL) and would slip
  // past a naive startsWith('/') check.
  if (target.startsWith('//')) return fallback
  if (/^[a-z][a-z0-9+.-]*:/i.test(target) === false && target.startsWith('/')) {
    // Pure relative path like `/board/abc` — accept after sanity-check.
    return target
  }

  try {
    // For absolute URLs, parse and verify the host is on our allowlist.
    // We use `winkingstar.com` as the base so paths like `/board/abc`
    // resolve to a known-good URL we can safely extract from.
    const url = new URL(target, 'https://winkingstar.com')
    if (!ALLOWED_INTERNAL_HOSTS.has(url.hostname)) return fallback
    if (!['http:', 'https:'].includes(url.protocol)) return fallback
    return url.pathname + url.search + url.hash
  } catch {
    return fallback
  }
}
