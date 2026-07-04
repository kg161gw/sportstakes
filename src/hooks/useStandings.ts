import { useQuery } from '@tanstack/react-query'
import { footballApi } from '../api/footballApi'
import { qk } from '../api/queryKeys'

export function useStandings() {
  return useQuery({
    queryKey: qk.standings(),
    queryFn: footballApi.standings,
    select: d => d.standings,
    staleTime: 2 * 60_000,
    refetchInterval: 60_000,
  })
}
