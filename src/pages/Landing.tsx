import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listFiles, classifyFiles, getFileUrl, todayStr } from '../api'

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
    setTimeout(() => setShow(true), 100)
  }, [])

  const handleStart = () => {
    setLeaving(true)
    setTimeout(onStart, 600)
  }

  return (
    <div className={`relative h-full w-full overflow-hidden transition-all duration-700 ${leaving ? 'scale-105 opacity-0' : ''}`}>
      {/* Grid background pattern */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating photo cards */}
      {images.length > 0 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {images.slice(0, 5).map((img, i) => (
            <div
              key={img.name}
              className="absolute rounded-xl overflow-hidden shadow-2xl shadow-black/10 border border-black/5"
              style={{
                width: i === 0 ? '220px' : i < 3 ? '160px' : '130px',
                aspectRatio: '4/3',
                top: [`8%`, `15%`, `55%`, `60%`, `20%`][i],
                left: [`5%`, `75%`, `3%`, `72%`, `42%`][i],
                opacity: show ? (i === 0 ? 0.3 : 0.15 + i * 0.03) : 0,
                transform: show ? `rotate(${[-3, 4, -5, 3, -2][i]}deg)` : 'translateY(40px)',
                transition: `all 1.2s ease-out ${0.3 + i * 0.15}s`,
                animation: show ? `float ${6 + i}s ease-in-out ${i * 0.5}s infinite` : 'none',
              }}
            >
              <img src={getFileUrl(img)} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        {/* Logo / Brand */}
        <div
          className="transition-all duration-1000 ease-out"
          style={{
            opacity: show ? 1 : 0,
            transform: show ? 'translateY(0)' : 'translateY(40px)',
          }}
        >
          <div className="text-xs tracking-[0.35em] text-stone-400 uppercase mb-6 font-medium">
            Vibeverse
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            <span className="text-stone-800">Turn Every Moment</span>
            <br />
            <span className="font-serif italic text-stone-800">Into <span className="text-orange-500">Cinema</span></span>
          </h1>
        </div>

        {/* Subtitle */}
        <p
          className="mt-5 text-sm sm:text-base text-stone-400 max-w-md leading-relaxed font-light transition-all duration-1000 ease-out"
          style={{
            opacity: show ? 1 : 0,
            transform: show ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: '0.3s',
          }}
        >
          AI captures your life through a wearable device,
          <br className="hidden sm:block" />
          then reimagines it as your personal movie.
        </p>

        {/* Buttons */}
        <div
          className="flex items-center gap-5 mt-12 transition-all duration-1000 ease-out"
          style={{
            opacity: show ? 1 : 0,
            transform: show ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: '0.6s',
          }}
        >
          <button
            onClick={handleStart}
            className="group px-10 py-4 rounded-full bg-stone-800 hover:bg-stone-900 text-white text-base font-medium shadow-xl shadow-stone-800/20 hover:shadow-2xl hover:shadow-stone-800/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            Start Experience
          </button>
          <button className="px-10 py-4 rounded-full border border-stone-300 text-stone-500 text-base font-medium hover:border-stone-500 hover:text-stone-700 transition-all duration-300">
            Learn More
          </button>
        </div>

        {/* Stats Bar */}
        <div
          className="mt-16 flex items-center gap-6 text-xs transition-all duration-1000 ease-out"
          style={{
            opacity: show ? 1 : 0,
            transitionDelay: '1s',
          }}
        >
          {data && (
            <>
              <div className="flex items-center gap-2 text-stone-400">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-stone-700 font-semibold text-sm tabular-nums">{images.length}</div>
                  <div className="text-[10px] text-stone-400">Photos</div>
                </div>
              </div>

              <div className="w-px h-8 bg-stone-200" />

              <div className="flex items-center gap-2 text-stone-400">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <div className="text-stone-700 font-semibold text-sm tabular-nums">{audios.length}</div>
                  <div className="text-[10px] text-stone-400">Recordings</div>
                </div>
              </div>

              <div className="w-px h-8 bg-stone-200" />

              <div className="flex items-center gap-1.5 text-emerald-500">
                <span
                  className="w-2 h-2 rounded-full bg-emerald-400"
                  style={{ animation: 'breathe 2s ease-in-out infinite' }}
                />
                <span className="text-xs font-medium">Live</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
