import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  classifyFiles,
  getCinemaRecords,
  getFileUrl,
  listFiles,
  todayStr,
  triggerCinemaHourly,
  triggerCinemaManual,
  type CinemaRecord,
  type OSSObject,
} from '../api'

const FALLBACK_VIDEO_URLS = [
  '/fallback-videos/cinema-fallback-1.mp4',
  '/fallback-videos/cinema-fallback-2.mp4',
]

type PlayableVideoItem = {
  id: string
  url: string
  createdAt: string
  hourBucket: string
}

const FALLBACK_PLAYABLES: PlayableVideoItem[] = [
  {
    id: 'fallback-1',
    url: FALLBACK_VIDEO_URLS[0],
    createdAt: '',
    hourBucket: '预置片段 1',
  },
  {
    id: 'fallback-2',
    url: FALLBACK_VIDEO_URLS[1],
    createdAt: '',
    hourBucket: '预置片段 2',
  },
]

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

function isPlayableVideoUrl(value?: string) {
  if (!value) return false
  const v = value.trim()
  return v.startsWith('http://') || v.startsWith('https://') || v.startsWith('/')
}

function resolvePlayableVideoUrl(record?: CinemaRecord) {
  if (!record) return ''
  const fromResult = String(record.result?.videoUrl || '').trim()
  if (isPlayableVideoUrl(fromResult)) return fromResult
  const fromContent = String(record.content || '').trim()
  if (isPlayableVideoUrl(fromContent)) return fromContent
  return ''
}

export default function VideoTab() {
  const queryClient = useQueryClient()
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [activePlayableId, setActivePlayableId] = useState<string>('')

  const { data: records = [] } = useQuery({
    queryKey: ['cinema-records'],
    queryFn: () => getCinemaRecords(12),
    refetchInterval: (query) => {
      const data = query.state.data as CinemaRecord[] | undefined
      const hasRunning = !!data?.some((item) => item.status === 'processing' || item.status === 'generating')
      return hasRunning ? 8000 : 30000
    },
  })

  const { data: fileData } = useQuery({
    queryKey: ['cinema-manual-images', todayStr()],
    queryFn: () => listFiles(todayStr()),
  })

  const { images } = fileData ? classifyFiles(fileData.objects) : { images: [] as OSSObject[] }

  useEffect(() => {
    if (!selectedImage && images.length > 0) {
      setSelectedImage(images[images.length - 1].name)
    }
  }, [images, selectedImage])

  const latest = records[0]
  const generatedPlayableVideos = useMemo(
    () =>
      records
        .map((item) => ({
          id: item.id,
          url: resolvePlayableVideoUrl(item),
          createdAt: item.createdAt,
          hourBucket: item.result?.hourBucket || item.date || '--',
        }))
        .filter((item) => Boolean(item.url)),
    [records],
  )

  const playableVideos = useMemo(
    () => [...generatedPlayableVideos, ...FALLBACK_PLAYABLES],
    [generatedPlayableVideos],
  )

  useEffect(() => {
    if (playableVideos.length === 0) {
      setActivePlayableId('')
      return
    }
    const stillExists = playableVideos.some((item) => item.id === activePlayableId)
    if (!stillExists) {
      setActivePlayableId(playableVideos[0].id)
    }
  }, [playableVideos, activePlayableId])

  const activePlayable =
    playableVideos.find((item) => item.id === activePlayableId) || playableVideos[0] || null
  const latestVideo = activePlayable?.url || ''
  const showingFallback = generatedPlayableVideos.length === 0
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

  const manualMutation = useMutation({
    mutationFn: (imagePath: string) => triggerCinemaManual(imagePath),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cinema-records'] })
    },
  })

  const selectedImageObj = images.find((item) => item.name === selectedImage)

  return (
    <div className="h-full flex flex-col">
      <header className="shrink-0 px-4 md:px-6 py-3.5 border-b border-[var(--line)] bg-white/55 backdrop-blur-sm">
        <div className="section-label">Cinema Hourly</div>
        <div className="mt-1.5 flex items-center justify-between">
          <h2 className="font-serif text-[1.7rem] md:text-[2rem] leading-none text-[var(--text-strong)]">Anime Reel</h2>
          <div className="chip rounded-full px-3.5 py-2 text-[13px] font-bold">{records.length} records</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
        <div className="surface-panel-strong rounded-2xl overflow-hidden">
          <div className="aspect-video bg-[rgba(32,24,16,0.08)] relative">
            {latestVideo ? (
              <video src={latestVideo} controls className="w-full h-full object-cover bg-black" />
            ) : (
              <div className="absolute inset-0 grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                {FALLBACK_VIDEO_URLS.map((src, idx) => (
                  <video
                    key={src}
                    src={src}
                    controls
                    preload="metadata"
                    className="w-full h-full object-cover bg-black rounded-xl"
                    aria-label={`fallback-cinema-video-${idx + 1}`}
                  />
                ))}
                {(latest?.status === 'processing' || latest?.status === 'generating') && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center pointer-events-none">
                    <div className="w-11 h-11 rounded-full border-2 border-[rgba(109,88,67,0.22)] border-t-[var(--accent)] animate-spin" />
                    <div className="mt-3 text-base font-semibold text-[var(--text-strong)]">正在生成 AI 漫剧短片...</div>
                    <div className="mt-2 text-[13px] text-[var(--text-muted)]">当前展示预置视频，任务完成后将自动切换</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-4 py-3.5 border-t border-[var(--line)] bg-white/70 text-[13px]">
            <div className="flex items-center justify-between">
              <div className="text-[var(--text-muted)]">每小时自动从过去一小时随机取图 1 张，生成 AI 漫剧短片</div>
              {latestStatus && (
                <span className={`px-2 py-0.5 rounded-full border font-semibold ${latestStatus.cls}`}>
                  {latestStatus.label}
                </span>
              )}
            </div>
            <div className="mt-2 text-[var(--text-muted)]">
              {showingFallback
                ? '当前暂无可用生成视频，正在展示预置短片。'
                : `最近生成时间：${formatDateTime(activePlayable?.createdAt)}，运行中任务：${runningCount}`}
            </div>
          </div>
        </div>

        {latest && (
          <section className="mt-4 grid grid-cols-2 gap-2.5 text-[13px]">
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

        {playableVideos.length > 0 && (
          <section className="mt-5">
            <div className="section-label mb-2">当前可播放视频（{playableVideos.length}）</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                {playableVideos.map((item) => {
                  const active = item.id === activePlayable?.id
                  return (
                  <button
                    key={item.id}
                    onClick={() => setActivePlayableId(item.id)}
                    className={`text-left rounded-xl overflow-hidden border transition-all ${active ? 'border-[var(--accent)] ring-2 ring-[rgba(200,122,55,0.25)]' : 'border-white/70'}`}
                  >
                    <video src={item.url} preload="metadata" className="w-full aspect-video object-cover bg-black" />
                    <div className="px-2.5 py-2 text-[12px] text-[var(--text-muted)] font-semibold">
                      {item.createdAt ? `${formatDateTime(item.createdAt)} · ` : ''}
                      {item.hourBucket}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        <section className="mt-5">
          <div className="section-label mb-2">Manual Pick</div>
          {images.length === 0 ? (
            <div className="chip rounded-xl px-3 py-4 text-center text-[13px] font-semibold">今天还没有可选图片。</div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-6 gap-2">
                {images.slice(-16).reverse().map((img) => {
                  const active = selectedImage === img.name
                  return (
                    <button
                      key={img.name}
                      onClick={() => setSelectedImage(img.name)}
                      className={`relative rounded-xl overflow-hidden border transition-all ${active ? 'border-[var(--accent)] ring-2 ring-[rgba(200,122,55,0.25)]' : 'border-white/70'}`}
                    >
                      <img
                        src={getFileUrl(img)}
                        alt="candidate"
                        loading="lazy"
                        className="w-full aspect-square object-cover"
                      />
                      {active && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[10px] flex items-center justify-center">
                          ✓
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="mt-2 text-[13px] text-[var(--text-muted)]">
                当前已选：{selectedImageObj ? selectedImageObj.name.split('/').pop() : '--'}
              </div>
            </>
          )}
        </section>

        <div className="mt-6 mb-6 space-y-2">
          <button
            onClick={() => selectedImage && manualMutation.mutate(selectedImage)}
            disabled={manualMutation.isPending || !selectedImage}
            className="cta-btn"
          >
            {manualMutation.isPending ? '手动生成中...' : '用选中图片生成短片'}
          </button>
          <button
            onClick={() => triggerMutation.mutate()}
            disabled={triggerMutation.isPending}
            className="cta-btn-secondary"
          >
            {triggerMutation.isPending ? '触发中...' : '随机触发本小时短片'}
          </button>
        </div>
      </div>
    </div>
  )
}
