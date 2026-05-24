import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '../hooks/useChat'
import { Briefcase, Send, Zap } from 'lucide-react'

const MODEL_LABEL = { free: 'Gemini Flash', pro: 'Claude Haiku', max: 'Claude Sonnet' }

export default function Chat() {
  const { messages, loading, remaining, limit, plan, error, sendMessage } = useChat()
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function handleSend() {
    const text = input.trim()
    if (!text || loading || remaining === 0) return
    setInput('')
    textareaRef.current && (textareaRef.current.style.height = 'auto')
    sendMessage(text)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput(e) {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const canSend = input.trim() && !loading && remaining !== 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-3 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(74,108,247,0.12)', border: '1px solid rgba(74,108,247,0.2)' }}
          >
            <Briefcase className="w-4 h-4" style={{ color: '#4a6cf7' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#f0ede6' }}>Business Assistant</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#22c55e', boxShadow: '0 0 4px rgba(34,197,94,0.6)' }}
              />
              <p className="text-[10px]" style={{ color: '#57534e' }}>{MODEL_LABEL[plan] ?? 'AI'}</p>
            </div>
          </div>
        </div>

        {remaining !== null && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{
              background: remaining <= 5 ? 'rgba(244,63,94,0.08)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${remaining <= 5 ? 'rgba(244,63,94,0.2)' : 'rgba(255,255,255,0.07)'}`,
            }}
          >
            <Zap className="w-3 h-3" style={{ color: remaining <= 5 ? '#f43f5e' : '#4a6cf7' }} />
            <span
              className="text-xs font-semibold tabular-nums"
              style={{ color: remaining <= 5 ? '#f43f5e' : '#ccc9c2' }}
            >
              {remaining}<span style={{ color: '#3d3a35', fontWeight: 400 }}>/{limit}</span>
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && !loading && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(74,108,247,0.1)', border: '1px solid rgba(74,108,247,0.18)' }}
            >
              <Briefcase className="w-6 h-6" style={{ color: '#4a6cf7' }} />
            </div>
            <p className="text-sm font-semibold mb-1.5" style={{ color: '#f0ede6' }}>
              Your business mentor is ready
            </p>
            <p className="text-xs leading-relaxed max-w-[220px] mx-auto" style={{ color: '#57534e' }}>
              Ask about your revenue, journal entries, upcoming reminders — anything.
            </p>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="max-w-[82%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
                style={
                  m.role === 'user'
                    ? {
                        background: 'linear-gradient(135deg, #4a6cf7 0%, #3655e5 100%)',
                        color: '#fff',
                        borderRadius: '14px 14px 4px 14px',
                        boxShadow: '0 2px 12px rgba(74,108,247,0.25)',
                      }
                    : {
                        background: '#1d1d1a',
                        color: '#ccc9c2',
                        borderRadius: '4px 14px 14px 14px',
                        border: '1px solid rgba(255,255,255,0.07)',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                      }
                }
              >
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div
              className="px-4 py-3"
              style={{
                background: '#1d1d1a',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '4px 14px 14px 14px',
              }}
            >
              <div className="flex gap-1.5 items-center">
                {[0, 150, 300].map((delay, idx) => (
                  <span
                    key={idx}
                    className="w-1.5 h-1.5 rounded-full animate-typing-dot"
                    style={{
                      background: '#57534e',
                      animationDelay: `${delay}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <p className="text-center text-xs py-1" style={{ color: '#f43f5e' }}>{error}</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="px-4 pt-3 pb-24 shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {remaining === 0 ? (
          <div
            className="text-center py-3 px-4 rounded-xl"
            style={{ background: '#1d1d1a', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-sm" style={{ color: '#57534e' }}>
              Weekly limit reached — resets Sunday.
            </p>
          </div>
        ) : (
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              className="input-field resize-none text-sm flex-1 py-2.5 min-h-[44px] leading-relaxed"
              placeholder="Ask your assistant…"
              value={input}
              onChange={handleInput}
              onKeyDown={handleKey}
              rows={1}
            />
            <motion.button
              onClick={handleSend}
              disabled={!canSend}
              className="w-11 h-11 flex items-center justify-center rounded-xl shrink-0 cursor-pointer"
              style={{
                background: canSend
                  ? 'linear-gradient(135deg, #4a6cf7 0%, #3655e5 100%)'
                  : 'rgba(255,255,255,0.05)',
                border: canSend ? 'none' : '1px solid rgba(255,255,255,0.07)',
                opacity: canSend ? 1 : 0.5,
                transition: 'background 150ms ease, opacity 150ms ease',
              }}
              whileHover={canSend ? { scale: 1.06 } : {}}
              whileTap={canSend ? { scale: 0.9 } : {}}
              transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Send className="w-4 h-4" style={{ color: canSend ? '#fff' : '#57534e' }} />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )
}
