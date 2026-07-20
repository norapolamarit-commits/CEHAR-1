import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface KpiCardProps {
  label: string
  value: ReactNode
  unit?: string
  hint?: string
  icon: LucideIcon
  /** สีเน้นของการ์ด (ค่า HEX เพราะต้องใช้กับ inline style) */
  accent?: string
  /** ถ้าใส่ การ์ดทั้งใบจะกลายเป็นลิงก์ */
  to?: string
}

/** การ์ดตัวเลขสรุปด้านบนหน้าภาพรวม */
export function KpiCard({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  accent = '#1C7293',
  to,
}: KpiCardProps) {
  const body = (
    <>
      {/* แถบสีบางบนสุด บอกหมวดของตัวเลขโดยไม่ต้องใช้พื้นที่ */}
      <span
        className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accent}33)` }}
        aria-hidden="true"
      />
      {/* แสงจาง ๆ หลังไอคอน ให้การ์ดมีมิติ ไม่แบน */}
      <span
        className="pointer-events-none absolute -top-8 -right-8 size-32 rounded-full opacity-60 blur-2xl"
        style={{ backgroundColor: `${accent}24` }}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-navy/60">{label}</p>
        <span
          className="grid size-10 shrink-0 place-items-center rounded-xl"
          style={{
            backgroundColor: `${accent}17`,
            color: accent,
            boxShadow: `inset 0 0 0 1px ${accent}33`,
          }}
        >
          <Icon className="size-5" strokeWidth={2} aria-hidden="true" />
        </span>
      </div>

      <p className="relative mt-3.5 flex items-baseline gap-1.5">
        <span className="tabular text-[2.5rem] leading-none font-semibold tracking-tight text-navy">
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-navy/50">{unit}</span>}
      </p>

      {hint && <p className="relative mt-2 text-xs leading-relaxed text-navy/50">{hint}</p>}
    </>
  )

  const base =
    'card-shadow relative block overflow-hidden rounded-2xl border border-navy/8 bg-white/95 p-5'

  if (to) {
    return (
      <Link to={to} className={`${base} card-lift hover:border-teal/35`}>
        {body}
      </Link>
    )
  }

  return <div className={base}>{body}</div>
}
