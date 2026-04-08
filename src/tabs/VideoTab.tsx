import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listFiles, classifyFiles, getFileUrl, todayStr } from '../api'

const styles = [
  { id: 'cinematic', label: 'Cinematic', desc: 'Film-like color grading' },
  { id: 'vlog', label: 'Vlog', desc: 'Fast-paced & fun' },
  { id: 'artistic', label: 'Artistic', desc: 'Vivid & expressive' },
]

export default function VideoTab() {
  const [style, setStyle] = useState('cinematic')
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showSlideshow, setShowSlideshow] = useState(false)

  const { data } = useQuery({
    queryKey: ['video-files', todayStr()],
    queryFn: () => listFiles(todayStr()),
  })

  const { images } = data ? classifyFiles(data.objects) : { images: [] }

  const handleGenerate = () => {
    if (images.length === 0) return
    setGenerating(true)
    setProgress(0)
    setShowSlideshow(false)

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setGenerating(false)
          setShowSlideshow(true)
          return 100
        }
        return p + 2
      })
    }, 80)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-5 py-4 bg-white/60 backdrop-blur-sm border-b border-stone-200/40">
        <div className="font-serif text-lg font-semibold text-stone-800">AI Cinema</div>
        <div className="text-[11px] text-stone-400 mt-0.5 font-light">
          Transform your day into a cinematic experience
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* Video Player / Slideshow */}
        <div className="aspect-video rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/60 shadow-sm mb-6">
          {showSlideshow ? (
            <Slideshow images={images} style={style} />
          ) : generating ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-white">
              <div className="w-10 h-10 rounded-full border-2 border-stone-200 border-t-orange-500 animate-spin" />
              <div className="text-sm text-stone-400 font-light">Creating your {style} film...</div>
              <div className="w-48 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-stone-300 tabular-nums">{progress}%</div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-300 bg-white">
              <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <span className="text-xs font-light">Your film will appear here</span>
            </div>
          )}
        </div>

        {/* Photo Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-stone-500 font-medium">Today's Footage</div>
            <div className="text-xs text-stone-400">{images.length} shots</div>
          </div>
          {images.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(0, 12).map((img, i) => (
                <div
                  key={img.name}
                  className="aspect-square rounded-xl overflow-hidden shadow-sm border border-stone-200/40"
                  style={{
                    animation: 'scaleIn 0.4s ease-out forwards',
                    animationDelay: `${i * 40}ms`,
                    opacity: 0,
                  }}
                >
                  <img
                    src={getFileUrl(img)}
                    alt=""
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              ))}
              {images.length > 12 && (
                <div className="aspect-square rounded-xl bg-stone-100 flex items-center justify-center text-xs text-stone-400 font-medium border border-stone-200/40">
                  +{images.length - 12}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-stone-300 text-xs font-light">
              No footage captured yet
            </div>
          )}
        </div>

        {/* Style Selector */}
        <div className="mb-6">
          <div className="text-xs text-stone-500 font-medium mb-3">Style</div>
          <div className="flex gap-2">
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3.5 rounded-xl border transition-all ${
                  style === s.id
                    ? 'bg-orange-50 border-orange-300 text-orange-600 shadow-sm'
                    : 'bg-white border-stone-200/60 text-stone-400 hover:text-stone-600 hover:border-stone-300'
                }`}
              >
                <span className="text-xs font-semibold">{s.label}</span>
                <span className="text-[9px] font-light">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating || images.length === 0}
          className="w-full py-4 rounded-full bg-stone-800 hover:bg-stone-900 text-white text-base font-medium shadow-lg shadow-stone-800/15 hover:shadow-xl hover:shadow-stone-800/20 transition-all disabled:opacity-20 disabled:hover:bg-stone-800 mb-10"
        >
          {generating ? 'Creating...' : 'Generate Film'}
        </button>
      </div>
    </div>
  )
}

function Slideshow({ images, style }: { images: any[]; style: string }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((i) => (i + 1) % images.length)
    }, style === 'cinematic' ? 4000 : style === 'vlog' ? 2000 : 3000)
    return () => clearInterval(interval)
  }, [images.length, style])

  const filterStyle = style === 'artistic'
    ? 'saturate-150 contrast-110'
    : style === 'cinematic'
    ? 'saturate-75 contrast-125'
    : ''

  return (
    <div className="relative w-full h-full bg-black">
      {images.map((img, i) => (
        <div
          key={img.name}
          className={`absolute inset-0 transition-opacity ${filterStyle}`}
          style={{
            opacity: i === idx ? 1 : 0,
            transitionDuration: style === 'cinematic' ? '2s' : '0.5s',
          }}
        >
          <img
            src={getFileUrl(img)}
            alt=""
            className="w-full h-full object-cover"
            style={{
              animation: i === idx ? 'kenburns1 8s ease-in-out infinite alternate' : 'none',
            }}
          />
        </div>
      ))}
      {style === 'cinematic' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[8%] bg-black" />
          <div className="absolute bottom-0 left-0 right-0 h-[8%] bg-black" />
        </>
      )}
      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/50 text-[10px] text-white/70 tabular-nums backdrop-blur-sm">
        {idx + 1} / {images.length}
      </div>
    </div>
  )
}
