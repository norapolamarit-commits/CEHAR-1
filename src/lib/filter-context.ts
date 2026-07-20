import { createContext, useContext } from 'react'
import type { EcosystemFilter, Filters, TimeRange } from '@/types'

/**
 * ตัวกรองระดับแอป (ระบบนิเวศ + ช่วงเวลา) ที่เลือกจาก top bar
 * ใช้ร่วมกันทุกหน้า เพื่อให้ผู้ใช้เปลี่ยนที่เดียวแล้วมีผลทั้งแดชบอร์ด
 */
export interface FilterContextValue extends Filters {
  setEcosystem: (value: EcosystemFilter) => void
  setTimeRange: (value: TimeRange) => void
}

export const FilterContext = createContext<FilterContextValue | null>(null)

export function useFilters(): FilterContextValue {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilters ต้องถูกเรียกภายใน <FilterProvider>')
  }
  return context
}
