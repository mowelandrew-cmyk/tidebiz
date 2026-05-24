import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import {
  collection, query, orderBy, onSnapshot, addDoc,
  serverTimestamp, updateDoc, doc, increment, limit,
} from 'firebase/firestore'
import { db } from '../../firebase/config'
import { ArrowLeft, MessageCircle, ChevronRight } from 'lucide-react'

const CATEGORIES = [
  { id: 'general',   label: 'General Business',    emoji: '🏢', desc: 'Anything and everything about running a business' },
  { id: 'marketing', label: 'Marketing & Sales',   emoji: '📣', desc: 'Growth strategies, branding, and closing deals' },
  { id: 'finance',   label: 'Finance & Budgeting', emoji: '💰', desc: 'Money management, pricing, and profitability' },
  { id: 'mindset',   label: 'Motivation & Mindset',emoji: '🧠', desc: 'Staying focused, growing as a founder' },
  { id: 'tech',      label: 'Tech & Tools',        emoji: '⚙️', desc: 'Apps, automation, and digital tools' },
]

const COLORS = ['#38bdf8', '#818cf8', '#a78bfa', '#f472b6', '#fb923c', '#34d399', '#facc15', '#f87171']

const CARD = {
  background: '#1d1d1a',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 1px 1px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.035)',
}

function Avatar({ name, color, size = 28 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold shrink-0"
      style={{ width: size, height: size, backgroundColor: color || COLORS[0], color: '#0e0e0c', fontSize: size <= 24 ? 10 : 12 }}
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
  const [view, setView] = useState('categories')
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

  function openCategory(cat) { setCategory(cat); setView('threads') }
  function openThread(t) { setThread(t); setView('thread') }
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
        { uid: user.uid, displayName: me.displayName, avatarColor: me.avatarColor, content: text, createdAt: serverTimestamp() }
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
    <motion.div
      className="px-4 py-4 space-y-2"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } } }}
    >
      <p className="section-label mb-3">Pick a topic to explore</p>
      {CATEGORIES.map(cat => (
        <motion.button
          key={cat.id}
          onClick={() => openCategory(cat)}
          className="w-full text-left rounded-xl p-4 flex items-center gap-3 cursor-pointer"
          style={CARD}
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
          }}
          whileHover={{ scale: 1.01, boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)' }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.12 }}
        >
          <span className="text-xl w-8 text-center shrink-0">{cat.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: '#f0ede6' }}>{cat.label}</p>
            <p className="text-xs mt-0.5 leading-snug" style={{ color: '#57534e' }}>{cat.desc}</p>
          </div>
          <ChevronRight className="w-4 h-4 shrink-0" style={{ color: '#3d3a35' }} />
        </motion.button>
      ))}
    </motion.div>
  )

  // ── Threads ─────────────────────────────────────────────────────────────────
  if (view === 'threads') return (
    <div>
      {/* Sub-header */}
      <div
        className="flex items-center gap-3 px-4 py-3 sticky top-12 z-10"
        style={{ background: '#0e0e0c', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <motion.button
          onClick={goBack}
          className="cursor-pointer"
          style={{ color: '#57534e' }}
          whileHover={{ color: '#f0ede6' }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.1 }}
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <span className="text-sm font-semibold flex-1" style={{ color: '#f0ede6' }}>
          {category.emoji} {category.label}
        </span>
        <button
          onClick={() => setShowNewThread(v => !v)}
          className="text-xs font-semibold cursor-pointer"
          style={{ color: '#4a6cf7' }}
        >
          {showNewThread ? 'Cancel' : '+ New'}
        </button>
      </div>

      {/* New thread form */}
      <AnimatePresence>
        {showNewThread && (
          <motion.div
            className="px-4 py-3 space-y-2"
            style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
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
              <motion.button
                onClick={createThread}
                disabled={posting || !threadTitle.trim()}
                className="px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #4a6cf7 0%, #3655e5 100%)', color: '#fff' }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.1 }}
              >
                {posting ? 'Posting…' : 'Post Thread'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thread list */}
      <div>
        {threads.length === 0 && (
          <p className="text-center py-12 text-sm" style={{ color: '#3d3a35' }}>
            No threads yet. Start one!
          </p>
        )}
        {threads.map((t, i) => (
          <motion.button
            key={t.id}
            onClick={() => openThread(t)}
            className="w-full text-left px-4 py-3 cursor-pointer"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <div className="flex items-start gap-3">
              <Avatar name={t.displayName} color={t.avatarColor} size={28} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-snug" style={{ color: '#f0ede6' }}>{t.title}</p>
                {t.content && (
                  <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#57534e' }}>{t.content}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs" style={{ color: '#57534e' }}>{t.displayName}</span>
                  <span style={{ color: '#3d3a35' }}>·</span>
                  <span className="text-xs" style={{ color: '#57534e' }}>{timeAgo(t.createdAt)}</span>
                  <span className="flex items-center gap-1 text-xs ml-auto" style={{ color: '#57534e' }}>
                    <MessageCircle className="w-3 h-3" />{t.replyCount || 0}
                  </span>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )

  // ── Thread detail ────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Sub-header */}
      <div
        className="flex items-center gap-3 px-4 py-3 sticky top-12 z-10"
        style={{ background: '#0e0e0c', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <motion.button
          onClick={goBack}
          className="cursor-pointer"
          style={{ color: '#57534e' }}
          whileHover={{ color: '#f0ede6' }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.1 }}
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <span className="text-sm font-semibold line-clamp-1 flex-1" style={{ color: '#f0ede6' }}>
          {thread.title}
        </span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Original post */}
        <div className="rounded-xl p-4 space-y-2" style={CARD}>
          <div className="flex items-center gap-2.5">
            <Avatar name={thread.displayName} color={thread.avatarColor} size={32} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#f0ede6' }}>{thread.displayName}</p>
              <p className="text-xs" style={{ color: '#57534e' }}>{timeAgo(thread.createdAt)}</p>
            </div>
          </div>
          <p className="text-base font-semibold" style={{ color: '#f0ede6' }}>{thread.title}</p>
          {thread.content && (
            <p className="text-sm leading-relaxed" style={{ color: '#ccc9c2' }}>{thread.content}</p>
          )}
        </div>

        <p className="section-label">
          {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
        </p>

        {/* Replies */}
        {replies.map((r, i) => (
          <motion.div
            key={r.id}
            className="flex gap-3"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <Avatar name={r.displayName} color={r.avatarColor} size={28} />
            <div
              className="flex-1 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-semibold" style={{ color: '#f0ede6' }}>{r.displayName}</span>
                <span className="text-[10px]" style={{ color: '#3d3a35' }}>{timeAgo(r.createdAt)}</span>
              </div>
              <p className="text-sm leading-relaxed mt-1" style={{ color: '#ccc9c2' }}>{r.content}</p>
            </div>
          </motion.div>
        ))}

        {/* Reply input */}
        <div className="flex gap-2 pb-4">
          <Avatar name={me.displayName} color={me.avatarColor} size={28} />
          <div className="flex flex-1 gap-2">
            <input
              className="flex-1 text-sm px-3 py-2 rounded-xl focus:outline-none"
              style={{
                background: '#1d1d1a',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#ccc9c2',
              }}
              placeholder="Write a reply…"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendReply()}
            />
            <motion.button
              onClick={sendReply}
              disabled={!replyText.trim() || posting}
              className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #4a6cf7 0%, #3655e5 100%)', color: '#fff' }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              transition={{ duration: 0.1 }}
            >
              {posting ? '…' : 'Reply'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
