import { useState } from 'react'
import ReminderModal from '../../components/journal/ReminderModal'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function todayKey() {
  return toDateKey(new Date())
}

export default function Calendar({ reminders, addReminder, editReminder, removeReminder }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedReminder, setSelectedReminder] = useState(null)

  // Group reminders by date key
  const byDate = {}
  reminders.forEach(r => {
    if (!byDate[r.date]) byDate[r.date] = []
    byDate[r.date].push(r)
  })

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  function handleDayClick(day) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(key)
    setSelectedReminder(null)
  }

  const today = todayKey()
  const dayReminders = selectedDate ? (byDate[selectedDate] ?? []) : []

  return (
    <div className="px-4 py-2 space-y-2">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-surface-raised transition-colors">
          <ChevronLeft />
        </button>
        <h3 className="text-white font-semibold">{MONTHS[month]} {year}</h3>
        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-surface-raised transition-colors">
          <ChevronRight />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] text-gray-600 font-medium py-0.5">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isToday = key === today
          const isSelected = key === selectedDate
          const hasReminders = !!byDate[key]?.length

          return (
            <button
              key={key}
              onClick={() => handleDayClick(day)}
              className={`
                h-8 flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-colors relative
                ${isSelected ? 'bg-accent text-gray-900' : isToday ? 'bg-accent/20 text-accent' : 'text-gray-300 hover:bg-surface-raised'}
              `}
            >
              {day}
              {hasReminders && (
                <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected ? 'bg-gray-900' : 'bg-accent'}`} />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day reminders */}
      {selectedDate && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            {selectedDate >= today && (
              <button onClick={() => setSelectedReminder('new')}
                className="text-xs text-accent hover:underline">
                + Add reminder
              </button>
            )}
          </div>

          {dayReminders.length === 0 && (
            <p className="text-gray-600 text-sm">No reminders for this day.</p>
          )}

          {dayReminders.map(r => (
            <div key={r.id}
              onClick={() => setSelectedReminder(r)}
              className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors hover:bg-surface
                ${r.done ? 'opacity-50' : ''}`}>
              <button
                className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 transition-colors
                  ${r.done ? 'bg-accent border-accent' : 'border-gray-600'}`}
                onClick={async (e) => { e.stopPropagation(); await editReminder(r.id, { done: !r.done }) }}
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium text-white ${r.done ? 'line-through' : ''}`}>{r.title}</p>
                {r.time && <p className="text-xs text-gray-500">{r.time}</p>}
                {r.note && <p className="text-xs text-gray-500 truncate">{r.note}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reminder modal */}
      {selectedReminder && (
        <ReminderModal
          date={selectedDate}
          reminder={selectedReminder === 'new' ? null : selectedReminder}
          onSave={async data => {
            if (selectedReminder === 'new') await addReminder(data)
            else await editReminder(selectedReminder.id, data)
          }}
          onDelete={removeReminder}
          onClose={() => setSelectedReminder(null)}
        />
      )}
    </div>
  )
}

function ChevronLeft() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
}
function ChevronRight() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
}
