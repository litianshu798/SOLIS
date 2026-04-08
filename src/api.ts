const BASE = '/api'
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImVzcDMyX2NhbSIsInN1YiI6MiwiaWF0IjoxNzc1NjM1ODI2LCJleHAiOjE3NzYyNDA2MjZ9.jEzSOY3e7f3PsfnXwXt8gnvE4SWOH7Yvpv_hpbkAOSk'
const USER_ID = 2

const headers = () => ({
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
})

// ===== Storage =====

export interface OSSObject {
  name: string
  url: string
  lastModified: string
  size: number
}

export interface FileList {
  success: boolean
  prefixes: string[]
  objects: OSSObject[]
}

export async function listFiles(date: string): Promise<FileList> {
  const prefix = `user/${USER_ID}/${date}/`
  const res = await fetch(`${BASE}/storage/list?prefix=${encodeURIComponent(prefix)}`, {
    headers: headers(),
  })
  return res.json()
}

// Classify OSS objects
export function classifyFiles(objects: OSSObject[]) {
  const images: OSSObject[] = []
  const audios: OSSObject[] = []
  for (const obj of objects || []) {
    if (obj.name.includes('-images-') || obj.name.endsWith('.jpg') || obj.name.endsWith('.png')) {
      images.push(obj)
    } else if (obj.name.includes('-audios-') || obj.name.endsWith('.wav') || obj.name.endsWith('.mp3')) {
      audios.push(obj)
    }
  }
  // Sort by name (contains timestamp)
  images.sort((a, b) => a.name.localeCompare(b.name))
  audios.sort((a, b) => a.name.localeCompare(b.name))
  return { images, audios }
}

// Extract timestamp from filename like "1775637789998-images-cap_1755631.jpg"
export function extractTime(name: string): string {
  const parts = name.split('/')
  const filename = parts[parts.length - 1]
  const match = filename.match(/^(\d+)-/)
  if (match) {
    const ts = parseInt(match[1])
    const d = new Date(ts)
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return ''
}

// Get file URL via OSS signing proxy
export function getFileUrl(obj: OSSObject): string {
  return `/oss/${obj.name}`
}

// ===== Records / Clips =====

export interface ClipResult {
  summary: string
  clips: Array<{
    timeSegment: string
    description: string
    suggestedStoryboard: string
  }>
  audioTranscriptions: Array<{
    timestamp: string
    text: string
  }>
  images: Array<{
    path: string
    timestamp: string
  }>
}

export interface Clip {
  id: number
  userId: number
  date: string
  status: 'processing' | 'completed' | 'failed'
  result: ClipResult | null
  createdAt: string
}

export async function generateClip(date: string): Promise<Clip> {
  const res = await fetch(`${BASE}/record/generate`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ date }),
  })
  return res.json()
}

export async function getMyRecords(): Promise<any[]> {
  const res = await fetch(`${BASE}/record/my-records`, {
    headers: headers(),
  })
  return res.json()
}

// ===== Chat with Memory Assistant =====

export interface ChatRequest {
  question: string
  date?: string
  context?: string
}

export interface ChatResponse {
  question: string
  answer: string
  sources?: Array<{
    type: 'image' | 'audio' | 'memory'
    url?: string
    timestamp: string
  }>
}

export async function chatWithMemory(question: string, context?: string, date?: string): Promise<string> {
  const req: ChatRequest = {
    question,
    date: date || todayStr(),
    context,
  }

  const res = await fetch(`${BASE}/memory/chat`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(req),
  })

  if (!res.ok) {
    throw new Error(`Chat API error: ${res.statusText}`)
  }

  const data: ChatResponse = await res.json()
  return data.answer
}

// ===== Helpers =====

export function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })
}

export function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
