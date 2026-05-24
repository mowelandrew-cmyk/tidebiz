import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  TrendingUp, BookOpen, Brain, Users, BarChart2, Bell,
  ArrowRight, ChevronDown, Zap, Shield, Sparkles, Check,
  TrendingDown, MessageCircle, DollarSign,
} from 'lucide-react'

/* ─── Data ────────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: DollarSign,
    title: 'Revenue & Expense Tracking',
    desc: 'Log every dollar in and out. Real-time profit with animated counters and a clean T-account ledger.',
    color: '#22c55e', bg: 'rgba(34,197,94,0.09)', border: 'rgba(34,197,94,0.18)',
  },
  {
    icon: BarChart2,
    title: 'Financial Analytics',
    desc: 'Line and bar charts that draw themselves on screen. Spot your business trends before they surprise you.',
    color: '#4a6cf7', bg: 'rgba(74,108,247,0.09)', border: 'rgba(74,108,247,0.18)',
  },
  {
    icon: BookOpen,
    title: 'Business Journal',
    desc: 'Document wins, ideas, and lessons with a rich text editor. Search and revisit any entry, any time.',
    color: '#a78bfa', bg: 'rgba(167,139,250,0.09)', border: 'rgba(167,139,250,0.18)',
  },
  {
    icon: Brain,
    title: 'AI Business Coach',
    desc: 'Ask anything — pricing, marketing, client strategy. Get thoughtful, instant answers 24/7.',
    color: '#38bdf8', bg: 'rgba(56,189,248,0.09)', border: 'rgba(56,189,248,0.18)',
  },
  {
    icon: Users,
    title: 'Founder Community',
    desc: "A private space to share wins, ask questions, and network with other Gen Z founders who actually get it.",
    color: '#f472b6', bg: 'rgba(244,114,182,0.09)', border: 'rgba(244,114,182,0.18)',
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    desc: 'Pin deadlines to your calendar. Daily reminders surface right on your home screen so nothing slips.',
    color: '#fbbf24', bg: 'rgba(251,191,36,0.09)', border: 'rgba(251,191,36,0.18)',
  },
]

const FAQ = [
  {
    q: 'Is TideBiz free to use?',
    a: 'Yes. The free plan gives you full access to the ledger, journal, community, and basic AI chat. Pro and Max plans unlock extended AI usage, advanced analytics, and priority support.',
  },
  {
    q: 'What makes TideBiz different from other business tools?',
    a: "Most business apps are built for 50-year-old CFOs in corner offices. TideBiz is built for the founder running their business from their phone — clean, fast, and focused on what actually matters.",
  },
  {
    q: 'Does it work on mobile?',
    a: "TideBiz is mobile-first by design. Open it in any browser on your phone and it installs and feels like a native app. No App Store required.",
  },
  {
    q: 'How does the AI Business Coach work?',
    a: 'The AI is powered by a large language model fine-tuned for business guidance. Ask it anything — pricing strategy, how to handle a difficult client, marketing ideas — and get real answers instantly.',
  },
  {
    q: 'Is my financial data secure?',
    a: 'Your data lives in Google Firebase with industry-standard encryption. Only you can access your ledger, journal, and reminders. We never sell or share your data, period.',
  },
  {
    q: 'Can multiple people use one account?',
    a: 'TideBiz is currently a personal business hub — one account per founder. Team features are on our roadmap. For now, community forums and DMs let you collaborate with other founders.',
  },
]

/* ─── Shared animation helpers ───────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}

const stagger = (delay = 0) => ({
  hidden: {},
  show:   { transition: { staggerChildren: 0.08, delayChildren: delay } },
})

function Section({ id, children, className = '' }) {
  return (
    <section id={id} className={`relative ${className}`}>
      {children}
    </section>
  )
}

/* ─── Phone mockup ───────────────────────────────────────────────────────── */

function PhoneMockup() {
  return (
    <div className="relative flex items-center justify-center" style={{ minHeight: 520 }}>

      {/* Glow behind phone */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 360, height: 360,
          background: 'radial-gradient(circle, rgba(74,108,247,0.18) 0%, transparent 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Floating badge — revenue */}
      <motion.div
        className="absolute rounded-2xl px-3 py-2 flex items-center gap-2 z-20"
        style={{
          background: 'rgba(34,197,94,0.12)',
          border: '1px solid rgba(34,197,94,0.25)',
          backdropFilter: 'blur(12px)',
          top: 60, right: -10,
          boxShadow: '0 4px 20px rgba(34,197,94,0.12)',
        }}
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.2)' }}>
          <TrendingUp style={{ width: 10, height: 10, color: '#22c55e' }} />
        </div>
        <div>
          <p style={{ fontSize: 9, color: '#57534e', lineHeight: 1.2 }}>This month</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#22c55e', lineHeight: 1.2 }}>+$3,840</p>
        </div>
      </motion.div>

      {/* Floating badge — AI */}
      <motion.div
        className="absolute rounded-2xl px-3 py-2 flex items-center gap-2 z-20"
        style={{
          background: 'rgba(74,108,247,0.12)',
          border: '1px solid rgba(74,108,247,0.25)',
          backdropFilter: 'blur(12px)',
          bottom: 100, left: -20,
          boxShadow: '0 4px 20px rgba(74,108,247,0.12)',
        }}
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
      >
        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,108,247,0.2)' }}>
          <Sparkles style={{ width: 10, height: 10, color: '#4a6cf7' }} />
        </div>
        <div>
          <p style={{ fontSize: 9, color: '#57534e', lineHeight: 1.2 }}>AI Coach</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#4a6cf7', lineHeight: 1.2 }}>Online</p>
        </div>
      </motion.div>

      {/* The phone */}
      <motion.div
        style={{
          width: 248,
          height: 496,
          borderRadius: 44,
          background: '#0e0e0c',
          border: '1.5px solid rgba(255,255,255,0.12)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
        }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-3 pb-1" style={{ fontSize: 9, color: '#57534e' }}>
          <span style={{ fontWeight: 600 }}>9:41</span>
          <div className="flex items-center gap-1">
            <span>▪▪▪</span>
            <span>WiFi</span>
            <span>100%</span>
          </div>
        </div>

        {/* App content */}
        <div className="px-4 pt-3 pb-2 flex flex-col gap-3" style={{ flex: 1 }}>

          {/* Greeting */}
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 9, color: '#57534e' }}>Monday, June 2</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#f0ede6', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                Good morning,<br />Alex
              </p>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#4a6cf7', color: '#fff' }}>
              AL
            </div>
          </div>

          {/* Net profit card */}
          <div
            className="rounded-2xl p-3"
            style={{
              background: '#1d1d1a',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <p style={{ fontSize: 8, color: '#57534e', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Net Profit</p>
            <motion.p
              style={{ fontSize: 22, fontWeight: 800, color: '#22c55e', letterSpacing: '-0.04em', lineHeight: 1.1, marginTop: 2 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              $4,280
            </motion.p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                <span style={{ fontSize: 9, color: '#22c55e', fontWeight: 600 }}>$8,500</span>
                <span style={{ fontSize: 7, background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '1px 4px', borderRadius: 4, fontWeight: 700 }}>IN</span>
              </div>
              <div className="flex items-center gap-1">
                <span style={{ fontSize: 9, color: '#f43f5e', fontWeight: 600 }}>$4,220</span>
                <span style={{ fontSize: 7, background: 'rgba(244,63,94,0.1)', color: '#f43f5e', padding: '1px 4px', borderRadius: 4, fontWeight: 700 }}>OUT</span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: 'Revenue', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', Icon: TrendingUp },
              { label: 'Journal', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', Icon: BookOpen },
              { label: 'Ask AI',  color: '#4a6cf7', bg: 'rgba(74,108,247,0.1)',  Icon: Sparkles },
            ].map(({ label, color, bg, Icon }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 py-3 rounded-xl" style={{ background: '#1d1d1a', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                  <Icon style={{ width: 13, height: 13, color }} />
                </div>
                <span style={{ fontSize: 8, color: '#ccc9c2', fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Quote card */}
          <div
            className="rounded-2xl p-3"
            style={{
              background: '#1d1d1a',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <p style={{ fontSize: 8, color: '#57534e', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>Daily quote</p>
            <p style={{ fontSize: 9, color: '#ccc9c2', lineHeight: 1.5, fontStyle: 'italic' }}>
              "The way to get started is to quit talking and begin doing."
            </p>
            <p style={{ fontSize: 8, color: '#57534e', marginTop: 4 }}>— Walt Disney</p>
          </div>
        </div>

        {/* Bottom nav */}
        <div
          className="flex items-center justify-around py-2.5 mt-auto"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#111110' }}
        >
          {[
            { Icon: TrendingUp, active: true, color: '#4a6cf7' },
            { Icon: BookOpen,   active: false, color: '#57534e' },
            { Icon: MessageCircle, active: false, color: '#57534e' },
            { Icon: Users,     active: false, color: '#57534e' },
          ].map(({ Icon, active, color }, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              {active && <div className="w-3 h-0.5 rounded-full mb-0.5" style={{ background: 'linear-gradient(90deg, #4a6cf7, #7a93f8)' }} />}
              <Icon style={{ width: 14, height: 14, color, opacity: active ? 1 : 0.45 }} />
            </div>
          ))}
        </div>

        {/* Home indicator bar */}
        <div className="flex justify-center pb-2 pt-1">
          <div className="w-20 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
        </div>
      </motion.div>
    </div>
  )
}

/* ─── FAQ item ───────────────────────────────────────────────────────────── */

function FAQItem({ q, a, index }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      className="rounded-2xl overflow-hidden cursor-pointer"
      style={{ background: '#1d1d1a', border: open ? '1px solid rgba(74,108,247,0.25)' : '1px solid rgba(255,255,255,0.06)' }}
      onClick={() => setOpen(v => !v)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ borderColor: 'rgba(74,108,247,0.2)' }}
    >
      <div className="flex items-center justify-between px-5 py-4 gap-4">
        <p className="text-sm font-semibold" style={{ color: '#f0ede6' }}>{q}</p>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0"
        >
          <ChevronDown className="w-4 h-4" style={{ color: '#4a6cf7' }} />
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: '#a09d97' }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── Main export ────────────────────────────────────────────────────────── */

export default function Landing() {
  const { scrollY } = useScroll()
  const navBg     = useTransform(scrollY, [0, 72], ['rgba(14,14,12,0)',    'rgba(14,14,12,0.92)'])
  const navBorder = useTransform(scrollY, [0, 72], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.07)'])
  const navBlur   = useTransform(scrollY, [0, 72], ['blur(0px)',           'blur(14px)'])

  return (
    <div style={{ background: '#0e0e0c', color: '#f0ede6', overflowX: 'hidden', minHeight: '100vh' }}>

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 px-5 md:px-8 py-4 flex items-center justify-between"
        style={{ background: navBg, borderBottom: '1px solid', borderColor: navBorder, backdropFilter: navBlur }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #4a6cf7 0%, #3655e5 100%)', boxShadow: '0 2px 10px rgba(74,108,247,0.4)' }}
          >
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="font-bold text-lg" style={{ color: '#f0ede6', letterSpacing: '-0.04em' }}>TideBiz</span>
        </div>

        {/* Desktop anchor links */}
        <nav className="hidden md:flex items-center gap-8">
          {['features', 'about', 'faq'].map(id => (
            <a
              key={id}
              href={`#${id}`}
              className="text-sm font-medium capitalize cursor-pointer"
              style={{ color: '#57534e', transition: 'color 120ms' }}
              onMouseEnter={e => (e.target.style.color = '#f0ede6')}
              onMouseLeave={e => (e.target.style.color = '#57534e')}
            >
              {id}
            </a>
          ))}
        </nav>

        {/* Auth CTA */}
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            to="/login"
            className="text-sm font-medium px-3 py-2 rounded-xl"
            style={{ color: '#ccc9c2', transition: 'color 120ms' }}
          >
            Sign In
          </Link>
          <Link
            to="/signup"
          >
            <motion.span
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #4a6cf7 0%, #3655e5 100%)',
                color: '#fff',
                boxShadow: '0 2px 12px rgba(74,108,247,0.35)',
              }}
              whileHover={{ scale: 1.04, boxShadow: '0 4px 20px rgba(74,108,247,0.5)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.1 }}
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.span>
          </Link>
        </div>
      </motion.header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <Section id="hero" className="relative min-h-screen flex items-center pt-20 pb-16 px-5 md:px-12 lg:px-20">

        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Hero top glow */}
          <div className="absolute inset-x-0 top-0 h-96" style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(74,108,247,0.18) 0%, transparent 65%)' }} />
          {/* Orb 1 */}
          <motion.div
            className="absolute rounded-full"
            style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(74,108,247,0.1) 0%, transparent 65%)', top: -120, right: -100 }}
            animate={{ x: [0, 30, -10, 0], y: [0, -20, 12, 0], scale: [1, 1.08, 0.95, 1] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Orb 2 */}
          <motion.div
            className="absolute rounded-full"
            style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 65%)', bottom: 0, left: -80 }}
            animate={{ x: [0, -20, 14, 0], y: [0, 18, -10, 0], scale: [1, 0.93, 1.06, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          />
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Left: text */}
          <motion.div
            className="flex-1 text-center lg:text-left max-w-xl mx-auto lg:mx-0"
            variants={stagger(0.1)}
            initial="hidden"
            animate="show"
          >
            {/* Eyebrow */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6" style={{ background: 'rgba(74,108,247,0.1)', border: '1px solid rgba(74,108,247,0.2)' }}>
              <Zap className="w-3 h-3" style={{ color: '#4a6cf7' }} />
              <span className="text-xs font-semibold" style={{ color: '#4a6cf7' }}>Built for Gen Z Founders</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="mb-5 leading-tight"
              style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.08 }}
            >
              Run your business.{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #4a6cf7 0%, #a78bfa 55%, #f472b6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Not your chaos.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="text-base md:text-lg leading-relaxed mb-8"
              style={{ color: '#a09d97', maxWidth: '38ch', margin: '0 auto 2rem' }}
            >
              TideBiz puts your financials, journal, AI coach, and founder community in one sleek mobile-first hub.
              Stop juggling apps. Start building your empire.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <Link to="/signup">
                <motion.span
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #4a6cf7 0%, #3655e5 100%)',
                    color: '#fff',
                    boxShadow: '0 4px 24px rgba(74,108,247,0.4), 0 1px 4px rgba(0,0,0,0.4)',
                    letterSpacing: '-0.01em',
                  }}
                  whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(74,108,247,0.55)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </Link>
              <a href="#features">
                <motion.span
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-semibold cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    color: '#ccc9c2',
                    letterSpacing: '-0.01em',
                  }}
                  whileHover={{ background: 'rgba(255,255,255,0.07)', color: '#f0ede6' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                >
                  See how it works
                </motion.span>
              </a>
            </motion.div>

            {/* Trust row */}
            <motion.div variants={fadeUp} className="flex items-center gap-5 mt-8 justify-center lg:justify-start">
              {[
                { icon: Shield, text: 'Secured by Firebase' },
                { icon: Check,  text: 'No credit card needed' },
                { icon: Zap,    text: 'Free to get started' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: '#4a6cf7' }} />
                  <span className="text-xs" style={{ color: '#57534e' }}>{text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: phone mockup */}
          <motion.div
            className="flex-shrink-0 lg:flex-1 flex justify-center lg:justify-end"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </Section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <Section id="features" className="py-24 px-5 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-14"
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
            variants={stagger()}
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4" style={{ background: 'rgba(74,108,247,0.08)', border: '1px solid rgba(74,108,247,0.15)' }}>
              <span className="text-xs font-semibold" style={{ color: '#4a6cf7' }}>Everything you need</span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1 }}
              className="mb-4"
            >
              One hub.{' '}
              <span style={{ background: 'linear-gradient(135deg, #4a6cf7 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Six superpowers.
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base" style={{ color: '#57534e', maxWidth: '48ch', margin: '0 auto' }}>
              Everything a young founder needs to run, track, and grow their business — from day one.
            </motion.p>
          </motion.div>

          {/* Cards grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          >
            {FEATURES.map(({ icon: Icon, title, desc, color, bg, border }) => (
              <motion.div
                key={title}
                className="rounded-2xl p-6 flex flex-col gap-4"
                style={{
                  background: '#1d1d1a',
                  border: `1px solid rgba(255,255,255,0.06)`,
                  boxShadow: '0 1px 1px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.035)',
                }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
                }}
                whileHover={{
                  y: -5,
                  borderColor: border,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${border}, inset 0 1px 0 rgba(255,255,255,0.04)`,
                }}
                transition={{ duration: 0.18 }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: bg, border: `1px solid ${border}` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="font-bold text-sm mb-1.5" style={{ color: '#f0ede6' }}>{title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#57534e' }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ── Stats bar ──────────────────────────────────────────────────── */}
      <div className="py-16 px-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
          {[
            { value: '100%', label: 'Mobile optimised' },
            { value: '6',    label: 'Core features' },
            { value: 'Free', label: 'To get started' },
          ].map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <p
                className="font-extrabold mb-1"
                style={{
                  fontSize: 'clamp(1.75rem, 5vw, 3rem)',
                  letterSpacing: '-0.05em',
                  background: 'linear-gradient(135deg, #f0ede6 0%, #ccc9c2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {value}
              </p>
              <p className="text-xs font-medium" style={{ color: '#57534e' }}>{label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── About ──────────────────────────────────────────────────────── */}
      <Section id="about" className="py-24 px-5 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-14 lg:gap-20">

          {/* Text */}
          <motion.div
            className="flex-1"
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}
            variants={stagger()}
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.18)' }}>
              <span className="text-xs font-semibold" style={{ color: '#a78bfa' }}>Our story</span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              style={{ fontSize: 'clamp(1.75rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1 }}
              className="mb-5"
            >
              Built for founders,
              <br />
              <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                by people who get it.
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base leading-relaxed mb-5" style={{ color: '#a09d97' }}>
              Most business tools were designed for Fortune 500 companies with dedicated finance teams.
              TideBiz was built for the 19-year-old running a freelance design studio from their bedroom,
              the 22-year-old who just launched their first product, the founder who tracks revenue in
              spreadsheets because nothing else felt right.
            </motion.p>
            <motion.p variants={fadeUp} className="text-base leading-relaxed mb-8" style={{ color: '#a09d97' }}>
              We wanted a hub that matches the way Gen Z actually works — fast, mobile-first,
              with an AI coach always on call. No bloat. No corporate dashboards. Just the tools you need, designed beautifully.
            </motion.p>

            <motion.div variants={fadeUp} className="space-y-3">
              {[
                { icon: Zap,     text: 'Mobile-first, always. The app lives in your browser — no downloads.' },
                { icon: Brain,   text: 'AI-powered advice that sounds like a mentor, not a Wikipedia article.' },
                { icon: Shield,  text: 'Your data is yours. Encrypted, private, and never sold.' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(74,108,247,0.1)' }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: '#4a6cf7' }} />
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#a09d97' }}>{text}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Visual card stack */}
          <motion.div
            className="flex-1 flex justify-center items-center"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative w-72 h-72">
              {/* Background decorative circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 rounded-full" style={{ border: '1px solid rgba(74,108,247,0.08)' }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-44 h-44 rounded-full" style={{ border: '1px solid rgba(74,108,247,0.08)' }} />
              </div>

              {/* Central logo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #4a6cf7 0%, #3655e5 100%)',
                    boxShadow: '0 12px 40px rgba(74,108,247,0.5)',
                  }}
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <span className="text-white font-black text-3xl" style={{ letterSpacing: '-0.04em' }}>T</span>
                </motion.div>
              </div>

              {/* Orbiting feature dots */}
              {FEATURES.slice(0, 4).map(({ icon: Icon, color, bg, border }, i) => {
                const angle = (i / 4) * 2 * Math.PI - Math.PI / 2
                const r = 110
                const x = Math.cos(angle) * r + 128
                const y = Math.sin(angle) * r + 128
                return (
                  <motion.div
                    key={i}
                    className="absolute w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: bg, border: `1px solid ${border}`, left: x - 20, top: y - 20 }}
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <Section id="faq" className="py-24 px-5 md:px-12 lg:px-20" style={{ background: '#0a0a09' }}>
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
            variants={stagger()}
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4" style={{ background: 'rgba(74,108,247,0.08)', border: '1px solid rgba(74,108,247,0.15)' }}>
              <span className="text-xs font-semibold" style={{ color: '#4a6cf7' }}>Got questions?</span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.04em' }}
              className="mb-3"
            >
              Frequently asked
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sm" style={{ color: '#57534e' }}>
              Everything you need to know before you start.
            </motion.p>
          </motion.div>

          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <FAQItem key={item.q} q={item.q} a={item.a} index={i} />
            ))}
          </div>
        </div>
      </Section>

      {/* ── CTA banner ─────────────────────────────────────────────────── */}
      <Section id="cta" className="py-24 px-5 md:px-12 lg:px-20">
        <motion.div
          className="max-w-3xl mx-auto rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(74,108,247,0.15) 0%, rgba(167,139,250,0.10) 50%, rgba(244,114,182,0.08) 100%)',
            border: '1px solid rgba(74,108,247,0.2)',
            boxShadow: '0 0 60px rgba(74,108,247,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(74,108,247,0.2) 0%, transparent 60%)' }} />

          <div className="relative z-10">
            <p className="text-xs font-semibold mb-4 uppercase tracking-widest" style={{ color: '#4a6cf7' }}>Ready to start?</p>
            <h2
              className="mb-4 font-extrabold"
              style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', letterSpacing: '-0.04em', lineHeight: 1.1 }}
            >
              Your empire starts today.
            </h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: '#a09d97', maxWidth: '38ch', margin: '0 auto 2rem' }}>
              Join TideBiz for free. No credit card, no fluff — just a clean hub to run your business from day one.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/signup">
                <motion.span
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #4a6cf7 0%, #3655e5 100%)',
                    color: '#fff',
                    boxShadow: '0 4px 24px rgba(74,108,247,0.45)',
                    letterSpacing: '-0.01em',
                  }}
                  whileHover={{ scale: 1.04, boxShadow: '0 8px 36px rgba(74,108,247,0.6)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                >
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </Link>
              <Link to="/login">
                <motion.span
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    color: '#ccc9c2',
                    letterSpacing: '-0.01em',
                  }}
                  whileHover={{ background: 'rgba(255,255,255,0.08)', color: '#f0ede6' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                >
                  Sign In Instead
                </motion.span>
              </Link>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="px-5 md:px-12 py-10" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4a6cf7 0%, #3655e5 100%)' }}>
              <span className="text-white font-bold text-xs">T</span>
            </div>
            <span className="font-bold text-sm" style={{ color: '#57534e', letterSpacing: '-0.03em' }}>TideBiz</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-5">
            {[
              { href: '#features', label: 'Features' },
              { href: '#about',    label: 'About' },
              { href: '#faq',      label: 'FAQ' },
              { to: '/login',      label: 'Sign In' },
              { to: '/signup',     label: 'Sign Up' },
            ].map(({ href, to, label }) =>
              to ? (
                <Link key={label} to={to} className="text-xs hover:text-white transition-colors duration-100" style={{ color: '#3d3a35' }}>
                  {label}
                </Link>
              ) : (
                <a key={label} href={href} className="text-xs hover:text-white transition-colors duration-100" style={{ color: '#3d3a35' }}>
                  {label}
                </a>
              )
            )}
          </div>

          <p className="text-xs" style={{ color: '#3d3a35' }}>
            © {new Date().getFullYear()} TideBiz. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
