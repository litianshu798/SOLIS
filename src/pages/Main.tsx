import { useState } from 'react'
import DiaryTab from '../tabs/DiaryTab'
import QATab from '../tabs/QATab'
import VideoTab from '../tabs/VideoTab'
import solisLogo from '../assets/solis-logo.svg'

const tabs = [
  {
    id: 'diary',
    label: 'Diary',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 5.25h10.5A2.25 2.25 0 0117.25 7.5v11.25a.75.75 0 01-1.28.53l-2.22-2.22a1.5 1.5 0 00-2.12 0l-1.1 1.1a1.5 1.5 0 01-2.12 0l-2.22-2.22a.75.75 0 00-1.28.53V7.5A2.25 2.25 0 014.5 5.25z" />
      </svg>
    ),
  },
  {
    id: 'qa',
    label: 'Memory',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12A7.5 7.5 0 0012 19.5c1.2 0 2.34-.27 3.35-.74l3.15.74-.74-3.15A7.5 7.5 0 1012 4.5" />
      </svg>
    ),
  },
  {
    id: 'video',
    label: 'Cinema',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75A2.25 2.25 0 016 4.5h12a2.25 2.25 0 012.25 2.25v10.5A2.25 2.25 0 0118 19.5H6a2.25 2.25 0 01-2.25-2.25V6.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25v7.5l6-3.75-6-3.75z" />
      </svg>
    ),
  },
] as const

type TabId = typeof tabs[number]['id']

interface Props {
  onGoHome: () => void
}

export default function Main({ onGoHome }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('diary')
  const active = tabs.find((tab) => tab.id === activeTab)!

  return (
    <div className="relative h-full overflow-hidden" style={{ animation: 'fadeIn 0.45s ease-out' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 12% 10%, rgba(93,143,255,0.24), transparent 30%), radial-gradient(circle at 84% 16%, rgba(73,199,174,0.22), transparent 34%), linear-gradient(165deg, #081724 0%, #0d1f31 48%, #11263a 100%)',
        }}
      />

      <div className="relative z-10 app-shell flex flex-col">
        <header className="shrink-0">
          <div className="surface-panel-strong rounded-[1.6rem] px-6 py-5 md:px-8 md:py-6">
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={onGoHome}
                className="flex items-center justify-center gap-3 rounded-xl transition-opacity hover:opacity-80"
                aria-label="Back to Solis home"
                title="Back to home"
              >
                <img src={solisLogo} alt="Solis logo" className="w-12 h-12 md:w-14 md:h-14 rounded-xl shadow-md shadow-black/15 object-cover" />
                <div className="text-[2.15rem] md:text-[2.7rem] font-extrabold leading-[1.32] tracking-tight text-white">Solis</div>
              </button>
              <div className="chip rounded-full px-4 py-2 text-[13px] md:text-[14px] font-bold w-fit text-cyan-200">
                Active: {active.label}
              </div>
            </div>

            <nav className="mt-5 grid grid-cols-3 gap-3 md:gap-3.5">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`nav-pill py-3.5 md:py-4 px-2.5 md:px-4 flex items-center justify-center gap-2.5 ${isActive ? 'nav-pill-active' : ''}`}
                  >
                    <span className="opacity-95">{tab.icon}</span>
                    <span className="text-[14px] md:text-[16px] font-extrabold tracking-[0.04em]">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </header>

        <main className="flex-1 min-h-0 pt-2 md:pt-3 pb-[max(0.45rem,env(safe-area-inset-bottom))]">
          <div className="surface-panel h-full rounded-[1.5rem] overflow-hidden">
            <div className={activeTab === 'diary' ? 'h-full' : 'hidden'}>
              <DiaryTab onOpenCinema={() => setActiveTab('video')} />
            </div>
            <div className={activeTab === 'qa' ? 'h-full' : 'hidden'}>
              <QATab />
            </div>
            <div className={activeTab === 'video' ? 'h-full' : 'hidden'}>
              <VideoTab />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
