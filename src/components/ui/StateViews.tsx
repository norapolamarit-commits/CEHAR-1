import { AlertTriangle, Loader2 } from 'lucide-react'

/** สถานะกำลังโหลดข้อมูล */
export function LoadingState({ label = 'กำลังโหลดข้อมูล…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-16 text-navy/55">
      <Loader2 className="size-5 animate-spin" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

/** สถานะโหลดข้อมูลไม่สำเร็จ */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'

  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <AlertTriangle className="size-7 text-risk-high" aria-hidden="true" />
      <div>
        <p className="font-medium text-navy">โหลดข้อมูลไม่สำเร็จ</p>
        <p className="mt-1 text-sm text-navy/60">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white transition hover:bg-deep"
        >
          ลองใหม่อีกครั้ง
        </button>
      )}
    </div>
  )
}

/** สถานะไม่มีข้อมูลตรงกับตัวกรอง */
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-16 text-center text-sm text-navy/55">
      <p>{message}</p>
    </div>
  )
}
