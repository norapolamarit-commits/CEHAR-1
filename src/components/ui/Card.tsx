import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

/** กล่องพื้นฐานของแดชบอร์ด — ขาว ขอบมน เงาอ่อน */
export function Card({ children, className = '' }: CardProps) {
  return (
    <section
      className={`card-shadow rounded-2xl border border-navy/8 bg-white/95 backdrop-blur-sm ${className}`}
    >
      {children}
    </section>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  /** ปุ่ม/ตัวกรองที่วางชิดขวาของหัวการ์ด */
  action?: ReactNode
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-navy/8 px-5 py-4">
      <div>
        <h2 className="text-base font-semibold text-navy">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-navy/55">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}
