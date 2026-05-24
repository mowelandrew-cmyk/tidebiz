import { useState } from 'react'

export default function ReminderModal({ date, reminder, onSave, onDelete, onClose }) {
  const editing = !!reminder
  const [title, setTitle] = useState(reminder?.title ?? '')
  const [note, setNote] = useState(reminder?.note ?? '')
  const [time, setTime] = useState(reminder?.time ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const displayDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  async function handleSave() {
    if (!title.trim()) return setError('Title is required.')
    setSaving(true)
    try {
      await onSave({ title: title.trim(), note: note.trim(), date, time })
      onClose()
    } catch {
      setError('Failed to save. Try again.')
      setSaving(false)
    }
  }

  async function handleDelete() {
    await onDelete(reminder.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:pb-0"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md bg-surface-raised rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-accent uppercase tracking-widest mb-0.5">Reminder</p>
            <p className="text-white font-semibold">{displayDate}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
            <XIcon />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input className="input-field" placeholder="e.g. Follow up with client"
              value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Note <span className="text-gray-600">(optional)</span></label>
            <textarea className="input-field resize-none" rows={2} placeholder="Add details..."
              value={note} onChange={e => setNote(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Time <span className="text-gray-600">(optional)</span></label>
            <input type="time" className="input-field" value={time} onChange={e => setTime(e.target.value)} />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-1">
            {editing && (
              <button onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-600/30 text-sm font-medium hover:bg-rose-600/30 transition-colors">
                Delete
              </button>
            )}
            <button onClick={handleSave} disabled={saving}
              className="flex-1 btn-primary !w-auto py-2.5 text-sm">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Reminder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
