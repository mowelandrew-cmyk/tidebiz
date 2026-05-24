import { useState, useEffect, useRef } from 'react'
import { motion, animate } from 'framer-motion'
import { formatAmount } from '../../lib/currencies'
import { Plus } from 'lucide-react'
import AddEntryModal from '../../components/logs/AddEntryModal'
import EntryDetailModal from '../../components/logs/EntryDetailModal'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
}
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
}

// ① Animated number counter — mutates DOM directly for 60fps, no React re-renders
function CountUp({ value, format, color, className, style }) {
  const ref = useRef(null)
  const prevRef = useRef(0)

  useEffect(() => {
    if (!isFinite(value) || !ref.current) return
    const from = prevRef.current
    prevRef.current = value
    const controls = animate(from, value, {
      duration: 0.75,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (ref.current) ref.current.textContent = format(v)
      },
    })
    return () => controls.stop()
  }, [value])

  return (
    <span ref={ref} className={className} style={{ color, ...style }}>
      {format(value)}
    </span>
  )
}

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

  function openAdd(type) { setAddType(type); setShowAdd(true) }

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

  const fmt = v => formatAmount(v, viewingCurrency)

  return (
    <motion.div
      className="flex flex-col gap-4 px-4 py-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Profit summary */}
      <motion.div
        variants={item}
        className="rounded-xl px-4 py-4"
        style={{
          background: '#1d1d1a',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 1px 1px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.035)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="section-label mb-1">Net Profit</p>
            {ratesLoading ? (
              <span className="text-2xl font-bold" style={{ color: '#3d3a35', letterSpacing: '-0.03em' }}>—</span>
            ) : (
              <CountUp
                value={profit}
                format={fmt}
                color={profit >= 0 ? '#22c55e' : '#f43f5e'}
                className="text-2xl font-bold tabular-nums"
                style={{ letterSpacing: '-0.03em' }}
              />
            )}
          </div>
          <div className="text-right space-y-1.5">
            <div className="flex items-center justify-end gap-1.5">
              {ratesLoading ? (
                <span className="text-xs" style={{ color: '#3d3a35' }}>—</span>
              ) : (
                <CountUp value={totalRevenue} format={fmt} color="#22c55e" className="text-xs tabular-nums" />
              )}
              <span className="text-[10px] font-semibold px-1 rounded" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>IN</span>
            </div>
            <div className="flex items-center justify-end gap-1.5">
              {ratesLoading ? (
                <span className="text-xs" style={{ color: '#3d3a35' }}>—</span>
              ) : (
                <CountUp value={totalExpense} format={fmt} color="#f43f5e" className="text-xs tabular-nums" />
              )}
              <span className="text-[10px] font-semibold px-1 rounded" style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e' }}>OUT</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* T-chart */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        {/* Revenue column */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#22c55e', letterSpacing: '0.08em' }}>
              Revenue
            </p>
            <motion.button
              onClick={() => openAdd('revenue')}
              className="w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              transition={{ duration: 0.1 }}
            >
              <Plus className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
            </motion.button>
          </div>
          {revenues.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: '#3d3a35' }}>No revenue yet</p>
          )}
          {revenues.map(e => (
            <EntryCard key={e.id} entry={e} viewingCurrency={viewingCurrency}
              convert={convert} ratesLoading={ratesLoading}
              onClick={() => setSelected(e)} accent="#22c55e" accentBg="rgba(34,197,94,0.08)" />
          ))}
          {revenues.length > 0 && (
            <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {ratesLoading ? (
                <p className="text-xs text-right" style={{ color: '#3d3a35' }}>—</p>
              ) : (
                <CountUp value={totalRevenue} format={fmt} color="#22c55e" className="text-xs block text-right font-semibold tabular-nums" />
              )}
            </div>
          )}
        </div>

        {/* Expense column */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#f43f5e', letterSpacing: '0.08em' }}>
              Expenses
            </p>
            <motion.button
              onClick={() => openAdd('expense')}
              className="w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer"
              style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              transition={{ duration: 0.1 }}
            >
              <Plus className="w-3.5 h-3.5" style={{ color: '#f43f5e' }} />
            </motion.button>
          </div>
          {expenses.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: '#3d3a35' }}>No expenses yet</p>
          )}
          {expenses.map(e => (
            <EntryCard key={e.id} entry={e} viewingCurrency={viewingCurrency}
              convert={convert} ratesLoading={ratesLoading}
              onClick={() => setSelected(e)} accent="#f43f5e" accentBg="rgba(244,63,94,0.06)" />
          ))}
          {expenses.length > 0 && (
            <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {ratesLoading ? (
                <p className="text-xs text-right" style={{ color: '#3d3a35' }}>—</p>
              ) : (
                <CountUp value={totalExpense} format={fmt} color="#f43f5e" className="text-xs block text-right font-semibold tabular-nums" />
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Modals */}
      {(showAdd || editing) && (
        <AddEntryModal
          initial={editing ? { ...editing, type: addType } : { type: addType }}
          onClose={() => { setShowAdd(false); setEditing(null) }}
          onSave={handleSave}
        />
      )}

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
    </motion.div>
  )
}

function EntryCard({ entry, viewingCurrency, convert, ratesLoading, onClick, accent, accentBg }) {
  const converted = convert(entry.amount, entry.currency)
  const date = entry.createdAt?.toDate?.()

  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left rounded-xl px-3 py-2.5 space-y-0.5 cursor-pointer"
      style={{ background: '#1d1d1a', border: '1px solid rgba(255,255,255,0.06)' }}
      whileHover={{ background: accentBg, borderColor: `${accent}30` }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="text-xs font-medium truncate" style={{ color: '#f0ede6' }}>{entry.title}</p>
      <p className="text-sm font-bold tabular-nums" style={{ color: accent }}>
        {ratesLoading ? '—' : formatAmount(converted, viewingCurrency)}
      </p>
      {entry.currency !== viewingCurrency && (
        <p className="text-[10px]" style={{ color: '#3d3a35' }}>
          {formatAmount(entry.amount, entry.currency)} {entry.currency}
        </p>
      )}
      {date && (
        <p className="text-[10px]" style={{ color: '#3d3a35' }}>
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      )}
    </motion.button>
  )
}
