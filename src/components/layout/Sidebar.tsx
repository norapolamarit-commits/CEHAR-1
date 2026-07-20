import { Link, NavLink } from 'react-router-dom'
import {
  BotMessageSquare,
  LayoutDashboard,
  ListOrdered,
  Map,
  Waves,
  X,
} from 'lucide-react'
import { USING_MOCK_DATA } from '@/lib/api'

const NAV_ITEMS = [
  { to: '/overview', label: 'ภาพรวม', icon: LayoutDashboard, end: true },
  { to: '/map', label: 'แผนที่ความเสี่ยง', icon: Map, end: false },
  { to: '/sites', label: 'รายละเอียดพื้นที่', icon: Waves, end: false },
  { to: '/restoration', label: 'ลำดับการฟื้นฟู', icon: ListOrdered, end: false },
  { to: '/assistant', label: 'ผู้ช่วย AI', icon: BotMessageSquare, end: false },
]

interface SidebarProps {
  /** เปิดอยู่หรือไม่ (ใช้เฉพาะจอเล็ก) */
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* ฉากหลังทึบตอนเปิดเมนูบนจอเล็ก */}
      {open && (
        <button
          type="button"
          aria-label="ปิดเมนู"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-navy/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy text-white transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        // ไล่เฉดเข้มลงด้านล่าง ให้ sidebar ไม่เป็นบล็อกสีเดียวแบน ๆ
        style={{ backgroundImage: 'linear-gradient(180deg, #1b4965 0%, #17405a 55%, #12344b 100%)' }}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          {/* คลิกโลโก้เพื่อกลับหน้าแรก */}
          <Link to="/" onClick={onClose} className="group flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 transition group-hover:bg-white/15">
              <Waves className="size-5 text-seafoam" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold">CEHAR Dashboard</span>
              <span className="block truncate text-xs text-white/55">GeoAI ระบบนิเวศชายฝั่ง</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดเมนู"
            className="ml-auto rounded-lg p-1.5 text-white/70 hover:bg-white/10 lg:hidden"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-xl py-2.5 pr-3 pl-4 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white/12 text-white shadow-sm shadow-black/20'
                    : 'text-white/60 hover:bg-white/6 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* ขีดสีฟ้าด้านซ้าย บอกหน้าที่เปิดอยู่ให้เห็นชัดกว่าพื้นหลังจาง ๆ */}
                  {isActive && (
                    <span
                      className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-seafoam"
                      aria-hidden="true"
                    />
                  )}
                  <Icon
                    className={`size-4.5 shrink-0 ${isActive ? 'text-seafoam' : ''}`}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          {USING_MOCK_DATA && (
            <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-risk-medium/20 px-2.5 py-1 text-xs font-medium text-amber-200">
              <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
              ข้อมูลจำลอง (mock)
            </p>
          )}
          <p className="text-xs leading-relaxed text-white/45">
            ต้นแบบสำหรับ GeoHackathon
            <br />
            ตัวเลขทั้งหมดยังไม่ใช่ผลประเมินจริง
          </p>
        </div>
      </aside>
    </>
  )
}
