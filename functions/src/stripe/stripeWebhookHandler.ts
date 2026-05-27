// functions/src/stripe/stripeWebhookHandler.ts

import { onRequest, type Request } from 'firebase-functions/v2/https'
import type { Response } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import Stripe from 'stripe'

// Matches the pinned version in this SDK install (Stripe.LatestApiVersion)
const stripeApiVersion = '2025-02-24.acacia' as const

function defaultGetStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY missing')
  return new Stripe(key, { apiVersion: stripeApiVersion })
}

type GetFirestoreOverride = () => FirebaseFirestore.Firestore
type GetStripeOverride = () => Stripe

export async function stripeWebhookHandlerImpl(
  req: Request,
  res: Response,
  _getFirestore: GetFirestoreOverride = getFirestore,
  _getStripe: GetStripeOverride = defaultGetStripe,
): Promise<void> {
  const sig = req.headers['stripe-signature']
  if (!sig || typeof sig !== 'string') {
    res.status(400).send('Missing signature')
    return
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    res.status(500).send('STRIPE_WEBHOOK_SECRET missing')
    return
  }

  const stripe = _getStripe()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, secret) as Stripe.Event
  } catch (err) {
    res.status(400).send(`Webhook signature verification failed: ${(err as Error).message}`)
    return
  }

  const db = _getFirestore()

  try {
    if (event.type === 'checkout.session.completed') {
      await handleCheckoutCompleted(db, event.id, event.data.object as Stripe.Checkout.Session)
    } else if (event.type === 'charge.refunded') {
      await handleChargeRefunded(db, stripe, event.id, event.data.object as Stripe.Charge)
    }
    res.status(200).send('ok')
  } catch (err) {
    console.error('Webhook handler error', err)
    res.status(500).send('handler error')
  }
}

async function handleCheckoutCompleted(
  db: FirebaseFirestore.Firestore,
  eventId: string,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const boardId = session.metadata?.boardId
  const uid = session.metadata?.uid
  if (!boardId || !uid) return
  if (session.payment_status !== 'paid') return

  const txRef = db.collection('stripeTransactions').doc(session.id)
  const txSnap = await txRef.get()

  // Idempotency: if this session's tx record already exists, don't re-write premium.
  // Optionally append the new event ID to rawEventIds for audit purposes.
  if (txSnap.exists) {
    const prior = (txSnap.data()?.rawEventIds ?? []) as string[]
    if (!prior.includes(eventId)) {
      await txRef.update({ rawEventIds: [...prior, eventId] })
    }
    return
  }

  // First time: write tx record then update the board
  await txRef.set({
    boardId,
    uid,
    amount: session.amount_total ?? 0,
    currency: session.currency ?? 'gbp',
    createdAt: FieldValue.serverTimestamp(),
    status: 'paid',
    rawEventIds: [eventId],
  })

  await db.collection('boards').doc(boardId).update({
    premium: true,
    premiumProductId: 'stripe_lifetime',
    premiumSource: 'web',
    premiumUnlockedAt: FieldValue.serverTimestamp(),
  })
}

async function handleChargeRefunded(
  db: FirebaseFirestore.Firestore,
  stripe: Stripe,
  eventId: string,
  charge: Stripe.Charge,
): Promise<void> {
  if (!charge.payment_intent) return
  const piId =
    typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : charge.payment_intent.id

  // Find the checkout session linked to this payment intent
  const sessions = await stripe.checkout.sessions.list({ payment_intent: piId, limit: 1 })
  const session = sessions.data[0]
  if (!session) return

  const txRef = db.collection('stripeTransactions').doc(session.id)
  const txSnap = await txRef.get()
  if (!txSnap.exists) return

  const tx = txSnap.data() as { boardId: string; rawEventIds: string[]; status: string }
  // Already refunded — idempotent no-op
  if (tx.status === 'refunded') return

  await txRef.update({
    status: 'refunded',
    rawEventIds: [...(tx.rawEventIds ?? []), eventId],
  })

  await db.collection('boards').doc(tx.boardId).update({
    premium: false,
    premiumRevokedAt: FieldValue.serverTimestamp(),
  })
}

export const stripeWebhookHandler = onRequest(
  { region: 'us-central1' },
  stripeWebhookHandlerImpl,
)
