import type {
  AssistantMessage,
  EcosystemFilter,
  OverviewStats,
  RestorationRankItem,
  Site,
} from '@/types'
import { MOCK_SITES } from '@/mock/sites'
import { buildOverview, buildRestorationRanking } from '@/mock/derive'
import { answerQuestion } from '@/mock/assistant'

/**
 * ═══════════════════════════════════════════════════════════════
 *  DATA ACCESS LAYER — จุดเดียวที่ UI ติดต่อกับข้อมูล
 * ═══════════════════════════════════════════════════════════════
 *
 * ตอนนี้คืนค่าจาก mock data แต่โครงพร้อมสลับไป backend จริงแล้ว
 *
 * ▸ วิธีสลับไปใช้ API จริง:
 *     1. สร้างไฟล์ .env.local ที่ราก project
 *     2. ใส่บรรทัด  VITE_API_BASE_URL=http://localhost:8000
 *     3. รีสตาร์ต dev server
 *   เท่านี้ทุกฟังก์ชันด้านล่างจะเปลี่ยนไปเรียก fetch() แทน mock อัตโนมัติ
 *   โดยไม่ต้องแก้โค้ดใน component ใด ๆ เลย
 *
 * ▸ Endpoint ที่ backend ต้องมี (ดูรูปร่างข้อมูลที่ src/types/index.ts):
 *     GET  /api/sites?ecosystem=              → Site[]
 *     GET  /api/sites/{id}                    → Site
 *     GET  /api/overview?ecosystem=           → OverviewStats
 *     GET  /api/restoration-ranking?ecosystem=→ RestorationRankItem[]
 *     POST /api/assistant                     → { content: string, sources: string[] }
 *
 *   พารามิเตอร์ ecosystem รับค่า all | seagrass | mangrove | coral
 *   ความหมาย: "แสดงเฉพาะพื้นที่ที่มีระบบนิเวศนั้นอยู่" (ไม่ใช่เปลี่ยนวิธีคิดคะแนน)
 */

/** ตั้งค่าใน .env.local — ถ้าเว้นว่างไว้ ระบบจะใช้ mock data */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

/** true เมื่อยังไม่ได้ตั้งค่า backend */
export const USING_MOCK_DATA = API_BASE_URL === ''

/** หน่วงเวลาเล็กน้อยเพื่อให้เห็น loading state ตอนใช้ mock */
const MOCK_LATENCY_MS = 350

function delay<T>(value: T, ms = MOCK_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })

  if (!response.ok) {
    throw new ApiError(`เรียก ${path} ไม่สำเร็จ (HTTP ${response.status})`, response.status)
  }

  return (await response.json()) as T
}

/** กรองพื้นที่ตามระบบนิเวศ — ใช้เฉพาะโหมด mock (ของจริง backend กรองให้) */
function filterByEcosystem(sites: Site[], ecosystem: EcosystemFilter): Site[] {
  if (ecosystem === 'all') return sites
  return sites.filter((site) => site.ecosystems.includes(ecosystem))
}

function ecosystemQuery(ecosystem: EcosystemFilter): string {
  return ecosystem === 'all' ? '' : `?ecosystem=${ecosystem}`
}

/* ═══════════════ ฟังก์ชันที่ UI เรียกใช้ ═══════════════ */

/** พื้นที่นำร่องทั้งหมด (กรองตามระบบนิเวศได้) */
export async function getSites(ecosystem: EcosystemFilter = 'all'): Promise<Site[]> {
  if (USING_MOCK_DATA) return delay(filterByEcosystem(MOCK_SITES, ecosystem))
  return request<Site[]>(`/api/sites${ecosystemQuery(ecosystem)}`)
}

/** พื้นที่เดียวตาม id — throw ApiError(404) เมื่อไม่พบ */
export async function getSiteById(id: string): Promise<Site> {
  if (USING_MOCK_DATA) {
    const site = MOCK_SITES.find((s) => s.id === id)
    if (!site) throw new ApiError(`ไม่พบพื้นที่รหัส "${id}"`, 404)
    return delay(site)
  }
  return request<Site>(`/api/sites/${encodeURIComponent(id)}`)
}

/** สถิติภาพรวมสำหรับหน้าแรก */
export async function getOverview(ecosystem: EcosystemFilter = 'all'): Promise<OverviewStats> {
  if (USING_MOCK_DATA) return delay(buildOverview(filterByEcosystem(MOCK_SITES, ecosystem)))
  return request<OverviewStats>(`/api/overview${ecosystemQuery(ecosystem)}`)
}

/** ตารางลำดับความสำคัญการฟื้นฟู */
export async function getRestorationRanking(
  ecosystem: EcosystemFilter = 'all',
): Promise<RestorationRankItem[]> {
  if (USING_MOCK_DATA) {
    return delay(buildRestorationRanking(filterByEcosystem(MOCK_SITES, ecosystem)))
  }
  return request<RestorationRankItem[]>(`/api/restoration-ranking${ecosystemQuery(ecosystem)}`)
}

/** ถามผู้ช่วย AI */
export async function askAssistant(question: string): Promise<AssistantMessage> {
  if (USING_MOCK_DATA) {
    const reply = answerQuestion(question, MOCK_SITES)
    // หน่วงนานกว่าปกติเล็กน้อยให้เหมือนกำลัง "คิด"
    return delay(
      {
        id: makeMessageId(),
        role: 'assistant' as const,
        content: reply.content,
        sources: reply.sources,
      },
      700,
    )
  }

  const reply = await request<{ content: string; sources?: string[] }>('/api/assistant', {
    method: 'POST',
    body: JSON.stringify({ question }),
  })

  return {
    id: makeMessageId(),
    role: 'assistant',
    content: reply.content,
    sources: reply.sources ?? [],
  }
}

/** id สำหรับข้อความในแชท (ใช้เป็น React key เท่านั้น) */
export function makeMessageId(): string {
  return `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
