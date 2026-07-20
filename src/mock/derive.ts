import type {
  CeharPoint,
  EcosystemSummary,
  EcosystemType,
  OverviewStats,
  RestorationRankItem,
  Site,
} from '@/types'
import {
  ECOSYSTEM_LABEL,
  RISK_LABEL_SHORT,
  formatDelta,
  primaryEcosystem,
  round1,
  subIndex,
  toRiskLevel,
} from '@/lib/cehar'

/**
 * ตัวสรุป/จัดอันดับที่คำนวณจาก MOCK_SITES
 *
 * TODO(backend): เมื่อมี backend จริง งานทั้งไฟล์นี้ควรย้ายไปฝั่ง server
 * แล้วให้ frontend เรียก GET /api/overview และ GET /api/restoration-ranking แทน
 * (เหตุผล: ต้องคำนวณจากพื้นที่ทั้งหมด ไม่ควรดึงข้อมูลดิบทุกพื้นที่มาคำนวณที่ browser)
 */

/** ค่าเฉลี่ยแบบไม่ถ่วงน้ำหนัก คืน null เมื่อไม่มีข้อมูล */
function mean(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}

/** ค่าเฉลี่ย CEHAR รายเดือนของกลุ่มพื้นที่ที่ส่งเข้ามา */
export function averageHistory(sites: Site[]): CeharPoint[] {
  if (sites.length === 0) return []
  const template = sites[0].history

  return template.map((point, i) => ({
    label: point.label,
    key: point.key,
    cehar: round1(mean(sites.map((s) => s.history[i].cehar)) ?? 0),
  }))
}

/** สรุปสถานะรายระบบนิเวศทั่วประเทศ */
export function summarizeEcosystems(sites: Site[]): EcosystemSummary[] {
  const ecosystems: EcosystemType[] = ['seagrass', 'mangrove', 'coral']

  return ecosystems.map((ecosystem) => {
    const present = sites.filter((s) => s.ecosystems.includes(ecosystem))
    const values = present
      .map((s) => subIndex(s, ecosystem))
      .filter((v): v is number => v !== null)

    const averageIndex = round1(mean(values) ?? 0)
    const worst = present.reduce((acc, site) => {
      const value = subIndex(site, ecosystem)
      if (value === null) return acc
      if (!acc || value < acc.index) {
        return { siteId: site.id, siteName: site.name, index: value }
      }
      return acc
    }, null as EcosystemSummary['worstSite'] | null)

    return {
      ecosystem,
      averageIndex,
      riskLevel: toRiskLevel(averageIndex),
      siteCount: present.length,
      trend12m: round1(mean(present.map((s) => s.trend12m)) ?? 0),
      worstSite: worst ?? { siteId: '', siteName: '—', index: 0 },
    }
  })
}

/** ตารางลำดับความสำคัญการฟื้นฟู เรียงจากคะแนนมากไปน้อย */
export function buildRestorationRanking(sites: Site[]): RestorationRankItem[] {
  return [...sites]
    .sort((a, b) => b.restorationPriorityScore - a.restorationPriorityScore)
    .map((site, index) => {
      const eco = primaryEcosystem(site)
      return {
        rank: index + 1,
        siteId: site.id,
        siteName: site.name,
        province: site.province,
        cehar: site.cehar,
        riskLevel: site.riskLevel,
        primaryEcosystem: eco,
        restorationPriorityScore: site.restorationPriorityScore,
        rationale: buildRationale(site, eco),
      }
    })
}

function buildRationale(site: Site, eco: EcosystemType): string {
  const worstFactor = site.shap.find((f) => f.contribution < 0)
  const trendText =
    site.trend12m < -3
      ? `ทรุดเร็ว (${formatDelta(site.trend12m)} ใน 12 เดือน)`
      : site.trend12m < 0
        ? `ทรุดช้า ๆ (${formatDelta(site.trend12m)})`
        : `ทรงตัวถึงดีขึ้น (${formatDelta(site.trend12m)})`

  const factorText = worstFactor ? `ปัจจัยฉุดหลัก: ${worstFactor.feature}` : 'ไม่มีปัจจัยลบเด่นชัด'

  return `${ECOSYSTEM_LABEL[eco]}เดือดร้อนที่สุด · ${trendText} · ${factorText} · พื้นที่ ${site.areaKm2} ตร.กม.`
}

/** ข้อมูลทั้งหมดของหน้าภาพรวม */
export function buildOverview(sites: Site[]): OverviewStats {
  const ranking = buildRestorationRanking(sites)
  const top = ranking[0]

  const averageCehar = round1(mean(sites.map((s) => s.cehar)) ?? 0)
  const highRiskCount = sites.filter((s) => s.riskLevel === 'high').length

  return {
    averageCehar,
    highRiskCount,
    monitoredCount: sites.length,
    totalAreaKm2: sites.reduce((sum, s) => sum + s.areaKm2, 0),
    topPriority: top
      ? { siteId: top.siteId, siteName: top.siteName, score: top.restorationPriorityScore }
      : { siteId: '', siteName: '—', score: 0 },
    history: averageHistory(sites),
    byEcosystem: summarizeEcosystems(sites),
    narrative: buildNarrative(sites, averageCehar, highRiskCount),
  }
}

/**
 * ข้อความสรุปภาพรวม — จำลองผลลัพธ์ที่ LLM จะสร้างจากข้อมูลชุดนี้
 *
 * TODO(backend): แทนที่ด้วยคำตอบจริงจาก LLM ผ่าน POST /api/assistant/summary
 * โดยส่ง OverviewStats เป็น context ไปให้โมเดล
 */
function buildNarrative(sites: Site[], averageCehar: number, highRiskCount: number): string {
  const worst = [...sites].sort((a, b) => a.cehar - b.cehar)[0]
  const best = [...sites].sort((a, b) => b.cehar - a.cehar)[0]
  const fastestDecline = [...sites].sort((a, b) => a.trend12m - b.trend12m)[0]
  const declining = sites.filter((s) => s.trend12m < 0).length

  return [
    `ค่าเฉลี่ย CEHAR ของพื้นที่นำร่องทั้ง ${sites.length} แห่งอยู่ที่ ${averageCehar} คะแนน จัดอยู่ในระดับความเสี่ยง${RISK_LABEL_SHORT[toRiskLevel(averageCehar)]}`,
    `มีพื้นที่ความเสี่ยงสูง ${highRiskCount} แห่ง และมี ${declining} แห่งที่คะแนนลดลงเมื่อเทียบกับ 12 เดือนก่อน`,
    `พื้นที่ที่น่ากังวลที่สุดคือ${worst.name} (CEHAR ${worst.cehar}) ส่วน${fastestDecline.name}เป็นพื้นที่ที่ทรุดเร็วที่สุด (${formatDelta(fastestDecline.trend12m)} ใน 12 เดือน)`,
    `ในทางกลับกัน${best.name} (CEHAR ${best.cehar}) ยังรักษาสภาพไว้ได้ดีและใช้เป็นพื้นที่อ้างอิงในการสอบเทียบดัชนีได้`,
  ].join(' ')
}
