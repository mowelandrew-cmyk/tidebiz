import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useJournalEntries } from '../hooks/useJournalEntries'
import { useReminders } from '../hooks/useReminders'
import Entries from './journal/Entries'
import Calendar from './journal/Calendar'

const TABS = ['Entries', 'Calendar']

export default function Journal() {
  const [activeTab, setActiveTab] = useState('Entries')
  const { entries, loading, addEntry, editEntry, removeEntry } = useJournalEntries()
  const { reminders, addReminder, editReminder, removeReminder } = useReminders()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 space-y-3">
        <h1
          className="font-bold"
          style={{ fontSize: '1.25rem', color: '#f0ede6', letterSpacing: '-0.02em' }}
        >
          Journal
        </h1>

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
                  layoutId="journal-tab-bg"
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
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{ height: '100%' }}
          >
            {activeTab === 'Entries' ? (
              <Entries
                entries={entries}
                loading={loading}
                addEntry={addEntry}
                editEntry={editEntry}
                removeEntry={removeEntry}
              />
            ) : (
              <Calendar
                reminders={reminders}
                addReminder={addReminder}
                editReminder={editReminder}
                removeReminder={removeReminder}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
