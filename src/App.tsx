import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { FilterProvider } from '@/components/FilterProvider'
import { Landing } from '@/pages/Landing'
import { Overview } from '@/pages/Overview'
import { RiskMapPage } from '@/pages/RiskMapPage'
import { SiteDetail } from '@/pages/SiteDetail'
import { RestorationPriority } from '@/pages/RestorationPriority'
import { Assistant } from '@/pages/Assistant'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ข้อมูลประเมินอัปเดตรายเดือน ไม่จำเป็นต้อง refetch ถี่
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FilterProvider>
        <BrowserRouter>
          <Routes>
            {/* หน้าแรกอยู่นอก AppLayout จึงไม่มี sidebar */}
            <Route path="/" element={<Landing />} />

            <Route element={<AppLayout />}>
              <Route path="/overview" element={<Overview />} />
              <Route path="/map" element={<RiskMapPage />} />
              <Route path="/sites" element={<SiteDetail />} />
              <Route path="/sites/:siteId" element={<SiteDetail />} />
              <Route path="/restoration" element={<RestorationPriority />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FilterProvider>
    </QueryClientProvider>
  )
}
