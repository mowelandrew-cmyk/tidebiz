import { motion } from 'framer-motion'
import { formatAmount, getCurrency } from '../../lib/currencies'
import { X, Edit2, Trash2 } from 'lucide-react'

export default function EntryDetailModal({ entry, viewingCurrency, convertedAmount, onClose, onEdit, onDelete }) {
  const isRevenue = entry.type === 'revenue'
  const date = entry.createdAt?.toDate?.()
  const accent = isRevenue ? '#22c55e' : '#f43f5e'
  const accentBg = isRevenue ? 'rgba(34,197,94,0.08)' : 'rgba(244,63,94,0.06)'
  const accentBorder = isRevenue ? 'rgba(34,197,94,0.2)' : 'rgba(244,63,94,0.2)'

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
        initial={{ opacity: 0, y: 28, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header stripe */}
        <div
          className="px-6 py-4"
          style={{ background: accentBg, borderBottom: `1px solid ${accentBorder}` }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: accent, letterSpacing: '0.08em' }}
            >
              {isRevenue ? 'Revenue' : 'Expense'}
            </span>
            <motion.button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
              style={{ color: '#57534e' }}
              whileHover={{ color: '#f0ede6', background: 'rgba(255,255,255,0.08)' }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.1 }}
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
          <p className="font-bold mt-1" style={{ fontSize: '1.1rem', color: '#f0ede6' }}>{entry.title}</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Converted amount */}
          <div>
            <p className="section-label mb-0.5">Amount ({viewingCurrency})</p>
            <p className="text-2xl font-bold tabular-nums" style={{ color: accent, letterSpacing: '-0.03em' }}>
              {formatAmount(convertedAmount, viewingCurrency)}
            </p>
          </div>

          {/* Original amount */}
          {entry.currency !== viewingCurrency && (
            <div
              className="px-4 py-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="section-label mb-0.5">Originally logged as</p>
              <p className="text-sm font-medium" style={{ color: '#ccc9c2' }}>
                {formatAmount(entry.amount, entry.currency)}{' '}
                <span style={{ color: '#57534e' }}>{entry.currency} · {getCurrency(entry.currency).name}</span>
              </p>
            </div>
          )}

          {/* Description */}
          {entry.description && (
            <div>
              <p className="section-label mb-0.5">Note</p>
              <p className="text-sm leading-relaxed" style={{ color: '#ccc9c2' }}>{entry.description}</p>
            </div>
          )}

          {/* Date */}
          {date && (
            <div>
              <p className="section-label mb-0.5">Logged on</p>
              <p className="text-sm" style={{ color: '#ccc9c2' }}>
                {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {' at '}
                {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <motion.button
              onClick={onEdit}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer flex items-center justify-center gap-2"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#ccc9c2',
              }}
              whileHover={{ background: 'rgba(255,255,255,0.07)', color: '#f0ede6' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.1 }}
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </motion.button>
            <motion.button
              onClick={onDelete}
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
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
