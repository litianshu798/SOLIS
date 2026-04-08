import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listFiles, classifyFiles, todayStr, chatWithMemory } from '../api'

interface Message {
  role: 'user' | 'ai'
  text: string
  time: string
}

export default function QATab() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: "Hi! I'm your memory assistant. Ask me anything about your day — I have access to all your photos and recordings.",
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
  }, [messages])

  const send = async () => {
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    if (inputRef.current) inputRef.current.style.height = '24px'

    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    setMessages((m) => [...m, { role: 'user', text: q, time: now }])
    setLoading(true)

    try {
      const context = `Today: ${images.length} photos, ${audios.length} audio recordings captured by wearable device.`
      const answer = await chatWithMemory(q, context, todayStr())
      const t = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      setMessages((m) => [...m, { role: 'ai', text: answer, time: t }])
    } catch (error) {
      const t = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      const errorMsg = error instanceof Error ? error.message : 'Sorry, something went wrong.'
      setMessages((m) => [...m, { role: 'ai', text: errorMsg, time: t }])
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
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }

  const suggestions = [
    { text: "What did I do today?", icon: "📅" },
    { text: "How many photos were taken?", icon: "📷" },
    { text: "Summarize my entire day", icon: "✨" },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-6 py-5 bg-white/60 backdrop-blur-sm border-b border-stone-200/40">
        <div className="font-serif text-xl font-semibold text-stone-800">Memory Assistant</div>
        <div className="text-xs text-stone-400 mt-1 font-light">
          Ask about your life captured by the device
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            style={{ animation: 'fadeInUp 0.35s ease-out' }}
          >
            {msg.role === 'ai' && (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center mr-3 mt-1 shrink-0 shadow-sm">
                <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
            )}
            <div
              className={`max-w-[78%] px-5 py-4 ${
                msg.role === 'user'
                  ? 'bg-stone-800 text-white rounded-[20px] rounded-br-md shadow-md'
                  : 'bg-white text-stone-600 rounded-[20px] rounded-bl-md border border-stone-100 shadow-sm'
              }`}
            >
              <p className="text-[15px] leading-relaxed">{msg.text}</p>
              <div className={`text-[10px] mt-2 text-right ${msg.role === 'user' ? 'text-white/40' : 'text-stone-300'}`}>
                {msg.time}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center mr-3 mt-1 shrink-0 shadow-sm">
              <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div className="px-5 py-4 rounded-[20px] rounded-bl-md bg-white border border-stone-100 shadow-sm">
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-stone-300"
                    style={{ animation: 'typing 1.4s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="space-y-2.5 mt-4">
            <div className="text-xs text-stone-400 font-medium ml-1 mb-1">Try asking</div>
            {suggestions.map((s) => (
              <button
                key={s.text}
                onClick={() => { setInput(s.text); setTimeout(() => inputRef.current?.focus(), 50) }}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-left text-sm text-stone-600 bg-white border border-stone-100 hover:border-orange-200 hover:bg-orange-50/30 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <span className="text-lg">{s.icon}</span>
                <span>{s.text}</span>
                <svg className="w-4 h-4 ml-auto text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 py-4 bg-white/60 backdrop-blur-sm border-t border-stone-200/40">
        <div className="flex items-end gap-3 px-5 py-3 rounded-2xl bg-white border border-stone-200 shadow-sm focus-within:border-stone-400 focus-within:shadow-md transition-all">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your memories..."
            className="flex-1 bg-transparent text-[15px] text-stone-700 placeholder:text-stone-300 outline-none resize-none leading-6"
            style={{ height: '24px', maxHeight: '120px' }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center text-white hover:bg-stone-900 transition-all disabled:opacity-20 disabled:hover:bg-stone-800 shadow-sm shrink-0"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
