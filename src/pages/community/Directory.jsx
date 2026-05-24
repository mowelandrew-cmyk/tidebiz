import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  collection, query, onSnapshot, addDoc, serverTimestamp,
  doc, setDoc, getDoc, orderBy, limit,
} from 'firebase/firestore'
import { db } from '../../firebase/config'
import { ArrowLeft, Send, Users, MessageSquare, Zap, Star } from 'lucide-react'

const COLORS = ['#38bdf8', '#818cf8', '#a78bfa', '#f472b6', '#fb923c', '#34d399', '#facc15', '#f87171']

function Avatar({ name, color, size = 40 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-gray-900 shrink-0"
      style={{ width: size, height: size, backgroundColor: color || COLORS[0], fontSize: size <= 28 ? 10 : 13 }}
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

function getDmId(uid1, uid2) {
  return [uid1, uid2].sort().join('_')
}

const PLAN_BADGE = {
  pro: { label: 'Pro', Icon: Star },
  max: { label: 'Max', Icon: Zap },
}

export default function Directory() {
  const { user, userProfile } = useAuth()
  const [allUsers, setAllUsers] = useState([])
  const [search, setSearch] = useState('')
  const [dmOpen, setDmOpen] = useState(false)
  const [dmUser, setDmUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [msgText, setMsgText] = useState('')
  const [sending, setSending] = useState(false)
  const msgEndRef = useRef(null)
  const dmUnsub = useRef(null)

  const me = {
    displayName: userProfile?.displayName || user?.displayName || 'User',
    avatarColor: userProfile?.avatarColor || COLORS[0],
  }

  useEffect(() => {
    const q = query(collection(db, 'users'), limit(100))
    return onSnapshot(q, snap => {
      setAllUsers(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(u => u.id !== user.uid)
      )
    })
  }, [user.uid])

  useEffect(() => {
    if (dmOpen) msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, dmOpen])

  const filtered = search
    ? allUsers.filter(u => u.displayName?.toLowerCase().includes(search.toLowerCase()))
    : allUsers

  async function openDm(otherUser) {
    setDmUser(otherUser)
    setMessages([])
    setDmOpen(true)
    setMsgText('')

    const dmId = getDmId(user.uid, otherUser.id)
    const dmRef = doc(db, 'dms', dmId)

    const snap = await getDoc(dmRef)
    if (!snap.exists()) {
      await setDoc(dmRef, {
        participants: [user.uid, otherUser.id],
        participantNames: {
          [user.uid]: me.displayName,
          [otherUser.id]: otherUser.displayName || 'User',
        },
        participantColors: {
          [user.uid]: me.avatarColor,
          [otherUser.id]: otherUser.avatarColor || COLORS[0],
        },
        lastMessage: null,
        lastAt: null,
      })
    }

    if (dmUnsub.current) dmUnsub.current()
    const q = query(
      collection(db, 'dms', dmId, 'messages'),
      orderBy('createdAt', 'asc')
    )
    dmUnsub.current = onSnapshot(q, s =>
      setMessages(s.docs.map(d => ({ id: d.id, ...d.data() })))
    )
  }

  function closeDm() {
    if (dmUnsub.current) { dmUnsub.current(); dmUnsub.current = null }
    setDmOpen(false)
    setDmUser(null)
    setMessages([])
  }

  async function sendMessage() {
    const text = msgText.trim()
    if (!text || sending) return
    setSending(true)
    setMsgText('')
    const dmId = getDmId(user.uid, dmUser.id)
    try {
      await addDoc(collection(db, 'dms', dmId, 'messages'), {
        uid: user.uid,
        content: text,
        createdAt: serverTimestamp(),
      })
      await setDoc(
        doc(db, 'dms', dmId),
        { lastMessage: text, lastAt: serverTimestamp() },
        { merge: true }
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* ── Directory list ── */}
      <div className="px-4 py-4 space-y-3">
        <input
          className="input-field text-sm"
          placeholder="Search by name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(74,108,247,0.1)' }}>
              <Users className="w-6 h-6" style={{ color: '#4a6cf7' }} />
            </div>
            <p className="text-sm text-gray-500">
              {search ? 'No users match that name.' : 'No other users yet.'}
            </p>
          </div>
        )}

        {filtered.map(u => {
          const badge = PLAN_BADGE[u.plan]
          return (
            <div key={u.id} className="card flex items-center gap-3">
              <Avatar name={u.displayName} color={u.avatarColor} size={40} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {u.displayName || 'User'}
                </p>
                {badge && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <badge.Icon className="w-3 h-3 text-accent" />
                    <p className="text-xs text-gray-500">{badge.label}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => openDm(u)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-accent text-accent text-xs font-semibold hover:bg-accent/10 transition-colors shrink-0 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Message
              </button>
            </div>
          )
        })}
      </div>

      {/* ── DM overlay ── */}
      {dmOpen && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0e0e0c' }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 shrink-0">
            <button
              onClick={closeDm}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer mr-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Avatar name={dmUser?.displayName} color={dmUser?.avatarColor} size={32} />
            <div>
              <p className="text-sm font-semibold text-white">{dmUser?.displayName || 'User'}</p>
              {PLAN_BADGE[dmUser?.plan] && (
                <p className="text-xs text-gray-500 capitalize">{dmUser.plan} plan</p>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {messages.length === 0 && (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(74,108,247,0.1)' }}>
                  <MessageSquare className="w-6 h-6" style={{ color: '#4a6cf7' }} />
                </div>
                <p className="text-sm text-gray-500">
                  Say hello to {dmUser?.displayName}!
                </p>
              </div>
            )}
            {messages.map(m => {
              const isMe = m.uid === user.uid
              return (
                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-accent text-gray-900 rounded-tr-sm'
                        : 'rounded-tl-sm border border-gray-800'
                    }`}
                    style={!isMe ? { background: '#272420' } : {}}
                  >
                    <p>{m.content}</p>
                    <p className={`text-xs mt-1 ${isMe ? 'text-gray-700' : 'text-gray-500'}`}>
                      {timeAgo(m.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={msgEndRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-gray-800 px-4 py-3 flex gap-2 items-center">
            <input
              className="flex-1 rounded-2xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent border border-gray-800"
              style={{ background: '#1d1d1a' }}
              placeholder={`Message ${dmUser?.displayName || 'User'}…`}
              value={msgText}
              onChange={e => setMsgText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={!msgText.trim() || sending}
              className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-gray-900 disabled:opacity-40 shrink-0 cursor-pointer transition-opacity hover:opacity-90"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
