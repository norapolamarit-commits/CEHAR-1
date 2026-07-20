import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Map as MapIcon, Waves } from 'lucide-react'
import { useOverview } from '@/lib/queries'
import { USING_MOCK_DATA } from '@/lib/api'
import {
  ECOSYSTEM_COLOR,
  ECOSYSTEM_INDEX_ABBR,
  ECOSYSTEM_LABEL,
  RISK_COLOR,
  RISK_LABEL_SHORT,
  toRiskLevel,
} from '@/lib/cehar'
import { CoastalArtwork } from '@/components/landing/CoastalArtwork'

/**
 * หน้าแรก (landing) — อยู่นอก AppLayout จึงไม่มี sidebar
 * ตัวเลขบนการ์ดขวามือดึงจาก data layer ตัวเดียวกับแดชบอร์ด ไม่ได้ hard-code
 */
/**
 * ภาพประกอบฝั่งซ้าย: ใช้ไฟล์ public/hero.png ถ้ามี ถ้าไม่มีจะถอยไปใช้ภาพ SVG ที่วาดในโค้ด
 * (วางไฟล์ชื่อนี้ลงโฟลเดอร์ public/ แล้วรีเฟรช ก็เปลี่ยนภาพได้เลยโดยไม่ต้องแก้โค้ด)
 */
const HERO_IMAGE = '/hero.png'

export function Landing() {
  const { data: overview, isPending } = useOverview('all')
  const [heroImageMissing, setHeroImageMissing] = useState(false)

  return (
    <div className="relative min-h-dvh bg-[#050a14] text-white">
      {/* ใช้ dvh เพื่อให้คอลัมน์ภาพยืดเต็มจอเสมอ แม้เนื้อหาฝั่งขวาจะสั้นกว่า */}
      <div className="grid min-h-dvh lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)]">
        {/* ---------- ภาพประกอบฝั่งซ้าย ---------- */}
        <div className="relative hidden overflow-hidden lg:block">
          {heroImageMissing ? (
            <CoastalArtwork />
          ) : (
            <img
              src={HERO_IMAGE}
              alt="ภาพประกอบระบบ: ดาวเทียมและเรือสำรวจเก็บข้อมูลระบบนิเวศชายฝั่ง"
              className="size-full object-cover"
              onError={() => setHeroImageMissing(true)}
            />
          )}

          {/* ไล่เฉดขอบขวาให้ภาพกลืนกับพื้นหลังของหน้า ไม่ว่าจะใช้ไฟล์รูปหรือ SVG */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-36 bg-gradient-to-r from-transparent to-[#050a14]"
            aria-hidden="true"
          />
        </div>

        {/* ---------- เนื้อหาฝั่งขวา ---------- */}
        <div className="relative flex items-center overflow-hidden">
          {/* แถบเรืองแสงจาง ๆ เป็นฉากหลัง */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              backgroundImage:
                'radial-gradient(55rem 40rem at 10% 0%, rgba(14,116,180,0.20), transparent 62%), radial-gradient(40rem 40rem at 95% 100%, rgba(34,211,238,0.10), transparent 60%)',
            }}
          />

          {/* แถบตั้งจาง ๆ ต่อจากขอบภาพ — ตามภาพอ้างอิง */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-56 bg-gradient-to-r from-sky-500/10 via-sky-500/4 to-transparent lg:block"
            aria-hidden="true"
          />

          {/* การ์ดย้ายลงล่างช่วง 1024–1279px เพื่อไม่ให้คอลัมน์หัวเรื่องแคบจนปุ่มตกบรรทัด */}
          <div className="relative grid w-full items-center gap-8 px-6 py-12 sm:px-10 lg:px-12 lg:py-14 xl:grid-cols-[minmax(0,1fr)_17rem] xl:px-16">
            {/* หัวเรื่อง + ปุ่ม */}
            <div className="max-w-2xl">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-400/35 bg-sky-400/10 px-3.5 py-1.5">
                <Waves className="size-3.5 text-sky-400" aria-hidden="true" />
                <span className="text-xs font-medium text-white/55">
                  GeoAI Decision Support System
                </span>
              </p>

              {/* ตัวย่อเป็นตัวเด่น ชื่อเต็มลดลงมาเป็นบรรทัดรอง —
                  ชื่อเต็มตัวพิมพ์ใหญ่ 5 บรรทัดอ่านยากและกินพื้นที่เกินจำเป็น */}
              <h1>
                <span className="block text-5xl leading-none font-bold tracking-tight sm:text-6xl xl:text-7xl">
                  CEHAR
                </span>
                <span className="mt-4 block max-w-lg text-sm leading-relaxed font-medium text-sky-300/90 sm:text-[0.95rem]">
                  AI-Based Coastal Ecosystem Health Assessment and Restoration Prioritization
                  System Using Satellite Imagery and Geospatial Data
                </span>
              </h1>

              <div className="mt-7 border-l-[3px] border-sky-400 pl-5">
                <p className="leading-relaxed text-white/70">
                  ระบบสนับสนุนการตัดสินใจด้วยปัญญาประดิษฐ์ เพื่อประเมินสุขภาพระบบนิเวศชายฝั่งของไทย
                  <br />
                  หญ้าทะเล · ป่าชายเลน · แนวปะการัง
                  <br />
                  จากข้อมูลดาวเทียมและข้อมูลสมุทรศาสตร์
                </p>
              </div>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  to="/overview"
                  className="group inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-3.5 text-center text-sm font-bold text-[#03101c] transition hover:brightness-110"
                >
                  เข้าสู่แดชบอร์ด
                  <ArrowRight
                    className="size-4 transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
                <Link
                  to="/map"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/[0.06] px-6 py-3.5 text-center text-sm font-bold text-white transition hover:border-sky-400/60 hover:bg-white/12"
                >
                  <MapIcon className="size-4" aria-hidden="true" />
                  ดูแผนที่ความเสี่ยง
                </Link>
              </div>

              {USING_MOCK_DATA && (
                <p className="mt-7 text-xs text-white/35">
                  ต้นแบบสำหรับ GeoHackathon · ตัวเลขทั้งหมดยังเป็นข้อมูลจำลอง ยังไม่ใช่ผลประเมินจริง
                </p>
              )}
            </div>

            {/* การ์ดสรุปฝั่งขวาสุด */}
            <div className="space-y-4">
              <StatusCard overview={overview} isPending={isPending} />
              <EcosystemsCard overview={overview} isPending={isPending} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type OverviewData = ReturnType<typeof useOverview>['data']

/**
 * สีระบบนิเวศเวอร์ชันสว่างขึ้น — สีป่าชายเลนของธีมหลัก (navy) มืดเกินกว่าจะเห็นบนพื้นดำ
 */
const ECOSYSTEM_COLOR_ON_DARK: Record<keyof typeof ECOSYSTEM_COLOR, string> = {
  ...ECOSYSTEM_COLOR,
  mangrove: '#4a89ab',
}

/** การ์ดที่ 1 — ตัวเลขสรุปล่าสุด */
function StatusCard({ overview, isPending }: { overview: OverviewData; isPending: boolean }) {
  const level = overview ? toRiskLevel(overview.averageCehar) : null

  return (
    <article className="rounded-2xl border border-white/12 bg-white/[0.045] p-5 backdrop-blur">
      <h2 className="text-xs font-semibold tracking-wide text-white/50 uppercase">สถานะล่าสุด</h2>

      {isPending || !overview ? (
        <div className="mt-4 space-y-3" aria-hidden="true">
          <div className="h-10 w-28 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-full animate-pulse rounded bg-white/8" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-white/8" />
        </div>
      ) : (
        <>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="tabular text-4xl font-semibold text-sky-300">
              {overview.averageCehar.toFixed(1)}
            </span>
            <span className="text-sm text-white/45">/ 100</span>
          </p>
          <p className="mt-1 text-xs text-white/55">
            CEHAR เฉลี่ยของพื้นที่นำร่อง {overview.monitoredCount} แห่ง
            {level && (
              <span className="ml-1.5" style={{ color: RISK_COLOR[level] }}>
                · ความเสี่ยง{RISK_LABEL_SHORT[level]}
              </span>
            )}
          </p>

          <dl className="mt-5 space-y-2.5 border-t border-white/10 pt-4 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-white/55">พื้นที่ความเสี่ยงสูง</dt>
              <dd className="tabular font-semibold" style={{ color: RISK_COLOR.high }}>
                {overview.highRiskCount} แห่ง
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-white/55">พื้นที่ที่ติดตาม</dt>
              <dd className="tabular font-semibold text-white">
                {overview.totalAreaKm2.toLocaleString('th-TH')} ตร.กม.
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="shrink-0 text-white/55">ควรฟื้นฟูก่อน</dt>
              <dd className="truncate font-semibold text-white">{overview.topPriority.siteName}</dd>
            </div>
          </dl>
        </>
      )}
    </article>
  )
}

/** การ์ดที่ 2 — สุขภาพแยกรายระบบนิเวศ */
function EcosystemsCard({ overview, isPending }: { overview: OverviewData; isPending: boolean }) {
  return (
    <article className="rounded-2xl border border-white/12 bg-white/[0.045] p-5 backdrop-blur">
      <h2 className="text-xs font-semibold tracking-wide text-white/50 uppercase">
        ระบบนิเวศที่ประเมิน
      </h2>

      {isPending || !overview ? (
        <div className="mt-4 space-y-4" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
              <div className="h-1.5 w-full animate-pulse rounded-full bg-white/8" />
            </div>
          ))}
        </div>
      ) : (
        <ul className="mt-4 space-y-3.5">
          {overview.byEcosystem.map((summary) => (
            <li key={summary.ecosystem}>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="text-white/75">
                  {ECOSYSTEM_LABEL[summary.ecosystem]}
                  <span className="ml-1.5 text-xs text-white/35">
                    {ECOSYSTEM_INDEX_ABBR[summary.ecosystem]}
                  </span>
                </span>
                <span className="tabular font-semibold text-white">
                  {summary.averageIndex.toFixed(1)}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${summary.averageIndex}%`,
                    backgroundColor: ECOSYSTEM_COLOR_ON_DARK[summary.ecosystem],
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link
        to="/restoration"
        className="mt-5 inline-flex items-center gap-1.5 border-t border-white/10 pt-4 text-xs font-medium text-sky-300 transition hover:text-white"
      >
        ดูลำดับพื้นที่ที่ควรฟื้นฟูก่อน
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </article>
  )
}
