// One-shot flag: set by SignUp's upgrade branches after a successful
// linkWithCredential / linkWithPopup, read+cleared by Board on its first
// render so we can show a "Your board is saved." toast exactly once.
//
// sessionStorage (not localStorage) so it dies with the tab — a refresh
// during the redirect window still fires the toast, but a separate visit
// later doesn't.

const KEY = 'winkingstar:upgraded'

export function flagUpgradeSuccess() {
  try { sessionStorage.setItem(KEY, '1') } catch { /* private mode etc. */ }
}

export function consumeUpgradeFlag() {
  try {
    const v = sessionStorage.getItem(KEY)
    if (v) sessionStorage.removeItem(KEY)
    return v === '1'
  } catch {
    return false
  }
}
