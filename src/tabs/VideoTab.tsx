import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCinemaRecords, triggerCinemaHourly, type CinemaRecord } from '../api'

function statusMeta(status: CinemaRecord['status']) {
  if (status === 'completed') return { label: 'Completed', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
  if (status === 'generating') return { label: 'Generating', cls: 'bg-amber-100 text-amber-800 border-amber-200' }
  if (status === 'processing') return { label: 'Preparing', cls: 'bg-sky-100 text-sky-700 border-sky-200' }
  return { label: 'Failed', cls: 'bg-rose-100 text-rose-700 border-rose-200' }
}

function formatDateTime(v?: string) {
  if (!v) return '--'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return '--'
  return d.toLocaleString('zh-CN', { hour12: false })
}

function ossProxyUrl(path?: string) {
  if (!path) return ''
  return `/oss/${path}`
}

export default function VideoTab() {
  const queryClient = useQueryClient()

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['cinema-records'],
    queryFn: () => getCinemaRecords(12),
    refetchInterval: (query) => {
      const data = query.state.data as CinemaRecord[] | undefined
      const hasRunning = !!data?.some((item) => item.status === 'processing' || item.status === 'generating')
      return hasRunning ? 8000 : 30000
    },
  })

  const latest = records[0]
  const latestVideo = latest?.result?.videoUrl || latest?.content || ''
  const latestImage = latest?.result?.selectedImage || ''
  const latestStatus = latest ? statusMeta(latest.status) : null

  const runningCount = useMemo(
    () => records.filter((item) => item.status === 'processing' || item.status === 'generating').length,
    [records],
  )

  const triggerMutation = useMutation({
    mutationFn: triggerCinemaHourly,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cinema-records'] })
    },
  })

  return (
    <div className="h-full flex flex-col">
      <header className="shrink-0 px-4 py-3 border-b border-[var(--line)] bg-white/55 backdrop-blur-sm">
        <div className="section-label">Cinema Hourly</div>
        <div className="mt-1.5 flex items-center justify-between">
          <h2 className="font-serif text-[1.7rem] leading-none text-[var(--text-strong)]">Anime Reel</h2>
          <div className="chip rounded-full px-2.5 py-1 text-[11px] font-semibold">{records.length} records</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="surface-panel-strong rounded-2xl overflow-hidden">
          <div className="aspect-video bg-[rgba(32,24,16,0.08)] relative">
            {latestVideo ? (
              <video src={latestVideo} controls className="w-full h-full object-cover bg-black" />
            ) : latest?.status === 'processing' || latest?.status === 'generating' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                <div className="w-11 h-11 rounded-full border-2 border-[rgba(109,88,67,0.22)] border-t-[var(--accent)] animate-spin" />
                <div className="mt-3 text-sm text-[var(--text-strong)]">正在生成 AI 漫剧短片...</div>
                <div className="mt-2 text-[11px] text-[var(--text-muted)]">任务会自动轮询刷新</div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-muted)] px-5 text-center">
                <svg className="w-10 h-10 mb-2 opacity-65" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75A2.25 2.25 0 016 4.5h12a2.25 2.25 0 012.25 2.25v10.5A2.25 2.25 0 0118 19.5H6a2.25 2.25 0 01-2.25-2.25V6.75z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25v7.5l6-3.75-6-3.75z" />
                </svg>
                <div className="text-xs">暂无短片，点击下方按钮触发一次生成</div>
              </div>
            )}
          </div>

          <div className="px-3.5 py-3 border-t border-[var(--line)] bg-white/70 text-[11px]">
            <div className="flex items-center justify-between">
              <div className="text-[var(--text-muted)]">每小时自动从过去一小时随机取图 1 张，生成 AI 漫剧短片</div>
              {latestStatus && (
                <span className={`px-2 py-0.5 rounded-full border font-semibold ${latestStatus.cls}`}>
                  {latestStatus.label}
                </span>
              )}
            </div>
            <div className="mt-2 text-[var(--text-muted)]">
              最近生成时间：{formatDateTime(latest?.createdAt)}，运行中任务：{runningCount}
            </div>
          </div>
        </div>

        {latest && (
          <section className="mt-4 grid grid-cols-2 gap-2.5 text-[11px]">
            <div className="chip rounded-xl px-3 py-2">
              <div className="section-label">Hour Bucket</div>
              <div className="mt-1 text-[var(--text-strong)]">{latest.result?.hourBucket || latest.date || '--'}</div>
            </div>
            <div className="chip rounded-xl px-3 py-2">
              <div className="section-label">Captured At</div>
              <div className="mt-1 text-[var(--text-strong)]">{formatDateTime(latest.result?.selectedImageAt)}</div>
            </div>
          </section>
        )}

        {latestImage && (
          <section className="mt-4">
            <div className="section-label mb-2">Selected Source Photo</div>
            <div className="rounded-2xl overflow-hidden border border-white/70 shadow-sm shadow-black/5">
              <img src={ossProxyUrl(latestImage)} alt="selected source" className="w-full aspect-video object-cover" />
            </div>
          </section>
        )}

        <section className="mt-5">
          <div className="section-label mb-2">Recent Runs</div>
          <div className="space-y-2">
            {isLoading && <div className="chip rounded-xl px-3 py-4 text-center text-xs">加载中...</div>}
            {!isLoading && records.length === 0 && <div className="chip rounded-xl px-3 py-4 text-center text-xs">还没有 Cinema 生成记录。</div>}
            {records.map((record) => {
              const meta = statusMeta(record.status)
              return (
                <div key={record.id} className="chip rounded-xl px-3 py-2.5 border">
                  <div className="flex items-center justify-between">
                    <div className="text-[var(--text-strong)] font-semibold">{record.result?.hourBucket || record.date}</div>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${meta.cls}`}>
                      {meta.label}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-[var(--text-muted)]">
                    触发时间：{formatDateTime(record.createdAt)}
                    {record.status === 'failed' && record.result?.error ? ` · 失败原因：${record.result.error}` : ''}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <button
          onClick={() => triggerMutation.mutate()}
          disabled={triggerMutation.isPending}
          className="mt-6 mb-6 w-full rounded-full py-3.5 bg-[var(--text-strong)] text-white font-semibold shadow-lg shadow-black/15 disabled:opacity-40 transition-all hover:-translate-y-0.5"
        >
          {triggerMutation.isPending ? '触发中...' : '立即生成本小时短片'}
        </button>
      </div>
    </div>
  )
}
