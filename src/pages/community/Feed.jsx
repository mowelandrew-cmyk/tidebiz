import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import {
  collection, query, orderBy, limit, onSnapshot,
  addDoc, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, increment,
} from 'firebase/firestore'
import { db } from '../../firebase/config'
import { Heart, MessageCircle, Bookmark, Feather, Send } from 'lucide-react'

const COLORS = ['#38bdf8', '#818cf8', '#a78bfa', '#f472b6', '#fb923c', '#34d399', '#facc15', '#f87171']

const CARD = {
  background: '#1d1d1a',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 1px 1px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.035)',
}

function Avatar({ name, color, size = 32 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: color || COLORS[0],
        color: '#0e0e0c',
        fontSize: size <= 24 ? 10 : 12,
      }}
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

const postVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
}

export default function Feed() {
  const { user, userProfile } = useAuth()
  const [posts, setPosts] = useState([])
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)
  const [expanded, setExpanded] = useState({})
  const [comments, setComments] = useState({})
  const [commentInput, setCommentInput] = useState({})
  const [sending, setSending] = useState({})
  const commentUnsubs = useRef({})

  const me = {
    displayName: userProfile?.displayName || user?.displayName || 'User',
    avatarColor: userProfile?.avatarColor || COLORS[0],
  }

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(30))
    return onSnapshot(q, snap => setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [])

  useEffect(() => {
    const unsubs = commentUnsubs.current
    return () => Object.values(unsubs).forEach(u => u())
  }, [])

  async function submitPost() {
    if (!draft.trim() || posting) return
    setPosting(true)
    try {
      await addDoc(collection(db, 'posts'), {
        uid: user.uid,
        displayName: me.displayName,
        avatarColor: me.avatarColor,
        content: draft.trim(),
        likes: [],
        saves: [],
        commentCount: 0,
        createdAt: serverTimestamp(),
      })
      setDraft('')
    } finally {
      setPosting(false)
    }
  }

  async function toggleLike(p) {
    const liked = p.likes?.includes(user.uid)
    await updateDoc(doc(db, 'posts', p.id), {
      likes: liked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    })
  }

  async function toggleSave(p) {
    const saved = p.saves?.includes(user.uid)
    await updateDoc(doc(db, 'posts', p.id), {
      saves: saved ? arrayRemove(user.uid) : arrayUnion(user.uid),
    })
  }

  function toggleComments(postId) {
    setExpanded(prev => {
      const open = !prev[postId]
      if (open && !commentUnsubs.current[postId]) {
        const q = query(
          collection(db, 'posts', postId, 'comments'),
          orderBy('createdAt', 'asc')
        )
        commentUnsubs.current[postId] = onSnapshot(q, snap =>
          setComments(c => ({ ...c, [postId]: snap.docs.map(d => ({ id: d.id, ...d.data() })) }))
        )
      }
      return { ...prev, [postId]: open }
    })
  }

  async function sendComment(postId) {
    const text = commentInput[postId]?.trim()
    if (!text || sending[postId]) return
    setSending(prev => ({ ...prev, [postId]: true }))
    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        uid: user.uid,
        displayName: me.displayName,
        avatarColor: me.avatarColor,
        content: text,
        createdAt: serverTimestamp(),
      })
      await updateDoc(doc(db, 'posts', postId), { commentCount: increment(1) })
      setCommentInput(prev => ({ ...prev, [postId]: '' }))
    } finally {
      setSending(prev => ({ ...prev, [postId]: false }))
    }
  }

  return (
    <div className="px-4 py-4 space-y-3">
      {/* Compose */}
      <motion.div
        className="rounded-xl p-4 space-y-3"
        style={CARD}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex gap-3">
          <Avatar name={me.displayName} color={me.avatarColor} size={32} />
          <textarea
            className="flex-1 text-sm resize-none focus:outline-none pt-1 leading-relaxed"
            style={{
              background: 'transparent',
              color: '#ccc9c2',
            }}
            placeholder="Share something with the community…"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={3}
          />
        </div>
        <div className="flex justify-end" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
          <motion.button
            onClick={submitPost}
            disabled={posting || !draft.trim()}
            className="px-5 py-1.5 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #4a6cf7 0%, #3655e5 100%)',
              color: '#fff',
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.1 }}
          >
            {posting ? 'Posting…' : 'Post'}
          </motion.button>
        </div>
      </motion.div>

      {/* Empty state */}
      {posts.length === 0 && (
        <motion.div
          className="text-center py-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(74,108,247,0.08)', border: '1px solid rgba(74,108,247,0.15)' }}
          >
            <Feather className="w-5 h-5" style={{ color: '#4a6cf7' }} />
          </div>
          <p className="text-sm" style={{ color: '#57534e' }}>No posts yet. Be the first to share!</p>
        </motion.div>
      )}

      {/* Posts */}
      <motion.div
        className="space-y-3"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      >
        {posts.map(p => {
          const liked = p.likes?.includes(user.uid)
          const saved = p.saves?.includes(user.uid)
          const open = expanded[p.id]
          const postComments = comments[p.id] || []

          return (
            <motion.div
              key={p.id}
              className="rounded-xl p-4 space-y-3"
              style={CARD}
              variants={postVariants}
            >
              {/* Author + content */}
              <div className="flex gap-3">
                <Avatar name={p.displayName} color={p.avatarColor} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold truncate" style={{ color: '#f0ede6' }}>
                      {p.displayName}
                    </span>
                    <span className="text-xs shrink-0" style={{ color: '#3d3a35' }}>
                      {timeAgo(p.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed mt-1" style={{ color: '#ccc9c2' }}>
                    {p.content}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div
                className="flex items-center gap-5 pt-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
              >
                <motion.button
                  onClick={() => toggleLike(p)}
                  className="flex items-center gap-1.5 text-xs cursor-pointer"
                  style={{ color: liked ? '#f43f5e' : '#57534e' }}
                  whileTap={{ scale: 1.3 }}
                  transition={{ duration: 0.08, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Heart
                    className="w-3.5 h-3.5"
                    style={{ fill: liked ? '#f43f5e' : 'none', color: liked ? '#f43f5e' : '#57534e' }}
                  />
                  <span>{p.likes?.length || 0}</span>
                </motion.button>

                <button
                  onClick={() => toggleComments(p.id)}
                  className="flex items-center gap-1.5 text-xs cursor-pointer transition-colors duration-100"
                  style={{ color: open ? '#4a6cf7' : '#57534e' }}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{p.commentCount || 0}</span>
                </button>

                <motion.button
                  onClick={() => toggleSave(p)}
                  className="flex items-center gap-1.5 text-xs cursor-pointer ml-auto"
                  style={{ color: saved ? '#4a6cf7' : '#57534e' }}
                  whileTap={{ scale: 1.2 }}
                  transition={{ duration: 0.08 }}
                >
                  <Bookmark
                    className="w-3.5 h-3.5"
                    style={{ fill: saved ? '#4a6cf7' : 'none', color: saved ? '#4a6cf7' : '#57534e' }}
                  />
                  <span>{saved ? 'Saved' : 'Save'}</span>
                </motion.button>
              </div>

              {/* Comments */}
              <AnimatePresence>
                {open && (
                  <motion.div
                    className="space-y-2.5 pt-2"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {postComments.length === 0 && (
                      <p className="text-xs text-center py-1" style={{ color: '#3d3a35' }}>
                        No comments yet.
                      </p>
                    )}
                    {postComments.map(c => (
                      <div key={c.id} className="flex gap-2">
                        <Avatar name={c.displayName} color={c.avatarColor} size={24} />
                        <div
                          className="flex-1 px-3 py-2 rounded-xl"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.05)',
                          }}
                        >
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs font-semibold" style={{ color: '#f0ede6' }}>
                              {c.displayName}
                            </span>
                            <span className="text-[10px]" style={{ color: '#3d3a35' }}>
                              {timeAgo(c.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#a09d97' }}>
                            {c.content}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Comment input */}
                    <div className="flex gap-2 pt-0.5">
                      <Avatar name={me.displayName} color={me.avatarColor} size={24} />
                      <div className="flex-1 flex gap-1.5">
                        <input
                          className="flex-1 text-xs px-3 py-1.5 rounded-xl focus:outline-none"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            color: '#ccc9c2',
                          }}
                          placeholder="Add a comment…"
                          value={commentInput[p.id] || ''}
                          onChange={e => setCommentInput(prev => ({ ...prev, [p.id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && sendComment(p.id)}
                        />
                        <motion.button
                          onClick={() => sendComment(p.id)}
                          disabled={!commentInput[p.id]?.trim() || sending[p.id]}
                          className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer disabled:opacity-40"
                          style={{ background: 'rgba(74,108,247,0.15)', border: '1px solid rgba(74,108,247,0.25)' }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ duration: 0.08 }}
                        >
                          <Send className="w-3 h-3" style={{ color: '#4a6cf7' }} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
