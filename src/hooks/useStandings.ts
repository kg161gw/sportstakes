import { useQuery } from '@tanstack/react-query'
import { footballApi } from '../api/footballApi'
import { qk } from '../api/queryKeys'

export function useStandings() {
  return useQuery({
    queryKey: qk.standings(),
    queryFn: footballApi.standings,
    select: d => d.standings,
    staleTime: 10 * 60_000,   // standings don't change mid-match
    refetchInterval: 15 * 60_000,
    retry: 3,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30_000),
  })
}
