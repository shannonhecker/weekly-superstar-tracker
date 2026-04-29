// Single source of truth for "boards this user is a member of" queries.
//
// Three pages (Landing, SignIn, SignUp) all needed the same query:
//   query(collection(db, 'boards'), where('memberIds', 'array-contains', uid))
// — and the bug from PR #30 (signup creating a duplicate board for an existing
// user) was directly caused by SignUp.jsx not running this check at all. By
// consolidating to one helper, every code path that lands a user on a board
// can use the same canonical "where do they actually belong?" answer.
//
// Audit Q1.

import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from './firebase'

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
