import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents`
const APP_URL = process.env.APP_URL || 'https://tidebiz.vercel.app'

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
  return data.users[0].localId
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
    const { idToken } = req.body
    if (!idToken) return res.status(400).json({ error: 'Missing token' })

    const uid = await verifyToken(idToken)
    const userDoc = await getUserDoc(uid, idToken)

    if (!userDoc.stripeCustomerId) {
      return res.status(400).json({ error: 'No active subscription found' })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: userDoc.stripeCustomerId,
      return_url: `${APP_URL}/settings`,
    })

    return res.json({ url: session.url })
  } catch (err) {
    console.error('create-portal-session error:', err)
    return res.status(500).json({ error: err.message })
  }
}
