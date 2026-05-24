import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEntries } from '../hooks/useEntries'
import { useExchangeRates } from '../hooks/useExchangeRates'
import { CURRENCIES } from '../lib/currencies'
import { useAuth } from '../context/AuthContext'
import Ledger from './logs/Ledger'
import Charts from './logs/Charts'

const TABS = ['Ledger', 'Charts']

export default function Logs() {
  const { userProfile } = useAuth()
  const isPro = userProfile?.plan === 'pro' || userProfile?.plan === 'max'

  const [activeTab, setActiveTab] = useState('Ledger')
  const [viewingCurrency, setViewingCurrency] = useState(
    () => localStorage.getItem('tidebiz_currency') ?? 'USD'
  )

  const { entries, loading: entriesLoading, addEntry, editEntry, removeEntry } = useEntries()
  const { convert, loading: ratesLoading } = useExchangeRates(viewingCurrency)

  function changeCurrency(code) {
    setViewingCurrency(code)
    localStorage.setItem('tidebiz_currency', code)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <h1
            className="font-bold"
            style={{ fontSize: '1.25rem', color: '#f0ede6', letterSpacing: '-0.02em' }}
          >
            Logs
          </h1>
          <select
            value={viewingCurrency}
            onChange={e => changeCurrency(e.target.value)}
            className="text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:border-accent cursor-pointer"
            style={{
              background: '#1d1d1a',
              border: '1px solid rgba(255,255,255,0.07)',
              color: '#ccc9c2',
            }}
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} — {c.symbol}</option>
            ))}
          </select>
        </div>

        {!isPro && (
          <p className="text-[11px]" style={{ color: '#57534e' }}>
            Free plan · Showing entries from the last 30 days.{' '}
            <span className="text-accent cursor-pointer hover:underline">Upgrade for full history</span>
          </p>
        )}

        {/* Animated tab switcher */}
        <div
          className="flex relative p-0.5 rounded-lg"
          style={{ background: '#161613', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-1.5 rounded-md text-sm font-medium relative z-10 transition-colors duration-100 cursor-pointer"
              style={{ color: activeTab === tab ? '#f0ede6' : '#57534e' }}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="logs-tab-bg"
                  className="absolute inset-0 rounded-md"
                  style={{ background: '#1d1d1a', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              <span className="relative">{tab}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {entriesLoading ? (
          <div className="px-4 pt-4 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: '100%' }}
            >
              {activeTab === 'Ledger' ? (
                <Ledger
                  entries={entries}
                  addEntry={addEntry}
                  editEntry={editEntry}
                  removeEntry={removeEntry}
                  viewingCurrency={viewingCurrency}
                  convert={convert}
                  ratesLoading={ratesLoading}
                />
              ) : (
                <Charts
                  entries={entries}
                  viewingCurrency={viewingCurrency}
                  convert={convert}
                  ratesLoading={ratesLoading}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
