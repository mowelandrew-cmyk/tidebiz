import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  collection, query, orderBy, onSnapshot, addDoc,
  serverTimestamp, updateDoc, doc, increment, limit,
} from 'firebase/firestore'
import { db } from '../../firebase/config'

const CATEGORIES = [
  { id: 'general',   label: 'General Business',    emoji: '🏢', desc: 'Anything and everything about running a business' },
  { id: 'marketing', label: 'Marketing & Sales',   emoji: '📣', desc: 'Growth strategies, branding, and closing deals' },
  { id: 'finance',   label: 'Finance & Budgeting', emoji: '💰', desc: 'Money management, pricing, and profitability' },
  { id: 'mindset',   label: 'Motivation & Mindset',emoji: '🧠', desc: 'Staying focused, growing as a founder' },
  { id: 'tech',      label: 'Tech & Tools',        emoji: '⚙️', desc: 'Apps, automation, and digital tools' },
]

const COLORS = ['#38bdf8', '#818cf8', '#a78bfa', '#f472b6', '#fb923c', '#34d399', '#facc15', '#f87171']

function Avatar({ name, color, size = 28 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-gray-900 shrink-0"
      style={{ width: size, height: size, backgroundColor: color || COLORS[0], fontSize: size <= 24 ? 10 : 12 }}
    >
      {initials}
    </div>
  )
}

function timeAgo(ts) {
  if (!ts?.toMillis) return 'just now'
  const s = Math.floor((Date.now() - ts.toMillis()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function Forums() {
  const { user, userProfile } = useAuth()
  const [view, setView] = useState('categories') // 'categories' | 'threads' | 'thread'
  const [category, setCategory] = useState(null)
  const [thread, setThread] = useState(null)
  const [threads, setThreads] = useState([])
  const [replies, setReplies] = useState([])
  const [showNewThread, setShowNewThread] = useState(false)
  const [threadTitle, setThreadTitle] = useState('')
  const [threadBody, setThreadBody] = useState('')
  const [replyText, setReplyText] = useState('')
  const [posting, setPosting] = useState(false)

  const me = {
    displayName: userProfile?.displayName || user?.displayName || 'User',
    avatarColor: userProfile?.avatarColor || COLORS[0],
  }

  // Load threads when category changes
  useEffect(() => {
    if (!category) return
    setThreads([])
    const q = query(
      collection(db, 'forums', category.id, 'threads'),
      orderBy('createdAt', 'desc'),
      limit(30)
    )
    return onSnapshot(q, snap =>
      setThreads(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
  }, [category])

  // Load replies when thread changes
  useEffect(() => {
    if (!thread || !category) return
    setReplies([])
    const q = query(
      collection(db, 'forums', category.id, 'threads', thread.id, 'replies'),
      orderBy('createdAt', 'asc')
    )
    return onSnapshot(q, snap =>
      setReplies(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
  }, [thread, category])

  function openCategory(cat) {
    setCategory(cat)
    setView('threads')
  }

  function openThread(t) {
    setThread(t)
    setView('thread')
  }

  function goBack() {
    if (view === 'thread') { setView('threads'); setThread(null); setReplies([]) }
    else if (view === 'threads') { setView('categories'); setCategory(null); setThreads([]) }
  }

  async function createThread() {
    if (!threadTitle.trim() || posting) return
    setPosting(true)
    try {
      await addDoc(collection(db, 'forums', category.id, 'threads'), {
        uid: user.uid,
        displayName: me.displayName,
        avatarColor: me.avatarColor,
        title: threadTitle.trim(),
        content: threadBody.trim(),
        replyCount: 0,
        createdAt: serverTimestamp(),
      })
      setThreadTitle('')
      setThreadBody('')
      setShowNewThread(false)
    } finally {
      setPosting(false)
    }
  }

  async function sendReply() {
    if (!replyText.trim() || posting) return
    setPosting(true)
    const text = replyText.trim()
    setReplyText('')
    try {
      await addDoc(
        collection(db, 'forums', category.id, 'threads', thread.id, 'replies'),
        {
          uid: user.uid,
          displayName: me.displayName,
          avatarColor: me.avatarColor,
          content: text,
          createdAt: serverTimestamp(),
        }
      )
      await updateDoc(doc(db, 'forums', category.id, 'threads', thread.id), {
        replyCount: increment(1),
      })
    } finally {
      setPosting(false)
    }
  }

  // ── Categories ──────────────────────────────────────────────────────────────
  if (view === 'categories') return (
    <div className="px-4 py-4 space-y-3">
      <p className="text-xs text-gray-500">Pick a topic to explore discussions</p>
      {CATEGORIES.map(cat => (
        <button
          key={cat.id}
          onClick={() => openCategory(cat)}
          className="card w-full text-left flex items-center gap-3 hover:border-gray-700 transition-colors active:scale-[0.99]"
        >
          <span className="text-2xl">{cat.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">{cat.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>
          </div>
          <span className="text-gray-600 text-lg">›</span>
        </button>
      ))}
    </div>
  )

  // ── Threads ─────────────────────────────────────────────────────────────────
  if (view === 'threads') return (
    <div>
      {/* Sub-header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-900 sticky top-12 z-10">
        <button onClick={goBack} className="text-gray-400 hover:text-white text-xl leading-none">←</button>
        <span className="text-sm font-semibold text-white flex-1">{category.emoji} {category.label}</span>
        <button onClick={() => setShowNewThread(v => !v)} className="text-xs text-accent font-semibold">
          {showNewThread ? 'Cancel' : '+ New'}
        </button>
      </div>

      {/* New thread form */}
      {showNewThread && (
        <div className="px-4 py-3 border-b border-gray-800 bg-gray-800/30 space-y-2">
          <input
            className="input-field text-sm"
            placeholder="Thread title…"
            value={threadTitle}
            onChange={e => setThreadTitle(e.target.value)}
          />
          <textarea
            className="input-field text-sm resize-none"
            placeholder="Add context (optional)"
            value={threadBody}
            onChange={e => setThreadBody(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={createThread}
              disabled={posting || !threadTitle.trim()}
              className="px-5 py-2 rounded-xl bg-accent text-gray-900 text-sm font-semibold disabled:opacity-40"
            >
              {posting ? 'Posting…' : 'Post Thread'}
            </button>
          </div>
        </div>
      )}

      {/* Thread list */}
      <div className="divide-y divide-gray-800">
        {threads.length === 0 && (
          <p className="text-center py-12 text-sm text-gray-600">No threads yet. Start one!</p>
        )}
        {threads.map(t => (
          <button
            key={t.id}
            onClick={() => openThread(t)}
            className="w-full text-left px-4 py-3 hover:bg-gray-800/40 transition-colors"
          >
            <div className="flex items-start gap-3">
              <Avatar name={t.displayName} color={t.avatarColor} size={28} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white leading-snug">{t.title}</p>
                {t.content && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{t.content}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{t.displayName}</span>
                  <span className="text-gray-700">·</span>
                  <span className="text-xs text-gray-500">{timeAgo(t.createdAt)}</span>
                  <span className="text-xs text-gray-500 ml-auto">💬 {t.replyCount || 0}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  // ── Thread detail ────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Sub-header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-900 sticky top-12 z-10">
        <button onClick={goBack} className="text-gray-400 hover:text-white text-xl leading-none">←</button>
        <span className="text-sm font-semibold text-white line-clamp-1 flex-1">{thread.title}</span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Original post */}
        <div className="card space-y-2">
          <div className="flex items-center gap-2.5">
            <Avatar name={thread.displayName} color={thread.avatarColor} size={32} />
            <div>
              <p className="text-sm font-semibold text-white">{thread.displayName}</p>
              <p className="text-xs text-gray-500">{timeAgo(thread.createdAt)}</p>
            </div>
          </div>
          <p className="text-base font-semibold text-white">{thread.title}</p>
          {thread.content && (
            <p className="text-sm text-gray-300 leading-relaxed">{thread.content}</p>
          )}
        </div>

        {/* Replies count */}
        <p className="text-xs text-gray-500">
          {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
        </p>

        {/* Replies */}
        {replies.map(r => (
          <div key={r.id} className="flex gap-3">
            <Avatar name={r.displayName} color={r.avatarColor} size={28} />
            <div className="flex-1 bg-gray-800/50 rounded-xl px-3 py-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-semibold text-white">{r.displayName}</span>
                <span className="text-xs text-gray-600">{timeAgo(r.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-300 mt-1 leading-relaxed">{r.content}</p>
            </div>
          </div>
        ))}

        {/* Reply input */}
        <div className="flex gap-2 pb-4">
          <Avatar name={me.displayName} color={me.avatarColor} size={28} />
          <div className="flex flex-1 gap-2">
            <input
              className="flex-1 bg-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="Write a reply…"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendReply()}
            />
            <button
              onClick={sendReply}
              disabled={!replyText.trim() || posting}
              className="px-4 py-2 rounded-xl bg-accent text-gray-900 text-sm font-semibold disabled:opacity-40"
            >
              {posting ? '…' : 'Reply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
