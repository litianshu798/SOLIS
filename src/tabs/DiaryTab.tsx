import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  listFiles,
  classifyFiles,
  getFileUrl,
  extractTime,
  todayStr,
  formatDate,
  shiftDate,
  generateClip,
  type Clip,
  type OSSObject,
} from '../api'

type TimelineItem = { type: 'image' | 'audio'; obj: OSSObject; time: string }

interface Props {
  onOpenCinema: () => void
}

export default function DiaryTab({ onOpenCinema }: Props) {
  const [date, setDate] = useState(todayStr())
  const [generating, setGenerating] = useState(false)
  const [clipResult, setClipResult] = useState<Clip | null>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['files', date],
    queryFn: () => listFiles(date),
    refetchInterval: 30000,
  })

  const { images, audios } = data ? classifyFiles(data.objects) : { images: [], audios: [] }

  const timeline: TimelineItem[] = [
    ...images.map((img) => ({ type: 'image' as const, obj: img, time: extractTime(img.name) })),
    ...audios.map((aud) => ({ type: 'audio' as const, obj: aud, time: extractTime(aud.name) })),
  ].sort((a, b) => getSortTimestamp(b.obj) - getSortTimestamp(a.obj))

  const summaryText = clipResult?.result?.summary || null

  const handleGenerate = async () => {
    setGenerating(true)
    onOpenCinema()
    try {
      const result = await generateClip(date)
      setClipResult(result)
    } catch (e) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <header className="shrink-0 px-4 md:px-6 py-3.5 border-b border-[var(--line)] bg-white/55 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setDate(shiftDate(date, -1))}
            className="icon-btn"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <div className="font-serif text-[1.45rem] md:text-[1.8rem] text-[var(--text-strong)] leading-none">{formatDate(date)}</div>
            <div className="mt-1.5 text-[13px] font-semibold text-[var(--text-muted)]">
              {images.length} photos · {audios.length} recordings
            </div>
          </div>
          <button
            onClick={() => setDate(shiftDate(date, 1))}
            className="icon-btn"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
        {isLoading ? (
          <div className="h-48 flex flex-col items-center justify-center text-[var(--text-muted)]">
            <div className="w-7 h-7 border-2 border-[rgba(109,88,67,0.15)] border-t-[var(--accent)] rounded-full animate-spin" />
            <span className="text-xs mt-3">Loading timeline...</span>
          </div>
        ) : timeline.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {timeline.map((item, index) => (
              <TimelineRow key={item.obj.name} item={item} index={index} onImageClick={setLightbox} />
            ))}
          </div>
        )}

        {clipResult && (
          <div className="surface-panel rounded-2xl px-4 py-3 mt-5">
            <div className="section-label">Generation Task</div>
            <div className="mt-1.5 text-sm text-[var(--text-strong)]">
              {clipResult.status === 'processing' && 'Task submitted. AI is preparing your diary clip.'}
              {clipResult.status === 'generating' && 'Visual direction generated. Rendering in progress.'}
              {clipResult.status === 'completed' && 'Task completed. Check the generated summary below.'}
              {clipResult.status === 'failed' && 'Generation failed. Please retry once.'}
              {!clipResult.status && 'Task response received.'}
            </div>
          </div>
        )}

        {summaryText && (
          <div className="surface-panel-strong rounded-2xl px-4 py-4 mt-4" style={{ animation: 'scaleIn 0.35s ease-out' }}>
            <div className="section-label">AI Summary</div>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--text-strong)]">{summaryText}</p>
          </div>
        )}

        {timeline.length > 0 && (
          <div className="sticky bottom-3 pt-6">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="cta-btn"
            >
              {generating ? 'Submitting...' : 'Generate AI Diary'}
            </button>
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
        </div>
      )}
    </div>
  )
}

function getSortTimestamp(obj: OSSObject): number {
  const filename = obj.name.split('/').pop() || ''
  const tsMatch = filename.match(/^(\d{13})-/)
  if (tsMatch) return Number(tsMatch[1])

  const lastModifiedTs = Date.parse(obj.lastModified || '')
  if (!Number.isNaN(lastModifiedTs)) return lastModifiedTs
  return 0
}

function TimelineRow({ item, index, onImageClick }: { item: TimelineItem; index: number; onImageClick: (url: string) => void }) {
  return (
    <div
      className="flex gap-3.5 py-1.5"
      style={{
        animation: 'fadeInUp 0.46s ease-out forwards',
        animationDelay: `${index * 40}ms`,
        opacity: 0,
      }}
    >
      <div className="w-12 shrink-0 flex flex-col items-center">
        <span className="text-[10px] tabular-nums text-[var(--text-muted)]">{item.time || '--:--'}</span>
        <span className={`mt-2 w-2 h-2 rounded-full ${item.type === 'image' ? 'bg-[var(--accent)]' : 'bg-[#4d8fcf]'}`} />
        <span className="mt-1 w-px flex-1 bg-[var(--line)]" />
      </div>

      {item.type === 'image' ? (
        <button
          onClick={() => onImageClick(getFileUrl(item.obj))}
          className="group flex-1 max-w-[min(100%,420px)] rounded-2xl overflow-hidden border border-white/70 shadow-md shadow-black/5"
        >
          <img
            src={getFileUrl(item.obj)}
            alt=""
            loading="lazy"
            className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </button>
      ) : (
        <AudioCard obj={item.obj} />
      )}
    </div>
  )
}

function AudioCard({ obj }: { obj: OSSObject }) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (playing) {
        audio.pause()
      } else {
        await audio.play()
      }
      setPlaying(!playing)
    } catch (e) {
      console.error(e)
      setPlaying(false)
    }
  }

  const sizeKB = Math.max(1, Math.round((obj.size || 0) / 1024))
  const durationEstimate = Math.max(1, Math.round(sizeKB / 32))

  return (
    <div className="flex-1 max-w-[min(100%,420px)]">
      <div className="surface-panel rounded-2xl px-3.5 py-3 flex items-center gap-3">
        <button
          onClick={toggle}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
            playing ? 'bg-[#3a85cb] text-white' : 'bg-[#e7f2fd] text-[#3a85cb] hover:bg-[#d9ecff]'
          }`}
        >
          {playing ? (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.841z" />
            </svg>
          )}
        </button>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[var(--text-strong)]">Voice Fragment</div>
          <div className="text-[11px] text-[var(--text-muted)]">{durationEstimate}s · {sizeKB}KB</div>
        </div>
      </div>
      <audio ref={audioRef} src={getFileUrl(obj)} onEnded={() => setPlaying(false)} preload="none" />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="h-56 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/70 border border-[var(--line)] flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-[var(--text-muted)]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        </svg>
      </div>
      <div className="font-semibold text-[var(--text-strong)]">No captures for this day</div>
      <div className="text-xs mt-1 text-[var(--text-muted)]">Wearable capture is still running in the background.</div>
      <div className="text-[11px] mt-3 flex items-center gap-1.5 text-[var(--success)] font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" style={{ animation: 'breathe 2s ease-in-out infinite' }} />
        Live Session
      </div>
    </div>
  )
}
