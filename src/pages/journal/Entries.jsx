import { useState, useMemo } from 'react'
import EntryEditor from '../../components/journal/EntryEditor'
import { BookOpen } from 'lucide-react'

function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, '') ?? ''
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
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* New entry button */}
      {!writing && !editingId && (
        <button onClick={() => setWriting(true)}
          className="w-full card border-dashed border-gray-700 hover:border-accent/50 text-gray-500 hover:text-accent transition-colors flex items-center justify-center gap-2 py-4">
          <PlusIcon />
          <span className="text-sm font-medium">New Entry</span>
        </button>
      )}

      {/* Editor — new entry */}
      {writing && (
        <div className="card">
          <p className="text-xs text-gray-500 mb-3">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            {' · '}
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <EntryEditor
            onSave={handleSave}
            onCancel={() => setWriting(false)}
            saving={saving}
          />
        </div>
      )}

      {/* Search */}
      {entries.length > 0 && (
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            className="input-field pl-9 text-sm"
            placeholder="Search titles, entries, dates…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Entry list */}
      {filtered.length === 0 && !writing && (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(167,139,250,0.1)' }}>
            <BookOpen className="w-6 h-6" style={{ color: '#a78bfa' }} />
          </div>
          <p className="text-gray-400 text-sm">
            {search ? 'No entries match your search.' : 'No entries yet. Write your first one!'}
          </p>
        </div>
      )}

      {filtered.map(entry => {
        const date = entry.createdAt?.toDate?.()
        const isExpanded = expandedId === entry.id
        const isEditing = editingId === entry.id

        if (isEditing) {
          return (
            <div key={entry.id} className="card">
              <p className="text-xs text-gray-500 mb-3">
                {date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <EntryEditor
                initialTitle={entry.title ?? ''}
                initialContent={entry.content ?? ''}
                onSave={handleSave}
                onCancel={() => setEditingId(null)}
                saving={saving}
              />
            </div>
          )
        }

        const needsTruncation = stripHtml(entry.content).length > 200

        return (
          <div key={entry.id} className="card space-y-2">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                {entry.title && (
                  <p className="text-white font-semibold text-sm truncate">{entry.title}</p>
                )}
                {date && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {' · '}
                    {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setEditingId(entry.id)}
                  className="text-gray-600 hover:text-accent text-xs px-2 py-1 rounded-lg hover:bg-surface transition-colors">
                  Edit
                </button>
                <button onClick={() => removeEntry(entry.id)}
                  className="text-gray-600 hover:text-rose-400 text-xs px-2 py-1 rounded-lg hover:bg-surface transition-colors">
                  Delete
                </button>
              </div>
            </div>

            {/* Content */}
            <div
              className={`entry-content text-sm text-gray-300 leading-relaxed ${!isExpanded && needsTruncation ? 'line-clamp-4' : ''}`}
              dangerouslySetInnerHTML={{ __html: entry.content ?? '' }}
            />

            {needsTruncation && (
              <button onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                className="text-xs text-accent hover:underline">
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  )
}
