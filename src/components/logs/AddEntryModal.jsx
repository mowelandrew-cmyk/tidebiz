import { useState } from 'react'
import { CURRENCIES } from '../../lib/currencies'

export default function AddEntryModal({ onClose, onSave, initial }) {
  const editing = !!initial
  const [type, setType] = useState(initial?.type ?? 'revenue')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [amount, setAmount] = useState(initial?.amount ?? '')
  const [currency, setCurrency] = useState(initial?.currency ?? 'USD')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:pb-0"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md bg-surface-raised rounded-2xl p-6 border border-gray-800 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{editing ? 'Edit Entry' : 'New Entry'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <XIcon />
          </button>
        </div>

        {/* Revenue / Expense toggle */}
        <div className="flex rounded-xl overflow-hidden border border-gray-700">
          <button
            type="button"
            onClick={() => setType('revenue')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              type === 'revenue' ? 'bg-emerald-600 text-white' : 'bg-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Revenue
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              type === 'expense' ? 'bg-rose-600 text-white' : 'bg-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Expense
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input className="input-field" placeholder="e.g. Client payment" value={title}
              onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description <span className="text-gray-600">(optional)</span></label>
            <textarea className="input-field resize-none" rows={2} placeholder="Add a note..."
              value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">Amount</label>
              <input className="input-field" type="number" min="0" step="0.01" placeholder="0.00"
                value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div className="w-28">
              <label className="block text-sm text-gray-400 mb-1">Currency</label>
              <select className="input-field" value={currency} onChange={e => setCurrency(e.target.value)}>
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} — {c.symbol}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={saving}
            className={`btn-primary ${type === 'expense' ? '!bg-rose-600 hover:!bg-rose-700' : '!bg-emerald-600 hover:!bg-emerald-700'}`}>
            {saving ? 'Saving…' : editing ? 'Save Changes' : `Add ${type === 'revenue' ? 'Revenue' : 'Expense'}`}
          </button>
        </form>
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
