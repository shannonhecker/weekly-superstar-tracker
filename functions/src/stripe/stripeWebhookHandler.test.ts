// functions/src/stripe/stripeWebhookHandler.test.ts
// Dependency-injection pattern — no mock.module (tsx/esm + Node 22 incompatibility).
// stripeWebhookHandlerImpl accepts optional _getFirestore and _getStripe overrides.

import { test } from 'node:test'
import assert from 'node:assert/strict'

type Captured = {
  txWrites: Array<{ id: string; data: unknown; mode: 'set' | 'update' }>
  boardWrites: Array<{ id: string; data: unknown }>
}

function makeFakeFirestore(initialTx: Record<string, unknown> | null = null): { getFs: () => unknown; captured: Captured } {
  const captured: Captured = { txWrites: [], boardWrites: [] }
  const fs = {
    collection: (name: string) => ({
      doc: (id: string) => {
        if (name === 'stripeTransactions') {
          return {
            get: async () => ({
              exists: initialTx !== null,
              data: () => initialTx,
            }),
            set: async (data: unknown, _opts?: unknown) => { captured.txWrites.push({ id, data, mode: 'set' }); return undefined },
            update: async (data: unknown) => { captured.txWrites.push({ id, data, mode: 'update' }); return undefined },
          }
        }
        return {
          update: async (data: unknown) => { captured.boardWrites.push({ id, data }); return undefined },
        }
      },
    }),
  }
  return { getFs: () => fs, captured }
}

function makeFakeStripe(constructEventFn: (raw: Buffer, sig: string, secret: string) => unknown, sessionsListResult?: { data: unknown[] }) {
  return () =>
    ({
      webhooks: { constructEvent: constructEventFn },
      checkout: {
        sessions: { list: async () => sessionsListResult ?? { data: [] } },
      },
    }) as never
}

function mockReq(body: object, sig = 'whsec_dummy_sig'): unknown {
  return {
    rawBody: Buffer.from(JSON.stringify(body)),
    headers: { 'stripe-signature': sig },
    method: 'POST',
  }
}
function mockRes() {
  return {
    statusCode: 200,
    body: '',
    status(code: number) { this.statusCode = code; return this },
    send(body: string) { this.body = body; return this },
  }
}

const { stripeWebhookHandlerImpl } = await import('./stripeWebhookHandler.js')

test('rejects request with bad signature', async () => {
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
  process.env.STRIPE_SECRET_KEY = 'sk_test'
  const { getFs } = makeFakeFirestore()
  const fakeStripe = makeFakeStripe(() => { throw new Error('bad sig') })
  const res = mockRes()
  await stripeWebhookHandlerImpl(mockReq({}) as never, res as never, getFs as never, fakeStripe as never)
  assert.equal(res.statusCode, 400)
})

test('checkout.session.completed writes premium=true and tx record', async () => {
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
  const { getFs, captured } = makeFakeFirestore(null)
  const fakeStripe = makeFakeStripe(() => ({
    id: 'evt_1',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_1',
        client_reference_id: 'b1:u1',
        amount_total: 499,
        currency: 'gbp',
        payment_status: 'paid',
        metadata: { boardId: 'b1', uid: 'u1' },
      },
    },
  }))
  const res = mockRes()
  await stripeWebhookHandlerImpl(mockReq({}) as never, res as never, getFs as never, fakeStripe as never)
  assert.equal(res.statusCode, 200)
  assert.equal(captured.boardWrites.length, 1)
  const boardData = captured.boardWrites[0].data as Record<string, unknown>
  assert.equal(boardData.premium, true)
  assert.equal(boardData.premiumSource, 'web')
  assert.equal(boardData.premiumProductId, 'stripe_lifetime')
  assert.equal(captured.txWrites.length, 1)
})

test('idempotent: second call with same session does not re-write board', async () => {
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
  const { getFs, captured } = makeFakeFirestore({ boardId: 'b1', rawEventIds: ['evt_prior'] })
  const fakeStripe = makeFakeStripe(() => ({
    id: 'evt_2',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_1',
        client_reference_id: 'b1:u1',
        amount_total: 499,
        currency: 'gbp',
        payment_status: 'paid',
        metadata: { boardId: 'b1', uid: 'u1' },
      },
    },
  }))
  const res = mockRes()
  await stripeWebhookHandlerImpl(mockReq({}) as never, res as never, getFs as never, fakeStripe as never)
  assert.equal(res.statusCode, 200)
  assert.equal(captured.boardWrites.length, 0, 'should not re-write board')
})

test('charge.refunded writes premium=false on matching session', async () => {
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
  const { getFs, captured } = makeFakeFirestore({ boardId: 'b1', uid: 'u1', rawEventIds: ['evt_1'], status: 'paid' })
  const fakeStripe = makeFakeStripe(
    () => ({
      id: 'evt_refund',
      type: 'charge.refunded',
      data: { object: { id: 'ch_1', payment_intent: 'pi_1' } },
    }),
    { data: [{ id: 'cs_1', payment_intent: 'pi_1' }] },
  )
  const res = mockRes()
  await stripeWebhookHandlerImpl(mockReq({}) as never, res as never, getFs as never, fakeStripe as never)
  assert.equal(res.statusCode, 200)
  assert.equal(captured.boardWrites.length, 1)
  const boardData = captured.boardWrites[0].data as Record<string, unknown>
  assert.equal(boardData.premium, false)
})
