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
      <div className="px-4 py-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-xl" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
          style={{ background: 'rgba(74,108,247,0.08)', border: '1px solid rgba(74,108,247,0.15)' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#4a6cf7" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>
        <p className="text-sm" style={{ color: '#57534e' }}>Add some entries in the Ledger tab to see your charts.</p>
      </div>
    )
  }

  const commonProps = {
    data,
    margin: { top: 8, right: 8, left: 0, bottom: 0 },
  }

  const tooltipStyle = {
    backgroundColor: '#1d1d1a',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    color: '#f0ede6',
    fontSize: 12,
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Chart type toggle */}
      <div
        className="flex p-0.5 rounded-lg w-fit"
        style={{ background: '#161613', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        {CHART_TYPES.map(t => (
          <button
            key={t.id}
            onClick={() => setChartType(t.id)}
            className="px-4 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-all duration-100"
            style={{
              color: chartType === t.id ? '#f0ede6' : '#57534e',
              background: chartType === t.id ? '#1d1d1a' : 'transparent',
              boxShadow: chartType === t.id ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        className="rounded-xl p-4"
        style={{
          background: '#1d1d1a',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 1px 1px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.035)',
        }}
      >
        <p className="section-label mb-4">
          Revenue · Expenses · Profit — {viewingCurrency}
        </p>
        <ResponsiveContainer width="100%" height={260}>
          {chartType === 'line' ? (
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tickFormatter={tickFmt} tick={{ fill: '#57534e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v)} tick={{ fill: '#57534e', fontSize: 10 }} width={72} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v, name) => [fmt(v), name]} contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(255,255,255,0.06)' }} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#57534e' }} />
              <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={false} name="Revenue" />
              <Line type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} dot={false} name="Expenses" />
              <Line type="monotone" dataKey="profit" stroke="#4a6cf7" strokeWidth={2} dot={false} name="Profit" />
            </LineChart>
          ) : (
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tickFormatter={tickFmt} tick={{ fill: '#57534e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v)} tick={{ fill: '#57534e', fontSize: 10 }} width={72} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v, name) => [fmt(v), name]} contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#57534e' }} />
              <Bar dataKey="revenue"  fill="#22c55e" name="Revenue"  radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#f43f5e" name="Expenses" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit"   fill="#4a6cf7" name="Profit"   radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
