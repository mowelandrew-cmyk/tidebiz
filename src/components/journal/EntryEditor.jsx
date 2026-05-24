import { useRef, useEffect, useState } from 'react'

const FORMAT_COMMANDS = ['bold', 'italic', 'underline', 'strikeThrough']

export default function EntryEditor({ initialTitle = '', initialContent = '', onSave, onCancel, saving }) {
  const [title, setTitle] = useState(initialTitle)
  const [activeFormats, setActiveFormats] = useState({})
  const editorRef = useRef(null)
  const contentRef = useRef(initialContent)
  const editorFocusedRef = useRef(false)

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent
      const range = document.createRange()
      const sel = window.getSelection()
      range.selectNodeContents(editorRef.current)
      range.collapse(false)
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }, [])

  function queryFormats() {
    const formats = {}
    for (const cmd of FORMAT_COMMANDS) {
      try { formats[cmd] = document.queryCommandState(cmd) } catch { formats[cmd] = false }
    }
    setActiveFormats(formats)
  }

  useEffect(() => {
    function updateFormats() {
      if (!editorFocusedRef.current) return
      queryFormats()
    }
    document.addEventListener('selectionchange', updateFormats)
    return () => document.removeEventListener('selectionchange', updateFormats)
  }, [])

  function format(command) {
    document.execCommand(command, false, null)
    queryFormats()
  }

  const canSave = title.trim().length > 0 && contentRef.current.trim().length > 0

  return (
    <div className="flex flex-col gap-3">
      <input
        className="input-field font-semibold text-base"
        placeholder="Entry title…"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <div className="flex gap-1 p-1 bg-surface rounded-xl border border-gray-700">
        <ToolbarBtn onClick={() => format('bold')} title="Bold" isActive={activeFormats.bold}>
          <span className="font-bold text-sm">B</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => format('italic')} title="Italic" isActive={activeFormats.italic}>
          <span className="italic text-sm">I</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => format('underline')} title="Underline" isActive={activeFormats.underline}>
          <span className="underline text-sm">U</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => format('strikeThrough')} title="Strikethrough" isActive={activeFormats.strikeThrough}>
          <span className="line-through text-sm">S</span>
        </ToolbarBtn>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Write your thoughts…"
        onFocus={() => { editorFocusedRef.current = true }}
        onBlur={() => { editorFocusedRef.current = false }}
        onInput={e => { contentRef.current = e.currentTarget.innerHTML }}
        className="input-field min-h-[200px] text-sm leading-relaxed focus:outline-none journal-editor"
      />

      <div className="flex items-center justify-between">
        <div className="flex gap-2 ml-auto">
          {onCancel && (
            <button onClick={onCancel}
              className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-gray-200 transition-colors">
              Cancel
            </button>
          )}
          <button
            onClick={() => onSave(title, contentRef.current)}
            disabled={saving || !canSave}
            className="btn-primary !w-auto px-5 py-2 text-sm"
          >
            {saving ? 'Saving…' : 'Save Entry'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ToolbarBtn({ onClick, title, children, isActive }) {
  return (
    <button
      type="button"
      onMouseDown={e => {
        e.preventDefault()
        onClick()
      }}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors
        ${isActive
          ? 'bg-accent text-gray-900'
          : 'text-gray-400 hover:text-white hover:bg-surface-raised'
        }`}
    >
      {children}
    </button>
  )
}
