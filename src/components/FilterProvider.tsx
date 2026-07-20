import { useMemo, useState, type ReactNode } from 'react'
import { FilterContext } from '@/lib/filter-context'
import type { EcosystemFilter, TimeRange } from '@/types'

export function FilterProvider({ children }: { children: ReactNode }) {
  const [ecosystem, setEcosystem] = useState<EcosystemFilter>('all')
  const [timeRange, setTimeRange] = useState<TimeRange>('12m')

  const value = useMemo(
    () => ({ ecosystem, timeRange, setEcosystem, setTimeRange }),
    [ecosystem, timeRange],
  )

  return <FilterContext value={value}>{children}</FilterContext>
}
