import { test } from 'node:test'
import assert from 'node:assert/strict'

// DI pattern — handler accepts optional getFirestore + verifyNotification overrides
type Captured = { boardWrites: Array<{ id: string; data: unknown }> }

function makeFakeFirestore(iapDocs: Array<{ boardId: string }> = []): { getFs: () => unknown; captured: Captured } {
  const captured: Captured = { boardWrites: [] }
  const fs = {
    collection: (name: string) => {
      if (name === 'iapTransactions') {
        return {
          where: () => ({
            limit: () => ({
              get: async () => ({
                empty: iapDocs.length === 0,
                docs: iapDocs.map((d) => ({ data: () => d })),
              }),
            }),
          }),
        }
      }
      return {
        doc: (id: string) => ({
          update: async (data: unknown) => {
            captured.boardWrites.push({ id, data })
          },
        }),
      }
    },
  }
  return { getFs: () => fs as never, captured }
}

function mockReq(body: object) {
  return { body, method: 'POST' } as never
}
function mockRes() {
  return {
    statusCode: 200,
    status(c: number) { this.statusCode = c; return this },
    send(_b: string) { return this },
  }
}

const { appleServerNotificationImpl, appleRootCertificates } = await import('./appleServerNotification.js')

test('appleRootCertificates loads all three Apple root certs as non-empty DER buffers', () => {
  const certs = appleRootCertificates()
  assert.equal(certs.length, 3, 'expected 3 root certs (G1, G2, G3)')
  for (const buf of certs) {
    assert.ok(Buffer.isBuffer(buf), 'each cert is a Buffer')
    assert.ok(buf.length > 0, 'each cert is non-empty')
    // DER-encoded X.509 certs start with 0x30 (ASN.1 SEQUENCE tag).
    assert.equal(buf[0], 0x30, 'each cert begins with the DER SEQUENCE tag')
  }
})

test('rejects when signedPayload missing', async () => {
  const { getFs } = makeFakeFirestore()
  const res = mockRes()
  await appleServerNotificationImpl(mockReq({}), res as never, getFs as never, async () => ({ notificationType: 'REFUND' } as never))
  assert.equal(res.statusCode, 400)
})

test('REFUND notification flips premium=false on matching board', async () => {
  const { getFs, captured } = makeFakeFirestore([{ boardId: 'b1' }])
  const res = mockRes()
  await appleServerNotificationImpl(
    mockReq({ signedPayload: 'jwt...' }),
    res as never,
    getFs as never,
    async () => ({
      notificationType: 'REFUND',
      data: { transactionInfo: { transactionId: 'tx_apple_1' } },
    } as never),
  )
  assert.equal(res.statusCode, 200)
  assert.equal(captured.boardWrites.length, 1)
  assert.equal(captured.boardWrites[0].id, 'b1')
  const data = captured.boardWrites[0].data as Record<string, unknown>
  assert.equal(data.premium, false)
})

test('DID_RENEW notification is no-op', async () => {
  const { getFs, captured } = makeFakeFirestore([{ boardId: 'b1' }])
  const res = mockRes()
  await appleServerNotificationImpl(
    mockReq({ signedPayload: 'jwt...' }),
    res as never,
    getFs as never,
    async () => ({
      notificationType: 'DID_RENEW',
      data: { transactionInfo: { transactionId: 'tx_apple_1' } },
    } as never),
  )
  assert.equal(res.statusCode, 200)
  assert.equal(captured.boardWrites.length, 0)
})

test('REVOKE on unknown transactionId returns 200 with no write', async () => {
  const { getFs, captured } = makeFakeFirestore([]) // no matching iapTransaction
  const res = mockRes()
  await appleServerNotificationImpl(
    mockReq({ signedPayload: 'jwt...' }),
    res as never,
    getFs as never,
    async () => ({
      notificationType: 'REVOKE',
      data: { transactionInfo: { transactionId: 'tx_unknown' } },
    } as never),
  )
  assert.equal(res.statusCode, 200)
  assert.equal(captured.boardWrites.length, 0)
})
