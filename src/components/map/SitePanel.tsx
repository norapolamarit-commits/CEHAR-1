import { ArrowRight, MapPin, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Site, TimeRange } from '@/types'
import { RISK_COLOR, formatThaiDate, sliceHistory } from '@/lib/cehar'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { DeltaPill } from '@/components/ui/DeltaPill'
import { SubIndexBars } from '@/components/ui/SubIndexBars'
import { CeharTrendChart } from '@/components/charts/CeharTrendChart'

interface SitePanelProps {
  site: Site
  timeRange: TimeRange
  onClose: () => void
}

/** แผงรายละเอียดด้านข้างของแผนที่ — เปิดเมื่อคลิกพื้นที่ */
export function SitePanel({ site, timeRange, onClose }: SitePanelProps) {
  return (
    <div className="thin-scroll flex h-full flex-col overflow-y-auto bg-white">
      <header className="sticky top-0 z-10 flex items-start gap-3 border-b border-navy/8 bg-white px-5 py-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-navy">{site.name}</h2>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-navy/55">
            <MapPin className="size-3.5" aria-hidden="true" />
            จ.{site.province} · {site.areaKm2} ตร.กม.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิดแผงรายละเอียด"
          className="rounded-lg p-1.5 text-navy/50 transition hover:bg-navy/6 hover:text-navy"
        >
          <X className="size-4.5" aria-hidden="true" />
        </button>
      </header>

      <div className="space-y-5 px-5 py-5">
        {/* คะแนนรวม */}
        <div
          className="rounded-2xl px-4 py-4"
          style={{ backgroundColor: `${RISK_COLOR[site.riskLevel]}12` }}
        >
          <p className="text-xs font-medium text-navy/60">คะแนน CEHAR</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span
              className="tabular text-4xl font-semibold"
              style={{ color: RISK_COLOR[site.riskLevel] }}
            >
              {site.cehar.toFixed(1)}
            </span>
            <span className="text-sm text-navy/45">/ 100</span>
            <DeltaPill value={site.trend12m} suffix="ใน 12 เดือน" className="ml-auto" />
          </div>
          <div className="mt-3">
            <RiskBadge level={site.riskLevel} />
          </div>
        </div>

        {/* ดัชนีย่อย */}
        <div>
          <h3 className="mb-2.5 text-sm font-semibold text-navy">ดัชนีย่อยรายระบบนิเวศ</h3>
          <SubIndexBars site={site} />
        </div>

        {/* แนวโน้ม */}
        <div>
          <h3 className="mb-1 text-sm font-semibold text-navy">แนวโน้มย้อนหลัง</h3>
          <CeharTrendChart
            data={sliceHistory(site.history, timeRange)}
            height={150}
            showThresholds={false}
            color={RISK_COLOR[site.riskLevel]}
          />
        </div>

        {/* ปัจจัยเด่น */}
        <div>
          <h3 className="mb-2 text-sm font-semibold text-navy">ปัจจัยที่มีผลมากที่สุด</h3>
          <ul className="space-y-1.5">
            {site.shap.slice(0, 3).map((factor) => (
              <li
                key={factor.featureEn}
                className="flex items-center justify-between gap-3 rounded-lg bg-mist px-3 py-2 text-xs"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-navy">{factor.feature}</span>
                  <span className="block truncate text-navy/50">{factor.observed}</span>
                </span>
                <span
                  className="tabular shrink-0 font-semibold"
                  style={{ color: factor.contribution >= 0 ? RISK_COLOR.low : RISK_COLOR.high }}
                >
                  {factor.contribution >= 0 ? '+' : '−'}
                  {Math.abs(factor.contribution).toFixed(1)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          to={`/sites/${site.id}`}
          className="flex items-center justify-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-deep"
        >
          ดูรายละเอียดพื้นที่เต็ม
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>

        <p className="text-center text-[11px] text-navy/40">
          ประมวลผลล่าสุด {formatThaiDate(site.lastUpdated)}
        </p>
      </div>
    </div>
  )
}
