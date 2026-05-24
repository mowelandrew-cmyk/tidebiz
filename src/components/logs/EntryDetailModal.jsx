import { formatAmount, getCurrency } from '../../lib/currencies'

export default function EntryDetailModal({ entry, viewingCurrency, convertedAmount, onClose, onEdit, onDelete }) {
  const isRevenue = entry.type === 'revenue'
  const date = entry.createdAt?.toDate?.()
  const sameCurrency = entry.currency === viewingCurrency

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:pb-0"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md bg-surface-raised rounded-2xl border border-gray-800 overflow-hidden">
        {/* Header stripe */}
        <div className={`px-6 py-4 ${isRevenue ? 'bg-emerald-600/20 border-b border-emerald-600/30' : 'bg-rose-600/20 border-b border-rose-600/30'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-widest ${isRevenue ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isRevenue ? 'Revenue' : 'Expense'}
            </span>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
              <XIcon />
            </button>
          </div>
          <p className="text-white font-bold text-xl mt-1">{entry.title}</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Converted amount */}
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Amount ({viewingCurrency})</p>
            <p className={`text-2xl font-bold ${isRevenue ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatAmount(convertedAmount, viewingCurrency)}
            </p>
          </div>

          {/* Original amount (if different currency) */}
          {entry.currency !== viewingCurrency && (
            <div className="bg-surface rounded-xl px-4 py-3 border border-gray-700">
              <p className="text-xs text-gray-500 mb-0.5">Originally logged as</p>
              <p className="text-white font-medium">
                {formatAmount(entry.amount, entry.currency)}{' '}
                <span className="text-gray-400 text-sm">{entry.currency} · {getCurrency(entry.currency).name}</span>
              </p>
            </div>
          )}

          {/* Description */}
          {entry.description && (
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Note</p>
              <p className="text-gray-300 text-sm">{entry.description}</p>
            </div>
          )}

          {/* Date */}
          {date && (
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Logged on</p>
              <p className="text-gray-300 text-sm">
                {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {' at '}
                {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={onEdit}
              className="flex-1 btn-secondary text-sm py-2">
              Edit
            </button>
            <button onClick={onDelete}
              className="flex-1 py-2 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-600/30 text-sm font-medium hover:bg-rose-600/30 transition-colors">
              Delete
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
