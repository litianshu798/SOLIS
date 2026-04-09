import { type ReactNode, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listFiles, classifyFiles, getFileUrl, todayStr, formatDate } from '../api'
import solisLogo from '../assets/solis-logo.svg'

interface Props {
  onStart: () => void
}

const TOTAL_PAGES = 3
const CORNER_SLOTS = [
  'left-5 top-5 -rotate-[7deg] sm:left-8 sm:top-8 lg:left-10 lg:top-10',
  'right-5 top-5 rotate-[6deg] sm:right-8 sm:top-8 lg:right-10 lg:top-10',
  'left-5 bottom-5 rotate-[5deg] sm:left-8 sm:bottom-8 lg:left-10 lg:bottom-10',
  'right-5 bottom-5 -rotate-[6deg] sm:right-8 sm:bottom-8 lg:right-10 lg:bottom-10',
] as const

export default function Landing({ onStart }: Props) {
  const [show, setShow] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [activePage, setActivePage] = useState(0)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const today = todayStr()

  const { data } = useQuery({
    queryKey: ['landing-files', today],
    queryFn: () => listFiles(today),
  })

  const { images, audios } = data ? classifyFiles(data.objects) : { images: [], audios: [] }
  const previewImages = [...images].slice(-6).reverse()
  const sectionPaddingStyle = {
    paddingTop: 'calc(5.7rem + env(safe-area-inset-top))',
    paddingBottom: 'calc(6.9rem + env(safe-area-inset-bottom))',
    paddingInlineStart: 'max(1.5rem, calc(env(safe-area-inset-left) + 1.2rem))',
    paddingInlineEnd: 'max(1.5rem, calc(env(safe-area-inset-right) + 1.2rem))',
  }

  useEffect(() => {
    const timer = window.setTimeout(() => setShow(true), 120)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const onScroll = () => {
      const height = Math.max(scroller.clientHeight, 1)
      const nextPage = Math.round(scroller.scrollTop / height)
      const safe = Math.max(0, Math.min(TOTAL_PAGES - 1, nextPage))
      setActivePage((prev) => (prev === safe ? prev : safe))
    }
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', onScroll)
  }, [])

  const handleStart = () => {
    setLeaving(true)
    window.setTimeout(onStart, 520)
  }

  const jumpToPage = (page: number) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const safe = Math.max(0, Math.min(TOTAL_PAGES - 1, page))
    scroller.scrollTo({ top: safe * scroller.clientHeight, behavior: 'smooth' })
    setActivePage(safe)
  }

  return (
    <div className={`relative h-full w-full overflow-hidden transition-all duration-700 ${leaving ? 'scale-105 opacity-0' : ''}`}>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 12% 10%, rgba(93,143,255,0.24), transparent 30%), radial-gradient(circle at 84% 16%, rgba(73,199,174,0.22), transparent 34%), linear-gradient(165deg, #081724 0%, #0d1f31 48%, #11263a 100%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'linear-gradient(rgba(163,205,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(163,205,255,0.12) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      {/* noise grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.038,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <header
        className="absolute top-0 inset-x-0 z-30 flex items-center justify-between"
        style={{
          paddingInlineStart: 'max(1.5rem, calc(env(safe-area-inset-left) + 1.2rem))',
          paddingInlineEnd: 'max(1.5rem, calc(env(safe-area-inset-right) + 1.2rem))',
          paddingTop: 'env(safe-area-inset-top)',
          height: 'calc(4rem + env(safe-area-inset-top))',
        }}
      >
        <button
          type="button"
          onClick={() => jumpToPage(0)}
          className="flex items-center gap-2.5"
        >
          <img src={solisLogo} alt="Solis logo" className="w-7 h-7 rounded-md object-cover" />
          <span className="text-[1.28rem] font-extrabold tracking-[0.02em] text-white">Solis</span>
        </button>
        <button
          type="button"
          onClick={handleStart}
          className="ios26-top-btn"
        >
          START
        </button>
      </header>

      <main
        ref={scrollerRef}
        className="relative z-10 h-full w-full overflow-y-auto overscroll-y-contain snap-y snap-mandatory hide-scrollbar"
      >
        <section
          className="snap-start min-h-[100svh] w-full flex items-start lg:items-center"
          style={sectionPaddingStyle}
        >
          <div
            className="relative w-full max-w-5xl mx-auto min-h-[560px] sm:min-h-[640px] lg:min-h-[680px] flex items-center justify-center transition-all duration-1000"
            style={{
              opacity: show ? 1 : 0,
              transform: show ? 'translateY(0)' : 'translateY(28px)',
            }}
          >
            {previewImages.slice(0, 4).map((img, i) => (
              <figure
                key={img.name}
                className={`absolute ${CORNER_SLOTS[i]} w-[110px] sm:w-[172px] lg:w-[232px] aspect-[4/3] rounded-2xl overflow-hidden border border-white/20 shadow-2xl shadow-black/35`}
                style={{
                  animation: `drift ${7 + i}s ease-in-out ${i * 0.24}s infinite`,
                  opacity: 0.82 - i * 0.09,
                }}
              >
                <img
                  src={getFileUrl(img)}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ animation: `kenburns1 ${16 + i * 4}s ease-in-out ${i * 1.5}s infinite alternate` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/42 via-transparent to-transparent" />
              </figure>
            ))}

            <div className="relative z-10 w-full max-w-4xl py-9 px-10 sm:py-12 sm:px-14 lg:py-14 lg:px-16">
              <h1 className="text-[2rem] font-extrabold leading-[1.32] sm:text-[2.75rem] lg:text-[3.35rem] text-white tracking-tight">
                你的每一天
                <br />
                <span className="text-cyan-200">都值得电影感呈现</span>
              </h1>
              <p className="mt-7 sm:mt-8 text-[1.03rem] sm:text-[1.14rem] leading-[2.1] text-slate-200/92 max-w-3xl">
                Solis 自动采集照片与声音，识别高光时刻，生成可回看、可分享、可续写的记忆影像。
              </p>
              <div className="mt-8 sm:mt-9 grid grid-cols-3 gap-2.5 sm:gap-3">
                <StatChip label="Today" value={formatDate(today)} />
                <StatChip label="Photo" value={`${images.length}`} />
                <StatChip label="Audio" value={`${audios.length}`} live />
              </div>
            </div>
          </div>
        </section>

        <section
          className="snap-start min-h-[100svh] w-full flex items-start lg:items-center"
          style={sectionPaddingStyle}
        >
          <div className="w-full max-w-5xl mx-auto py-9 px-10 sm:py-12 sm:px-14 lg:py-14 lg:px-16">
            <div className="relative">
              <div className="absolute inset-0 -z-10 pointer-events-none bg-[radial-gradient(circle_at_18%_28%,rgba(129,236,255,0.16),transparent_38%),radial-gradient(circle_at_84%_78%,rgba(255,215,9,0.14),transparent_34%)]" />

              <div>
                <h2 className="text-[1.88rem] font-extrabold sm:text-[2.55rem] leading-[1.32] text-white tracking-tight">
                  无需操作
                  <br />
                  <span className="text-cyan-200">自动生成专属剧情</span>
                </h2>
                <p className="mt-7 text-[1.01rem] sm:text-[1.12rem] leading-[2.1] text-slate-200/92 max-w-2xl">
                  多模态 AI 会自动解析照片与语音线索，完成关键片段筛选、镜头语义编排与风格化生成，让日常记录自然变成可播放的短片叙事。
                </p>

                <div className="mt-8 grid sm:grid-cols-2 gap-3.5">
                  <FlowCard
                    title="Capture Stream"
                    subtitle="Photo + Audio synced"
                    progress="78%"
                    tone="cyan"
                    icon={
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 7.5A1.5 1.5 0 016 6h12a1.5 1.5 0 011.5 1.5v9A1.5 1.5 0 0118 18H6a1.5 1.5 0 01-1.5-1.5v-9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.75h6M9 12h3.75M15 12h.008v.008H15V12z" />
                      </svg>
                    }
                  />
                  <FlowCard
                    title="Story Assembly"
                    subtitle="Prompt + render"
                    progress="61%"
                    tone="amber"
                    icon={
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-1.113-2.79a4.5 4.5 0 00-2.544-2.544L2.25 12l2.79-1.113a4.5 4.5 0 002.544-2.544L9 5.25l1.113 2.79a4.5 4.5 0 002.544 2.544L15.75 12l-2.79 1.113a4.5 4.5 0 00-2.544 2.544z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 8.25h.008v.008h-.008V8.25zM18.75 15.75h.008v.008h-.008v-.008z" />
                      </svg>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="snap-start min-h-[100svh] w-full flex items-start lg:items-center"
          style={sectionPaddingStyle}
        >
          <div className="w-full max-w-5xl mx-auto py-9 px-10 sm:py-12 sm:px-14 lg:py-14 lg:px-16">
            <div className="grid md:grid-cols-[1fr_1.1fr] gap-7 md:gap-10 items-center">
              <div className="relative h-[280px] sm:h-[320px] rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-br from-cyan-300/22 via-blue-400/12 to-slate-900/55">
                {previewImages[0] ? (
                  <img src={getFileUrl(previewImages[0])} alt="" className="w-full h-full object-cover opacity-78" />
                ) : (
                  <div className="w-full h-full" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#081724]/95 via-[#081724]/35 to-transparent" />
              </div>

              <div>
                <h2 className="text-[1.95rem] font-extrabold sm:text-[2.65rem] leading-[1.32] text-white tracking-tight">
                  点击开启
                  <br />
                  <span className="text-cyan-200">你的第一支记忆短片</span>
                </h2>
                <p className="mt-7 text-[1.02rem] sm:text-[1.13rem] leading-[2.1] text-slate-200/92">
                  进入后你可以在 Diary 查看时间线，在 Memory 对话追问细节，在 Cinema 立即生成并播放视频。
                </p>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={handleStart}
                    className="w-full rounded-2xl border-0 px-6 py-4 text-[1.08rem] font-extrabold text-[#072133] bg-gradient-to-r from-[#86f2ff] via-[#a9f4ff] to-[#6ce8ff] hover:translate-y-[-1px] transition-transform"
                    style={{ animation: 'glowPulse 2.6s ease-in-out infinite' }}
                  >
                    ✦ Enter Solis
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div
        className="absolute left-1/2 -translate-x-1/2 z-20"
        style={{ bottom: 'calc(1.6rem + env(safe-area-inset-bottom))' }}
      >
        <div className="ios26-tabs">
          {[
            { label: 'Intro', index: 0 },
            { label: 'Auto', index: 1 },
            { label: 'Start', index: 2 },
          ].map((item) => (
            <button
              key={item.index}
              type="button"
              onClick={() => jumpToPage(item.index)}
              className={`ios26-tab ${activePage === item.index ? 'ios26-tab-active' : ''}`}
              aria-label={`Go to slide ${item.index + 1}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden lg:flex absolute bottom-7 right-8 z-20 items-center gap-2 text-[12px] font-semibold tracking-[0.15em] uppercase text-white/62">
        <span>Scroll</span>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l-4-4m4 4l4-4" />
        </svg>
      </div>
    </div>
  )
}

function StatChip({ label, value, live = false }: { label: string; value: string; live?: boolean }) {
  return (
    <div className="relative rounded-2xl border border-white/14 bg-white/7 px-5 py-5 sm:px-6 text-center overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-cyan-300/0 via-cyan-300/75 to-cyan-300/0" />
      <div className="text-[11px] uppercase tracking-[0.15em] font-bold text-slate-300">{label}</div>
      <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[1rem] sm:text-[1.05rem] font-bold text-white font-mono">
        {live && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" style={{ animation: 'breathe 2s ease-in-out infinite' }} />}
        <span className="truncate">{value}</span>
      </div>
    </div>
  )
}

function FlowCard({
  title,
  subtitle,
  progress,
  tone,
  icon,
}: {
  title: string
  subtitle: string
  progress: string
  tone: 'cyan' | 'amber'
  icon: ReactNode
}) {
  const isCyan = tone === 'cyan'
  return (
    <div className="rounded-2xl border border-white/14 bg-white/7 p-6 sm:p-7">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${isCyan ? 'bg-cyan-300/20 text-cyan-100' : 'bg-amber-300/22 text-amber-100'}`}>
        {icon}
      </div>
      <div className="mt-3 text-[1.04rem] font-bold text-white">{title}</div>
      <div className="text-[12px] font-medium text-slate-300">{subtitle}</div>
      <div className="mt-3 h-1.5 rounded-full bg-white/15 overflow-hidden">
        <div
          className={`h-full rounded-full ${isCyan ? 'bg-cyan-200' : 'bg-amber-200'}`}
          style={{ width: progress, animation: 'pulseBar 2.1s ease-in-out infinite' }}
        />
      </div>
    </div>
  )
}
