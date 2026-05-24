import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CURRENCIES } from '../../lib/currencies'
import { X } from 'lucide-react'

export default function AddEntryModal({ onClose, onSave, initial }) {
  const editing = !!initial?.id
  const [type, setType] = useState(initial?.type ?? 'revenue')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [amount, setAmount] = useState(initial?.amount ?? '')
  const [currency, setCurrency] = useState(initial?.currency ?? 'USD')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isRevenue = type === 'revenue'
  const accent = isRevenue ? '#22c55e' : '#f43f5e'
  const accentBg = isRevenue ? 'rgba(34,197,94,0.1)' : 'rgba(244,63,94,0.1)'
  const accentBorder = isRevenue ? 'rgba(34,197,94,0.25)' : 'rgba(244,63,94,0.25)'

  async function handleSubmit(e) {
    e.preventDefault()
    const num = parseFloat(amount)
    if (!title.trim()) return setError('Title is required.')
    if (isNaN(num) || num <= 0) return setError('Enter a valid amount.')
    setSaving(true)
    try {
      await onSave({ type, title: title.trim(), description: description.trim(), amount: num, currency })
      onClose()
    } catch {
      setError('Failed to save. Try again.')
      setSaving(false)
    }
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
        className="w-full max-w-md p-6 space-y-5"
        style={{
          background: '#1d1d1a',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        }}
        initial={{ opacity: 0, y: 28, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold" style={{ fontSize: '1rem', color: '#f0ede6' }}>
            {editing ? 'Edit Entry' : 'New Entry'}
          </h2>
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

        {/* Type toggle */}
        <div
          className="flex p-0.5 rounded-lg"
          style={{ background: '#161613', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          {['revenue', 'expense'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className="flex-1 py-1.5 rounded-md text-sm font-medium relative cursor-pointer capitalize"
              style={{
                color: type === t ? (t === 'revenue' ? '#22c55e' : '#f43f5e') : '#57534e',
                background: type === t
                  ? t === 'revenue' ? 'rgba(34,197,94,0.1)' : 'rgba(244,63,94,0.1)'
                  : 'transparent',
                transition: 'all 150ms ease',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="section-label">Title</label>
            <input
              className="input-field"
              placeholder="e.g. Client payment"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="section-label">
              Description <span style={{ color: '#3d3a35' }}>(optional)</span>
            </label>
            <textarea
              className="input-field resize-none"
              rows={2}
              placeholder="Add a note…"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="section-label">Amount</label>
              <input
                className="input-field"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
            <div className="w-28 space-y-1.5">
              <label className="section-label">Currency</label>
              <select
                className="input-field"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} — {c.symbol}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="text-sm" style={{ color: '#f43f5e' }}>{error}</p>
          )}

          <motion.button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-50 cursor-pointer"
            style={{
              background: isRevenue
                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                : 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
              color: '#fff',
            }}
            whileHover={{ opacity: 0.92 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
          >
            {saving ? 'Saving…' : editing ? 'Save Changes' : `Add ${isRevenue ? 'Revenue' : 'Expense'}`}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  )
}
