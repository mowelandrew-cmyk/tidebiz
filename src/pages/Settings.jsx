import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
    price: '$18/mo',
    features: ['200 AI messages/week', 'Full entry history', 'Claude Sonnet AI', 'Early feature access'],
  },
]

const FONT_SIZES = [
  { key: 'small', label: 'Small' },
  { key: 'medium', label: 'Medium' },
  { key: 'large', label: 'Large' },
]

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
    <div className="px-4 py-4 space-y-4 pb-8">
      <h1 className="text-white font-bold text-lg">Settings</h1>

      {/* Account */}
      <Section title="Account">
        <div className="flex flex-col items-center gap-3 pb-4 border-b border-gray-800">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-gray-900"
            style={{ backgroundColor: avatarColor }}
          >
            {initials}
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {AVATAR_COLORS.map(color => (
              <button
                key={color}
                onClick={() => updateAvatarColor(color)}
                className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                style={{
                  backgroundColor: color,
                  outline: avatarColor === color ? '2px solid white' : 'none',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-gray-400">Display Name</label>
          <div className="flex gap-2">
            <input
              className="input-field text-sm flex-1"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveName()}
              placeholder="Your name"
            />
            <button
              onClick={handleSaveName}
              disabled={nameSaving || !nameInput.trim() || nameInput.trim() === displayName}
              className="px-4 py-2 rounded-xl bg-accent text-gray-900 text-sm font-semibold disabled:opacity-40 shrink-0"
            >
              {nameSuccess ? '✓' : nameSaving ? '…' : 'Save'}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-gray-400">Bio</label>
          <textarea
            className="input-field text-sm resize-none"
            value={bioInput}
            onChange={e => setBioInput(e.target.value)}
            placeholder="Tell the community about you and your business"
            rows={3}
            maxLength={150}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">{bioInput.length}/150</span>
            <button
              onClick={handleSaveBio}
              disabled={bioSaving || bioInput.trim() === (userProfile?.bio ?? '')}
              className="px-4 py-1.5 rounded-xl bg-accent text-gray-900 text-sm font-semibold disabled:opacity-40"
            >
              {bioSuccess ? '✓' : bioSaving ? '…' : 'Save'}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-gray-400">Email</label>
          <p className="text-sm text-gray-300 px-4 py-3 bg-surface-raised rounded-xl border border-gray-700">
            {user?.email}
          </p>
        </div>
      </Section>

      {/* Subscription */}
      <Section title="Subscription">
        {/* Payment failed banner */}
        {userProfile?.paymentFailed && plan === 'free' && (
          <div className="px-4 py-3 bg-rose-600/20 border border-rose-600/40 rounded-xl">
            <p className="text-sm text-rose-400 font-medium">⚠️ Your last payment failed — you've been moved to Free.</p>
            <p className="text-xs text-rose-400/70 mt-0.5">Update your payment method to reactivate your plan.</p>
            <button
              onClick={handleManageSubscription}
              disabled={!!upgrading}
              className="mt-2 text-xs font-semibold text-rose-400 underline disabled:opacity-50"
            >
              {upgrading === 'manage' ? 'Opening…' : 'Fix payment method →'}
            </button>
          </div>
        )}

        {/* Payment success banner */}
        {paymentSuccess && (
          <div className="px-4 py-3 bg-green-600/20 border border-green-600/40 rounded-xl">
            <p className="text-sm text-green-400 font-medium">
              🎉 Payment successful! Your plan is being updated — refresh in a moment.
            </p>
          </div>
        )}

        {/* Manage subscription for paid users */}
        {plan !== 'free' && (
          <button
            onClick={handleManageSubscription}
            disabled={!!upgrading}
            className="w-full py-2.5 rounded-xl border border-gray-700 text-sm text-gray-300 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-50"
          >
            {upgrading === 'manage' ? 'Opening portal…' : 'Manage Subscription'}
          </button>
        )}

        <div className="space-y-2">
          {PLANS.map(p => {
            const isCurrent = p.key === plan
            return (
              <div
                key={p.key}
                className={`rounded-xl border p-3 space-y-2 ${isCurrent ? 'border-accent bg-accent/5' : 'border-gray-800'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">{p.label}</span>
                    {isCurrent && (
                      <span className="text-[10px] bg-accent text-gray-900 font-bold px-1.5 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm">{p.price}</span>
                </div>
                <ul className="space-y-0.5">
                  {p.features.map(f => (
                    <li key={f} className="text-xs text-gray-400 flex items-center gap-1.5">
                      <span className="text-accent">✓</span> {f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && (
                  <button
                    onClick={() => handleUpgrade(p.key)}
                    disabled={!!upgrading}
                    className="w-full py-1.5 rounded-lg text-xs font-semibold border border-accent text-accent hover:bg-accent/10 transition-colors disabled:opacity-50"
                  >
                    {upgrading === p.key ? 'Redirecting to Stripe…' : `Upgrade to ${p.label}`}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Appearance">
        <div className="space-y-1.5">
          <label className="text-xs text-gray-400">Text Size</label>
          <div className="flex gap-2">
            {FONT_SIZES.map(s => (
              <button
                key={s.key}
                onClick={() => handleFontSize(s.key)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors
                  ${fontSize === s.key
                    ? 'bg-accent text-gray-900 border-accent'
                    : 'border-gray-700 text-gray-400 hover:text-white'
                  }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-gray-400">Theme</label>
          <div className="flex items-center justify-between px-4 py-3 bg-surface-raised rounded-xl border border-gray-700">
            <span className="text-sm text-gray-300">Dark</span>
            <span className="text-xs text-gray-600">More themes coming soon</span>
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <div className="flex items-center justify-between px-4 py-3 bg-surface-raised rounded-xl border border-gray-700">
          <div>
            <p className="text-sm text-gray-300">Push Notifications</p>
            <p className="text-xs text-gray-600">Get reminded about upcoming events</p>
          </div>
          <span className="text-xs text-gray-600">Coming soon</span>
        </div>
      </Section>

      {/* Danger Zone */}
      <Section title="Danger Zone">
        <button
          onClick={logOut}
          className="w-full py-2.5 rounded-xl border border-gray-700 text-sm text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
        >
          Sign Out
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full py-2.5 rounded-xl border border-rose-600/40 text-sm text-rose-400 hover:bg-rose-600/10 transition-colors"
        >
          Delete Account
        </button>
      </Section>

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:pb-0"
          onClick={e => e.target === e.currentTarget && setShowDeleteModal(false)}
        >
          <div className="w-full max-w-md bg-surface-raised rounded-2xl border border-gray-800 p-6 space-y-4">
            <div>
              <h3 className="text-white font-semibold">Delete Account</h3>
              <p className="text-gray-400 text-sm mt-1">
                This permanently deletes your account, all journal entries, logs, and reminders. This cannot be undone.
              </p>
            </div>
            {deleteError && <p className="text-rose-400 text-sm">{deleteError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteError('') }}
                className="flex-1 py-2.5 rounded-xl border border-gray-700 text-sm text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="card space-y-3">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{title}</h2>
      {children}
    </div>
  )
}
