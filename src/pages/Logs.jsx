import { useState } from 'react'
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
          <h1 className="text-xl font-bold text-white">Logs</h1>
          {/* Viewing currency selector */}
          <select
            value={viewingCurrency}
            onChange={e => changeCurrency(e.target.value)}
            className="bg-surface-raised border border-gray-700 text-gray-200 text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:border-accent"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} — {c.symbol}</option>
            ))}
          </select>
        </div>

        {/* Free tier notice */}
        {!isPro && (
          <p className="text-[11px] text-gray-600">
            Free plan · Showing entries from the last 30 days.{' '}
            <span className="text-accent cursor-pointer hover:underline">Upgrade for full history →</span>
          </p>
        )}

        {/* Sub-tabs */}
        <div className="flex gap-1 bg-surface-raised rounded-xl p-1 border border-gray-800">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-accent text-gray-900'
                  : 'text-gray-400 hover:text-gray-200'
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {entriesLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === 'Ledger' ? (
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
      </div>
    </div>
  )
}
