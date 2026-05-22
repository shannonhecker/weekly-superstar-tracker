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

import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { db } from './firebase'
import { generateShareCode } from './codes'
import { THEMES, DEFAULT_ACTIVITIES } from './themes'
import { getWeekKey } from './week'

export const PARENT_CONSENT_VERSION = '2026-05'

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
export async function createBoardForNewUser(
  user,
  { theme, kidName, birthday, parentConsentAccepted, parentConsentVersion },
) {
  if (parentConsentAccepted !== true) {
    throw new Error('Parent consent is required before creating a family board.')
  }
  const trimmedKid = (kidName || '').trim()
  // Display name falls back to the kid's name so the board feels personal even
  // if we never collected an explicit parent name (we don't, in Direction B).
  // Skip the update if Firebase already has a displayName from OAuth.
  if (trimmedKid && !user.displayName) {
    try { await updateProfile(user, { displayName: trimmedKid }) } catch { /* non-fatal */ }
  }

  const boardRef = doc(collection(db, 'boards'))
  const batch = writeBatch(db)
  batch.set(boardRef, {
    name: trimmedKid ? `${trimmedKid}'s board` : 'Our Family',
    adminId: user.uid,
    memberIds: [user.uid],
    shareCode: generateShareCode(),
    parentConsentAcceptedAt: serverTimestamp(),
    parentConsentVersion: parentConsentVersion || PARENT_CONSENT_VERSION,
    parentConsentSource: 'web-onboarding',
    parentConsentUid: user.uid,
    kidCount: 1,
    createdAt: serverTimestamp(),
  })

  // Mirror the kid shape used by KidSwitcher — keeps Board.jsx happy on first render.
  batch.set(doc(collection(db, 'boards', boardRef.id, 'kids')), {
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
  await batch.commit()

  return boardRef.id
}
