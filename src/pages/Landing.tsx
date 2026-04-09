import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { classifyFiles, formatDate, getFileUrl, listFiles, todayStr } from '../api'

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
  const imageUrls = useMemo(() => images.map((img) => getFileUrl(img)), [images])

  useEffect(() => {
    const timer = window.setTimeout(() => setShow(true), 120)
    return () => window.clearTimeout(timer)
  }, [])

  const handleStart = () => {
    setLeaving(true)
    window.setTimeout(onStart, 460)
  }

  return (
    <div className={`h-full w-full overflow-y-auto hide-scrollbar bg-[#fefcf4] text-[#373930] transition-all duration-500 ${leaving ? 'opacity-0 scale-[1.01]' : ''}`}>
      <nav className="sticky top-0 z-50 border-b border-[#ebe8dc] bg-[#fefcf4]/82 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-14 py-6 flex items-center justify-between gap-4">
          <a className="text-[1.9rem] italic text-[#5f4a50]" style={{ fontFamily: 'Newsreader, serif' }} href="#">
            Solis
          </a>

          <div className="hidden md:flex items-center gap-8 text-[13px] tracking-[0.08em]">
            <a className="text-[#855863] font-semibold border-b border-[#c9a9b1] pb-0.5" href="#">Journal</a>
            <a className="text-[#7b7c72] hover:text-[#855863] transition-colors" href="#">Cinema</a>
            <a className="text-[#7b7c72] hover:text-[#855863] transition-colors" href="#">Memory AI</a>
          </div>

          <button
            onClick={handleStart}
            className="rounded-full px-10 md:px-14 py-5 min-h-[4rem] min-w-[11.5rem] md:min-w-[16rem] text-base font-medium tracking-wide text-white bg-gradient-to-br from-[#6a6362] to-[#807876] hover:opacity-90 transition-opacity"
          >
            Start Capturing
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-8">
        <section className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-14 mb-32 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div
            className="lg:col-span-7 flex flex-col items-center text-center gap-7"
            style={{
              opacity: show ? 1 : 0,
              transform: show ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 560ms ease, transform 560ms ease',
            }}
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-[#efeee3] text-[#855863] text-xs font-semibold tracking-[0.18em] uppercase w-fit">
              The Digital Archivist
            </div>

            <h1
              className="text-[#373930] leading-[1.08] italic"
              style={{ fontFamily: 'Newsreader, serif', fontSize: 'clamp(2.8rem, 9vw, 5.5rem)' }}
            >
              Your life is worth a
              <span
                className="block text-[#855863] -mt-2 md:-mt-4"
                style={{ fontFamily: 'Birthstone, cursive', fontSize: 'clamp(3rem, 10vw, 6.2rem)', fontStyle: 'normal' }}
              >
                cinematic presentation
              </span>
            </h1>

            <p className="text-[#64655b] text-[1.08rem] leading-[1.85] max-w-xl mx-auto">
              Solis automatically collects photos and sounds, identifies highlight moments, and creates shareable, continuing memory films.
            </p>

            <div className="flex w-full flex-wrap items-center justify-center gap-4">
              <button
                onClick={handleStart}
                className="w-full sm:w-auto rounded-full px-12 md:px-16 py-6 min-h-[4.6rem] sm:min-w-[19rem] md:min-w-[23rem] bg-[#6a6362] text-white text-lg font-semibold hover:shadow-xl transition-all"
              >
                Begin Your Archive
              </button>
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 md:px-14 py-4 min-h-[4rem] sm:min-w-[16rem] md:min-w-[20rem] rounded-full bg-[#ede2e0]/70 text-[#6a6362] font-semibold">
                <span className="material-symbols-outlined">play_circle</span>
                See the Magic
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex justify-center py-8 lg:py-14">
            <div className="relative w-[84%] max-w-[380px] mx-auto aspect-[4/5] bg-white p-4 rounded-2xl shadow-[0_16px_50px_rgba(55,57,48,0.12)] rotate-[1.4deg] z-10">
              <div className="w-full h-[84%] rounded-lg overflow-hidden bg-[#ece9dd]">
                {imageUrls[0] ? (
                  <img src={imageUrls[0]} alt="" className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#f1eee2] to-[#dfdbc9]" />
                )}
              </div>
              <p className="mt-4 text-center text-[#6a6362]" style={{ fontFamily: 'Birthstone, cursive', fontSize: '2rem' }}>
                {formatDate(today)}
              </p>
            </div>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[74%] max-w-[320px] aspect-[4/5] rounded-2xl bg-[#efeee3] -rotate-[4deg] opacity-70 -z-10" />
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[52%] max-w-[240px] aspect-square rounded-full bg-[#ffd9e0] blur-3xl opacity-35 -z-20" />
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-14 mb-24">
          <div className="rounded-[1.8rem] bg-[#f5f4e9] border border-[#ebe8dc] py-10 px-6 sm:px-8">
            <div className="flex flex-col md:flex-row justify-center items-center gap-10 text-center">
              <StatBlock value={`${images.length} photos`} label="Processed Today" />
              <div className="hidden md:block h-14 w-px bg-[#d9d8cc]" />
              <StatBlock value={`${audios.length} audio recordings`} label="Captured & Curated" />
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-14 mb-32">
          <div className="flex flex-col items-center text-center gap-6 mb-16 md:mb-20">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-[2.6rem] md:text-[3.2rem] text-[#373930]" style={{ fontFamily: 'Newsreader, serif' }}>
                Curation is a form of <span className="italic">love</span>.
              </h2>
              <p className="mt-6 text-[#64655b] leading-[1.95]">
                We don't just store files; we weave narratives. Solis uses ambient AI to listen for laughter, detect golden hour, and find the threads that connect your days.
              </p>
            </div>
            <a className="inline-block text-[#855863] text-xs uppercase tracking-[0.18em] font-bold mt-1" href="#">View All Features</a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 rounded-[1.8rem] bg-[#fbfaf0] border border-[#e8e5d8] p-8 md:p-11 flex flex-col md:flex-row gap-10 items-center">
              <div className="flex-1 flex flex-col items-center text-center">
                <div className="w-11 h-11 rounded-full bg-[#ffd9e0] text-[#855863] flex items-center justify-center">
                  <span className="material-symbols-outlined">movie_filter</span>
                </div>
                <h3 className="mt-5 text-[2rem] md:text-[2.3rem] italic text-[#373930]" style={{ fontFamily: 'Newsreader, serif' }}>Daily Vlog</h3>
                <p className="mt-4 text-[#64655b] leading-[1.9] max-w-[34rem]">
                  Every evening, Solis delivers a summary of your day. It is not just video; it is a feeling.
                </p>
                <button className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 md:px-12 py-4 min-h-[3.8rem] sm:min-w-[16rem] md:min-w-[19rem] rounded-full bg-[#ffd9e0]/65 text-[#855863] font-semibold">
                  Watch your preview
                  <span className="material-symbols-outlined text-[20px]">arrow_right_alt</span>
                </button>
              </div>
              <PolaroidCard image={imageUrls[1] || imageUrls[0] || ''} title="The Summer Cut" volume="Volume 04" />
            </div>

            <div className="md:col-span-4 rounded-[1.8rem] bg-[#efeee3] border border-[#e3dfd1] p-7 md:p-9">
              <div className="w-11 h-11 rounded-full bg-[#feeaac] text-[#726332] flex items-center justify-center">
                <span className="material-symbols-outlined">auto_graph</span>
              </div>
              <h3 className="mt-5 text-[1.95rem] italic text-[#373930]" style={{ fontFamily: 'Newsreader, serif' }}>Timeline</h3>
              <p className="mt-3 text-[#64655b] leading-[1.8] text-sm">
                A tactile stream of your life pulse. See moments as they happened, enriched with AI metadata.
              </p>
              <div className="mt-6 h-36 rounded-xl overflow-hidden bg-[#e9e9dc]">
                {imageUrls[2] ? (
                  <img src={imageUrls[2]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#f1eee2] to-[#dfdbc9]" />
                )}
              </div>
            </div>

            <div className="md:col-span-12 rounded-[1.8rem] bg-[#ebe0de]/45 border border-[#e2d6d2] p-8 md:p-10">
              <div className="inline-flex items-center gap-2 text-[#6a6362] text-xs uppercase tracking-[0.18em] font-bold">
                <span className="material-symbols-outlined text-sm">colors_spark</span>
                Exclusive Insight
              </div>
              <h3 className="mt-4 text-[2.45rem] text-[#373930]" style={{ fontFamily: 'Newsreader, serif' }}>AI Narratives</h3>
              <p className="mt-3 text-[#5f6058] leading-[1.85] max-w-3xl">
                Solis writes the story you're too busy living and identifies themes across your daily memory stream.
              </p>
              <div className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-3.5">
                {[3, 4, 5, 6].map((idx) => (
                  <div key={idx} className="aspect-square rounded-xl border border-[#e8e5d8] bg-white p-2">
                    {imageUrls[idx] ? (
                      <img src={imageUrls[idx]} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="w-full h-full rounded-lg bg-gradient-to-br from-[#f1eee2] to-[#dfdbc9]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-10 sm:px-16 lg:px-24 mt-10 mb-28">
          <div className="relative max-w-4xl mx-auto rounded-[1.6rem] bg-[#ffd9e0] border border-[#efc2cc] py-12 md:py-14 px-6 md:px-10 text-center overflow-hidden">
            <div className="absolute -top-24 -left-16 w-80 h-80 rounded-full bg-white/65 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-8 w-72 h-72 rounded-full bg-[#f4a8b8]/55 blur-3xl pointer-events-none" />
            <h2 className="relative text-[1.75rem] md:text-[2.35rem] text-[#4a383f] leading-[1.3] max-w-2xl mx-auto" style={{ fontFamily: 'Newsreader, serif' }}>
              Don't let your memories become data. Let them become films.
            </h2>
            <p className="relative mt-5 text-[#704650] text-[1rem] md:text-[1.1rem] leading-[1.9] max-w-xl mx-auto">
              Join creators transforming their digital footprints into heirloom stories.
            </p>
            <div className="relative mt-7 flex flex-col sm:flex-row justify-center gap-3.5">
              <button
                onClick={handleStart}
                className="w-full sm:w-auto px-10 md:px-12 py-5 min-h-[3.9rem] sm:min-w-[14.5rem] md:min-w-[17rem] rounded-full bg-[#6a6362] text-white text-[1.05rem] md:text-[1.15rem] font-bold hover:scale-[1.02] transition-transform"
              >
                Get Solis for iOS
              </button>
              <button className="w-full sm:w-auto px-10 md:px-12 py-5 min-h-[3.9rem] sm:min-w-[14.5rem] md:min-w-[17rem] rounded-full bg-white text-[#855863] text-[1.05rem] md:text-[1.15rem] font-bold hover:scale-[1.02] transition-transform">
                Explore Pricing
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-14">
          <div className="rounded-[1.6rem] bg-[#f9f8ef] border border-[#ece9dc] py-10 px-8 md:px-12 flex flex-col md:flex-row items-center justify-between gap-7">
            <div className="text-center md:text-left">
              <div className="text-[1.6rem] italic text-[#5f4a50]" style={{ fontFamily: 'Newsreader, serif' }}>Solis</div>
              <p className="mt-2 text-xs tracking-[0.16em] uppercase text-[#8d8c82]">© 2026 Solis. Every memory is an heirloom.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-7 text-xs tracking-[0.16em] uppercase text-[#8d8c82]">
              <span>Archive Policy</span>
              <span>Privacy</span>
              <span>Terms</span>
              <span>Contact</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[2rem] md:text-[2.3rem] italic text-[#373930]" style={{ fontFamily: 'Newsreader, serif' }}>
        {value}
      </span>
      <span className="text-[11px] uppercase tracking-[0.2em] text-[#855863] font-bold">{label}</span>
    </div>
  )
}

function PolaroidCard({ image, title, volume }: { image: string; title: string; volume: string }) {
  return (
    <div className="w-full md:w-80 rounded-2xl bg-white p-4 shadow-lg rotate-3">
      <div className="aspect-[4/5] rounded-lg overflow-hidden bg-[#ece9dd]">
        {image ? (
          <img src={image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#f1eee2] to-[#dfdbc9]" />
        )}
      </div>
      <div className="mt-3 px-1.5 flex items-center justify-between">
        <span style={{ fontFamily: 'Birthstone, cursive', fontSize: '1.6rem' }} className="text-[#6a6362]">{title}</span>
        <span className="text-[10px] uppercase tracking-[0.1em] text-[#98978f] font-bold">{volume}</span>
      </div>
    </div>
  )
}
