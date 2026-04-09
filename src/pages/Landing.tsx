import { type ReactNode, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listFiles, classifyFiles, getFileUrl, todayStr, formatDate } from '../api'
import solisLogo from '../assets/solis-logo.svg'

interface Props {
  onStart: () => void
}

const TOTAL_PAGES = 3

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
    paddingTop: 'calc(5.25rem + env(safe-area-inset-top))',
    paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))',
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
      <header
        className="absolute top-0 inset-x-0 z-30 px-5 sm:px-10 lg:px-14 flex items-center justify-between"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          height: 'calc(4rem + env(safe-area-inset-top))',
        }}
      >
        <button
          type="button"
          onClick={() => jumpToPage(0)}
          className="flex items-center gap-2.5 rounded-full px-3 py-2 bg-white/8 border border-white/14 backdrop-blur-xl"
        >
          <img src={solisLogo} alt="Solis logo" className="w-7 h-7 rounded-md object-cover" />
          <span className="font-serif text-[1.35rem] tracking-tight text-white">Solis</span>
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
          className="snap-start min-h-[100svh] w-full px-5 sm:px-10 lg:px-14 flex items-start lg:items-center"
          style={sectionPaddingStyle}
        >
          <div
            className="w-full max-w-6xl mx-auto grid md:grid-cols-[1.08fr_0.92fr] gap-6 md:gap-10 items-center transition-all duration-1000"
            style={{
              opacity: show ? 1 : 0,
              transform: show ? 'translateY(0)' : 'translateY(28px)',
            }}
          >
            <div className="rounded-[2rem] border border-white/16 bg-white/[0.06] backdrop-blur-xl p-6 sm:p-8 lg:p-10 shadow-[0_24px_56px_rgba(2,10,28,0.42)]">
              <h1 className="font-serif text-[2.45rem] leading-[0.95] sm:text-[3.6rem] lg:text-[4.3rem] text-white tracking-tight">
                你的每一天
                <br />
                <span className="text-cyan-200">都值得电影感呈现</span>
              </h1>
              <p className="mt-5 sm:mt-6 text-[1.03rem] sm:text-[1.14rem] leading-relaxed text-slate-200/92 max-w-2xl">
                Solis 自动采集照片与声音，识别高光时刻，生成可回看、可分享、可续写的记忆影像。
              </p>
              <div className="mt-7 grid grid-cols-3 gap-2.5 sm:gap-3">
                <StatChip label="Today" value={formatDate(today)} />
                <StatChip label="Photo" value={`${images.length}`} />
                <StatChip label="Audio" value={`${audios.length}`} live />
              </div>

              {previewImages.length > 0 && (
                <div className="mt-4 md:hidden grid grid-cols-3 gap-2">
                  {previewImages.slice(0, 3).map((img) => (
                    <div key={img.name} className="aspect-[4/3] rounded-xl overflow-hidden border border-white/15">
                      <img src={getFileUrl(img)} alt="" className="w-full h-full object-cover opacity-86" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative hidden md:block h-[430px]">
              {previewImages.length > 0 ? (
                previewImages.slice(0, 5).map((img, i) => (
                  <figure
                    key={img.name}
                    className="absolute rounded-2xl overflow-hidden border border-white/20 shadow-2xl shadow-black/35"
                    style={{
                      width: i === 0 ? '252px' : i < 3 ? '206px' : '176px',
                      aspectRatio: '4 / 3',
                      top: ['2%', '16%', '48%', '54%', '25%'][i],
                      left: ['8%', '52%', '4%', '57%', '28%'][i],
                      transform: `rotate(${[-5, 4, -3, 5, -2][i]}deg)`,
                      opacity: 0.84 - i * 0.12,
                      animation: `drift ${7 + i}s ease-in-out ${i * 0.26}s infinite`,
                    }}
                  >
                    <img src={getFileUrl(img)} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/42 via-transparent to-transparent" />
                  </figure>
                ))
              ) : (
                <div className="h-full rounded-[2rem] border border-white/16 bg-gradient-to-br from-cyan-300/15 via-blue-300/10 to-transparent backdrop-blur-xl" />
              )}
            </div>
          </div>
        </section>

        <section
          className="snap-start min-h-[100svh] w-full px-5 sm:px-10 lg:px-14 flex items-start lg:items-center"
          style={sectionPaddingStyle}
        >
          <div className="w-full max-w-5xl mx-auto rounded-[2rem] border border-white/16 bg-white/[0.06] backdrop-blur-xl p-6 sm:p-8 lg:p-10 shadow-[0_24px_56px_rgba(2,10,28,0.42)]">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              <FlowCard
                title="Capture"
                subtitle="Wearable stream"
                progress="70%"
                tone="cyan"
                icon={
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 7.5A1.5 1.5 0 016 6h12a1.5 1.5 0 011.5 1.5v9A1.5 1.5 0 0118 18H6a1.5 1.5 0 01-1.5-1.5v-9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.75h6M9 12h3.75M15 12h.008v.008H15V12z" />
                  </svg>
                }
              />
              <FlowCard
                title="Storyboard"
                subtitle="AI selects moments"
                progress="55%"
                tone="amber"
                icon={
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-1.113-2.79a4.5 4.5 0 00-2.544-2.544L2.25 12l2.79-1.113a4.5 4.5 0 002.544-2.544L9 5.25l1.113 2.79a4.5 4.5 0 002.544 2.544L15.75 12l-2.79 1.113a4.5 4.5 0 00-2.544 2.544z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 8.25h.008v.008h-.008V8.25zM18.75 15.75h.008v.008h-.008v-.008z" />
                  </svg>
                }
              />
            </div>

            <h2 className="mt-8 sm:mt-10 font-serif text-[2.25rem] sm:text-[3.3rem] leading-[0.96] text-white tracking-tight">
              无需剪辑经验
              <br />
              <span className="text-amber-200">系统自动产出漫剧短片</span>
            </h2>
            <p className="mt-5 text-[1.02rem] sm:text-[1.13rem] leading-relaxed text-slate-200/92 max-w-3xl">
              每小时智能抽取关键画面，生成分镜提示词，自动提交图生视频任务。你只需回看、选择、分享。
            </p>

            <div className="mt-8 grid sm:grid-cols-3 gap-3">
              <MiniPill label="Hourly trigger" value="1 photo / hour" />
              <MiniPill label="Manual trigger" value="Select image instantly" />
              <MiniPill label="Cinema style" value="Stylized comic drama" />
            </div>
          </div>
        </section>

        <section
          className="snap-start min-h-[100svh] w-full px-5 sm:px-10 lg:px-14 flex items-start lg:items-center"
          style={sectionPaddingStyle}
        >
          <div className="w-full max-w-5xl mx-auto rounded-[2rem] border border-white/16 bg-white/[0.06] backdrop-blur-xl p-6 sm:p-8 lg:p-10 shadow-[0_24px_56px_rgba(2,10,28,0.42)]">
            <div className="grid md:grid-cols-[1fr_1.1fr] gap-7 md:gap-10 items-center">
              <div className="relative h-[280px] sm:h-[320px] rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-br from-cyan-300/22 via-blue-400/12 to-slate-900/55">
                {previewImages[0] ? (
                  <img src={getFileUrl(previewImages[0])} alt="" className="w-full h-full object-cover opacity-78" />
                ) : (
                  <div className="w-full h-full" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#081724]/95 via-[#081724]/35 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-white/18 bg-black/35 px-3 py-2 backdrop-blur-lg">
                  <span className="text-[12px] font-semibold tracking-wide text-white/90">Solis Cinema Preview</span>
                  <span className="text-[11px] text-cyan-100/90">Ready to Generate</span>
                </div>
              </div>

              <div>
                <h2 className="font-serif text-[2.25rem] sm:text-[3.3rem] leading-[0.96] text-white tracking-tight">
                  点击开启
                  <br />
                  <span className="text-cyan-200">你的第一支记忆短片</span>
                </h2>
                <p className="mt-5 text-[1.02rem] sm:text-[1.13rem] leading-relaxed text-slate-200/92">
                  进入后你可以在 Diary 查看时间线，在 Memory 对话追问细节，在 Cinema 立即生成并播放视频。
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3.5">
                  <button
                    type="button"
                    onClick={handleStart}
                    className="w-full sm:flex-1 rounded-2xl border-0 px-6 py-4 text-[1.08rem] font-extrabold text-[#072133] bg-gradient-to-r from-[#86f2ff] via-[#a9f4ff] to-[#6ce8ff] shadow-[0_14px_34px_rgba(59,223,255,0.35)] hover:translate-y-[-1px] transition-transform"
                  >
                    Enter Solis
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpToPage(1)}
                    className="w-full sm:w-auto rounded-2xl border border-white/20 bg-white/8 px-6 py-4 text-[1rem] font-bold text-white/90 hover:bg-white/14 transition-colors"
                  >
                    Back One Step
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div
        className="absolute left-1/2 -translate-x-1/2 z-20"
        style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
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
    <div className="rounded-2xl border border-white/14 bg-white/7 px-4 py-3.5 sm:px-5 text-left">
      <div className="text-[11px] uppercase tracking-[0.15em] font-bold text-slate-300">{label}</div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[1rem] sm:text-[1.05rem] font-bold text-white">
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
    <div className="rounded-2xl border border-white/14 bg-white/7 p-4 sm:p-5">
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

function MiniPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/14 bg-white/7 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.14em] font-bold text-slate-300">{label}</div>
      <div className="mt-1 text-[14px] font-semibold text-white">{value}</div>
    </div>
  )
}
