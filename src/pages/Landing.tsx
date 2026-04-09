import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listFiles, classifyFiles, getFileUrl, todayStr, formatDate } from '../api'
import solisLogo from '../assets/solis-logo.svg'

interface Props {
  onStart: () => void
}

export default function Landing({ onStart }: Props) {
  const [show, setShow] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const today = todayStr()

  const { data } = useQuery({
    queryKey: ['landing-files', today],
    queryFn: () => listFiles(today),
  })

  const { images, audios } = data ? classifyFiles(data.objects) : { images: [], audios: [] }

  useEffect(() => {
    const timer = window.setTimeout(() => setShow(true), 120)
    return () => window.clearTimeout(timer)
  }, [])

  const handleStart = () => {
    setLeaving(true)
    window.setTimeout(onStart, 520)
  }

  return (
    <div className={`relative h-full w-full overflow-hidden transition-all duration-700 ${leaving ? 'scale-105 opacity-0' : ''}`}>
      <div className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 12% 12%, rgba(212,127,59,0.14), transparent 32%), radial-gradient(circle at 85% 14%, rgba(228,184,138,0.35), transparent 36%)',
        }}
      />
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {images.length > 0 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {images.slice(0, 6).map((img, i) => (
            <div
              key={img.name}
              className="absolute rounded-2xl overflow-hidden border border-white/60 shadow-2xl shadow-black/10"
              style={{
                width: i === 0 ? '220px' : i < 3 ? '170px' : '140px',
                aspectRatio: '4/3',
                top: ['8%', '18%', '57%', '63%', '24%', '48%'][i],
                left: ['5%', '75%', '3%', '72%', '40%', '79%'][i],
                opacity: show ? (i === 0 ? 0.26 : 0.12 + i * 0.02) : 0,
                transform: show ? `rotate(${[-4, 5, -6, 3, -2, 2][i]}deg)` : 'translateY(44px)',
                transition: `all 1.1s ease-out ${0.25 + i * 0.12}s`,
                animation: show ? `drift ${6 + i * 0.9}s ease-in-out ${i * 0.3}s infinite` : 'none',
              }}
            >
              <img src={getFileUrl(img)} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 flex items-center justify-center h-full px-5 py-8 sm:px-10">
        <section
          className="surface-panel-strong w-full max-w-3xl rounded-[32px] p-7 sm:p-10 text-center backdrop-blur-xl transition-all duration-1000"
          style={{
            opacity: show ? 1 : 0,
            transform: show ? 'translateY(0)' : 'translateY(34px)',
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <img src={solisLogo} alt="Solis logo" className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl shadow-md shadow-black/15 object-cover" />
            <div className="section-label">Solis Memory Cinema</div>
          </div>
          <h1 className="font-serif text-[2.65rem] sm:text-7xl leading-[0.95] font-semibold text-[var(--text-strong)] tracking-tight">
            Direct Your Day.
            <br />
            <span className="italic">Cut It Like Cinema.</span>
          </h1>
          <p className="mt-5 text-[1.02rem] sm:text-[1.16rem] leading-relaxed text-[var(--text-muted)] max-w-2xl mx-auto">
            Wearable capture feeds your private timeline.
            AI turns moments, voices, and photos into a cinematic memory draft.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto cta-btn sm:min-w-[250px]"
            >
              Enter Solis
            </button>
            <button className="w-full sm:w-auto cta-btn-secondary sm:min-w-[250px]">
              Product Story
            </button>
          </div>

          {data && (
            <div className="mt-8 grid grid-cols-3 gap-2.5 sm:gap-3">
              <StatChip
                label="Today"
                value={formatDate(today)}
              />
              <StatChip
                label="Captured"
                value={`${images.length} photos`}
              />
              <StatChip
                label="Voice"
                value={`${audios.length} recordings`}
                live
              />
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function StatChip({ label, value, live = false }: { label: string; value: string; live?: boolean }) {
  return (
    <div className="chip rounded-2xl px-4 py-3.5 sm:px-5 text-left">
      <div className="text-[12px] uppercase tracking-[0.13em] font-bold opacity-75">{label}</div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[1rem] sm:text-[1.08rem] font-bold text-[var(--text-strong)]">
        {live && <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" style={{ animation: 'breathe 2s ease-in-out infinite' }} />}
        <span className="truncate">{value}</span>
      </div>
    </div>
  )
}
