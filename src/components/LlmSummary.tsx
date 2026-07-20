import { Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

interface LlmSummaryProps {
  title?: string
  children: ReactNode
}

/**
 * กล่องข้อความสรุปภาษาธรรมชาติ
 *
 * ติดป้ายกำกับชัดเจนว่าเป็นข้อความที่ระบบสร้าง เพื่อไม่ให้ผู้ใช้เข้าใจผิดว่า
 * เป็นความเห็นของผู้เชี่ยวชาญ
 *
 * TODO(backend): เปลี่ยนเนื้อหาเป็นคำตอบจริงจาก LLM ผ่าน /api/assistant/summary
 */
export function LlmSummary({ title = 'สรุปสถานการณ์โดยระบบ', children }: LlmSummaryProps) {
  return (
    <div className="rounded-2xl border border-seafoam/35 bg-gradient-to-br from-seafoam/12 to-teal/6 p-5">
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <span className="grid size-7 place-items-center rounded-lg bg-teal/15 text-teal">
          <Sparkles className="size-4" aria-hidden="true" />
        </span>
        <h2 className="text-sm font-semibold text-navy">{title}</h2>
        <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-medium text-navy/55">
          ข้อความสร้างโดย AI · ยังเป็นผลจำลอง
        </span>
      </div>
      <div className="text-sm leading-relaxed text-navy/80">{children}</div>
    </div>
  )
}
