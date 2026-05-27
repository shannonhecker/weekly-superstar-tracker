# Stripe + Firebase + Apple S2S manual setup

Complete these steps OUTSIDE of code before deploying the new Cloud Functions from Plan A. All steps are manual (dashboard, API key paste, etc.) — no committable artifact.

Apply in **TEST mode first**, validate end-to-end, then repeat in **LIVE mode** before launch.

---

## 1. Stripe — Product + Price

1. Sign in to https://dashboard.stripe.com (TEST MODE toggle at top right).
2. **Products → Add product**
   - Name: `Winking Star Lifetime`
   - Description: `One-time unlock for the whole family. Premium forever.`
   - Pricing model: `One time`
   - Price: `4.99 GBP`
   - Enable multi-currency in advanced options:
     - `USD` $4.99
     - `EUR` €4.99
     - (These match Apple's auto-equalizations for Tier 5)
3. Save. Copy the `price_xxxxxxxxxxxxxx` ID — this becomes `STRIPE_PRICE_ID`.

## 2. Stripe — Webhook endpoint

1. **Developers → Webhooks → Add endpoint**
2. Endpoint URL:
   ```
   https://us-central1-weekly-superstar-tracker.cloudfunctions.net/stripeWebhookHandler
   ```
3. Events to send:
   - `checkout.session.completed`
   - `charge.refunded`
4. Save. Copy the signing secret `whsec_xxxxxxxxxxxxxx` — becomes `STRIPE_WEBHOOK_SECRET`.

## 3. Firebase Functions — secrets

Run from repo root:

```bash
cd Kids-achievement-tracker

firebase functions:secrets:set STRIPE_SECRET_KEY
# paste sk_test_xxxxxxxxxxxx (TEST mode) or sk_live_xxxxxxxxxxxx (LIVE mode)

firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
# paste whsec_xxxxxxxxxxxxxx

firebase functions:secrets:set STRIPE_PRICE_ID
# paste price_xxxxxxxxxxxxxx

firebase functions:secrets:set STRIPE_PUBLISHABLE_KEY
# paste pk_test_xxxxxxxxxxxx or pk_live_xxxxxxxxxxxx
# (also used by the web client; set as VITE_STRIPE_PUBLISHABLE_KEY in web .env)

# Non-secret config:
firebase functions:config:set web.base_url="https://winkingstar.com"
```

Then redeploy so the functions pick up the secrets:

```bash
firebase deploy --only functions:createCheckoutSession,functions:stripeWebhookHandler
```

## 4. Apple Server-to-Server — production URL

1. Sign in to App Store Connect.
2. **My Apps → Winking Star → App Information → App Store Server Notifications**
3. Set Production URL:
   ```
   https://us-central1-weekly-superstar-tracker.cloudfunctions.net/appleServerNotification
   ```
4. Notification version: **V2**
5. Save.

## 5. Apple root certificates — Secret Manager injection (REQUIRED before live use)

The `appleServerNotification` handler uses `@apple/app-store-server-library`'s `SignedDataVerifier`, which requires Apple's root certificates to validate the JWS signature on every notification. **The production code ships with `rootCerts: Buffer[] = []` (empty)** — real Apple notifications will fail with 400 until certs are injected.

Steps:

1. Download Apple's root cert bundle. From an Apple developer doc page (or via `curl`):
   ```bash
   curl -O https://www.apple.com/appleca/AppleIncRootCertificate.cer
   curl -O https://www.apple.com/certificateauthority/AppleRootCA-G3.cer
   ```
2. Store the certs as a single Firebase secret (base64-encoded JSON array of buffers, or concatenated DER stream — pick one and document the format):
   ```bash
   firebase functions:secrets:set APPLE_ROOT_CERTS_B64
   # paste the base64 string of the concatenated certs
   ```
3. Update `defaultVerifyNotification` in `functions/src/apple/appleServerNotification.ts`:

   Replace
   ```typescript
   const rootCerts: Buffer[] = [] // production: inject from secret manager
   ```
   with
   ```typescript
   const rootCertsB64 = process.env.APPLE_ROOT_CERTS_B64
   if (!rootCertsB64) throw new Error('APPLE_ROOT_CERTS_B64 missing')
   const rootCerts: Buffer[] = JSON.parse(
     Buffer.from(rootCertsB64, 'base64').toString('utf8'),
   ).map((s: string) => Buffer.from(s, 'base64'))
   ```
   (Adjust storage format to match whatever you actually chose in step 2 — JSON array of base64 strings is one option, raw concatenated bytes another.)
4. Redeploy:
   ```bash
   firebase deploy --only functions:appleServerNotification
   ```

## 6. Smoke test — Stripe TEST mode

After all of the above:

```bash
# In one terminal — forward Stripe events to your deployed endpoint
stripe listen --forward-to https://us-central1-weekly-superstar-tracker.cloudfunctions.net/stripeWebhookHandler

# In another terminal — trigger a test event
stripe trigger checkout.session.completed \
  --override checkout_session:metadata.boardId=YOUR_TEST_BOARD_ID \
  --override checkout_session:metadata.uid=YOUR_TEST_UID
```

Verify in Firestore Console:
- `boards/{YOUR_TEST_BOARD_ID}.premium === true`
- `boards/{YOUR_TEST_BOARD_ID}.premiumSource === 'web'`
- `boards/{YOUR_TEST_BOARD_ID}.premiumProductId === 'stripe_lifetime'`
- `stripeTransactions/{cs_id}` exists with `status === 'paid'`

Then refund:
```bash
stripe trigger charge.refunded
```

Verify:
- `boards/{YOUR_TEST_BOARD_ID}.premium === false`
- `boards/{YOUR_TEST_BOARD_ID}.premiumRevokedAt` is set
- `stripeTransactions/{cs_id}.status === 'refunded'`

## 7. Smoke test — Apple S2S (requires sandbox subscription)

Use App Store Connect's "Send Test Notification" feature:

1. ASC → Winking Star → App Information → App Store Server Notifications
2. Click "Test Notification" (sends a `TEST` event you can verify in Cloud Functions logs)
3. To test a real refund flow: make a sandbox IAP purchase via TestFlight, then request a refund via Apple Reporter / Sandbox Test → verify `boards/{boardId}.premium` flips to false on the matching `iapTransactions.transactionId`.

## 8. Firestore rules update (Task 8 — STOP-class, deferred)

The new `stripeTransactions` collection needs Firestore security rules. The Task 8 patch is in Plan A but **NOT applied yet**. Before launching Stripe checkout to real users, the rules must be:

- Lock `stripeTransactions/{sessionId}` writes to Cloud Functions only (admin SDK).
- Limit `stripeTransactions/{sessionId}` reads to board members.
- Lock `boards/{boardId}.premium*` fields to Cloud Functions only.
- Allow board members to write `boards/{boardId}.parentalGateAt` only.

See Plan A Task 8 for the exact rule snippet. Per CLAUDE.md hard rule, deploying rules requires explicit per-batch authorization.

---

**Rollback:** to remove the Stripe integration entirely:
1. Stripe dashboard → archive the product + delete the webhook endpoint
2. `firebase functions:delete createCheckoutSession stripeWebhookHandler appleServerNotification`
3. Revert the commits on `feat/plan-a-stripe-functions` and merge the revert to main
