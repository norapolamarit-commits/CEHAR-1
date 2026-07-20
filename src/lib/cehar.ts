import type {
  EcosystemType,
  RiskLevel,
  Site,
  TimeRange,
} from '@/types'

/**
 * กติกาการคำนวณและป้ายกำกับของดัชนี CEHAR
 *
 * ไฟล์นี้เก็บ "ตรรกะ" ล้วน ๆ ไม่มี React เพื่อให้ backend Python
 * นำสูตรเดียวกันไปใช้ซ้ำได้ และทดสอบแยกได้ง่าย
 */

/* ---------- น้ำหนักของ sub-index ---------- */

/**
 * น้ำหนักตั้งต้นของแต่ละระบบนิเวศเมื่อรวมเป็น CEHAR
 * ถ้าพื้นที่ใดไม่มีระบบนิเวศนั้น จะ normalize น้ำหนักที่เหลือให้รวมเป็น 1
 *
 * TODO(backend): ค่าน้ำหนักชุดนี้ควรมาจาก config ฝั่ง backend
 * เพื่อให้ปรับได้โดยไม่ต้อง build frontend ใหม่
 */
export const ECOSYSTEM_WEIGHTS: Record<EcosystemType, number> = {
  seagrass: 0.35,
  mangrove: 0.35,
  coral: 0.3,
}

/**
 * รวม sub-index (SHI/MHI/CHI) เป็นคะแนน CEHAR เดียว
 * ใช้ค่าเฉลี่ยถ่วงน้ำหนักเฉพาะระบบนิเวศที่มีอยู่จริงในพื้นที่
 */
export function computeCehar(parts: {
  shi: number | null
  mhi: number | null
  chi: number | null
}): number {
  const entries: Array<[EcosystemType, number]> = []
  if (parts.shi !== null) entries.push(['seagrass', parts.shi])
  if (parts.mhi !== null) entries.push(['mangrove', parts.mhi])
  if (parts.chi !== null) entries.push(['coral', parts.chi])

  if (entries.length === 0) return 0

  const totalWeight = entries.reduce((sum, [eco]) => sum + ECOSYSTEM_WEIGHTS[eco], 0)
  const weighted = entries.reduce(
    (sum, [eco, value]) => sum + value * ECOSYSTEM_WEIGHTS[eco],
    0,
  )
  return round1(weighted / totalWeight)
}

/* ---------- ระดับความเสี่ยง ---------- */

/** เกณฑ์: 70–100 = ต่ำ, 40–69 = ปานกลาง, 0–39 = สูง */
export function toRiskLevel(cehar: number): RiskLevel {
  if (cehar >= 70) return 'low'
  if (cehar >= 40) return 'medium'
  return 'high'
}

export const RISK_LABEL: Record<RiskLevel, string> = {
  low: 'ความเสี่ยงต่ำ',
  medium: 'ความเสี่ยงปานกลาง',
  high: 'ความเสี่ยงสูง',
}

export const RISK_LABEL_SHORT: Record<RiskLevel, string> = {
  low: 'ต่ำ',
  medium: 'ปานกลาง',
  high: 'สูง',
}

/** สี HEX ของแต่ละระดับ ใช้กับ Leaflet/Recharts ที่ต้องส่งสีเป็นค่าตรง ๆ */
export const RISK_COLOR: Record<RiskLevel, string> = {
  low: '#1C7293',
  medium: '#D9A441',
  high: '#C0392B',
}

/** คลาส Tailwind สำหรับชิป/แบดจ์ */
export const RISK_CHIP: Record<RiskLevel, string> = {
  low: 'bg-risk-low/12 text-risk-low ring-risk-low/25',
  medium: 'bg-risk-medium/15 text-amber-700 ring-risk-medium/35',
  high: 'bg-risk-high/12 text-risk-high ring-risk-high/25',
}

/* ---------- ระบบนิเวศ ---------- */

export const ECOSYSTEM_LABEL: Record<EcosystemType, string> = {
  seagrass: 'หญ้าทะเล',
  mangrove: 'ป่าชายเลน',
  coral: 'แนวปะการัง',
}

export const ECOSYSTEM_INDEX_KEY: Record<EcosystemType, 'shi' | 'mhi' | 'chi'> = {
  seagrass: 'shi',
  mangrove: 'mhi',
  coral: 'chi',
}

/** ตัวย่อดัชนีรายระบบนิเวศ ใช้แสดงคู่กับตัวเลข */
export const ECOSYSTEM_INDEX_ABBR: Record<EcosystemType, string> = {
  seagrass: 'SHI',
  mangrove: 'MHI',
  coral: 'CHI',
}

export const ECOSYSTEM_COLOR: Record<EcosystemType, string> = {
  seagrass: '#5CA7B4',
  mangrove: '#1B4965',
  coral: '#065A82',
}

/** อ่านค่า sub-index ของระบบนิเวศหนึ่งจาก site */
export function subIndex(site: Site, ecosystem: EcosystemType): number | null {
  return site[ECOSYSTEM_INDEX_KEY[ecosystem]]
}

/** ระบบนิเวศที่ "เดือดร้อนที่สุด" ในพื้นที่ = sub-index ต่ำสุดที่มีอยู่ */
export function primaryEcosystem(site: Site): EcosystemType {
  let worst: EcosystemType = site.ecosystems[0]
  let worstValue = Number.POSITIVE_INFINITY
  for (const eco of site.ecosystems) {
    const value = subIndex(site, eco)
    if (value !== null && value < worstValue) {
      worstValue = value
      worst = eco
    }
  }
  return worst
}

/* ---------- ลำดับความสำคัญการฟื้นฟู ---------- */

/**
 * คะแนนความสำคัญในการฟื้นฟู 0–100
 *
 *   55%  ความรุนแรงของปัญหา       (100 − CEHAR)
 *   25%  อัตราการเสื่อมถอย         (แนวโน้ม 12 เดือนที่ติดลบ)
 *   20%  ขนาดพื้นที่ที่ได้ประโยชน์  (log-scale ของ areaKm2)
 *
 * ตั้งใจให้พื้นที่ "แย่แต่ทรงตัว" ได้คะแนนน้อยกว่าพื้นที่ "แย่และกำลังทรุด"
 * เพราะงบฟื้นฟูควรไปที่จุดที่ยังยับยั้งได้ทัน
 *
 * TODO(backend): ย้ายสูตรนี้ไป backend เมื่อมีข้อมูลต้นทุน/ความเป็นไปได้จริง
 * (feasibility, cost per hectare, สถานะพื้นที่คุ้มครอง)
 */
export function computeRestorationPriority(input: {
  cehar: number
  trend12m: number
  areaKm2: number
}): number {
  const severity = 100 - input.cehar
  const decline = clamp(-input.trend12m, 0, 20) * 5 // −20 คะแนน → 100
  const scale = clamp((Math.log10(input.areaKm2 + 1) / Math.log10(201)) * 100, 0, 100)

  return round1(0.55 * severity + 0.25 * decline + 0.2 * scale)
}

/* ---------- ช่วงเวลา ---------- */

export const TIME_RANGE_LABEL: Record<TimeRange, string> = {
  '3m': '3 เดือนล่าสุด',
  '6m': '6 เดือนล่าสุด',
  '12m': '12 เดือนล่าสุด',
}

export const TIME_RANGE_MONTHS: Record<TimeRange, number> = {
  '3m': 3,
  '6m': 6,
  '12m': 12,
}

/** ตัดประวัติให้เหลือเฉพาะ n เดือนล่าสุดตามช่วงเวลาที่เลือก */
export function sliceHistory<T>(history: T[], range: TimeRange): T[] {
  return history.slice(-TIME_RANGE_MONTHS[range])
}

/* ---------- ตัวช่วยทั่วไป ---------- */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10
}

/** จัดรูปแบบส่วนต่างให้มีเครื่องหมายเสมอ เช่น "+2.4" / "−3.1" */
export function formatDelta(value: number): string {
  const rounded = round1(Math.abs(value))
  if (rounded === 0) return '0.0'
  return `${value > 0 ? '+' : '−'}${rounded.toFixed(1)}`
}

export function formatNumber(value: number, digits = 1): string {
  return value.toLocaleString('th-TH', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

/** วันที่แบบไทย เช่น "19 ก.ค. 2569" */
export function formatThaiDate(iso: string): string {
  return new Date(iso).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
