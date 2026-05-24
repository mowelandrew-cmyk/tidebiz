import Stripe from 'stripe'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin once per warm Lambda instance
const apps = getApps()
const adminApp = apps.length
  ? apps[0]
  : initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) })

const adminDb = getFirestore(adminApp)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const PRICE_TO_PLAN = {
  [process.env.STRIPE_PRO_PRICE_ID]: 'pro',
  [process.env.STRIPE_MAX_PRICE_ID]: 'max',
}

// Stripe requires the raw body — disable Vercel's body parser
export const config = {
  api: { bodyParser: false },
}

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
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
    switch (event.type) {

      // Payment complete → upgrade plan
      case 'checkout.session.completed': {
        const session = event.data.object
        const uid = session.metadata?.uid
        const plan = session.metadata?.plan
        const customerId = session.customer
        const subscriptionId = session.subscription

        if (uid && plan && customerId) {
          await adminDb.doc(`users/${uid}`).update({
            plan,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId || null,
            paymentFailed: false,
          })
          console.log(`Plan updated: user ${uid} → ${plan}`)
        }
        break
      }

      // Plan changed via Stripe portal (e.g. pro → max)
      case 'customer.subscription.updated': {
        const sub = event.data.object
        if (sub.status !== 'active') break

        const customerId = sub.customer
        const priceId = sub.items?.data?.[0]?.price?.id
        const plan = PRICE_TO_PLAN[priceId]

        if (plan) {
          const snap = await adminDb.collection('users')
            .where('stripeCustomerId', '==', customerId)
            .limit(1)
            .get()
          if (!snap.empty) {
            // Also clears paymentFailed in case this is a retry success
            await snap.docs[0].ref.update({ plan, paymentFailed: false })
            console.log(`Plan updated via portal: customer ${customerId} → ${plan}`)
          }
        }
        break
      }

      // Payment retry or renewal succeeded → restore plan + clear failed flag
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        // Skip the very first invoice — already handled by checkout.session.completed
        if (invoice.billing_reason === 'subscription_create') break

        const customerId = invoice.customer
        const priceId = invoice.lines?.data?.[0]?.price?.id
        const plan = PRICE_TO_PLAN[priceId]

        const snap = await adminDb.collection('users')
          .where('stripeCustomerId', '==', customerId)
          .limit(1)
          .get()
        if (!snap.empty) {
          const update = { paymentFailed: false }
          if (plan) update.plan = plan // restore plan if we can map the price
          await snap.docs[0].ref.update(update)
          console.log(`Payment succeeded: cleared failed flag for customer ${customerId}`)
        }
        break
      }

      // Payment failed → downgrade to free until they fix their card
      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const customerId = invoice.customer

        const snap = await adminDb.collection('users')
          .where('stripeCustomerId', '==', customerId)
          .limit(1)
          .get()
        if (!snap.empty) {
          await snap.docs[0].ref.update({ plan: 'free', paymentFailed: true })
          console.log(`Payment failed: downgraded customer ${customerId} to free`)
        }
        break
      }

      // Subscription cancelled → downgrade to free
      case 'customer.subscription.deleted': {
        const sub = event.data.object
        const customerId = sub.customer

        const snap = await adminDb.collection('users')
          .where('stripeCustomerId', '==', customerId)
          .limit(1)
          .get()
        if (!snap.empty) {
          await snap.docs[0].ref.update({ plan: 'free', stripeSubscriptionId: null })
          console.log(`Downgraded to free: customer ${customerId}`)
        }
        break
      }

      default:
        break
    }

    return res.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return res.status(500).json({ error: 'Handler failed' })
  }
}
