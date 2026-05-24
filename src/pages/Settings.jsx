import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { AlertTriangle, CheckCircle2, Check, LogOut, Trash2 } from 'lucide-react'

const AVATAR_COLORS = [
  '#38bdf8', '#818cf8', '#a78bfa', '#f472b6',
  '#fb923c', '#34d399', '#facc15', '#f87171',
]

const PLANS = [
  {
    key: 'free',
    label: 'Free',
    price: '$0/mo',
    features: ['20 AI messages/week', '30-day entry history', 'Gemini Flash AI'],
  },
  {
    key: 'pro',
    label: 'Pro',
    price: '$7/mo',
    features: ['100 AI messages/week', 'Full entry history', 'Claude Haiku AI', 'Priority support'],
  },
  {
    key: 'max',
    label: 'Max',
    price: '$15/mo',
    features: ['200 AI messages/week', 'Full entry history', 'Claude Sonnet AI', 'Early feature access'],
  },
]

const FONT_SIZES = [
  { key: 'small', label: 'Small' },
  { key: 'medium', label: 'Medium' },
  { key: 'large', label: 'Large' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } },
}

const CARD = {
  background: '#1d1d1a',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 1px 1px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.035)',
}

export default function Settings() {
  const { user, userProfile, logOut, updateDisplayName, updateAvatarColor, updateBio, deleteAccount } = useAuth()
  const [nameInput, setNameInput] = useState(userProfile?.displayName ?? user?.displayName ?? '')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)
  const [bioInput, setBioInput] = useState(userProfile?.bio ?? '')
  const [bioSaving, setBioSaving] = useState(false)
  const [bioSuccess, setBioSuccess] = useState(false)
  const [fontSize, setFontSize] = useState(localStorage.getItem('tidebiz_fontsize') ?? 'medium')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [upgrading, setUpgrading] = useState(null)
  const [searchParams] = useSearchParams()
  const paymentSuccess = searchParams.get('payment') === 'success'

  const plan = userProfile?.plan ?? 'free'
  const displayName = userProfile?.displayName ?? user?.displayName ?? ''
  const avatarColor = userProfile?.avatarColor ?? AVATAR_COLORS[0]
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'

  async function handleSaveName() {
    if (!nameInput.trim() || nameInput.trim() === displayName) return
    setNameSaving(true)
    try {
      await updateDisplayName(nameInput.trim())
      setNameSuccess(true)
      setTimeout(() => setNameSuccess(false), 2000)
    } finally {
      setNameSaving(false)
    }
  }

  function handleFontSize(size) {
    setFontSize(size)
    localStorage.setItem('tidebiz_fontsize', size)
    document.documentElement.dataset.fontsize = size
  }

  async function handleSaveBio() {
    const trimmed = bioInput.trim()
    if (trimmed === (userProfile?.bio ?? '')) return
    setBioSaving(true)
    try {
      await updateBio(trimmed)
      setBioSuccess(true)
      setTimeout(() => setBioSuccess(false), 2000)
    } finally {
      setBioSaving(false)
    }
  }

  async function handleUpgrade(planKey) {
    setUpgrading(planKey)
    try {
      const idToken = await user.getIdToken()
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey, idToken }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
      throw new Error(data.error || 'Failed to create checkout session')
    } catch (err) {
      alert('Something went wrong. Please try again.')
      setUpgrading(null)
    }
  }

  async function handleManageSubscription() {
    setUpgrading('manage')
    try {
      const idToken = await user.getIdToken()
      const res = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
      throw new Error(data.error || 'Failed to open portal')
    } catch (err) {
      alert('Something went wrong. Please try again.')
      setUpgrading(null)
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteAccount()
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        setDeleteError('Please sign out and sign back in, then try again.')
      } else {
        setDeleteError('Something went wrong. Please try again.')
      }
      setDeleting(false)
    }
  }

  return (
    <motion.div
      className="px-4 pt-6 pb-10 space-y-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.h1
        variants={item}
        className="font-bold"
        style={{ fontSize: '1.25rem', color: '#f0ede6', letterSpacing: '-0.02em' }}
      >
        Settings
      </motion.h1>

      {/* ── Account ── */}
      <Section title="Account" variants={item}>
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
              style={{ backgroundColor: avatarColor, color: '#0e0e0c', boxShadow: `0 0 0 3px rgba(0,0,0,0.8), 0 0 0 5px ${avatarColor}40` }}
            >
              {initials}
            </div>
          </motion.div>
          <div className="flex gap-2 flex-wrap justify-center">
            {AVATAR_COLORS.map(color => (
              <motion.button
                key={color}
                onClick={() => updateAvatarColor(color)}
                className="w-6 h-6 rounded-full cursor-pointer"
                style={{
                  backgroundColor: color,
                  outline: avatarColor === color ? `2px solid ${color}` : 'none',
                  outlineOffset: '2px',
                  opacity: avatarColor === color ? 1 : 0.6,
                }}
                whileHover={{ scale: 1.2, opacity: 1 }}
                whileTap={{ scale: 0.88 }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-1.5">
          <label className="section-label">Display Name</label>
          <div className="flex gap-2">
            <input
              className="input-field text-sm flex-1"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveName()}
              placeholder="Your name"
            />
            <motion.button
              onClick={handleSaveName}
              disabled={nameSaving || !nameInput.trim() || nameInput.trim() === displayName}
              className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 shrink-0 cursor-pointer"
              style={{
                background: nameSuccess
                  ? 'rgba(34,197,94,0.15)'
                  : 'rgba(74,108,247,0.15)',
                border: nameSuccess
                  ? '1px solid rgba(34,197,94,0.3)'
                  : '1px solid rgba(74,108,247,0.3)',
                color: nameSuccess ? '#22c55e' : '#4a6cf7',
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              {nameSuccess ? <Check className="w-4 h-4" /> : nameSaving ? '…' : 'Save'}
            </motion.button>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label className="section-label">Bio</label>
          <textarea
            className="input-field text-sm resize-none"
            value={bioInput}
            onChange={e => setBioInput(e.target.value)}
            placeholder="Tell the community about you and your business"
            rows={3}
            maxLength={150}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: '#3d3a35' }}>{bioInput.length}/150</span>
            <motion.button
              onClick={handleSaveBio}
              disabled={bioSaving || bioInput.trim() === (userProfile?.bio ?? '')}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40 cursor-pointer"
              style={{
                background: bioSuccess ? 'rgba(34,197,94,0.12)' : 'rgba(74,108,247,0.12)',
                border: bioSuccess ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(74,108,247,0.25)',
                color: bioSuccess ? '#22c55e' : '#4a6cf7',
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              {bioSuccess ? <Check className="w-3.5 h-3.5" /> : bioSaving ? '…' : 'Save'}
            </motion.button>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="section-label">Email</label>
          <p
            className="text-sm px-4 py-3 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#57534e',
            }}
          >
            {user?.email}
          </p>
        </div>
      </Section>

      {/* ── Subscription ── */}
      <Section title="Subscription" variants={item}>
        {/* Payment failed banner */}
        {userProfile?.paymentFailed && plan === 'free' && (
          <div
            className="px-4 py-3 rounded-xl space-y-1"
            style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: '#f43f5e' }} />
              <p className="text-sm font-medium" style={{ color: '#f43f5e' }}>
                Your last payment failed — you've been moved to Free.
              </p>
            </div>
            <p className="text-xs pl-6" style={{ color: 'rgba(244,63,94,0.6)' }}>
              Update your payment method to reactivate your plan.
            </p>
            <button
              onClick={handleManageSubscription}
              disabled={!!upgrading}
              className="mt-1 pl-6 text-xs font-semibold underline cursor-pointer disabled:opacity-50"
              style={{ color: '#f43f5e' }}
            >
              {upgrading === 'manage' ? 'Opening…' : 'Fix payment method →'}
            </button>
          </div>
        )}

        {/* Payment success banner */}
        {paymentSuccess && (
          <div
            className="px-4 py-3 rounded-xl"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#22c55e' }} />
              <p className="text-sm font-medium" style={{ color: '#22c55e' }}>
                Payment successful! Your plan is being updated — refresh in a moment.
              </p>
            </div>
          </div>
        )}

        {/* Manage subscription for paid users */}
        {plan !== 'free' && (
          <motion.button
            onClick={handleManageSubscription}
            disabled={!!upgrading}
            className="w-full py-2.5 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#ccc9c2',
            }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
          >
            {upgrading === 'manage' ? 'Opening portal…' : 'Manage Subscription'}
          </motion.button>
        )}

        {/* Plan cards */}
        <div className="space-y-2">
          {PLANS.map(p => {
            const isCurrent = p.key === plan
            return (
              <motion.div
                key={p.key}
                className="rounded-xl p-3 space-y-2"
                style={{
                  background: isCurrent ? 'rgba(74,108,247,0.06)' : 'rgba(255,255,255,0.02)',
                  border: isCurrent ? '1px solid rgba(74,108,247,0.25)' : '1px solid rgba(255,255,255,0.06)',
                }}
                animate={{ borderColor: isCurrent ? 'rgba(74,108,247,0.25)' : 'rgba(255,255,255,0.06)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: '#f0ede6' }}>{p.label}</span>
                    {isCurrent && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(74,108,247,0.2)', color: '#4a6cf7' }}
                      >
                        Current
                      </span>
                    )}
                  </div>
                  <span className="text-sm" style={{ color: '#57534e' }}>{p.price}</span>
                </div>
                <ul className="space-y-1">
                  {p.features.map(f => (
                    <li key={f} className="text-xs flex items-center gap-1.5" style={{ color: '#57534e' }}>
                      <Check className="w-3 h-3 shrink-0" style={{ color: isCurrent ? '#4a6cf7' : '#3d3a35' }} />
                      {f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && (
                  <motion.button
                    onClick={() => handleUpgrade(p.key)}
                    disabled={!!upgrading}
                    className="w-full py-1.5 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(74,108,247,0.3)',
                      color: '#4a6cf7',
                    }}
                    whileHover={{ background: 'rgba(74,108,247,0.1)' }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.1 }}
                  >
                    {upgrading === p.key ? 'Redirecting to Stripe…' : `Upgrade to ${p.label}`}
                  </motion.button>
                )}
              </motion.div>
            )
          })}
        </div>
      </Section>

      {/* ── Appearance ── */}
      <Section title="Appearance" variants={item}>
        <div className="space-y-1.5">
          <label className="section-label">Text Size</label>
          <div className="flex gap-2">
            {FONT_SIZES.map(s => (
              <motion.button
                key={s.key}
                onClick={() => handleFontSize(s.key)}
                className="flex-1 py-2 rounded-xl text-sm font-medium cursor-pointer"
                style={{
                  background: fontSize === s.key ? 'rgba(74,108,247,0.12)' : 'rgba(255,255,255,0.03)',
                  border: fontSize === s.key ? '1px solid rgba(74,108,247,0.3)' : '1px solid rgba(255,255,255,0.07)',
                  color: fontSize === s.key ? '#4a6cf7' : '#57534e',
                }}
                whileHover={{ opacity: 0.85 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.1 }}
              >
                {s.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="section-label">Theme</label>
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <span className="text-sm" style={{ color: '#ccc9c2' }}>Dark</span>
            <span className="text-[11px]" style={{ color: '#3d3a35' }}>More themes coming soon</span>
          </div>
        </div>
      </Section>

      {/* ── Notifications ── */}
      <Section title="Notifications" variants={item}>
        <div
          className="flex items-center justify-between px-4 py-3 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div>
            <p className="text-sm" style={{ color: '#ccc9c2' }}>Push Notifications</p>
            <p className="text-xs mt-0.5" style={{ color: '#3d3a35' }}>Get reminded about upcoming events</p>
          </div>
          <span className="text-[11px]" style={{ color: '#3d3a35' }}>Coming soon</span>
        </div>
      </Section>

      {/* ── Danger Zone ── */}
      <Section title="Danger Zone" variants={item}>
        <motion.button
          onClick={logOut}
          className="w-full py-2.5 rounded-xl text-sm font-medium cursor-pointer flex items-center justify-center gap-2"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: '#ccc9c2',
          }}
          whileHover={{ background: 'rgba(255,255,255,0.06)', color: '#f0ede6' }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.1 }}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </motion.button>
        <motion.button
          onClick={() => setShowDeleteModal(true)}
          className="w-full py-2.5 rounded-xl text-sm font-medium cursor-pointer flex items-center justify-center gap-2"
          style={{
            background: 'rgba(244,63,94,0.05)',
            border: '1px solid rgba(244,63,94,0.2)',
            color: '#f43f5e',
          }}
          whileHover={{ background: 'rgba(244,63,94,0.1)' }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.1 }}
        >
          <Trash2 className="w-4 h-4" />
          Delete Account
        </motion.button>
      </Section>

      {/* ── Delete modal ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={e => e.target === e.currentTarget && setShowDeleteModal(false)}
          >
            <motion.div
              className="w-full max-w-md p-6 space-y-4"
              style={{
                background: '#1d1d1a',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
              }}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
                style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}
              >
                <Trash2 className="w-5 h-5" style={{ color: '#f43f5e' }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: '#f0ede6', fontSize: '1rem' }}>
                  Delete Account
                </h3>
                <p className="text-sm mt-1.5 leading-relaxed" style={{ color: '#57534e' }}>
                  This permanently deletes your account, all journal entries, logs, and reminders. This cannot be undone.
                </p>
              </div>
              {deleteError && (
                <p className="text-sm" style={{ color: '#f43f5e' }}>{deleteError}</p>
              )}
              <div className="flex gap-3 pt-1">
                <motion.button
                  onClick={() => { setShowDeleteModal(false); setDeleteError('') }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#ccc9c2',
                  }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.1 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
                  style={{ background: '#dc2626', color: '#fff' }}
                  whileHover={{ background: '#ef4444' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.1 }}
                >
                  {deleting ? 'Deleting…' : 'Yes, Delete'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function Section({ title, children, variants }) {
  return (
    <motion.div
      className="rounded-xl p-4 space-y-3"
      style={{
        background: '#1d1d1a',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 1px 1px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.035)',
      }}
      variants={variants}
    >
      <p
        className="text-[10px] font-semibold uppercase"
        style={{ color: '#3d3a35', letterSpacing: '0.08em' }}
      >
        {title}
      </p>
      {children}
    </motion.div>
  )
}
