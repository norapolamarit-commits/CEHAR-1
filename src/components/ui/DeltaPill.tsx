import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { formatDelta } from '@/lib/cehar'

interface DeltaPillProps {
  value: number
  /** ข้อความต่อท้าย เช่น "ใน 12 เดือน" */
  suffix?: string
  className?: string
}

/**
 * ป้ายแสดงการเปลี่ยนแปลงของคะแนน
 * เขียว = ดีขึ้น, แดง = แย่ลง (คะแนนสุขภาพ ยิ่งสูงยิ่งดี)
 */
export function DeltaPill({ value, suffix, className = '' }: DeltaPillProps) {
  const isFlat = Math.abs(value) < 0.05
  const isUp = value > 0

  const tone = isFlat
    ? 'bg-navy/6 text-navy/60'
    : isUp
      ? 'bg-emerald-500/12 text-emerald-700'
      : 'bg-risk-high/10 text-risk-high'

  const Icon = isFlat ? Minus : isUp ? TrendingUp : TrendingDown

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tone} ${className}`}
    >
      <Icon className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
      <span className="tabular">{formatDelta(value)}</span>
      {suffix && <span className="font-normal opacity-75">{suffix}</span>}
    </span>
  )
}
