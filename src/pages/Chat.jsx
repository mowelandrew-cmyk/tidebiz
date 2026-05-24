import { useState, useRef, useEffect } from 'react'
import { useChat } from '../hooks/useChat'
import { Briefcase, Send } from 'lucide-react'

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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-gray-800 shrink-0">
        <div>
          <h2 className="text-white font-semibold text-sm">Business Assistant</h2>
          <p className="text-xs text-gray-500">{MODEL_LABEL[plan] ?? 'AI'}</p>
        </div>
        {remaining !== null && (
          <div className="text-right">
            <p className={`text-sm font-semibold ${remaining <= 5 ? 'text-rose-400' : 'text-accent'}`}>
              {remaining}/{limit}
            </p>
            <p className="text-[10px] text-gray-600">msgs this week</p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(74,108,247,0.12)', border: '1px solid rgba(74,108,247,0.2)' }}>
              <Briefcase className="w-7 h-7" style={{ color: '#4a6cf7' }} />
            </div>
            <p className="text-white font-semibold text-sm mb-1">Your business mentor is ready</p>
            <p className="text-gray-500 text-xs max-w-[220px] mx-auto">
              Ask about your revenue, journal entries, upcoming reminders — anything.
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap
                ${m.role === 'user'
                  ? 'bg-accent text-gray-900 rounded-br-sm'
                  : 'bg-surface-raised text-gray-100 rounded-bl-sm border border-gray-800'
                }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface-raised border border-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-center text-rose-400 text-xs py-1">{error}</p>}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pt-2 pb-24 border-t border-gray-800 shrink-0">
        {remaining === 0 ? (
          <p className="text-center text-gray-500 text-sm py-3">
            Weekly limit reached — resets Sunday.
          </p>
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
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading || remaining === 0}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-accent text-gray-900 disabled:opacity-40 shrink-0 cursor-pointer transition-opacity hover:opacity-90"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

