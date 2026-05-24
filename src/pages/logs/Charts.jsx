import { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { formatAmount } from '../../lib/currencies'

const CHART_TYPES = [
  { id: 'line', label: 'Line' },
  { id: 'bar',  label: 'Bar' },
]

export default function Charts({ entries, viewingCurrency, convert, ratesLoading }) {
  const [chartType, setChartType] = useState('line')

  const data = useMemo(() => {
    const byMonth = {}
    entries.forEach(e => {
      const d = e.createdAt?.toDate?.()
      if (!d) return
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!byMonth[key]) byMonth[key] = { month: key, revenue: 0, expenses: 0 }
      const amt = convert(e.amount, e.currency)
      if (e.type === 'revenue') byMonth[key].revenue += amt
      else byMonth[key].expenses += amt
    })
    return Object.values(byMonth)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(d => ({ ...d, profit: d.revenue - d.expenses }))
  }, [entries, convert])

  const fmt = v => formatAmount(v, viewingCurrency)
  const tickFmt = v => {
    const [y, m] = v.split('-')
    return new Date(+y, +m - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }

  if (ratesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <p className="text-4xl mb-3">📊</p>
        <p className="text-gray-400 text-sm">Add some entries in the Ledger tab to see your charts.</p>
      </div>
    )
  }

  const commonProps = {
    data,
    margin: { top: 8, right: 8, left: 0, bottom: 0 },
  }

  const tooltipStyle = {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: 8,
    color: '#f9fafb',
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Chart type toggle */}
      <div className="flex rounded-xl overflow-hidden border border-gray-700 w-fit">
        {CHART_TYPES.map(t => (
          <button key={t.id} onClick={() => setChartType(t.id)}
            className={`px-4 py-1.5 text-sm font-medium transition-colors ${
              chartType === t.id ? 'bg-accent text-gray-900' : 'text-gray-400 hover:text-gray-200'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">
          Revenue · Expenses · Profit — {viewingCurrency}
        </p>
        <ResponsiveContainer width="100%" height={260}>
          {chartType === 'line' ? (
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" tickFormatter={tickFmt} tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tickFormatter={v => fmt(v)} tick={{ fill: '#6b7280', fontSize: 10 }} width={72} />
              <Tooltip formatter={(v, name) => [fmt(v), name]} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
              <Line type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={2} dot={false} name="Revenue" />
              <Line type="monotone" dataKey="expenses" stroke="#fb7185" strokeWidth={2} dot={false} name="Expenses" />
              <Line type="monotone" dataKey="profit" stroke="#38bdf8" strokeWidth={2} dot={false} name="Profit" />
            </LineChart>
          ) : (
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" tickFormatter={tickFmt} tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tickFormatter={v => fmt(v)} tick={{ fill: '#6b7280', fontSize: 10 }} width={72} />
              <Tooltip formatter={(v, name) => [fmt(v), name]} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
              <Bar dataKey="revenue"  fill="#34d399" name="Revenue"  radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#fb7185" name="Expenses" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit"   fill="#38bdf8" name="Profit"   radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
