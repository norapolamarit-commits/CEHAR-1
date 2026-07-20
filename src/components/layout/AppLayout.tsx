import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

/** โครงหน้าหลัก: sidebar ซ้าย + top bar + เนื้อหาจาก route ปัจจุบัน */
export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="h-full bg-mist">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* คอลัมน์เนื้อหา: top bar สูงคงที่ + พื้นที่หลักที่เลื่อนได้เอง
          (ทำแบบนี้เพื่อให้หน้าแผนที่ขยายเต็มความสูงที่เหลือได้พอดี) */}
      <div className="flex h-full flex-col lg:pl-64">
        <Topbar onOpenMenu={() => setMenuOpen(true)} />
        <main className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
