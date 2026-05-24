import { useJournalEntries } from '../hooks/useJournalEntries'
import { useReminders } from '../hooks/useReminders'
import Entries from './journal/Entries'
import Calendar from './journal/Calendar'
import { useState } from 'react'

const TABS = ['Entries', 'Calendar']

export default function Journal() {
  const [activeTab, setActiveTab] = useState('Entries')
  const { entries, loading, addEntry, editEntry, removeEntry } = useJournalEntries()
  const { reminders, addReminder, editReminder, removeReminder } = useReminders()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 space-y-3">
        <h1 className="text-xl font-bold text-white">Journal</h1>
        <div className="flex gap-1 bg-surface-raised rounded-xl p-1 border border-gray-800">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab ? 'bg-accent text-gray-900' : 'text-gray-400 hover:text-gray-200'
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
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
      </div>
    </div>
  )
}
