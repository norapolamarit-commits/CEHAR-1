/**
 * ชนิดข้อมูลกลางของระบบ CEHAR (Coastal Ecosystem Health Assessment and Restoration)
 *
 * โครงสร้างเหล่านี้คือ "สัญญา" ระหว่าง UI กับ data layer (src/lib/api.ts)
 * เมื่อต่อ backend จริง ให้ backend ตอบกลับด้วยรูปร่างเดียวกันนี้
 * แล้ว UI จะทำงานต่อได้โดยไม่ต้องแก้
 */

/** ระบบนิเวศชายฝั่ง 3 ประเภทที่ระบบประเมิน */
export type EcosystemType = 'seagrass' | 'mangrove' | 'coral'

/** ระดับความเสี่ยง: CEHAR 70–100 = ต่ำ, 40–69 = ปานกลาง, 0–39 = สูง */
export type RiskLevel = 'low' | 'medium' | 'high'

/** ฝั่งทะเล ใช้จัดกลุ่มและกรองพื้นที่ */
export type Coast = 'gulf' | 'andaman'

/**
 * ผลลัพธ์ SHAP ต่อหนึ่งปัจจัย
 * contribution เป็นค่าบวก/ลบ หน่วยเดียวกับคะแนน CEHAR
 * (+ = ดันคะแนนสุขภาพขึ้น, − = ฉุดคะแนนลง)
 */
export interface ShapFeature {
  /** ชื่อปัจจัยภาษาไทย */
  feature: string
  /** ชื่อปัจจัยภาษาอังกฤษ / ตัวย่อทางเทคนิค เช่น SST, Chl-a */
  featureEn: string
  contribution: number
  /** ค่าที่ตรวจวัดได้จริง แสดงเป็นข้อความพร้อมหน่วย เช่น "30.8 °C" */
  observed: string
}

/** จุดข้อมูลหนึ่งเดือนในกราฟแนวโน้ม */
export interface CeharPoint {
  /** ป้ายเดือนแบบไทย เช่น "ก.ค. 68" */
  label: string
  /** คีย์เรียงลำดับ รูปแบบ YYYY-MM */
  key: string
  cehar: number
}

/** พื้นที่นำร่องหนึ่งแห่ง พร้อมผลประเมินทั้งหมด */
export interface Site {
  id: string
  name: string
  province: string
  coast: Coast
  lat: number
  lng: number
  /** ขนาดพื้นที่ประเมิน (ตร.กม.) ใช้ถ่วงน้ำหนักและแสดงผล */
  areaKm2: number
  /** ระบบนิเวศที่พบในพื้นที่นี้ */
  ecosystems: EcosystemType[]

  /** Seagrass Health Index — null ถ้าไม่มีหญ้าทะเลในพื้นที่ */
  shi: number | null
  /** Mangrove Health Index — null ถ้าไม่มีป่าชายเลน */
  mhi: number | null
  /** Coral Health Index — null ถ้าไม่มีแนวปะการัง */
  chi: number | null

  /** ดัชนีรวม 0–100 คำนวณจาก sub-index ที่มี (ดู lib/cehar.ts) */
  cehar: number
  riskLevel: RiskLevel
  /** ส่วนต่าง CEHAR เทียบ 12 เดือนก่อน (+ ดีขึ้น / − แย่ลง) */
  trend12m: number

  shap: ShapFeature[]
  /** ประวัติ CEHAR ย้อนหลัง 12 เดือน เรียงจากเก่า → ใหม่ */
  history: CeharPoint[]

  /** คะแนนลำดับความสำคัญในการฟื้นฟู 0–100 (สูง = ควรทำก่อน) */
  restorationPriorityScore: number

  /** ข้อความสรุปสถานการณ์ (จำลองผลจาก LLM) */
  summary: string
  /** ข้อเสนอแนะเชิงอนุรักษ์ (จำลองผลจาก LLM) */
  recommendations: string[]

  /** วันที่ประมวลผลล่าสุด รูปแบบ ISO */
  lastUpdated: string
}

/** หนึ่งแถวในตารางลำดับความสำคัญการฟื้นฟู */
export interface RestorationRankItem {
  rank: number
  siteId: string
  siteName: string
  province: string
  cehar: number
  riskLevel: RiskLevel
  /** ระบบนิเวศหลักของพื้นที่ (sub-index ต่ำสุด = เดือดร้อนที่สุด) */
  primaryEcosystem: EcosystemType
  restorationPriorityScore: number
  /** เหตุผลสั้น ๆ ว่าทำไมได้อันดับนี้ */
  rationale: string
}

/** ภาพรวมทั้งประเทศ ใช้บนหน้า Overview */
export interface OverviewStats {
  averageCehar: number
  highRiskCount: number
  monitoredCount: number
  totalAreaKm2: number
  /** พื้นที่อันดับ 1 ที่แนะนำให้ฟื้นฟูก่อน */
  topPriority: { siteId: string; siteName: string; score: number }
  /** ค่าเฉลี่ย CEHAR รายเดือนของทุกพื้นที่ */
  history: CeharPoint[]
  /** สรุปแยกรายระบบนิเวศ */
  byEcosystem: EcosystemSummary[]
  /** ข้อความสรุปภาพรวม (จำลองผลจาก LLM) */
  narrative: string
}

export interface EcosystemSummary {
  ecosystem: EcosystemType
  /** ค่าเฉลี่ย sub-index ของระบบนิเวศนี้ทั่วประเทศ */
  averageIndex: number
  riskLevel: RiskLevel
  siteCount: number
  trend12m: number
  /** พื้นที่ที่ระบบนิเวศนี้แย่ที่สุด */
  worstSite: { siteId: string; siteName: string; index: number }
}

/** ข้อความหนึ่งบรรทัดในหน้าผู้ช่วย AI */
export interface AssistantMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  /** ชื่อพื้นที่/แหล่งข้อมูลที่คำตอบนี้อ้างอิง */
  sources?: string[]
}

/* ---------- ตัวกรองระดับแอป ---------- */

export type EcosystemFilter = 'all' | EcosystemType
/** ช่วงเวลาย้อนหลังที่ใช้กับกราฟและค่าเฉลี่ย */
export type TimeRange = '3m' | '6m' | '12m'

export interface Filters {
  ecosystem: EcosystemFilter
  timeRange: TimeRange
}
