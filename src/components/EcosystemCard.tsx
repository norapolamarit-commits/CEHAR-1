import { Link } from 'react-router-dom'
import type { EcosystemSummary } from '@/types'
import {
  ECOSYSTEM_COLOR,
  ECOSYSTEM_INDEX_ABBR,
  ECOSYSTEM_LABEL,
  RISK_COLOR,
} from '@/lib/cehar'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { DeltaPill } from '@/components/ui/DeltaPill'

/** การ์ดสรุปสถานะของระบบนิเวศหนึ่งประเภททั่วประเทศ */
export function EcosystemCard({ summary }: { summary: EcosystemSummary }) {
  const color = ECOSYSTEM_COLOR[summary.ecosystem]

  return (
    <article className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm shadow-navy/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-navy">{ECOSYSTEM_LABEL[summary.ecosystem]}</h3>
          <p className="text-xs text-navy/50">
            {ECOSYSTEM_INDEX_ABBR[summary.ecosystem]} · {summary.siteCount} พื้นที่
          </p>
        </div>
        <RiskBadge level={summary.riskLevel} variant="short" />
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="tabular text-3xl font-semibold" style={{ color }}>
          {summary.averageIndex.toFixed(1)}
        </span>
        <span className="text-sm text-navy/45">/ 100</span>
        <DeltaPill value={summary.trend12m} className="ml-auto" />
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-navy/8">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${summary.averageIndex}%`, backgroundColor: color }}
        />
      </div>

      <p className="mt-4 border-t border-navy/8 pt-3 text-xs text-navy/60">
        พื้นที่ที่แย่ที่สุด:{' '}
        <Link
          to={`/sites/${summary.worstSite.siteId}`}
          className="font-medium text-navy underline decoration-navy/25 underline-offset-2 hover:decoration-navy"
        >
          {summary.worstSite.siteName}
        </Link>{' '}
        <span className="tabular font-semibold" style={{ color: RISK_COLOR.high }}>
          {summary.worstSite.index.toFixed(0)}
        </span>
      </p>
    </article>
  )
}
