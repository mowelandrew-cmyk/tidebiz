import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
      <div
        className="sticky top-0 z-10 flex shrink-0"
        style={{ background: '#0e0e0c', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 py-3 text-sm font-medium relative cursor-pointer transition-colors duration-100"
            style={{ color: tab === t.key ? '#f0ede6' : '#57534e' }}
          >
            {tab === t.key && (
              <motion.span
                layoutId="community-tab-line"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: 'linear-gradient(90deg, #4a6cf7, #7a93f8)' }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          {tab === 'feed' && <Feed />}
          {tab === 'forums' && <Forums />}
          {tab === 'directory' && <Directory />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
