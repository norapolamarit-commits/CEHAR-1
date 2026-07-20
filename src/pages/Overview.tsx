import { Link } from 'react-router-dom'
import { Activity, ArrowRight, ShieldAlert, Sprout, Waves } from 'lucide-react'
import { useFilters } from '@/lib/filter-context'
import { useOverview, useSites } from '@/lib/queries'
import { ECOSYSTEM_LABEL, TIME_RANGE_LABEL, sliceHistory } from '@/lib/cehar'
import { Card, CardHeader } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { DeltaPill } from '@/components/ui/DeltaPill'
import { ErrorState, LoadingState } from '@/components/ui/StateViews'
import { CeharTrendChart } from '@/components/charts/CeharTrendChart'
import { EcosystemCard } from '@/components/EcosystemCard'
import { LlmSummary } from '@/components/LlmSummary'

export function Overview() {
  const { ecosystem, timeRange } = useFilters()
  const overviewQuery = useOverview(ecosystem)
  const sitesQuery = useSites(ecosystem)

  if (overviewQuery.isPending || sitesQuery.isPending) {
    return <LoadingState />
  }

  if (overviewQuery.isError || sitesQuery.isError) {
    return (
      <ErrorState
        error={overviewQuery.error ?? sitesQuery.error}
        onRetry={() => {
          void overviewQuery.refetch()
          void sitesQuery.refetch()
        }}
      />
    )
  }

  const overview = overviewQuery.data
  const sites = sitesQuery.data

  // พื้นที่ที่ต้องจับตา = คะแนนต่ำสุด 4 อันดับแรก
  const watchlist = [...sites].sort((a, b) => a.cehar - b.cehar).slice(0, 4)

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {ecosystem !== 'all' && (
        <p className="rounded-xl border border-teal/25 bg-teal/8 px-4 py-2.5 text-sm text-navy/75">
          กำลังแสดงเฉพาะพื้นที่ที่มี<strong className="font-semibold">{ECOSYSTEM_LABEL[ecosystem]}</strong> ({sites.length} แห่ง)
          — คะแนน CEHAR ที่แสดงยังเป็นคะแนนรวมของทุกระบบนิเวศในพื้นที่นั้น
        </p>
      )}

      {/* ---------- KPI ---------- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="CEHAR เฉลี่ยทุกพื้นที่"
          value={overview.averageCehar.toFixed(1)}
          unit="/ 100"
          hint={`จาก ${overview.monitoredCount} พื้นที่นำร่อง`}
          icon={Activity}
          accent="#1C7293"
        />
        <KpiCard
          label="พื้นที่ความเสี่ยงสูง"
          value={overview.highRiskCount}
          unit="แห่ง"
          hint="คะแนน CEHAR ต่ำกว่า 40"
          icon={ShieldAlert}
          accent="#C0392B"
          to="/map"
        />
        <KpiCard
          label="พื้นที่ที่ติดตาม"
          value={overview.monitoredCount}
          unit="แห่ง"
          hint={`รวม ${overview.totalAreaKm2.toLocaleString('th-TH')} ตร.กม.`}
          icon={Waves}
          accent="#065A82"
          to="/map"
        />
        {/* ใช้คะแนนเป็นตัวเด่นเหมือนการ์ดอื่น ชื่อพื้นที่ลงไปอยู่บรรทัดรอง
            เพื่อให้ทั้งแถวมีจังหวะการอ่านเดียวกัน */}
        <KpiCard
          label="ควรฟื้นฟูก่อน"
          value={overview.topPriority.score.toFixed(1)}
          unit="คะแนน"
          hint={`อันดับ 1 · ${overview.topPriority.siteName}`}
          icon={Sprout}
          accent="#D9A441"
          to="/restoration"
        />
      </div>

      {/* ---------- แนวโน้ม + พื้นที่ที่ต้องจับตา ---------- */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="แนวโน้มคะแนน CEHAR เฉลี่ย"
            subtitle={`ค่าเฉลี่ยของพื้นที่ทั้งหมด · ${TIME_RANGE_LABEL[timeRange]}`}
          />
          <div className="px-3 py-4 sm:px-4">
            <CeharTrendChart data={sliceHistory(overview.history, timeRange)} height={330} />
          </div>
        </Card>

        <Card>
          <CardHeader title="พื้นที่ที่ต้องจับตา" subtitle="เรียงจากคะแนนต่ำสุด" />
          <ul className="divide-y divide-navy/6">
            {watchlist.map((site) => (
              <li key={site.id}>
                <Link
                  to={`/sites/${site.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-mist"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-navy">{site.name}</p>
                    <p className="mt-0.5 flex items-center gap-2">
                      <RiskBadge level={site.riskLevel} variant="short" />
                      <DeltaPill value={site.trend12m} />
                    </p>
                  </div>
                  <span className="tabular text-lg font-semibold text-navy">
                    {site.cehar.toFixed(1)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-navy/8 px-5 py-3">
            <Link
              to="/restoration"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-teal hover:text-deep"
            >
              ดูลำดับการฟื้นฟูทั้งหมด
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </Card>
      </div>

      {/* ---------- สรุปรายระบบนิเวศ ---------- */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-navy/70">สุขภาพแยกตามระบบนิเวศ</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {overview.byEcosystem
            .filter((summary) => summary.siteCount > 0)
            .map((summary) => (
              <EcosystemCard key={summary.ecosystem} summary={summary} />
            ))}
        </div>
      </section>

      {/* ---------- สรุปโดย AI ---------- */}
      <LlmSummary>{overview.narrative}</LlmSummary>
    </div>
  )
}
