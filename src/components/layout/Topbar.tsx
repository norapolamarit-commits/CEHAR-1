import { CalendarRange, Menu } from 'lucide-react'
import { useFilters } from '@/lib/filter-context'
import { ECOSYSTEM_LABEL, TIME_RANGE_LABEL } from '@/lib/cehar'
import type { EcosystemFilter, TimeRange } from '@/types'

const ECOSYSTEM_OPTIONS: Array<{ value: EcosystemFilter; label: string }> = [
  { value: 'all', label: 'ทุกระบบนิเวศ' },
  { value: 'seagrass', label: ECOSYSTEM_LABEL.seagrass },
  { value: 'mangrove', label: ECOSYSTEM_LABEL.mangrove },
  { value: 'coral', label: ECOSYSTEM_LABEL.coral },
]

const TIME_RANGE_OPTIONS: TimeRange[] = ['3m', '6m', '12m']

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { ecosystem, timeRange, setEcosystem, setTimeRange } = useFilters()

  return (
    <header className="sticky top-0 z-20 border-b border-navy/8 bg-mist/85 backdrop-blur">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="เปิดเมนู"
          className="rounded-lg p-2 text-navy/70 transition hover:bg-navy/6 lg:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>

        <div className="mr-auto min-w-0">
          <h1 className="truncate text-sm font-semibold text-navy sm:text-base">
            ระบบสนับสนุนการตัดสินใจประเมินสุขภาพระบบนิเวศชายฝั่ง
          </h1>
          <p className="hidden text-xs text-navy/55 sm:block">
            CEHAR · หญ้าทะเล · ป่าชายเลน · แนวปะการัง
          </p>
        </div>

        {/* ตัวกรองระบบนิเวศ */}
        <div className="flex items-center gap-1 rounded-xl border border-navy/10 bg-white p-1">
          {ECOSYSTEM_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setEcosystem(option.value)}
              aria-pressed={ecosystem === option.value}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                ecosystem === option.value
                  ? 'bg-navy text-white'
                  : 'text-navy/65 hover:bg-navy/6'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* ตัวกรองช่วงเวลา */}
        <label className="flex items-center gap-2 rounded-xl border border-navy/10 bg-white px-3 py-2">
          <CalendarRange className="size-4 text-navy/50" aria-hidden="true" />
          <span className="sr-only">ช่วงเวลา</span>
          <select
            value={timeRange}
            onChange={(event) => setTimeRange(event.target.value as TimeRange)}
            className="bg-transparent text-xs font-medium text-navy outline-none"
          >
            {TIME_RANGE_OPTIONS.map((range) => (
              <option key={range} value={range}>
                {TIME_RANGE_LABEL[range]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  )
}
