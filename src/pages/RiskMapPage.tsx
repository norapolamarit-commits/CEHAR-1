import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFilters } from '@/lib/filter-context'
import { useSites } from '@/lib/queries'
import { ECOSYSTEM_LABEL, TIME_RANGE_LABEL } from '@/lib/cehar'
import { RiskMap } from '@/components/map/RiskMap'
import { MapLegend } from '@/components/map/MapLegend'
import { SitePanel } from '@/components/map/SitePanel'
import { ErrorState, LoadingState } from '@/components/ui/StateViews'

/**
 * หน้าแผนที่ความเสี่ยง
 * เก็บพื้นที่ที่เลือกไว้ใน query string (?site=) เพื่อให้ส่งลิงก์ต่อได้
 */
export function RiskMapPage() {
  const { ecosystem, timeRange } = useFilters()
  const sitesQuery = useSites(ecosystem)
  const [searchParams, setSearchParams] = useSearchParams()
  const [panelOpen, setPanelOpen] = useState(true)

  const selectedId = searchParams.get('site')

  const selectSite = (siteId: string) => {
    setSearchParams({ site: siteId }, { replace: true })
    setPanelOpen(true)
  }

  const closePanel = () => {
    setPanelOpen(false)
    searchParams.delete('site')
    setSearchParams(searchParams, { replace: true })
  }

  if (sitesQuery.isPending) return <LoadingState label="กำลังโหลดแผนที่…" />
  if (sitesQuery.isError) {
    return <ErrorState error={sitesQuery.error} onRetry={() => void sitesQuery.refetch()} />
  }

  const sites = sitesQuery.data
  const selectedSite = sites.find((site) => site.id === selectedId) ?? null
  const showPanel = Boolean(selectedSite) && panelOpen

  return (
    <div className="relative flex h-full">
      {/* แผนที่ */}
      <div className="relative min-w-0 flex-1">
        <RiskMap sites={sites} selectedId={selectedId} onSelect={selectSite} />

        {/* แถบสรุปตัวกรองที่ใช้อยู่ */}
        <div className="pointer-events-none absolute top-3 left-3 z-[1000] rounded-xl border border-navy/10 bg-white/95 px-3.5 py-2.5 shadow-lg shadow-navy/10 backdrop-blur sm:left-5">
          <p className="text-xs font-semibold text-navy">
            {ecosystem === 'all' ? 'ทุกระบบนิเวศ' : ECOSYSTEM_LABEL[ecosystem]}
            <span className="ml-1.5 font-normal text-navy/50">· {sites.length} พื้นที่</span>
          </p>
          <p className="mt-0.5 text-[11px] text-navy/50">{TIME_RANGE_LABEL[timeRange]}</p>
          {!selectedSite && (
            <p className="mt-1.5 border-t border-navy/8 pt-1.5 text-[11px] text-teal">
              คลิกที่วงกลมเพื่อดูรายละเอียด
            </p>
          )}
        </div>

        <MapLegend />
      </div>

      {/* แผงรายละเอียด — ซ้อนทับบนจอเล็ก, เป็นคอลัมน์บนจอใหญ่ */}
      {showPanel && selectedSite && (
        <div className="absolute inset-y-0 right-0 z-[1100] w-full max-w-sm border-l border-navy/10 shadow-2xl shadow-navy/20 lg:static lg:z-0 lg:w-96 lg:max-w-none lg:shadow-none">
          <SitePanel site={selectedSite} timeRange={timeRange} onClose={closePanel} />
        </div>
      )}
    </div>
  )
}
