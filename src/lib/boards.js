// Single source of truth for "boards this user is a member of" queries +
// the canonical board+kid creation shape used by every auth path that
// lands a user on a fresh board.
//
// Three pages (Landing, SignIn, SignUp) all needed the same query:
//   query(collection(db, 'boards'), where('memberIds', 'array-contains', uid))
// — and the bug from PR #30 (signup creating a duplicate board for an
// existing user) was directly caused by SignUp.jsx not running this check
// at all. By consolidating to one helper, every code path that lands a
// user on a board can use the same canonical "where do they actually
// belong?" answer.
//
// `createBoardForNewUser` was previously exported from `src/pages/SignUp.jsx`
// and imported from there by SignIn + Try — the page-importing-page smell
// is gone now that it lives here next to its query neighbour.
//
// Audit Q1.

import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { db } from './firebase'
import { generateShareCode } from './codes'
import { THEMES, DEFAULT_ACTIVITIES } from './themes'
import { getWeekKey } from './week'

/**
 * Returns the boards the user is a member of, ordered by createdAt
 * ascending (earliest first). Earliest-by-createdAt is the right
 * tiebreaker because it prefers the user's original board over any
 * test/orphan duplicates.
 *
 * Returns an array of `{ id, data }` for ergonomic destructuring at
 * the call site — `data` is the raw Firestore doc data, `id` is the
 * board doc id.
 *
 * Returns an empty array if the user has no boards.
 */
export async function findUserBoards(uid) {
  if (!uid) return []
  const snap = await getDocs(
    query(collection(db, 'boards'), where('memberIds', 'array-contains', uid)),
  )
  return snap.docs
    .map((d) => ({ id: d.id, data: d.data() }))
    .sort((a, b) => {
      const ta = a.data.createdAt?.toMillis?.() ?? 0
      const tb = b.data.createdAt?.toMillis?.() ?? 0
      return ta - tb
    })
}

// Shared by every auth path that creates a fresh board+kid:
// SignUp (email/password + OAuth), SignIn (first-time OAuth users), Try
// (anonymous guest seed). The board+kid Firestore writes are identical
// regardless of how the user authed — only the credential source changes.
// Keeping this in one place means tweaks to the default kid shape can't
// drift between code paths.
export async function createBoardForNewUser(user, { theme, kidName, birthday }) {
  const trimmedKid = (kidName || '').trim()
  // Display name falls back to the kid's name so the board feels personal even
  // if we never collected an explicit parent name (we don't, in Direction B).
  // Skip the update if Firebase already has a displayName from OAuth.
  if (trimmedKid && !user.displayName) {
    try { await updateProfile(user, { displayName: trimmedKid }) } catch { /* non-fatal */ }
  }

  const board = await addDoc(collection(db, 'boards'), {
    name: trimmedKid ? `${trimmedKid}'s board` : 'Our Family',
    adminId: user.uid,
    memberIds: [user.uid],
    shareCode: generateShareCode(),
    createdAt: serverTimestamp(),
  })

  // Mirror the kid shape used by KidSwitcher — keeps Board.jsx happy on first render.
  await addDoc(collection(db, 'boards', board.id, 'kids'), {
    name: trimmedKid || 'Superstar',
    theme: theme || Object.keys(THEMES)[0],
    order: 0,
    birthday: birthday || null,
    activities: DEFAULT_ACTIVITIES,
    checks: {},
    stickers: {},
    badges: [],
    petName: null,
    reward: null,
    weekKey: getWeekKey(),
    weekHistory: {},
    chainKey: null,
    favoritePet: null,
    createdAt: serverTimestamp(),
  })

  return board.id
}
