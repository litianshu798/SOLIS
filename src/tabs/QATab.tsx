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
      text: 'I can read your captures and diary memory. Ask me about highlights, mood changes, or any moment context.',
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
      <header className="shrink-0 px-6 md:px-8 py-4 border-b border-[var(--line)] bg-white/[0.04] backdrop-blur-sm">
        <div className="flex flex-col items-center gap-2.5">
          <h2 className="text-[1.75rem] md:text-[2.1rem] font-extrabold leading-[1.32] tracking-tight text-white text-center">Ask Your Day</h2>
          <div className="chip rounded-full px-3.5 py-2 text-[13px] font-bold">
            {images.length} photos · {audios.length} audio
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 md:px-8 py-5 md:py-6">
        <div className="mx-auto w-full max-w-4xl space-y-4">
          {messages.map((msg, index) => (
            <div key={`${msg.time}-${index}`} style={{ animation: 'fadeInUp 0.35s ease-out' }}>
              {msg.role === 'user' ? (
                <div className="flex justify-end">
                  <div className="chat-bubble-user max-w-[90%] md:max-w-[72%] px-5 py-4 md:px-6 md:py-5 shadow-md shadow-black/30">
                    <p className="text-[15px] leading-[2.0] whitespace-pre-wrap">{msg.text}</p>
                    <div className="mt-1.5 text-[11px] text-white/50 text-right">{msg.time}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 md:gap-3">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-cyan-400/15 border border-cyan-400/25 text-cyan-300 text-[11px] font-bold flex items-center justify-center shrink-0 mt-1">
                    AI
                  </div>
                  <div className="chat-bubble-ai max-w-[92%] md:max-w-[78%] px-5 py-4 md:px-6 md:py-5">
                    <p className="text-[15px] leading-[2.0] whitespace-pre-wrap">{msg.text}</p>
                    <div className="mt-1.5 text-[11px] text-[var(--text-muted)]">{msg.time}</div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-2.5 md:gap-3">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-cyan-400/15 border border-cyan-400/25 text-cyan-300 text-[11px] font-bold flex items-center justify-center shrink-0 mt-1">
                AI
              </div>
              <div className="chat-bubble-ai px-4 py-3 rounded-2xl">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s)
                    window.setTimeout(() => inputRef.current?.focus(), 40)
                  }}
                  className="text-left px-5 py-5 rounded-xl chip hover:border-cyan-400/35 transition-colors"
                >
                  <span className="text-base font-semibold text-[var(--text-strong)]">{s}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="shrink-0 px-5 md:px-8 py-4 md:py-5 bg-white/[0.04] backdrop-blur-sm border-t border-[var(--line)]">
        <div className="mx-auto w-full max-w-4xl">
          <div className="chat-composer px-4 py-3 md:px-5 md:py-3.5 flex items-end gap-3">
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
              className="composer-send"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-5.25-5.25M19.5 12l-5.25 5.25" />
              </svg>
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
