import type { Site } from '@/types'
import {
  ECOSYSTEM_COLOR,
  ECOSYSTEM_INDEX_ABBR,
  ECOSYSTEM_LABEL,
  subIndex,
} from '@/lib/cehar'

/** แถบแสดงดัชนีย่อยรายระบบนิเวศ (SHI / MHI / CHI) ของพื้นที่หนึ่ง */
export function SubIndexBars({ site }: { site: Site }) {
  return (
    <ul className="space-y-2.5">
      {site.ecosystems.map((eco) => {
        const value = subIndex(site, eco)
        if (value === null) return null

        return (
          <li key={eco}>
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="font-medium text-navy/75">
                {ECOSYSTEM_LABEL[eco]}
                <span className="ml-1.5 text-navy/40">{ECOSYSTEM_INDEX_ABBR[eco]}</span>
              </span>
              <span className="tabular font-semibold text-navy">{value.toFixed(0)}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-navy/8">
              <div
                className="h-full rounded-full"
                style={{ width: `${value}%`, backgroundColor: ECOSYSTEM_COLOR[eco] }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
