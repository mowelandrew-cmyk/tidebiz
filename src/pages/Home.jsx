import { useAuth } from '../context/AuthContext'
import { useReminders } from '../hooks/useReminders'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  TrendingUp, BookOpen, Sparkles, Bell, ChevronRight, Zap, Quote,
} from 'lucide-react'
import { getDailyQuote } from '../data/quotes'

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const QUICK_ACTIONS = [
  { icon: TrendingUp, label: 'Log Revenue', color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   to: '/logs' },
  { icon: BookOpen,   label: 'Write Entry', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', to: '/journal' },
  { icon: Sparkles,   label: 'Ask AI',      color: '#4a6cf7', bg: 'rgba(74,108,247,0.1)',  to: '/chat' },
]

const CARD_STYLE = {
  background: '#1d1d1a',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 1px 1px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.035)',
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
}

export default function Home() {
  const { user, userProfile } = useAuth()
  const { reminders } = useReminders()
  const navigate = useNavigate()

  const today = todayKey()
  const todayReminders = reminders.filter(r => r.date === today && !r.done)
  const displayName = userProfile?.displayName ?? user?.displayName ?? 'there'
  const firstName = displayName.split(' ')[0]
  const avatarColor = userProfile?.avatarColor ?? '#4a6cf7'
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const plan = userProfile?.plan ?? 'free'
  const quote = getDailyQuote()

  return (
    <div className="relative overflow-hidden">
      {/* ── Animation #6: ambient floating gradient orbs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 320,
            height: 320,
            background: 'radial-gradient(circle, rgba(74,108,247,0.065) 0%, transparent 68%)',
            top: -80,
            right: -80,
          }}
          animate={{
            x: [0, 18, -8, 4, 0],
            y: [0, -12, 6, -18, 0],
            scale: [1, 1.07, 0.96, 1.03, 1],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 240,
            height: 240,
            background: 'radial-gradient(circle, rgba(167,139,250,0.045) 0%, transparent 68%)',
            bottom: 120,
            left: -60,
          }}
          animate={{
            x: [0, -14, 10, -6, 0],
            y: [0, 16, -8, 12, 0],
            scale: [1, 0.94, 1.06, 0.98, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 180,
            height: 180,
            background: 'radial-gradient(circle, rgba(34,197,94,0.03) 0%, transparent 68%)',
            top: '40%',
            right: -30,
          }}
          animate={{
            x: [0, 10, -6, 14, 0],
            y: [0, -10, 14, -4, 0],
            scale: [1, 1.05, 0.97, 1.02, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
        />
      </div>

      {/* Page content */}
      <motion.div
        className="relative px-4 pt-6 pb-6"
        style={{ zIndex: 1 }}
        variants={container}
        initial="hidden"
        animate="show"
      >

        {/* ── Hero header — raw type, no card ── */}
        <motion.div variants={item} className="flex items-start justify-between mb-7">
          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: '#57534e' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1
              className="font-bold leading-tight"
              style={{ color: '#f0ede6', letterSpacing: '-0.03em', fontSize: '1.75rem' }}
            >
              {greeting},<br />{firstName}
            </h1>
          </div>
          <motion.button
            onClick={() => navigate('/settings')}
            className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-1"
            style={{ backgroundColor: avatarColor, color: '#0e0e0c' }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {initials}
          </motion.button>
        </motion.div>

        {/* ── Plan badge ── */}
        <motion.div variants={item} className="mb-5">
          <motion.button
            className="w-full rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer"
            style={{
              background: plan !== 'free' ? 'rgba(74,108,247,0.08)' : '#1d1d1a',
              border: plan !== 'free' ? '1px solid rgba(74,108,247,0.18)' : '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 1px 1px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.035)',
            }}
            onClick={() => navigate('/settings')}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(74,108,247,0.12)' }}
              >
                <Zap className="w-4 h-4" style={{ color: '#4a6cf7' }} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold capitalize" style={{ color: '#f0ede6' }}>
                  {plan} Plan
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#57534e' }}>
                  {plan === 'free' ? 'Upgrade for more AI & features' : 'Full access enabled'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: '#3d3a35' }} />
          </motion.button>
        </motion.div>

        {/* ── Quick actions ── */}
        <motion.div variants={item} className="mb-5">
          <p className="section-label mb-3">Quick actions</p>
          <div className="grid grid-cols-3 gap-2.5">
            {QUICK_ACTIONS.map(({ icon: Icon, label, color, bg, to }) => (
              <motion.button
                key={to}
                onClick={() => navigate(to)}
                className="flex flex-col items-center gap-2 py-4 px-2 rounded-xl cursor-pointer"
                style={CARD_STYLE}
                whileHover={{
                  scale: 1.04,
                  boxShadow: '0 6px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
                }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: bg }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <p className="font-semibold text-xs text-center leading-tight" style={{ color: '#e8e6e1' }}>
                  {label}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Daily quote ── */}
        <motion.div variants={item} className="mb-5">
          <div
            className="rounded-xl px-4 py-4 relative overflow-hidden"
            style={CARD_STYLE}
          >
            {/* Subtle radial glow */}
            <div
              className="absolute -top-6 -left-6 w-24 h-24 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(74,108,247,0.07) 0%, transparent 70%)' }}
            />
            <div className="relative space-y-2.5">
              <div className="flex items-center gap-2">
                <Quote className="w-3 h-3 shrink-0" style={{ color: '#4a6cf7' }} />
                <p className="section-label">Daily quote</p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#ccc9c2', fontStyle: 'italic' }}>
                "{quote.text}"
              </p>
              <div>
                <p className="text-xs font-semibold" style={{ color: '#f0ede6' }}>{quote.author}</p>
                <p className="text-[11px] mt-0.5" style={{ color: '#57534e' }}>{quote.title}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Today's reminders ── */}
        {todayReminders.length > 0 && (
          <motion.div variants={item}>
            <motion.div
              className="rounded-xl p-4 cursor-pointer"
              style={CARD_STYLE}
              onClick={() => navigate('/journal')}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(251,191,36,0.1)' }}
                  >
                    <Bell className="w-3.5 h-3.5 text-yellow-400" />
                  </div>
                  <p className="font-semibold text-sm" style={{ color: '#f0ede6' }}>
                    {todayReminders.length === 1 ? '1 reminder today' : `${todayReminders.length} reminders today`}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: '#3d3a35' }} />
              </div>

              <div className="space-y-2">
                {todayReminders.slice(0, 3).map((r, i) => (
                  <motion.div
                    key={r.id}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.055, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: '#4a6cf7' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#ccc9c2' }}>{r.title}</p>
                      {r.time && <p className="text-xs mt-0.5" style={{ color: '#57534e' }}>{r.time}</p>}
                    </div>
                  </motion.div>
                ))}
                {todayReminders.length > 3 && (
                  <p className="text-xs pl-4" style={{ color: '#3d3a35' }}>
                    +{todayReminders.length - 3} more
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

      </motion.div>
    </div>
  )
}
