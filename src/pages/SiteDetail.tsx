import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Map as MapIcon, MapPin } from 'lucide-react'
import { useFilters } from '@/lib/filter-context'
import { useSite, useSites } from '@/lib/queries'
import {
  ECOSYSTEM_COLOR,
  ECOSYSTEM_LABEL,
  RISK_COLOR,
  TIME_RANGE_LABEL,
  formatThaiDate,
  sliceHistory,
} from '@/lib/cehar'
import { MODEL_BASE_VALUE } from '@/mock/sites'
import { Card, CardHeader } from '@/components/ui/Card'
import { Gauge } from '@/components/ui/Gauge'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { DeltaPill } from '@/components/ui/DeltaPill'
import { SubIndexBars } from '@/components/ui/SubIndexBars'
import { ErrorState, LoadingState } from '@/components/ui/StateViews'
import { CeharTrendChart } from '@/components/charts/CeharTrendChart'
import { ShapChart } from '@/components/charts/ShapChart'
import { LlmSummary } from '@/components/LlmSummary'

export function SiteDetail() {
  const { siteId } = useParams<{ siteId: string }>()
  const navigate = useNavigate()
  const { timeRange } = useFilters()

  // รายชื่อพื้นที่ทั้งหมดใช้กับ dropdown สลับพื้นที่ (ไม่ผูกกับตัวกรองระบบนิเวศ
  // เพราะผู้ใช้ควรเปิดดูพื้นที่ไหนก็ได้จากหน้านี้)
  const sitesQuery = useSites('all')
  const siteQuery = useSite(siteId)

  // เข้ามาที่ /sites เฉย ๆ ให้เด้งไปพื้นที่แรกโดยอัตโนมัติ
  useEffect(() => {
    if (!siteId && sitesQuery.data?.length) {
      navigate(`/sites/${sitesQuery.data[0].id}`, { replace: true })
    }
  }, [siteId, sitesQuery.data, navigate])

  if (siteQuery.isPending || sitesQuery.isPending) return <LoadingState />
  if (siteQuery.isError) {
    return <ErrorState error={siteQuery.error} onRetry={() => void siteQuery.refetch()} />
  }

  const site = siteQuery.data
  const history = sliceHistory(site.history, timeRange)
  const positives = site.shap.filter((f) => f.contribution > 0)
  const negatives = site.shap.filter((f) => f.contribution < 0)

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* ---------- หัวหน้า ---------- */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">{site.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-navy/55">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4" aria-hidden="true" />
              จ.{site.province}
            </span>
            <span>{site.areaKm2} ตร.กม.</span>
            <span className="tabular">
              {site.lat.toFixed(3)}°N, {site.lng.toFixed(3)}°E
            </span>
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {site.ecosystems.map((eco) => (
              <li
                key={eco}
                className="rounded-full px-2.5 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: ECOSYSTEM_COLOR[eco] }}
              >
                {ECOSYSTEM_LABEL[eco]}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-xl border border-navy/10 bg-white px-3 py-2 text-sm">
            <span className="text-navy/55">พื้นที่</span>
            <select
              value={site.id}
              onChange={(event) => navigate(`/sites/${event.target.value}`)}
              className="bg-transparent font-medium text-navy outline-none"
            >
              {sitesQuery.data?.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <Link
            to={`/map?site=${site.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-navy px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-deep"
          >
            <MapIcon className="size-4" aria-hidden="true" />
            ดูบนแผนที่
          </Link>
        </div>
      </div>

      {/* ---------- คะแนน + SHAP ---------- */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="คะแนนสุขภาพรวม" subtitle="Coastal Ecosystem Health Assessment and Restoration" />
          <div className="flex flex-col items-center px-5 py-5">
            <Gauge value={site.cehar} level={site.riskLevel} />

            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <RiskBadge level={site.riskLevel} />
              <DeltaPill value={site.trend12m} suffix="ใน 12 เดือน" />
            </div>

            <div className="mt-5 w-full border-t border-navy/8 pt-4">
              <h3 className="mb-2.5 text-sm font-semibold text-navy">ดัชนีย่อย</h3>
              <SubIndexBars site={site} />
            </div>

            <p className="mt-4 w-full border-t border-navy/8 pt-3 text-xs text-navy/45">
              ประมวลผลล่าสุด {formatThaiDate(site.lastUpdated)}
            </p>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="ปัจจัยที่ส่งผลต่อคะแนน (SHAP)"
            subtitle={`ค่าฐานของแบบจำลอง ${MODEL_BASE_VALUE} คะแนน + ผลรวมทุกปัจจัย = ${site.cehar.toFixed(1)}`}
          />
          <div className="px-2 py-4 sm:px-4">
            <ShapChart data={site.shap} height={410} />
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 border-t border-navy/8 px-5 py-3 text-xs text-navy/60">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ backgroundColor: RISK_COLOR.low }} />
              ดันคะแนนขึ้น ({positives.length} ปัจจัย)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ backgroundColor: RISK_COLOR.high }} />
              ฉุดคะแนนลง ({negatives.length} ปัจจัย)
            </span>
            <span className="text-navy/40">ชี้ที่แท่งเพื่อดูค่าที่ตรวจวัดได้</span>
          </div>
        </Card>
      </div>

      {/* ---------- แนวโน้ม ---------- */}
      <Card>
        <CardHeader
          title="แนวโน้มคะแนนของพื้นที่นี้"
          subtitle={TIME_RANGE_LABEL[timeRange]}
        />
        <div className="px-3 py-4 sm:px-4">
          <CeharTrendChart data={history} height={260} color={RISK_COLOR[site.riskLevel]} />
        </div>
      </Card>

      {/* ---------- สรุป + ข้อเสนอแนะ ---------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <LlmSummary title="คำอธิบายสถานการณ์">{site.summary}</LlmSummary>

        <Card>
          <CardHeader title="ข้อเสนอแนะเชิงอนุรักษ์" subtitle="เรียงตามลำดับความเร่งด่วน" />
          <ol className="space-y-3 px-5 py-4">
            {site.recommendations.map((item, index) => (
              <li key={item} className="flex gap-3">
                <span className="tabular mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-teal/12 text-xs font-semibold text-teal">
                  {index + 1}
                </span>
                <p className="text-sm leading-relaxed text-navy/80">{item}</p>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  )
}
