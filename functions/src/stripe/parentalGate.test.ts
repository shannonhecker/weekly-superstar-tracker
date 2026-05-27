import { test } from 'node:test'
import assert from 'node:assert/strict'
import { verifyParentalGate, PARENTAL_GATE_MAX_AGE_MS } from './parentalGate.js'

const now = Date.now()

function mockBoardSnapshot(parentalGateAtMs: number | null) {
  return {
    exists: true,
    data: () => ({
      parentalGateAt: parentalGateAtMs === null
        ? null
        : { toMillis: () => parentalGateAtMs },
    }),
  } as unknown as FirebaseFirestore.DocumentSnapshot
}

test('verifyParentalGate passes when timestamp is fresh', () => {
  const snap = mockBoardSnapshot(now - 60_000) // 1 min ago
  assert.doesNotThrow(() => verifyParentalGate(snap, now))
})

test('verifyParentalGate throws when timestamp is stale', () => {
  const snap = mockBoardSnapshot(now - PARENTAL_GATE_MAX_AGE_MS - 1000)
  assert.throws(() => verifyParentalGate(snap, now), /stale/i)
})

test('verifyParentalGate throws when timestamp is missing', () => {
  const snap = mockBoardSnapshot(null)
  assert.throws(() => verifyParentalGate(snap, now), /missing/i)
})

test('verifyParentalGate throws when document does not exist', () => {
  const snap = { exists: false, data: () => undefined } as unknown as FirebaseFirestore.DocumentSnapshot
  assert.throws(() => verifyParentalGate(snap, now), /board not found/i)
})
