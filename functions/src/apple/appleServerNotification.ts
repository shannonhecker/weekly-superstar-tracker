// functions/src/apple/appleServerNotification.ts

import { onRequest, type Request } from 'firebase-functions/v2/https'
import type { Response } from 'express'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const REVOCATION_TYPES = new Set(['REFUND', 'REVOKE', 'EXPIRED'])

interface DecodedNotification {
  notificationType?: string
  data?: {
    transactionInfo?: {
      transactionId?: string
      originalTransactionId?: string
    }
  }
}

type GetFirestoreOverride = () => FirebaseFirestore.Firestore
type VerifyNotificationOverride = (signedPayload: string) => Promise<DecodedNotification>

async function defaultVerifyNotification(signedPayload: string): Promise<DecodedNotification> {
  // Defer the Apple library import to runtime to keep cold starts smaller.
  // The library validates the JWS signed payload against Apple's root certs.
  //
  // Root certs must be injected from Secret Manager in production.
  // Constructor signature matches @apple/app-store-server-library ^3.1.0.
  const { SignedDataVerifier } = await import('@apple/app-store-server-library')
  const APPLE_BUNDLE_ID = 'com.winkingstar.app'
  const APPLE_APP_APPLE_ID = 6765767262
  const rootCerts: Buffer[] = [] // production: inject from secret manager
  const enableOnlineCheck = true
  const environment = 'Production'
  const verifier = new SignedDataVerifier(
    rootCerts,
    enableOnlineCheck,
    environment as never,
    APPLE_BUNDLE_ID,
    APPLE_APP_APPLE_ID,
  )
  return (await (verifier as unknown as {
    verifyAndDecodeNotification(p: string): Promise<DecodedNotification>
  }).verifyAndDecodeNotification(signedPayload)) as DecodedNotification
}

export async function appleServerNotificationImpl(
  req: Request,
  res: Response,
  _getFirestore: GetFirestoreOverride = getFirestore,
  _verifyNotification: VerifyNotificationOverride = defaultVerifyNotification,
): Promise<void> {
  const body = (req.body ?? {}) as { signedPayload?: string }
  if (!body.signedPayload) {
    res.status(400).send('Missing signedPayload')
    return
  }
  let notification: DecodedNotification
  try {
    notification = await _verifyNotification(body.signedPayload)
  } catch (err) {
    console.error('Apple S2S verification failed', err)
    res.status(400).send('Invalid signed payload')
    return
  }

  const type = notification.notificationType
  if (!type || !REVOCATION_TYPES.has(type)) {
    res.status(200).send('ok (no-op)')
    return
  }

  const transactionId =
    notification.data?.transactionInfo?.transactionId ??
    notification.data?.transactionInfo?.originalTransactionId
  if (!transactionId) {
    res.status(200).send('ok (no tx)')
    return
  }

  const db = _getFirestore()
  const txQuery = await db
    .collection('iapTransactions')
    .where('transactionId', '==', transactionId)
    .limit(1)
    .get()
  if (txQuery.empty) {
    res.status(200).send('ok (no record)')
    return
  }
  const txData = txQuery.docs[0].data() as { boardId: string }
  await db.collection('boards').doc(txData.boardId).update({
    premium: false,
    premiumRevokedAt: FieldValue.serverTimestamp(),
  })
  res.status(200).send('ok (revoked)')
}

export const appleServerNotification = onRequest(
  { region: 'us-central1' },
  (req, res) => appleServerNotificationImpl(req, res),
)
