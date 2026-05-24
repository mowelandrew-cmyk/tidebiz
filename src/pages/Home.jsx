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
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white">{greeting}, {displayName.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
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
      <div className="grid grid-cols-2 gap-3">
        <QuickCard icon="📊" label="Log Revenue" sub="Track your earnings" onClick={() => navigate('/logs')} />
        <QuickCard icon="📓" label="Write Entry" sub="Reflect on your day" onClick={() => navigate('/journal')} />
      </div>

      {/* Placeholder for future dashboard widgets */}
      <div className="card border-dashed border-gray-700 flex items-center justify-center py-8">
        <p className="text-gray-600 text-sm">More dashboard widgets coming soon</p>
      </div>
    </div>
  )
}

function QuickCard({ icon, label, sub, onClick }) {
  return (
    <button onClick={onClick}
      className="card text-left hover:border-gray-700 active:scale-95 transition-all duration-150">
      <span className="text-2xl">{icon}</span>
      <p className="text-white font-semibold text-sm mt-2">{label}</p>
      <p className="text-gray-500 text-xs">{sub}</p>
    </button>
  )
}
