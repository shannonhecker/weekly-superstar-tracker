// functions/src/stripe/types.ts

export type PremiumSource = 'ios' | 'web'

export interface CreateCheckoutSessionRequest {
  boardId: string
}

export interface CreateCheckoutSessionResponse {
  url: string
  sessionId: string
}

export interface StripeTransactionRecord {
  boardId: string
  uid: string
  amount: number       // smallest currency unit (e.g. 499 for £4.99)
  currency: string     // 'gbp', 'usd', etc.
  createdAt: FirebaseFirestore.Timestamp
  status: 'paid' | 'refunded' | 'failed'
  rawEventIds: string[]
}

export interface BoardPremiumUpdate {
  premium: boolean
  premiumProductId?: string
  premiumSource?: PremiumSource
  premiumUnlockedAt?: FirebaseFirestore.FieldValue
  premiumRevokedAt?: FirebaseFirestore.FieldValue
}
