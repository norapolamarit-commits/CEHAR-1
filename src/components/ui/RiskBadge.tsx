import type { RiskLevel } from '@/types'
import { RISK_CHIP, RISK_LABEL, RISK_LABEL_SHORT } from '@/lib/cehar'

interface RiskBadgeProps {
  level: RiskLevel
  /** short = "สูง" · full = "ความเสี่ยงสูง" */
  variant?: 'short' | 'full'
  className?: string
}

/** ชิปสีบอกระดับความเสี่ยง ใช้ซ้ำทั้งตาราง การ์ด และแผงแผนที่ */
export function RiskBadge({ level, variant = 'full', className = '' }: RiskBadgeProps) {
  const text = variant === 'short' ? RISK_LABEL_SHORT[level] : RISK_LABEL[level]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${RISK_CHIP[level]} ${className}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {text}
    </span>
  )
}
