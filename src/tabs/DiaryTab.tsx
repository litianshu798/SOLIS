import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  listFiles, classifyFiles, getFileUrl, extractTime,
  todayStr, formatDate, shiftDate, generateClip,
} from '../api'

export default function DiaryTab() {
  const [date, setDate] = useState(todayStr())
  const [generating, setGenerating] = useState(false)
  const [clipResult, setClipResult] = useState<any>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['files', date],
    queryFn: () => listFiles(date),
    refetchInterval: 30000,
  })

  const { images, audios } = data ? classifyFiles(data.objects) : { images: [], audios: [] }

  const timeline = [
    ...images.map((img) => ({ type: 'image' as const, obj: img, time: extractTime(img.name) })),
    ...audios.map((aud) => ({ type: 'audio' as const, obj: aud, time: extractTime(aud.name) })),
  ].sort((a, b) => a.obj.name.localeCompare(b.obj.name))

  const handleGenerate = async () => {
    setGenerating(true)
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
      {/* Date Header */}
      <div className="shrink-0 flex items-center justify-between px-5 py-4 bg-white/60 backdrop-blur-sm border-b border-stone-200/40">
        <button
          onClick={() => setDate(shiftDate(date, -1))}
          className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <div className="font-serif text-lg font-semibold text-stone-800">{formatDate(date)}</div>
          <div className="text-[11px] text-stone-400 mt-0.5 font-light">
            {images.length} photos · {audios.length} recordings
          </div>
        </div>
        <button
          onClick={() => setDate(shiftDate(date, 1))}
          className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 text-stone-300">
            <div className="w-6 h-6 border-2 border-stone-200 border-t-orange-400 rounded-full animate-spin" />
            <span className="text-xs mt-3 text-stone-400">Loading...</span>
          </div>
        ) : timeline.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-0">
            {timeline.map((item, i) => (
              <TimelineItem key={item.obj.name} item={item} index={i} onImageClick={setLightbox} />
            ))}
          </div>
        )}

        {/* AI Summary */}
        {clipResult?.result?.summary && (
          <div
            className="mt-6 p-5 rounded-2xl bg-white border border-stone-200/60 shadow-sm"
            style={{ animation: 'scaleIn 0.4s ease-out' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 1a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 1zM5.05 3.05a.75.75 0 011.06 0l1.062 1.06A.75.75 0 116.11 5.173L5.05 4.11a.75.75 0 010-1.06zm9.9 0a.75.75 0 010 1.06l-1.06 1.062a.75.75 0 01-1.062-1.061l1.061-1.06a.75.75 0 011.06 0zM10 7a3 3 0 100 6 3 3 0 000-6zm-6.75 3a.75.75 0 01-.75-.75h-1.5a.75.75 0 010 1.5h1.5A.75.75 0 013.25 10zm14.5 0a.75.75 0 01.75.75h1.5a.75.75 0 010-1.5h-1.5a.75.75 0 01-.75.75z" />
                </svg>
              </div>
              <span className="font-serif text-sm font-semibold text-stone-700">AI Diary Summary</span>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed font-light">
              {clipResult.result.summary}
            </p>
          </div>
        )}

        {/* Generate Button */}
        {timeline.length > 0 && (
          <div className="flex justify-center mt-6 mb-10">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium shadow-lg shadow-stone-800/15 hover:shadow-xl hover:shadow-stone-800/20 transition-all disabled:opacity-50 disabled:hover:bg-stone-800"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 1a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 1z" />
                  </svg>
                  Generate AI Diary
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <img src={lightbox} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
        </div>
      )}
    </div>
  )
}

function TimelineItem({
  item,
  index,
  onImageClick,
}: {
  item: { type: 'image' | 'audio'; obj: any; time: string }
  index: number
  onImageClick: (url: string) => void
}) {
  return (
    <div
      className="flex gap-4 py-3"
      style={{
        animation: 'fadeInUp 0.5s ease-out forwards',
        animationDelay: `${index * 50}ms`,
        opacity: 0,
      }}
    >
      {/* Time + Dot + Line */}
      <div className="flex flex-col items-center w-14 shrink-0">
        <span className="text-[10px] text-stone-400 tabular-nums font-medium">{item.time}</span>
        <div className={`w-2 h-2 rounded-full mt-2 ${item.type === 'image' ? 'bg-orange-400' : 'bg-blue-400'}`} />
        <div className="w-px flex-1 bg-stone-200/60 mt-1" />
      </div>

      {/* Content */}
      {item.type === 'image' ? (
        <button
          onClick={() => onImageClick(getFileUrl(item.obj))}
          className="group relative rounded-xl overflow-hidden flex-1 max-w-[220px] shadow-sm hover:shadow-md transition-shadow"
        >
          <img
            src={getFileUrl(item.obj)}
            alt=""
            className="w-full aspect-[4/3] object-cover rounded-xl group-hover:scale-[1.02] transition-transform duration-500"
            loading="lazy"
          />
        </button>
      ) : (
        <AudioCard obj={item.obj} />
      )}
    </div>
  )
}

function AudioCard({ obj }: { obj: any }) {
  const [playing, setPlaying] = useState(false)

  const toggle = () => {
    const audio = document.getElementById(`audio-${obj.name}`) as HTMLAudioElement
    if (audio) {
      if (playing) audio.pause()
      else audio.play()
      setPlaying(!playing)
    }
  }

  const sizeKB = Math.round((obj.size || 0) / 1024)
  const durationEstimate = Math.round(sizeKB / 32)

  return (
    <div className="flex-1 max-w-[240px]">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-stone-200/60 shadow-sm hover:shadow-md transition-all">
        <button
          onClick={toggle}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
            playing ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-500 hover:bg-blue-100'
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
        <div className="flex-1 min-w-0">
          <div className="text-xs text-stone-600 font-medium">Recording</div>
          <div className="text-[10px] text-stone-400">{durationEstimate}s · {sizeKB}KB</div>
        </div>
      </div>
      <audio id={`audio-${obj.name}`} src={getFileUrl(obj)} onEnded={() => setPlaying(false)} preload="none" />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-52 text-center">
      <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        </svg>
      </div>
      <div className="text-sm text-stone-400 font-medium">No records yet</div>
      <div className="text-xs text-stone-300 mt-1">Device is capturing in the background</div>
      <div className="flex items-center gap-1.5 mt-3 text-emerald-500 text-xs font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: 'breathe 2s ease-in-out infinite' }} />
        Live
      </div>
    </div>
  )
}
