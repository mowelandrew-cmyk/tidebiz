import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AVATAR_COLORS = [
  '#38bdf8', '#818cf8', '#a78bfa', '#f472b6',
  '#fb923c', '#34d399', '#facc15', '#f87171',
]

const BUSINESS_TYPES = [
  { key: 'ecommerce', label: 'E-Commerce / Dropshipping', emoji: '🛒' },
  { key: 'service',   label: 'Service Business',          emoji: '🤝' },
  { key: 'content',   label: 'Content Creator',           emoji: '🎬' },
  { key: 'tech',      label: 'App / Software',            emoji: '💻' },
  { key: 'other',     label: 'Something Else',            emoji: '✨' },
]

const MAIN_GOALS = [
  { key: 'customers', label: 'Getting my first customers', emoji: '🎯' },
  { key: 'revenue',   label: 'Growing revenue',            emoji: '📈' },
  { key: 'product',   label: 'Building my product',        emoji: '🔨' },
  { key: 'finances',  label: 'Managing finances',          emoji: '💰' },
  { key: 'mindset',   label: 'Staying motivated',          emoji: '🧠' },
]

const PLANS = [
  {
    key: 'free', label: 'Free', price: '$0/mo', badge: null,
    features: ['20 AI messages/week', '30-day entry history', 'Gemini Flash AI'],
  },
  {
    key: 'pro', label: 'Pro', price: '$7/mo', badge: 'Popular',
    features: ['100 AI messages/week', 'Full entry history', 'Claude Haiku AI', 'Priority support'],
  },
  {
    key: 'max', label: 'Max', price: '$18/mo', badge: null,
    features: ['200 AI messages/week', 'Full entry history', 'Claude Sonnet AI', 'Early feature access'],
  },
]

const TOTAL_STEPS = 3 // questionnaire, plans, profile

export default function Onboarding() {
  const { user, userProfile, loading, completeOnboarding } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]           = useState(0) // 0=splash, 1–3=real, 4=done
  const [splashIn, setSplashIn]   = useState(false)
  const [contentIn, setContentIn] = useState(true)
  const completing = useRef(false)

  // Form state
  const [businessType, setBusinessType] = useState(null)
  const [mainGoal, setMainGoal]         = useState(null)
  const [plan, setPlan]                 = useState('free')
  const [name, setName]                 = useState('')
  const [bio, setBio]                   = useState('')
  const [avatarColor, setAvatarColor]   = useState(AVATAR_COLORS[0])
  const [saving, setSaving]             = useState(false)

  // Redirect already-onboarded users away from this page
  useEffect(() => {
    if (!loading && userProfile?.onboardingComplete && !completing.current) {
      navigate('/', { replace: true })
    }
  }, [loading, userProfile, navigate])

  // Pre-fill from existing auth/profile data
  useEffect(() => {
    if (user?.displayName) setName(user.displayName)
    if (userProfile?.displayName) setName(userProfile.displayName)
    if (userProfile?.avatarColor) setAvatarColor(userProfile.avatarColor)
    if (userProfile?.bio) setBio(userProfile.bio)
  }, [user, userProfile])

  // Splash: fade in, then auto-advance after 2.5s
  useEffect(() => {
    const t1 = setTimeout(() => setSplashIn(true), 50)
    const t2 = setTimeout(() => advance(), 2600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function advance() {
    setContentIn(false)
    setTimeout(() => {
      setStep(s => s + 1)
      setContentIn(true)
    }, 180)
  }

  async function finish() {
    if (!name.trim() || saving) return
    completing.current = true
    setSaving(true)
    try {
      // Always complete onboarding on free — Stripe webhook handles plan upgrade
      await completeOnboarding({
        displayName: name.trim(),
        bio: bio.trim(),
        avatarColor,
        businessType,
        mainGoal,
      })

      // If they picked a paid plan, redirect to Stripe Checkout
      if (plan !== 'free') {
        const idToken = await user.getIdToken()
        const res = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan, idToken }),
        })
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url
          return // browser will navigate away
        }
        // If Stripe fails, fall through to home on free plan
      }

      setStep(4)
      setTimeout(() => navigate('/', { replace: true }), 1800)
    } catch (err) {
      console.error('Onboarding error:', err)
      completing.current = false
      setSaving(false)
    }
  }

  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'

  // ── Splash ──────────────────────────────────────────────────────────────────
  if (step === 0) return (
    <div className="h-screen bg-gray-900 flex items-center justify-center">
      <div className={`text-center transition-all duration-700 ${splashIn ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <div className="text-8xl mb-5">🌊</div>
        <h1 className="text-5xl font-bold text-white tracking-tight">TideBiz</h1>
        <p className="text-gray-400 mt-3 text-lg">Your business hub</p>
      </div>
    </div>
  )

  // ── Done ────────────────────────────────────────────────────────────────────
  if (step === 4) return (
    <div className="h-screen bg-gray-900 flex items-center justify-center px-8 text-center">
      <div>
        <div className="text-7xl mb-5">🎉</div>
        <h2 className="text-3xl font-bold text-white">You're all set!</h2>
        <p className="text-gray-300 mt-3 text-lg">
          Welcome to TideBiz, {name.split(' ')[0] || 'entrepreneur'}.
        </p>
        <p className="text-gray-500 text-sm mt-2">Let's build something great.</p>
      </div>
    </div>
  )

  // ── Steps 1–3 ───────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Progress bar */}
      <div className="px-6 pt-14 pb-5 shrink-0">
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${((step - 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-2">Step {step} of {TOTAL_STEPS}</p>
      </div>

      {/* Step content */}
      <div className={`flex-1 overflow-y-auto px-6 pb-8 transition-opacity duration-200 ${contentIn ? 'opacity-100' : 'opacity-0'}`}>

        {/* ── Step 1: Questionnaire ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Tell us about you</h2>
              <p className="text-gray-400 text-sm mt-1">Help us personalize your experience</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-300">What type of business are you building?</p>
              {BUSINESS_TYPES.map(bt => (
                <button
                  key={bt.key}
                  onClick={() => setBusinessType(bt.key)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                    businessType === bt.key
                      ? 'border-accent bg-accent/10 text-white'
                      : 'border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <span className="text-xl">{bt.emoji}</span>
                  <span className="text-sm">{bt.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-300">What's your main goal right now?</p>
              {MAIN_GOALS.map(g => (
                <button
                  key={g.key}
                  onClick={() => setMainGoal(g.key)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                    mainGoal === g.key
                      ? 'border-accent bg-accent/10 text-white'
                      : 'border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <span className="text-xl">{g.emoji}</span>
                  <span className="text-sm">{g.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={advance}
              disabled={!businessType || !mainGoal}
              className="btn-primary"
            >
              Continue →
            </button>
          </div>
        )}

        {/* ── Step 2: Plans ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-white">Choose your plan</h2>
              <p className="text-gray-400 text-sm mt-1">Start free, upgrade anytime</p>
            </div>

            <div className="space-y-3">
              {PLANS.map(p => (
                <button
                  key={p.key}
                  onClick={() => setPlan(p.key)}
                  className={`w-full text-left rounded-xl border p-4 space-y-2 transition-colors ${
                    plan === p.key ? 'border-accent bg-accent/5' : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{p.label}</span>
                      {p.badge && (
                        <span className="text-[10px] bg-accent text-gray-900 font-bold px-1.5 py-0.5 rounded-full">
                          {p.badge}
                        </span>
                      )}
                      {plan === p.key && (
                        <span className="text-[10px] border border-accent text-accent font-bold px-1.5 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <span className="text-gray-400 text-sm">{p.price}</span>
                  </div>
                  <ul className="space-y-1">
                    {p.features.map(f => (
                      <li key={f} className="text-xs text-gray-400 flex items-center gap-1.5">
                        <span className="text-accent">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <button onClick={advance} className="btn-primary">
                Continue with {PLANS.find(p => p.key === plan)?.label}
              </button>
              {plan !== 'free' && (
                <p className="text-xs text-gray-600 text-center">
                  Payment coming soon — you'll start on Free for now.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Step 3: Profile ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-white">Set up your profile</h2>
              <p className="text-gray-400 text-sm mt-1">This is how the community sees you</p>
            </div>

            {/* Avatar preview + color picker */}
            <div className="flex flex-col items-center gap-3 py-2">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-gray-900"
                style={{ backgroundColor: avatarColor }}
              >
                {initials}
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {AVATAR_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setAvatarColor(c)}
                    className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      outline: avatarColor === c ? '2px solid white' : 'none',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400">Display Name</label>
              <input
                className="input-field"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400">
                Bio <span className="text-gray-600">(optional)</span>
              </label>
              <textarea
                className="input-field resize-none"
                placeholder="e.g. 19yo building a streetwear brand in NYC 🔥"
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                maxLength={150}
              />
              <p className="text-xs text-gray-600 text-right">{bio.length}/150</p>
            </div>

            <button
              onClick={finish}
              disabled={!name.trim() || saving}
              className="btn-primary"
            >
              {saving ? 'Setting up…' : 'Finish Setup →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
