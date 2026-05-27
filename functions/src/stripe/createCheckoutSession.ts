// functions/src/stripe/createCheckoutSession.ts

import { onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https'
import { getFirestore } from 'firebase-admin/firestore'
import Stripe from 'stripe'
import { verifyParentalGate } from './parentalGate.js'
import type {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
} from './types.js'

// Matches the pinned version in this SDK install (Stripe.LatestApiVersion)
const stripeApiVersion = '2025-02-24.acacia' as const

type GetFirestoreOverride = () => FirebaseFirestore.Firestore
type GetStripeOverride = () => Stripe

export async function createCheckoutSessionHandler(
  req: CallableRequest<CreateCheckoutSessionRequest>,
  _getFirestore: GetFirestoreOverride = getFirestore,
  _getStripe: GetStripeOverride = defaultGetStripe,
): Promise<CreateCheckoutSessionResponse> {
  if (!req.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Sign in required')
  }
  const { boardId } = req.data ?? {}
  if (!boardId) throw new HttpsError('invalid-argument', 'boardId required')

  const db = _getFirestore()
  const boardSnap = await db.collection('boards').doc(boardId).get()
  if (!boardSnap.exists) {
    throw new HttpsError('not-found', 'Board not found')
  }
  const board = boardSnap.data() as { memberIds?: string[] }
  if (!board.memberIds?.includes(req.auth.uid)) {
    throw new HttpsError('permission-denied', 'Caller is not a member of board')
  }

  verifyParentalGate(boardSnap)

  const priceId = process.env.STRIPE_PRICE_ID
  const webBaseUrl = process.env.WEB_BASE_URL
  if (!priceId || !webBaseUrl) {
    throw new HttpsError('failed-precondition', 'Stripe price or web base URL missing')
  }

  const stripe = _getStripe()
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${webBaseUrl}/board/${boardId}?upgraded=1`,
    cancel_url: `${webBaseUrl}/board/${boardId}?upgrade=cancelled`,
    client_reference_id: `${boardId}:${req.auth.uid}`,
    metadata: { boardId, uid: req.auth.uid },
  })

  if (!session.url) {
    throw new HttpsError('internal', 'Stripe did not return a checkout URL')
  }
  return { url: session.url, sessionId: session.id }
}

function defaultGetStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new HttpsError('failed-precondition', 'STRIPE_SECRET_KEY missing')
  return new Stripe(key, { apiVersion: stripeApiVersion })
}

export const createCheckoutSession = onCall<
  CreateCheckoutSessionRequest,
  Promise<CreateCheckoutSessionResponse>
>({ region: 'us-central1' }, (req) => createCheckoutSessionHandler(req))
