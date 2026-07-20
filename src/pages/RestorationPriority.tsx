import { Link } from 'react-router-dom'
import { Info } from 'lucide-react'
import { useFilters } from '@/lib/filter-context'
import { useRestorationRanking } from '@/lib/queries'
import { ECOSYSTEM_COLOR, ECOSYSTEM_LABEL, RISK_COLOR } from '@/lib/cehar'
import { Card, CardHeader } from '@/components/ui/Card'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StateViews'

export function RestorationPriority() {
  const { ecosystem } = useFilters()
  const rankingQuery = useRestorationRanking(ecosystem)

  if (rankingQuery.isPending) return <LoadingState />
  if (rankingQuery.isError) {
    return <ErrorState error={rankingQuery.error} onRetry={() => void rankingQuery.refetch()} />
  }

  const ranking = rankingQuery.data
  const maxScore = Math.max(...ranking.map((item) => item.restorationPriorityScore), 1)

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">ลำดับความสำคัญการฟื้นฟู</h1>
        <p className="mt-1 text-sm text-navy/60">
          จัดอันดับพื้นที่ที่ควรได้รับการฟื้นฟูก่อน จากความรุนแรงของปัญหา อัตราการเสื่อมถอย และขนาดพื้นที่ที่ได้ประโยชน์
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-teal/25 bg-teal/8 px-4 py-3.5 text-sm text-navy/75">
        <Info className="mt-0.5 size-4.5 shrink-0 text-teal" aria-hidden="true" />
        <p className="leading-relaxed">
          <strong className="font-semibold">วิธีคิดคะแนน:</strong> ความรุนแรงของปัญหา (100 − CEHAR) 55% + อัตราการเสื่อมถอยใน 12 เดือน 25% + ขนาดพื้นที่ที่ได้ประโยชน์ 20%
          <br />
          พื้นที่ที่ “แย่และกำลังทรุด” จะได้ลำดับสูงกว่าพื้นที่ที่ “แย่แต่ทรงตัว” เพราะยังยับยั้งความเสียหายได้ทัน
        </p>
      </div>

      <Card>
        <CardHeader
          title={`ตารางจัดอันดับ ${ranking.length} พื้นที่`}
          subtitle={ecosystem === 'all' ? 'ทุกระบบนิเวศ' : `เฉพาะพื้นที่ที่มี${ECOSYSTEM_LABEL[ecosystem]}`}
        />

        {ranking.length === 0 ? (
          <EmptyState message="ไม่พบพื้นที่ที่ตรงกับตัวกรองที่เลือก" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-3xl border-collapse text-sm">
              <thead>
                <tr className="border-b border-navy/8 text-left text-xs font-semibold text-navy/55">
                  <th scope="col" className="px-5 py-3">อันดับ</th>
                  <th scope="col" className="px-3 py-3">พื้นที่</th>
                  <th scope="col" className="px-3 py-3 text-right">CEHAR</th>
                  <th scope="col" className="px-3 py-3">ระดับความเสี่ยง</th>
                  <th scope="col" className="px-3 py-3">ระบบนิเวศหลัก</th>
                  <th scope="col" className="px-5 py-3">คะแนนความสำคัญ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/6">
                {ranking.map((item) => (
                  <tr key={item.siteId} className="align-top transition hover:bg-mist">
                    <td className="px-5 py-4">
                      <span
                        className="tabular grid size-8 place-items-center rounded-full text-sm font-semibold"
                        style={{
                          backgroundColor: `${RISK_COLOR[item.riskLevel]}18`,
                          color: RISK_COLOR[item.riskLevel],
                        }}
                      >
                        {item.rank}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <Link
                        to={`/sites/${item.siteId}`}
                        className="font-medium text-navy underline decoration-navy/20 underline-offset-2 hover:decoration-navy"
                      >
                        {item.siteName}
                      </Link>
                      <p className="text-xs text-navy/50">จ.{item.province}</p>
                      <p className="mt-1 max-w-md text-xs leading-relaxed text-navy/55">
                        {item.rationale}
                      </p>
                    </td>

                    <td className="tabular px-3 py-4 text-right font-semibold text-navy">
                      {item.cehar.toFixed(1)}
                    </td>

                    <td className="px-3 py-4">
                      <RiskBadge level={item.riskLevel} variant="short" />
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className="inline-block rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap text-white"
                        style={{ backgroundColor: ECOSYSTEM_COLOR[item.primaryEcosystem] }}
                      >
                        {ECOSYSTEM_LABEL[item.primaryEcosystem]}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-2 w-24 shrink-0 overflow-hidden rounded-full bg-navy/8">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(item.restorationPriorityScore / maxScore) * 100}%`,
                              backgroundColor: RISK_COLOR[item.riskLevel],
                            }}
                          />
                        </div>
                        <span className="tabular font-semibold text-navy">
                          {item.restorationPriorityScore.toFixed(1)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
