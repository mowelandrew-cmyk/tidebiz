import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents`
const APP_URL = process.env.APP_URL || 'https://tidebiz.vercel.app'

const PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  max: process.env.STRIPE_MAX_PRICE_ID,
}

async function verifyToken(idToken) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  )
  const data = await res.json()
  if (!res.ok || !data.users?.[0]) throw new Error('Unauthorized')
  const u = data.users[0]
  return { uid: u.localId, email: u.email }
}

async function getUserDoc(uid, idToken) {
  const res = await fetch(`${FIRESTORE_BASE}/users/${uid}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  })
  if (!res.ok) return {}
  const doc = await res.json()
  const fields = doc.fields ?? {}
  return Object.fromEntries(
    Object.entries(fields).map(([k, v]) => [
      k,
      v.stringValue ?? v.integerValue ?? v.booleanValue ?? null,
    ])
  )
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { idToken, plan } = req.body
    if (!idToken || !plan) return res.status(400).json({ error: 'Missing fields' })

    const priceId = PRICE_IDS[plan]
    if (!priceId) return res.status(400).json({ error: 'Invalid plan' })

    const { uid, email } = await verifyToken(idToken)
    const userDoc = await getUserDoc(uid, idToken)

    const sessionParams = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { uid, plan },
      subscription_data: { metadata: { uid, plan } },
      success_url: `${APP_URL}/settings?payment=success`,
      cancel_url: `${APP_URL}/settings`,
      allow_promotion_codes: true,
    }

    // Reuse existing Stripe customer or create new one via email
    if (userDoc.stripeCustomerId) {
      sessionParams.customer = userDoc.stripeCustomerId
    } else {
      sessionParams.customer_email = email
    }

    const session = await stripe.checkout.sessions.create(sessionParams)
    return res.json({ url: session.url })
  } catch (err) {
    console.error('create-checkout-session error:', err)
    return res.status(500).json({ error: err.message })
  }
}
