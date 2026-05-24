import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EntryEditor from '../../components/journal/EntryEditor'
import { BookOpen, Plus, Search } from 'lucide-react'

function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, '') ?? ''
}

const CARD = {
  background: '#1d1d1a',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 1px 1px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.035)',
}

export default function Entries({ entries, loading, addEntry, editEntry, removeEntry }) {
  const [writing, setWriting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    if (!search.trim()) return entries
    const q = search.toLowerCase()
    return entries.filter(e => {
      const content = stripHtml(e.content).toLowerCase()
      const title = e.title?.toLowerCase() ?? ''
      const date = e.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      }).toLowerCase() ?? ''
      return content.includes(q) || title.includes(q) || date.includes(q)
    })
  }, [entries, search])

  async function handleSave(title, content) {
    setSaving(true)
    try {
      if (editingId) {
        await editEntry(editingId, title, content)
        setEditingId(null)
      } else {
        await addEntry(title, content)
        setWriting(false)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-xl" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    )
  }

  return (
    <div className="px-4 py-4 space-y-3">
      {/* New entry button */}
      {!writing && !editingId && (
        <motion.button
          onClick={() => setWriting(true)}
          className="w-full rounded-xl py-4 flex items-center justify-center gap-2 cursor-pointer"
          style={{
            background: 'transparent',
            border: '1px dashed rgba(255,255,255,0.1)',
            color: '#57534e',
          }}
          whileHover={{
            borderColor: 'rgba(74,108,247,0.4)',
            color: '#4a6cf7',
            background: 'rgba(74,108,247,0.04)',
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">New Entry</span>
        </motion.button>
      )}

      {/* Editor — new entry */}
      <AnimatePresence>
        {writing && (
          <motion.div
            className="rounded-xl p-4"
            style={CARD}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xs mb-3" style={{ color: '#57534e' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              {' · '}
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <EntryEditor
              onSave={handleSave}
              onCancel={() => setWriting(false)}
              saving={saving}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      {entries.length > 0 && (
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: '#57534e' }}
          />
          <input
            className="input-field pl-9 text-sm"
            placeholder="Search titles, entries, dates…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && !writing && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)' }}
          >
            <BookOpen className="w-5 h-5" style={{ color: '#a78bfa' }} />
          </div>
          <p className="text-sm" style={{ color: '#57534e' }}>
            {search ? 'No entries match your search.' : 'No entries yet. Write your first one!'}
          </p>
        </motion.div>
      )}

      {/* Entry list */}
      <motion.div
        className="space-y-3"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.055 } } }}
      >
        {filtered.map(entry => {
          const date = entry.createdAt?.toDate?.()
          const isExpanded = expandedId === entry.id
          const isEditing = editingId === entry.id

          if (isEditing) {
            return (
              <motion.div
                key={entry.id}
                className="rounded-xl p-4"
                style={CARD}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-xs mb-3" style={{ color: '#57534e' }}>
                  {date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <EntryEditor
                  initialTitle={entry.title ?? ''}
                  initialContent={entry.content ?? ''}
                  onSave={handleSave}
                  onCancel={() => setEditingId(null)}
                  saving={saving}
                />
              </motion.div>
            )
          }

          const needsTruncation = stripHtml(entry.content).length > 200

          return (
            <motion.div
              key={entry.id}
              className="rounded-xl p-4 space-y-2"
              style={CARD}
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
              }}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {entry.title && (
                    <p className="text-sm font-semibold truncate" style={{ color: '#f0ede6' }}>
                      {entry.title}
                    </p>
                  )}
                  {date && (
                    <p className="text-xs mt-0.5" style={{ color: '#57534e' }}>
                      {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {' · '}
                      {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setEditingId(entry.id)}
                    className="text-xs px-2 py-1 rounded-lg cursor-pointer transition-colors duration-100"
                    style={{ color: '#57534e' }}
                    onMouseEnter={e => e.target.style.color = '#4a6cf7'}
                    onMouseLeave={e => e.target.style.color = '#57534e'}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="text-xs px-2 py-1 rounded-lg cursor-pointer transition-colors duration-100"
                    style={{ color: '#57534e' }}
                    onMouseEnter={e => e.target.style.color = '#f43f5e'}
                    onMouseLeave={e => e.target.style.color = '#57534e'}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Content */}
              <div
                className={`entry-content text-sm leading-relaxed ${!isExpanded && needsTruncation ? 'line-clamp-4' : ''}`}
                style={{ color: '#a09d97' }}
                dangerouslySetInnerHTML={{ __html: entry.content ?? '' }}
              />

              {needsTruncation && (
                <button
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="text-xs cursor-pointer hover:underline transition-colors duration-100"
                  style={{ color: '#4a6cf7' }}
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
