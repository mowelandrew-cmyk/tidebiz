import { useState } from 'react'
import { formatAmount } from '../../lib/currencies'
import AddEntryModal from '../../components/logs/AddEntryModal'
import EntryDetailModal from '../../components/logs/EntryDetailModal'

export default function Ledger({ entries, addEntry, editEntry, removeEntry, viewingCurrency, convert, ratesLoading }) {
  const [showAdd, setShowAdd] = useState(false)
  const [addType, setAddType] = useState('revenue')
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)

  const revenues = entries.filter(e => e.type === 'revenue')
  const expenses = entries.filter(e => e.type === 'expense')

  const totalRevenue = revenues.reduce((s, e) => s + convert(e.amount, e.currency), 0)
  const totalExpense = expenses.reduce((s, e) => s + convert(e.amount, e.currency), 0)
  const profit = totalRevenue - totalExpense

  function openAdd(type) {
    setAddType(type)
    setShowAdd(true)
  }

  async function handleSave(data) {
    if (editing) {
      await editEntry(editing.id, data)
      setEditing(null)
    } else {
      await addEntry(data)
    }
  }

  async function handleDelete(id) {
    await removeEntry(id)
    setSelected(null)
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {/* Profit summary */}
      <div className="card flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">Net Profit</p>
          <p className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {ratesLoading ? '—' : formatAmount(profit, viewingCurrency)}
          </p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-xs text-emerald-400">↑ {ratesLoading ? '—' : formatAmount(totalRevenue, viewingCurrency)}</p>
          <p className="text-xs text-rose-400">↓ {ratesLoading ? '—' : formatAmount(totalExpense, viewingCurrency)}</p>
        </div>
      </div>

      {/* T-chart */}
      <div className="grid grid-cols-2 gap-3">
        {/* Revenue column */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Revenue</h3>
            <button onClick={() => openAdd('revenue')}
              className="w-6 h-6 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-600/40 transition-colors">
              <PlusIcon />
            </button>
          </div>
          {revenues.length === 0 && (
            <p className="text-gray-600 text-xs text-center py-4">No revenue yet</p>
          )}
          {revenues.map(e => (
            <EntryCard key={e.id} entry={e} viewingCurrency={viewingCurrency}
              convert={convert} ratesLoading={ratesLoading}
              onClick={() => setSelected(e)} color="emerald" />
          ))}
          {revenues.length > 0 && (
            <div className="border-t border-gray-700 pt-2 text-right">
              <p className="text-xs text-emerald-400 font-semibold">
                {ratesLoading ? '—' : formatAmount(totalRevenue, viewingCurrency)}
              </p>
            </div>
          )}
        </div>

        {/* Expense column */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-widest">Expenses</h3>
            <button onClick={() => openAdd('expense')}
              className="w-6 h-6 rounded-full bg-rose-600/20 text-rose-400 flex items-center justify-center hover:bg-rose-600/40 transition-colors">
              <PlusIcon />
            </button>
          </div>
          {expenses.length === 0 && (
            <p className="text-gray-600 text-xs text-center py-4">No expenses yet</p>
          )}
          {expenses.map(e => (
            <EntryCard key={e.id} entry={e} viewingCurrency={viewingCurrency}
              convert={convert} ratesLoading={ratesLoading}
              onClick={() => setSelected(e)} color="rose" />
          ))}
          {expenses.length > 0 && (
            <div className="border-t border-gray-700 pt-2 text-right">
              <p className="text-xs text-rose-400 font-semibold">
                {ratesLoading ? '—' : formatAmount(totalExpense, viewingCurrency)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add entry modal */}
      {(showAdd || editing) && (
        <AddEntryModal
          initial={editing ? { ...editing, type: addType } : { type: addType }}
          onClose={() => { setShowAdd(false); setEditing(null) }}
          onSave={handleSave}
        />
      )}

      {/* Entry detail modal */}
      {selected && !editing && (
        <EntryDetailModal
          entry={selected}
          viewingCurrency={viewingCurrency}
          convertedAmount={convert(selected.amount, selected.currency)}
          onClose={() => setSelected(null)}
          onEdit={() => { setEditing(selected); setAddType(selected.type); setSelected(null) }}
          onDelete={() => handleDelete(selected.id)}
        />
      )}
    </div>
  )
}

function EntryCard({ entry, viewingCurrency, convert, ratesLoading, onClick, color }) {
  const converted = convert(entry.amount, entry.currency)
  const date = entry.createdAt?.toDate?.()

  return (
    <button onClick={onClick}
      className={`w-full text-left card hover:border-${color}-600/40 active:scale-[0.98] transition-all duration-150 space-y-1`}>
      <p className="text-white text-xs font-medium truncate">{entry.title}</p>
      <p className={`text-sm font-bold text-${color}-400`}>
        {ratesLoading ? '—' : formatAmount(converted, viewingCurrency)}
      </p>
      {entry.currency !== viewingCurrency && (
        <p className="text-gray-600 text-[10px]">{formatAmount(entry.amount, entry.currency)} {entry.currency}</p>
      )}
      {date && (
        <p className="text-gray-600 text-[10px]">
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      )}
    </button>
  )
}

function PlusIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}
