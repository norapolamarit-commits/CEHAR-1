import { RISK_COLOR } from '@/lib/cehar'

const ITEMS = [
  { level: 'low' as const, label: 'ความเสี่ยงต่ำ', range: 'CEHAR 70–100' },
  { level: 'medium' as const, label: 'ความเสี่ยงปานกลาง', range: 'CEHAR 40–69' },
  { level: 'high' as const, label: 'ความเสี่ยงสูง', range: 'CEHAR 0–39' },
]

/** คำอธิบายสัญลักษณ์บนแผนที่ — วางทับมุมล่างซ้าย */
export function MapLegend() {
  return (
    <div className="pointer-events-none absolute bottom-5 left-3 z-[1000] rounded-xl border border-navy/10 bg-white/95 px-3.5 py-3 shadow-lg shadow-navy/10 backdrop-blur sm:left-5">
      <p className="mb-2 text-xs font-semibold text-navy">ระดับความเสี่ยง</p>
      <ul className="space-y-1.5">
        {ITEMS.map((item) => (
          <li key={item.level} className="flex items-center gap-2 text-xs text-navy/75">
            <span
              className="size-3 shrink-0 rounded-full ring-2 ring-white"
              style={{ backgroundColor: RISK_COLOR[item.level] }}
              aria-hidden="true"
            />
            <span className="font-medium">{item.label}</span>
            <span className="tabular text-navy/45">{item.range}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2.5 border-t border-navy/8 pt-2 text-[11px] leading-tight text-navy/45">
        ขนาดวงกลม = ขนาดพื้นที่ประเมิน
      </p>
    </div>
  )
}
