import { useAuth } from '../context/AuthContext'
import { useReminders } from '../hooks/useReminders'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, BookOpen, Sparkles, Bell, ChevronRight, Zap,
} from 'lucide-react'

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const QUICK_ACTIONS = [
  { icon: TrendingUp, label: 'Log Revenue', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', to: '/logs' },
  { icon: BookOpen,   label: 'Write Entry', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', to: '/journal' },
  { icon: Sparkles,   label: 'Ask AI',      color: '#4a6cf7', bg: 'rgba(74,108,247,0.1)', to: '/chat' },
]

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

  return (
    <div className="px-4 pt-5 pb-4 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600 font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-xl font-bold text-white mt-0.5">{greeting}, {firstName}</h1>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-gray-900 cursor-pointer shrink-0 transition-opacity hover:opacity-80"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </button>
      </div>

      {/* Plan badge */}
      <div
        className="rounded-2xl px-4 py-3.5 flex items-center justify-between cursor-pointer"
        style={{
          background: plan !== 'free'
            ? 'linear-gradient(135deg, rgba(74,108,247,0.2) 0%, rgba(122,147,248,0.1) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
          border: plan !== 'free'
            ? '1px solid rgba(74,108,247,0.35)'
            : '1px solid rgba(255,255,255,0.07)',
        }}
        onClick={() => navigate('/settings')}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(74,108,247,0.15)' }}
          >
            <Zap className="w-3.5 h-3.5" style={{ color: '#4a6cf7' }} />
          </div>
          <div>
            <p className="text-xs font-semibold text-white capitalize">{plan} Plan</p>
            <p className="text-[10px] text-gray-500">
              {plan === 'free' ? 'Upgrade for more AI & features' : 'Full access enabled'}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-600" />
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-3">Quick actions</p>
        <div className="grid grid-cols-3 gap-2.5">
          {QUICK_ACTIONS.map(({ icon: Icon, label, color, bg, to }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="flex flex-col items-center gap-2.5 py-4 px-2 rounded-2xl cursor-pointer transition-all duration-150 active:scale-95"
              style={{
                background: 'linear-gradient(160deg, #161b28 0%, #131825 100%)',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <p className="text-white font-semibold text-xs text-center leading-tight">{label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Today's reminders */}
      {todayReminders.length > 0 && (
        <div
          className="rounded-2xl p-4 space-y-3 cursor-pointer"
          style={{
            background: 'linear-gradient(160deg, #161b28 0%, #131825 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
          onClick={() => navigate('/journal')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.15)' }}>
                <Bell className="w-3.5 h-3.5 text-yellow-400" />
              </div>
              <p className="text-white font-semibold text-sm">
                {todayReminders.length === 1 ? '1 reminder today' : `${todayReminders.length} reminders today`}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </div>
          <div className="space-y-2">
            {todayReminders.slice(0, 3).map(r => (
              <div key={r.id} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#4a6cf7' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 font-medium truncate">{r.title}</p>
                  {r.time && <p className="text-xs text-gray-500">{r.time}</p>}
                </div>
              </div>
            ))}
            {todayReminders.length > 3 && (
              <p className="text-xs text-gray-600 pl-4">+{todayReminders.length - 3} more</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
