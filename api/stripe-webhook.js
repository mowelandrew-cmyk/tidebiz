import Stripe from 'stripe'
import crypto from 'crypto'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents`

const PRICE_TO_PLAN = {
  [process.env.STRIPE_PRO_PRICE_ID]: 'pro',
  [process.env.STRIPE_MAX_PRICE_ID]: 'max',
}

// Stripe requires raw body for signature verification
export const config = { api: { bodyParser: false } }

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', c => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

// Generate a Google OAuth2 access token from the service account credentials
// Uses Node's built-in crypto — no firebase-admin or google-auth-library needed
async function getAdminToken() {
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  const now = Math.floor(Date.now() / 1000)

  const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    sub: sa.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/datastore',
  })).toString('base64url')

  const toSign = `${header}.${payload}`
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(toSign)
  const sig = sign.sign(sa.private_key, 'base64url')
  const jwt = `${toSign}.${sig}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('Token error: ' + JSON.stringify(data))
  return data.access_token
}

// PATCH a user document by UID
async function updateUserDoc(uid, token, fields) {
  const maskParams = Object.keys(fields).map(f => `updateMask.fieldPaths=${f}`).join('&')
  const firestoreFields = {}
  for (const [k, v] of Object.entries(fields)) {
    if (v === null || v === undefined) firestoreFields[k] = { nullValue: null }
    else if (typeof v === 'boolean')   firestoreFields[k] = { booleanValue: v }
    else                               firestoreFields[k] = { stringValue: String(v) }
  }
  const res = await fetch(`${FIRESTORE_BASE}/users/${uid}?${maskParams}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ fields: firestoreFields }),
  })
  if (!res.ok) throw new Error(`Firestore PATCH failed: ${await res.text()}`)
}

// Find a user UID by their Stripe customer ID using Firestore runQuery
async function findUidByCustomerId(customerId, token) {
  const res = await fetch(`${FIRESTORE_BASE}:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'users' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'stripeCustomerId' },
            op: 'EQUAL',
            value: { stringValue: customerId },
          },
        },
        limit: 1,
      },
    }),
  })
  const results = await res.json()
  const docName = results[0]?.document?.name
  return docName ? docName.split('/').pop() : null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const sig = req.headers['stripe-signature']
  const rawBody = await getRawBody(req)

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  try {
    const token = await getAdminToken()

    switch (event.type) {

      // New subscription paid → upgrade plan
      case 'checkout.session.completed': {
        const session = event.data.object
        const uid = session.metadata?.uid
        const plan = session.metadata?.plan
        if (uid && plan) {
          await updateUserDoc(uid, token, {
            plan,
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription || null,
            paymentFailed: false,
          })
          console.log(`Upgraded user ${uid} to ${plan}`)
        }
        break
      }

      // Plan switched via portal or retry succeeded
      case 'customer.subscription.updated': {
        const sub = event.data.object
        if (sub.status !== 'active') break
        const priceId = sub.items?.data?.[0]?.price?.id
        const plan = PRICE_TO_PLAN[priceId]
        if (plan) {
          const uid = await findUidByCustomerId(sub.customer, token)
          if (uid) await updateUserDoc(uid, token, { plan, paymentFailed: false })
        }
        break
      }

      // Renewal or retry payment succeeded → clear failed flag
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        if (invoice.billing_reason === 'subscription_create') break // handled by checkout.session.completed
        const priceId = invoice.lines?.data?.[0]?.price?.id
        const plan = PRICE_TO_PLAN[priceId]
        const uid = await findUidByCustomerId(invoice.customer, token)
        if (uid) {
          const update = { paymentFailed: false }
          if (plan) update.plan = plan
          await updateUserDoc(uid, token, update)
        }
        break
      }

      // Payment bounced → downgrade to free
      case 'invoice.payment_failed': {
        const uid = await findUidByCustomerId(event.data.object.customer, token)
        if (uid) await updateUserDoc(uid, token, { plan: 'free', paymentFailed: true })
        break
      }

      // Subscription cancelled → downgrade to free
      case 'customer.subscription.deleted': {
        const uid = await findUidByCustomerId(event.data.object.customer, token)
        if (uid) await updateUserDoc(uid, token, { plan: 'free', stripeSubscriptionId: null })
        break
      }

      default: break
    }

    return res.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return res.status(500).json({ error: err.message })
  }
}
