import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listFiles, classifyFiles, getFileUrl, todayStr, type OSSObject } from '../api'

const styles = [
  { id: 'cinematic', label: 'Cinematic', desc: 'soft contrast, warm grain' },
  { id: 'vlog', label: 'Vlog', desc: 'faster cuts, bright energy' },
  { id: 'artistic', label: 'Artistic', desc: 'color pushed, expressive' },
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

  const stageText = useMemo(() => {
    if (progress < 25) return 'Analyzing captured timeline...'
    if (progress < 55) return 'Extracting emotional beats...'
    if (progress < 80) return 'Matching visual style...'
    return 'Rendering preview sequence...'
  }, [progress])

  const handleGenerate = () => {
    if (images.length === 0 || generating) return

    setGenerating(true)
    setProgress(0)
    setShowSlideshow(false)

    const interval = window.setInterval(() => {
      setProgress((value) => {
        const next = value + 2
        if (next >= 100) {
          window.clearInterval(interval)
          setGenerating(false)
          setShowSlideshow(true)
          return 100
        }
        return next
      })
    }, 85)
  }

  const steps = [
    { label: 'Timeline Scan', done: progress >= 20 },
    { label: 'Story Arc', done: progress >= 55 },
    { label: 'Style Render', done: progress >= 85 },
  ]

  return (
    <div className="h-full flex flex-col">
      <header className="shrink-0 px-4 py-3 border-b border-[var(--line)] bg-white/55 backdrop-blur-sm">
        <div className="section-label">Cinema Generator</div>
        <div className="mt-1.5 flex items-center justify-between">
          <h2 className="font-serif text-[1.7rem] leading-none text-[var(--text-strong)]">Direct A Cut</h2>
          <div className="chip rounded-full px-2.5 py-1 text-[11px] font-semibold">{images.length} frames</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="surface-panel-strong rounded-2xl overflow-hidden">
          <div className="aspect-video bg-[rgba(32,24,16,0.08)] relative">
            {showSlideshow ? (
              <Slideshow images={images} style={style} />
            ) : generating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                <div className="w-11 h-11 rounded-full border-2 border-[rgba(109,88,67,0.22)] border-t-[var(--accent)] animate-spin" />
                <div className="mt-3 text-sm text-[var(--text-strong)]">{stageText}</div>
                <div className="mt-3 w-full max-w-[220px] h-1.5 rounded-full bg-[rgba(109,88,67,0.12)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] origin-left"
                    style={{ width: `${progress}%`, animation: 'pulseBar 1.8s ease-in-out infinite' }}
                  />
                </div>
                <div className="mt-2 text-[11px] tabular-nums text-[var(--text-muted)]">{progress}%</div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-muted)]">
                <svg className="w-10 h-10 mb-2 opacity-65" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75A2.25 2.25 0 016 4.5h12a2.25 2.25 0 012.25 2.25v10.5A2.25 2.25 0 0118 19.5H6a2.25 2.25 0 01-2.25-2.25V6.75z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25v7.5l6-3.75-6-3.75z" />
                </svg>
                <div className="text-xs">Generate a preview from today's captures</div>
              </div>
            )}
          </div>
          <div className="px-3.5 py-3 border-t border-[var(--line)] bg-white/70">
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              {steps.map((step) => (
                <div key={step.label} className={`rounded-lg px-2 py-1.5 border ${step.done ? 'bg-[var(--accent-soft)] border-[rgba(200,122,55,0.35)] text-[var(--text-strong)]' : 'border-[var(--line)] text-[var(--text-muted)]'}`}>
                  {step.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-5">
          <div className="section-label mb-2">Style Direction</div>
          <div className="grid grid-cols-1 gap-2.5">
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`text-left rounded-xl px-3.5 py-3 border transition-all ${
                  style === s.id
                    ? 'bg-[var(--accent-soft)] border-[rgba(200,122,55,0.35)]'
                    : 'chip hover:border-[rgba(109,88,67,0.34)]'
                }`}
              >
                <div className="font-semibold text-[var(--text-strong)]">{s.label}</div>
                <div className="text-[11px] mt-1 text-[var(--text-muted)]">{s.desc}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-5">
          <div className="section-label mb-2">Captured Frames</div>
          {images.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(0, 12).map((img, index) => (
                <div
                  key={img.name}
                  className="rounded-xl overflow-hidden border border-white/70 shadow-sm shadow-black/5"
                  style={{
                    animation: 'scaleIn 0.35s ease-out forwards',
                    animationDelay: `${index * 34}ms`,
                    opacity: 0,
                  }}
                >
                  <img
                    src={getFileUrl(img)}
                    alt=""
                    loading="lazy"
                    className="w-full aspect-square object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="chip rounded-xl px-3 py-4 text-center text-xs">No captures available yet.</div>
          )}
        </section>

        <button
          onClick={handleGenerate}
          disabled={generating || images.length === 0}
          className="mt-6 mb-6 w-full rounded-full py-3.5 bg-[var(--text-strong)] text-white font-semibold shadow-lg shadow-black/15 disabled:opacity-30 transition-all hover:-translate-y-0.5"
        >
          {generating ? 'Generating Preview...' : 'Generate Film Preview'}
        </button>
      </div>
    </div>
  )
}

function Slideshow({ images, style }: { images: OSSObject[]; style: string }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (images.length === 0) return
    const delay = style === 'cinematic' ? 3800 : style === 'vlog' ? 2100 : 2900
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, delay)
    return () => window.clearInterval(timer)
  }, [images.length, style])

  const filterStyle = style === 'artistic'
    ? 'saturate-150 contrast-110'
    : style === 'cinematic'
      ? 'saturate-80 contrast-120'
      : ''

  return (
    <div className="relative w-full h-full bg-black">
      {images.map((img, i) => (
        <div
          key={img.name}
          className={`absolute inset-0 transition-opacity ${filterStyle}`}
          style={{
            opacity: i === index ? 1 : 0,
            transitionDuration: style === 'cinematic' ? '1.7s' : '0.48s',
          }}
        >
          <img
            src={getFileUrl(img)}
            alt=""
            className="w-full h-full object-cover"
            style={{ animation: i === index ? 'kenburns1 8s ease-in-out infinite alternate' : 'none' }}
          />
        </div>
      ))}

      {style === 'cinematic' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/28 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[9%] bg-black" />
          <div className="absolute bottom-0 left-0 right-0 h-[9%] bg-black" />
        </>
      )}

      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/50 text-[10px] text-white/75 tabular-nums backdrop-blur-sm">
        {index + 1} / {images.length}
      </div>
    </div>
  )
}
