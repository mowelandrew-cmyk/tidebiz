import { useAuth } from '../context/AuthContext'
import { useReminders } from '../hooks/useReminders'
import { useNavigate } from 'react-router-dom'

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function Home() {
  const { user, userProfile } = useAuth()
  const { reminders } = useReminders()
  const navigate = useNavigate()

  const today = todayKey()
  const todayReminders = reminders.filter(r => r.date === today && !r.done)
  const displayName = userProfile?.displayName ?? user?.displayName ?? 'there'
  const firstName = displayName.split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">

      {/* Greeting */}
      <div className="space-y-0.5">
        <p className="text-gray-500 text-sm">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-2xl font-bold text-white">{greeting}, {firstName} 👋</h1>
      </div>

      {/* Today's reminders */}
      {todayReminders.length > 0 && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔔</span>
              <p className="text-white font-semibold text-sm">
                {todayReminders.length === 1
                  ? '1 reminder today'
                  : `${todayReminders.length} reminders today`}
              </p>
            </div>
            <button onClick={() => navigate('/journal')}
              className="text-xs text-accent hover:underline">View all</button>
          </div>
          <div className="space-y-2">
            {todayReminders.slice(0, 3).map(r => (
              <div key={r.id} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-200 font-medium">{r.title}</p>
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

      {/* Quick actions */}
      <div>
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-3">Quick actions</p>
        <div className="grid grid-cols-3 gap-2.5">
          <QuickCard icon="📊" label="Log Revenue" onClick={() => navigate('/logs')} />
          <QuickCard icon="📓" label="Write Entry" onClick={() => navigate('/journal')} />
          <QuickCard icon="✨" label="Ask AI" onClick={() => navigate('/chat')} />
        </div>
      </div>

      {/* Plan banner for free users */}
      {(!userProfile?.plan || userProfile.plan === 'free') && (
        <button
          onClick={() => navigate('/settings')}
          className="w-full rounded-2xl p-4 text-left transition-all duration-200 hover:scale-[1.01]"
          style={{
            background: 'linear-gradient(135deg, rgba(74,108,247,0.15) 0%, rgba(54,85,229,0.08) 100%)',
            border: '1px solid rgba(74, 108, 247, 0.25)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Unlock the full TideBiz experience</p>
              <p className="text-xs text-gray-400 mt-0.5">Upgrade to Pro or Max for more AI messages & features</p>
            </div>
            <span className="text-accent text-lg ml-3">→</span>
          </div>
        </button>
      )}
    </div>
  )
}

function QuickCard({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl transition-all duration-150 active:scale-95 hover:scale-[1.02]"
      style={{
        background: 'linear-gradient(160deg, #161b28 0%, #131825 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
      }}
    >
      <span className="text-2xl">{icon}</span>
      <p className="text-white font-semibold text-xs text-center leading-tight">{label}</p>
    </button>
  )
}
