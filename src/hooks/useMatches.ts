import { useQuery } from '@tanstack/react-query'
import { footballApi } from '../api/footballApi'
import type { Match } from '../api/footballApi'
import { qk } from '../api/queryKeys'

export function useMatchDetail(id: number | null) {
  return useQuery({
    queryKey: qk.matchDetail(id!),
    queryFn: () => footballApi.matchDetail(id!),
    enabled: id !== null,
    staleTime: 5 * 60_000,
    retry: 2,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 10_000),
  })
}

function getRefetchInterval(matches: Match[]): number {
  const hasLive = matches.some(m => m.status === 'IN_PLAY' || m.status === 'PAUSED')
  if (hasLive) return 30_000
  const now = Date.now()
  const soonMatch = matches.find(m => {
    const t = new Date(m.utcDate).getTime()
    return m.status === 'SCHEDULED' || m.status === 'TIMED' ? t - now < 2 * 60 * 60 * 1000 && t > now : false
  })
  if (soonMatch) return 5 * 60_000
  return 15 * 60_000
}

export function useMatches() {
  return useQuery({
    queryKey: qk.matches(),
    queryFn: footballApi.matches,
    select: d => d.matches,
    refetchInterval: (query) => {
      const raw = query.state.data as { matches: Match[] } | Match[] | undefined
      if (!raw) return 60_000
      const matches = Array.isArray(raw) ? raw : raw.matches
      return getRefetchInterval(matches)
    },
  })
}

export function useLiveMatches() {
  const { data: matches = [] } = useMatches()
  return matches.filter(m => m.status === 'IN_PLAY' || m.status === 'PAUSED')
}

export function useTodayMatches() {
  const { data: matches = [] } = useMatches()
  const today = new Date().toDateString()
  return matches.filter(m => new Date(m.utcDate).toDateString() === today)
}
