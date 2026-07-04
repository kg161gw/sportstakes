import { useQuery } from '@tanstack/react-query'
import { footballApi, type Scorer } from '../api/footballApi'
import { qk } from '../api/queryKeys'

export function useTeams() {
  return useQuery({
    queryKey: qk.teams(),
    queryFn: footballApi.teams,
    select: d => d.teams,
    staleTime: 60 * 60_000,   // team list never changes during tournament
    retry: 3,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30_000),
  })
}

export function useTeamDetail(id: number | null) {
  return useQuery({
    queryKey: qk.team(id!),
    queryFn: () => footballApi.team(id!),
    enabled: id !== null,
    staleTime: 30 * 60_000,
    retry: 3,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30_000),
  })
}

export function useTeamMatches(id: number | null) {
  return useQuery({
    queryKey: qk.teamMatches(id!),
    queryFn: () => footballApi.teamMatches(id!),
    select: d => d.matches,
    enabled: id !== null,
    staleTime: 5 * 60_000,
    retry: 3,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30_000),
  })
}

export function useScorers() {
  return useQuery({
    queryKey: ['wc', 'scorers'],
    queryFn: footballApi.scorers,
    select: (d: { scorers: Scorer[] }) => d.scorers,
    staleTime: 10 * 60_000,
    retry: 3,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30_000),
  })
}
