import { useQuery } from '@tanstack/react-query'
import type { EcosystemFilter } from '@/types'
import {
  getOverview,
  getRestorationRanking,
  getSiteById,
  getSites,
} from '@/lib/api'

/**
 * React Query hooks — ห่อ data-access layer อีกชั้นหนึ่ง
 * component ไม่ต้องรู้ว่าข้อมูลมาจาก mock หรือ API จริง
 */

export const queryKeys = {
  sites: (ecosystem: EcosystemFilter) => ['sites', ecosystem] as const,
  site: (id: string) => ['site', id] as const,
  overview: (ecosystem: EcosystemFilter) => ['overview', ecosystem] as const,
  ranking: (ecosystem: EcosystemFilter) => ['restoration-ranking', ecosystem] as const,
}

export function useSites(ecosystem: EcosystemFilter = 'all') {
  return useQuery({
    queryKey: queryKeys.sites(ecosystem),
    queryFn: () => getSites(ecosystem),
  })
}

export function useSite(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.site(id ?? ''),
    queryFn: () => getSiteById(id as string),
    enabled: Boolean(id),
  })
}

export function useOverview(ecosystem: EcosystemFilter = 'all') {
  return useQuery({
    queryKey: queryKeys.overview(ecosystem),
    queryFn: () => getOverview(ecosystem),
  })
}

export function useRestorationRanking(ecosystem: EcosystemFilter = 'all') {
  return useQuery({
    queryKey: queryKeys.ranking(ecosystem),
    queryFn: () => getRestorationRanking(ecosystem),
  })
}
