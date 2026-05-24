import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Trash2 } from 'lucide-react'

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
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="w-full max-w-md overflow-hidden"
        style={{
          background: '#1d1d1a',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        }}
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div>
            <p
              className="text-[10px] font-semibold uppercase mb-0.5"
              style={{ color: '#4a6cf7', letterSpacing: '0.08em' }}
            >
              Reminder
            </p>
            <p className="font-semibold" style={{ color: '#f0ede6' }}>{displayDate}</p>
          </div>
          <motion.button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
            style={{ color: '#57534e' }}
            whileHover={{ color: '#f0ede6', background: 'rgba(255,255,255,0.06)' }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.1 }}
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="section-label">Title</label>
            <input
              className="input-field"
              placeholder="e.g. Follow up with client"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="section-label">
              Note <span style={{ color: '#3d3a35' }}>(optional)</span>
            </label>
            <textarea
              className="input-field resize-none"
              rows={2}
              placeholder="Add details…"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="section-label">
              Time <span style={{ color: '#3d3a35' }}>(optional)</span>
            </label>
            <input
              type="time"
              className="input-field"
              value={time}
              onChange={e => setTime(e.target.value)}
            />
          </div>

          {error && <p className="text-sm" style={{ color: '#f43f5e' }}>{error}</p>}

          <div className="flex gap-3 pt-1">
            {editing && (
              <motion.button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer flex items-center justify-center gap-2"
                style={{
                  background: 'rgba(244,63,94,0.08)',
                  border: '1px solid rgba(244,63,94,0.2)',
                  color: '#f43f5e',
                }}
                whileHover={{ background: 'rgba(244,63,94,0.14)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.1 }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </motion.button>
            )}
            <motion.button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #4a6cf7 0%, #3655e5 100%)', color: '#fff' }}
              whileHover={{ opacity: 0.92 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.1 }}
            >
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Reminder'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
