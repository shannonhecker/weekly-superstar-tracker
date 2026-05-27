// functions/src/stripe/parentalGate.ts

import { HttpsError } from 'firebase-functions/v2/https'

export const PARENTAL_GATE_MAX_AGE_MS = 5 * 60 * 1000 // 5 min

interface ParentalGateData {
  parentalGateAt?: FirebaseFirestore.Timestamp | { toMillis: () => number } | null
}

export function verifyParentalGate(
  boardSnap: FirebaseFirestore.DocumentSnapshot,
  nowMs: number = Date.now(),
): void {
  if (!boardSnap.exists) {
    throw new HttpsError('not-found', 'Board not found')
  }
  const data = boardSnap.data() as ParentalGateData | undefined
  const ts = data?.parentalGateAt
  if (!ts) {
    throw new HttpsError(
      'failed-precondition',
      'Parental gate missing. Re-authenticate before purchase.',
    )
  }
  const ageMs = nowMs - ts.toMillis()
  if (ageMs > PARENTAL_GATE_MAX_AGE_MS) {
    throw new HttpsError(
      'failed-precondition',
      'Parental gate is stale. Re-authenticate before purchase.',
    )
  }
}
