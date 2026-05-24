import { useState } from 'react'
import Feed from './community/Feed'
import Forums from './community/Forums'
import Directory from './community/Directory'

const TABS = [
  { key: 'feed', label: 'Feed' },
  { key: 'forums', label: 'Forums' },
  { key: 'directory', label: 'Directory' },
]

export default function Community() {
  const [tab, setTab] = useState('feed')

  return (
    <div className="flex flex-col min-h-full">
      {/* Sticky tab bar */}
      <div className="sticky top-0 z-10 flex border-b border-gray-800 shrink-0" style={{ background: '#0e0e0c' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
              tab === t.key
                ? 'text-accent border-accent'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'feed' && <Feed />}
      {tab === 'forums' && <Forums />}
      {tab === 'directory' && <Directory />}
    </div>
  )
}
