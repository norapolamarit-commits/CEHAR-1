import type { EcosystemType, Site } from '@/types'
import {
  ECOSYSTEM_INDEX_ABBR,
  ECOSYSTEM_LABEL,
  RISK_LABEL_SHORT,
  formatDelta,
  primaryEcosystem,
  subIndex,
} from '@/lib/cehar'
import { buildRestorationRanking, summarizeEcosystems } from '@/mock/derive'
import { MODEL_BASE_VALUE } from '@/mock/sites'

/**
 * ผู้ช่วย AI แบบ rule-based (จำลอง)
 *
 * ตอบจากข้อมูลใน mock data จริง ๆ ไม่ได้สุ่มข้อความ เพื่อให้คำตอบสอดคล้องกับ
 * ตัวเลขที่แสดงในหน้าอื่น ๆ ของแดชบอร์ด
 *
 * TODO(backend): แทนที่ทั้งไฟล์ด้วยการเรียก POST /api/assistant
 * ซึ่งฝั่ง server จะทำ RAG จากผลประเมินจริงแล้วส่งให้ LLM สรุป
 */

export interface AssistantReply {
  content: string
  sources: string[]
}

/** คำถามตัวอย่างที่แสดงเป็นปุ่มลัดในหน้าแชท */
export const SUGGESTED_PROMPTS = [
  'พื้นที่ไหนเสี่ยงสูงที่สุด',
  'ควรฟื้นฟูที่ไหนก่อน เพราะอะไร',
  'อธิบายคะแนน CEHAR ของเกาะเต่า',
  'สถานการณ์หญ้าทะเลตอนนี้เป็นอย่างไร',
  'CEHAR คำนวณอย่างไร',
]

const ECOSYSTEM_KEYWORDS: Array<{ keys: string[]; ecosystem: EcosystemType }> = [
  { keys: ['หญ้าทะเล', 'seagrass', 'shi'], ecosystem: 'seagrass' },
  { keys: ['ป่าชายเลน', 'โกงกาง', 'mangrove', 'mhi'], ecosystem: 'mangrove' },
  { keys: ['ปะการัง', 'coral', 'chi', 'ฟอกขาว'], ecosystem: 'coral' },
]

/** ตอบคำถามจากข้อมูลพื้นที่ทั้งหมด */
export function answerQuestion(question: string, sites: Site[]): AssistantReply {
  const q = question.toLowerCase().trim()

  // 1) ถามถึงพื้นที่ใดพื้นที่หนึ่งโดยตรง — ตรวจก่อนเพราะเจาะจงที่สุด
  const matchedSite = sites.find(
    (s) => q.includes(s.name.toLowerCase()) || q.includes(s.province.toLowerCase()),
  )
  if (matchedSite) return explainSite(matchedSite)

  // 2) วิธีคำนวณ
  if (hasAny(q, ['คำนวณ', 'สูตร', 'วิธีคิด', 'ระเบียบวิธี', 'methodology', 'cehar คือ', 'ดัชนีคือ'])) {
    return explainMethodology()
  }

  // 3) ลำดับการฟื้นฟู
  if (hasAny(q, ['ฟื้นฟู', 'ลำดับ', 'priority', 'ก่อน', 'งบ'])) {
    return explainRestoration(sites)
  }

  // 4) ความเสี่ยง / พื้นที่แย่ที่สุด
  if (hasAny(q, ['เสี่ยง', 'แย่', 'วิกฤต', 'อันตราย', 'risk', 'worst'])) {
    return explainRisk(sites)
  }

  // 5) แนวโน้ม
  if (hasAny(q, ['แนวโน้ม', 'เทรนด์', 'trend', 'ดีขึ้น', 'แย่ลง', 'เปลี่ยนแปลง'])) {
    return explainTrend(sites)
  }

  // 6) ระบบนิเวศรายประเภท
  const ecosystemMatch = ECOSYSTEM_KEYWORDS.find((entry) => hasAny(q, entry.keys))
  if (ecosystemMatch) return explainEcosystem(ecosystemMatch.ecosystem, sites)

  return fallback(sites)
}

function hasAny(text: string, keywords: string[]): boolean {
  return keywords.some((k) => text.includes(k.toLowerCase()))
}

/* ---------- ตัวสร้างคำตอบแต่ละแบบ ---------- */

function explainSite(site: Site): AssistantReply {
  const top = site.shap.slice(0, 3)
  const parts = site.ecosystems
    .map((eco) => {
      const value = subIndex(site, eco)
      return value === null ? null : `${ECOSYSTEM_INDEX_ABBR[eco]} ${value}`
    })
    .filter(Boolean)
    .join(' · ')

  const factorLines = top
    .map((f) => {
      const sign = f.contribution >= 0 ? 'ดันคะแนนขึ้น' : 'ฉุดคะแนนลง'
      return `• ${f.feature} (${f.observed}) — ${sign} ${Math.abs(f.contribution).toFixed(1)} คะแนน`
    })
    .join('\n')

  return {
    content: [
      `${site.name} จ.${site.province} มีคะแนน CEHAR ${site.cehar} จัดเป็นความเสี่ยง${RISK_LABEL_SHORT[site.riskLevel]}`,
      `ดัชนีย่อย: ${parts} · แนวโน้ม 12 เดือน ${formatDelta(site.trend12m)} คะแนน`,
      '',
      'ปัจจัยที่มีผลมากที่สุด 3 อันดับแรก (จากค่า SHAP):',
      factorLines,
      '',
      `สรุป: ${site.summary}`,
      '',
      `ข้อเสนอแนะอันดับแรก: ${site.recommendations[0]}`,
    ].join('\n'),
    sources: [site.name],
  }
}

function explainRisk(sites: Site[]): AssistantReply {
  const sorted = [...sites].sort((a, b) => a.cehar - b.cehar)
  const highRisk = sorted.filter((s) => s.riskLevel === 'high')
  const lines = sorted
    .slice(0, 4)
    .map(
      (s, i) =>
        `${i + 1}. ${s.name} จ.${s.province} — CEHAR ${s.cehar} (${RISK_LABEL_SHORT[s.riskLevel]}) แนวโน้ม ${formatDelta(s.trend12m)}`,
    )
    .join('\n')

  return {
    content: [
      `ขณะนี้มีพื้นที่ความเสี่ยงสูง ${highRisk.length} แห่งจากทั้งหมด ${sites.length} แห่ง`,
      '',
      'เรียงจากคะแนนต่ำสุด:',
      lines,
      '',
      `พื้นที่ที่ต้องจับตาที่สุดคือ${sorted[0].name} ซึ่งมีปัจจัยฉุดหลักคือ${sorted[0].shap.find((f) => f.contribution < 0)?.feature ?? 'หลายปัจจัยรวมกัน'}`,
    ].join('\n'),
    sources: sorted.slice(0, 4).map((s) => s.name),
  }
}

function explainRestoration(sites: Site[]): AssistantReply {
  const ranking = buildRestorationRanking(sites).slice(0, 3)
  const lines = ranking
    .map((item) => `${item.rank}. ${item.siteName} — คะแนนความสำคัญ ${item.restorationPriorityScore}\n   ${item.rationale}`)
    .join('\n')

  return {
    content: [
      'ลำดับพื้นที่ที่ควรฟื้นฟูก่อน 3 อันดับแรก:',
      '',
      lines,
      '',
      'คะแนนความสำคัญคำนวณจาก ความรุนแรงของปัญหา 55% + อัตราการเสื่อมถอย 25% + ขนาดพื้นที่ที่ได้ประโยชน์ 20%',
      'พื้นที่ที่ "แย่และกำลังทรุด" จะได้ลำดับสูงกว่าพื้นที่ที่ "แย่แต่ทรงตัว" เพราะยังยับยั้งได้ทัน',
    ].join('\n'),
    sources: ranking.map((r) => r.siteName),
  }
}

function explainTrend(sites: Site[]): AssistantReply {
  const declining = [...sites].filter((s) => s.trend12m < 0).sort((a, b) => a.trend12m - b.trend12m)
  const improving = [...sites].filter((s) => s.trend12m >= 0).sort((a, b) => b.trend12m - a.trend12m)

  return {
    content: [
      `ใน 12 เดือนที่ผ่านมา มี ${declining.length} พื้นที่ที่คะแนนลดลง และ ${improving.length} พื้นที่ที่ทรงตัวหรือดีขึ้น`,
      '',
      'ทรุดเร็วที่สุด:',
      declining
        .slice(0, 3)
        .map((s) => `• ${s.name} ${formatDelta(s.trend12m)} คะแนน (ปัจจุบัน ${s.cehar})`)
        .join('\n'),
      '',
      improving.length > 0
        ? `ดีขึ้น: ${improving.map((s) => `${s.name} (${formatDelta(s.trend12m)})`).join(', ')}`
        : 'ยังไม่มีพื้นที่ใดที่คะแนนดีขึ้น',
    ].join('\n'),
    sources: declining.slice(0, 3).map((s) => s.name),
  }
}

function explainEcosystem(ecosystem: EcosystemType, sites: Site[]): AssistantReply {
  const summary = summarizeEcosystems(sites).find((s) => s.ecosystem === ecosystem)
  if (!summary) return fallback(sites)

  const present = sites
    .filter((s) => s.ecosystems.includes(ecosystem))
    .sort((a, b) => (subIndex(a, ecosystem) ?? 0) - (subIndex(b, ecosystem) ?? 0))

  const lines = present
    .map((s) => `• ${s.name} — ${ECOSYSTEM_INDEX_ABBR[ecosystem]} ${subIndex(s, ecosystem)}`)
    .join('\n')

  return {
    content: [
      `${ECOSYSTEM_LABEL[ecosystem]} พบใน ${summary.siteCount} พื้นที่ ค่าเฉลี่ย ${ECOSYSTEM_INDEX_ABBR[ecosystem]} อยู่ที่ ${summary.averageIndex} (ความเสี่ยง${RISK_LABEL_SHORT[summary.riskLevel]})`,
      `แนวโน้มเฉลี่ย 12 เดือน ${formatDelta(summary.trend12m)} คะแนน`,
      '',
      'รายพื้นที่ (เรียงจากแย่ไปดี):',
      lines,
      '',
      `พื้นที่ที่ต้องดูแลก่อนคือ${summary.worstSite.siteName} ซึ่งมีดัชนีเพียง ${summary.worstSite.index}`,
    ].join('\n'),
    sources: present.map((s) => s.name),
  }
}

function explainMethodology(): AssistantReply {
  return {
    content: [
      'CEHAR (Coastal Ecosystem Health Assessment and Restoration) เป็นดัชนี 0–100 ที่รวมสุขภาพของระบบนิเวศชายฝั่ง 3 ประเภทเข้าด้วยกัน',
      '',
      '1) คำนวณดัชนีย่อยของแต่ละระบบนิเวศก่อน — SHI (หญ้าทะเล), MHI (ป่าชายเลน), CHI (แนวปะการัง)',
      '2) รวมเป็น CEHAR ด้วยค่าเฉลี่ยถ่วงน้ำหนัก (หญ้าทะเล 0.35 · ป่าชายเลน 0.35 · ปะการัง 0.30) โดยนับเฉพาะระบบนิเวศที่มีอยู่จริงในพื้นที่นั้น แล้ว normalize น้ำหนักใหม่',
      '3) แปลงเป็นระดับความเสี่ยง: 70–100 = ต่ำ, 40–69 = ปานกลาง, 0–39 = สูง',
      '',
      `ส่วนกราฟ SHAP อธิบายว่าคะแนนของแต่ละพื้นที่ต่างจากค่าฐานของแบบจำลอง (${MODEL_BASE_VALUE} คะแนน) เพราะปัจจัยใดบ้าง ผลรวมของทุกปัจจัยบวกกับค่าฐานจะเท่ากับคะแนน CEHAR ของพื้นที่นั้นพอดี`,
      '',
      'ปัจจัยนำเข้าที่ใช้: อุณหภูมิผิวน้ำทะเล (SST), ความขุ่นของน้ำ, คลอโรฟิลล์-เอ, การเปลี่ยนแปลงแนวชายฝั่ง, การใช้ประโยชน์ที่ดิน (LULC), ความลึกน้ำ, แรงกดดันจากมนุษย์, อัตราการขยายตัวของเมืองในลุ่มน้ำ และอัตราการทรุดตัวของแผ่นดิน',
      '',
      'สองปัจจัยหลังเป็นแรงกดดันจากฝั่งบกที่เชื่อมโยงกัน — เมืองขยายตัวทำให้สูบน้ำบาดาลมากขึ้น แผ่นดินจึงทรุด ระดับน้ำทะเลสัมพัทธ์สูงขึ้น และชายฝั่งถูกกัดเซาะเร็วขึ้นตามมา',
    ].join('\n'),
    sources: ['ระเบียบวิธี CEHAR'],
  }
}

function fallback(sites: Site[]): AssistantReply {
  const worst = [...sites].sort((a, b) => a.cehar - b.cehar)[0]
  const eco = primaryEcosystem(worst)

  return {
    content: [
      'ยังตอบคำถามนี้ไม่ได้ครับ ระบบสาธิตนี้ตอบได้เฉพาะเรื่องที่เกี่ยวกับข้อมูลในแดชบอร์ด',
      '',
      'ลองถามแบบนี้ดูได้:',
      '• พื้นที่ไหนเสี่ยงสูงที่สุด',
      '• ควรฟื้นฟูที่ไหนก่อน',
      `• อธิบายคะแนน CEHAR ของ${worst.name}`,
      `• สถานการณ์${ECOSYSTEM_LABEL[eco]}เป็นอย่างไร`,
      '• CEHAR คำนวณอย่างไร',
    ].join('\n'),
    sources: [],
  }
}
