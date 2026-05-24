import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  collection, query, orderBy, limit, onSnapshot,
  addDoc, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, increment,
} from 'firebase/firestore'
import { db } from '../../firebase/config'
import { Heart, MessageCircle, Bookmark, Feather } from 'lucide-react'

const COLORS = ['#38bdf8', '#818cf8', '#a78bfa', '#f472b6', '#fb923c', '#34d399', '#facc15', '#f87171']

function Avatar({ name, color, size = 32 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-gray-900 shrink-0"
      style={{ width: size, height: size, backgroundColor: color || COLORS[0], fontSize: size <= 24 ? 10 : 13 }}
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

  // Clean up comment listeners on unmount
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
    <div className="px-4 py-4 space-y-4">
      {/* Compose */}
      <div className="card space-y-3">
        <div className="flex gap-3">
          <Avatar name={me.displayName} color={me.avatarColor} size={32} />
          <textarea
            className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-500 resize-none focus:outline-none pt-1"
            placeholder="Share something with the community…"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={3}
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={submitPost}
            disabled={posting || !draft.trim()}
            className="px-5 py-2 rounded-xl bg-accent text-gray-900 text-sm font-semibold disabled:opacity-40"
          >
            {posting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {posts.length === 0 && (
        <div className="text-center py-14">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(74,108,247,0.1)' }}>
            <Feather className="w-6 h-6" style={{ color: '#4a6cf7' }} />
          </div>
          <p className="text-sm text-gray-500">No posts yet. Be the first to share!</p>
        </div>
      )}

      {/* Posts */}
      {posts.map(p => {
        const liked = p.likes?.includes(user.uid)
        const saved = p.saves?.includes(user.uid)
        const open = expanded[p.id]
        const postComments = comments[p.id] || []

        return (
          <div key={p.id} className="card space-y-3">
            {/* Author + content */}
            <div className="flex gap-3">
              <Avatar name={p.displayName} color={p.avatarColor} size={32} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-white truncate">{p.displayName}</span>
                  <span className="text-xs text-gray-500 shrink-0">{timeAgo(p.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-300 mt-1 leading-relaxed">{p.content}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-5 pt-1 border-t border-gray-800">
              <button
                onClick={() => toggleLike(p)}
                className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${liked ? 'text-rose-400' : 'text-gray-500 hover:text-rose-400'}`}
              >
                <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-400' : ''}`} />
                <span>{p.likes?.length || 0}</span>
              </button>
              <button
                onClick={() => toggleComments(p.id)}
                className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${open ? 'text-accent' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{p.commentCount || 0}</span>
              </button>
              <button
                onClick={() => toggleSave(p)}
                className={`flex items-center gap-1.5 text-xs transition-colors ml-auto cursor-pointer ${saved ? 'text-accent' : 'text-gray-500 hover:text-accent'}`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-accent' : ''}`} />
                <span>{saved ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            {/* Comments */}
            {open && (
              <div className="space-y-2.5 pt-1 border-t border-gray-800">
                {postComments.length === 0 && (
                  <p className="text-xs text-gray-600 text-center py-1">No comments yet.</p>
                )}
                {postComments.map(c => (
                  <div key={c.id} className="flex gap-2">
                    <Avatar name={c.displayName} color={c.avatarColor} size={24} />
                    <div className="flex-1 bg-gray-800/60 rounded-xl px-3 py-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-semibold text-white">{c.displayName}</span>
                        <span className="text-xs text-gray-600">{timeAgo(c.createdAt)}</span>
                      </div>
                      <p className="text-xs text-gray-300 mt-0.5">{c.content}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 pt-0.5">
                  <Avatar name={me.displayName} color={me.avatarColor} size={24} />
                  <input
                    className="flex-1 bg-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-accent"
                    placeholder="Add a comment…"
                    value={commentInput[p.id] || ''}
                    onChange={e => setCommentInput(prev => ({ ...prev, [p.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && sendComment(p.id)}
                  />
                  <button
                    onClick={() => sendComment(p.id)}
                    disabled={!commentInput[p.id]?.trim() || sending[p.id]}
                    className="px-3 py-1.5 rounded-xl bg-accent text-gray-900 text-xs font-semibold disabled:opacity-40"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
