// functions/src/stripe/createCheckoutSession.test.ts
// Dependency-injection pattern used instead of mock.module:
// node:test mock.module has incomplete ESM support on Node 22 with tsx/esm loader.
// createCheckoutSessionHandler accepts optional _getFirestore and _getStripe overrides
// so tests inject fakes directly. Production export uses real implementations.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { CallableRequest } from 'firebase-functions/v2/https'
import type { CreateCheckoutSessionRequest } from './types.js'

// Shared fake helpers
function makeSnap(data: Record<string, unknown> | null) {
  return {
    exists: data !== null,
    data: () => data,
  } as never
}

function fakeFirestore(snapData: Record<string, unknown> | null) {
  return () => ({
    collection: () => ({
      doc: () => ({ get: async () => makeSnap(snapData) }),
    }),
  })
}

function fakeStripe(sessionResult: { id: string; url: string }) {
  return () =>
    ({
      checkout: {
        sessions: {
          create: async (_params: unknown) => sessionResult,
        },
      },
    }) as never
}

const { createCheckoutSessionHandler } = await import('./createCheckoutSession.js')

// ── Tests ──────────────────────────────────────────────────────────────────

test('rejects unauthenticated calls', async () => {
  await assert.rejects(
    () =>
      createCheckoutSessionHandler(
        { data: { boardId: 'b1' }, auth: undefined } as never,
        fakeFirestore(null),
        fakeStripe({ id: '', url: '' }),
      ),
    (err: Error & { code?: string }) => err.code === 'unauthenticated',
  )
})

test('rejects when caller is not a board member', async () => {
  const snapData = {
    memberIds: ['other-uid'],
    parentalGateAt: { toMillis: () => Date.now() },
  }
  await assert.rejects(
    () =>
      createCheckoutSessionHandler(
        { data: { boardId: 'b1' }, auth: { uid: 'me' } } as CallableRequest<CreateCheckoutSessionRequest>,
        fakeFirestore(snapData),
        fakeStripe({ id: '', url: '' }),
      ),
    /permission-denied|not a member/i,
  )
})

test('creates session and returns url+sessionId on happy path', async () => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_dummy'
  process.env.STRIPE_PRICE_ID = 'price_dummy'
  process.env.WEB_BASE_URL = 'https://winkingstar.com'

  const snapData = {
    memberIds: ['me'],
    parentalGateAt: { toMillis: () => Date.now() },
  }

  let capturedParams: Record<string, unknown> | null = null
  const stripeWithCapture = () =>
    ({
      checkout: {
        sessions: {
          create: async (params: Record<string, unknown>) => {
            capturedParams = params
            return { id: 'cs_test_123', url: 'https://checkout.stripe.com/c/pay/cs_test_123' }
          },
        },
      },
    }) as never

  const result = await createCheckoutSessionHandler(
    { data: { boardId: 'b1' }, auth: { uid: 'me' } } as CallableRequest<CreateCheckoutSessionRequest>,
    fakeFirestore(snapData),
    stripeWithCapture,
  )

  assert.equal(result.sessionId, 'cs_test_123')
  assert.match(result.url, /checkout\.stripe\.com/)
  assert.equal(capturedParams?.client_reference_id, 'b1:me')
  assert.equal(capturedParams?.mode, 'payment')
})
