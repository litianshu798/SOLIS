import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listFiles, classifyFiles, todayStr, chatWithMemory } from '../api'

interface Message {
  role: 'user' | 'ai'
  text: string
  time: string
}

const suggestions = [
  'Summarize my day in three moments',
  'What was the emotional tone today?',
  'What should I remember from today?',
]

export default function QATab() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: 'I can read your captures and diary memory. Ask me for highlights, mood changes, or context around any moment.',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { data } = useQuery({
    queryKey: ['qa-files', todayStr()],
    queryFn: () => listFiles(todayStr()),
  })

  const { images, audios } = data ? classifyFiles(data.objects) : { images: [], audios: [] }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const send = async () => {
    const question = input.trim()
    if (!question || loading) return

    setInput('')
    if (inputRef.current) inputRef.current.style.height = '24px'
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    setMessages((prev) => [...prev, { role: 'user', text: question, time: now }])
    setLoading(true)

    try {
      const answer = await chatWithMemory(question, undefined, todayStr())
      const t = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      setMessages((prev) => [...prev, { role: 'ai', text: answer, time: t }])
    } catch (error) {
      const t = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      const message = error instanceof Error ? error.message : 'Something went wrong while contacting memory service.'
      setMessages((prev) => [...prev, { role: 'ai', text: message, time: t }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const ta = e.target
    ta.style.height = '24px'
    ta.style.height = `${Math.min(ta.scrollHeight, 128)}px`
  }

  return (
    <div className="h-full flex flex-col">
      <header className="shrink-0 px-4 py-3 border-b border-[var(--line)] bg-white/55 backdrop-blur-sm">
        <div className="section-label">Memory Assistant</div>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <h2 className="font-serif text-[1.7rem] leading-none text-[var(--text-strong)]">Ask Your Day</h2>
          <div className="chip rounded-full px-2.5 py-1 text-[11px] font-semibold">
            {images.length} photos · {audios.length} audio
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={`${msg.time}-${index}`}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            style={{ animation: 'fadeInUp 0.35s ease-out' }}
          >
            <div
              className={`max-w-[82%] px-4 py-3.5 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-[var(--text-strong)] text-white rounded-br-md shadow-md shadow-black/15'
                  : 'surface-panel text-[var(--text-strong)] rounded-bl-md'
              }`}
            >
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <div className={`mt-1.5 text-[10px] ${msg.role === 'user' ? 'text-white/45 text-right' : 'text-[var(--text-muted)]'}`}>
                {msg.time}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="surface-panel rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5 items-center">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2.5 w-2.5 rounded-full bg-[var(--text-muted)]/45"
                    style={{ animation: 'typing 1.4s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.length <= 1 && (
          <div className="space-y-2 pt-1">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setInput(s)
                  window.setTimeout(() => inputRef.current?.focus(), 40)
                }}
                className="w-full text-left px-4 py-3 rounded-xl chip hover:border-[rgba(109,88,67,0.34)] transition-colors"
              >
                <span className="text-sm text-[var(--text-strong)]">{s}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <footer className="shrink-0 px-4 py-3 bg-white/60 backdrop-blur-sm border-t border-[var(--line)]">
        <div className="surface-panel-strong rounded-2xl px-3 py-2 flex items-end gap-2.5">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your memories..."
            className="flex-1 bg-transparent outline-none resize-none text-[15px] text-[var(--text-strong)] placeholder:text-[var(--text-muted)]/70 leading-6"
            style={{ height: '24px', maxHeight: '128px' }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-[var(--text-strong)] text-white flex items-center justify-center disabled:opacity-30 transition-all hover:-translate-y-0.5"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-5.25-5.25M19.5 12l-5.25 5.25" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  )
}
