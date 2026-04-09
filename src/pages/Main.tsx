import { useState } from 'react'
import DiaryTab from '../tabs/DiaryTab'
import QATab from '../tabs/QATab'
import VideoTab from '../tabs/VideoTab'

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

export default function Main() {
  const [activeTab, setActiveTab] = useState<TabId>('diary')
  const active = tabs.find((tab) => tab.id === activeTab)!

  return (
    <div className="relative h-full overflow-hidden" style={{ animation: 'fadeIn 0.45s ease-out' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 8% 20%, rgba(214,138,70,0.14), transparent 30%), radial-gradient(circle at 90% 8%, rgba(226,194,157,0.3), transparent 35%)',
        }}
      />

      <div className="relative z-10 h-full max-w-md mx-auto flex flex-col">
        <header className="shrink-0 px-5 pt-5 pb-3">
          <div className="surface-panel rounded-2xl px-4 py-3">
            <div className="section-label">Personal Cut</div>
            <div className="mt-1.5 flex items-center justify-between">
              <div className="font-serif text-2xl leading-none text-[var(--text-strong)]">Vibeverse</div>
              <div className="chip rounded-full px-2.5 py-1 text-[11px] font-semibold">{active.label}</div>
            </div>
          </div>
        </header>

        <div className="flex-1 min-h-0 px-3 pb-2">
          <div className="surface-panel h-full rounded-[26px] overflow-hidden">
            <div className={activeTab === 'diary' ? 'h-full' : 'hidden'}>
              <DiaryTab />
            </div>
            <div className={activeTab === 'qa' ? 'h-full' : 'hidden'}>
              <QATab />
            </div>
            <div className={activeTab === 'video' ? 'h-full' : 'hidden'}>
              <VideoTab />
            </div>
          </div>
        </div>

        <footer className="shrink-0 px-4 pt-1 pb-[max(0.7rem,env(safe-area-inset-bottom))]">
          <div className="surface-panel-strong rounded-2xl p-1.5 flex items-center justify-between">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'text-[var(--accent)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-strong)]'
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-xl bg-[var(--accent-soft)] border border-[rgba(200,122,55,0.25)]" />
                  )}
                  <span className="relative z-10">{tab.icon}</span>
                  <span className="relative z-10 text-[10px] font-semibold tracking-wide">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </footer>
      </div>
    </div>
  )
}
