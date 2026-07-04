import { useQuery } from '@tanstack/react-query'
import { footballApi, type Scorer } from '../api/footballApi'
import { qk } from '../api/queryKeys'

export function useTeams() {
  return useQuery({
    queryKey: qk.teams(),
    queryFn: footballApi.teams,
    select: d => d.teams,
    staleTime: 10 * 60_000,
  })
}

export function useTeamDetail(id: number | null) {
  return useQuery({
    queryKey: qk.team(id!),
    queryFn: () => footballApi.team(id!),
    enabled: id !== null,
    staleTime: 5 * 60_000,
  })
}

export function useTeamMatches(id: number | null) {
  return useQuery({
    queryKey: qk.teamMatches(id!),
    queryFn: () => footballApi.teamMatches(id!),
    select: d => d.matches,
    enabled: id !== null,
  })
}

export function useScorers() {
  return useQuery({
    queryKey: ['wc', 'scorers'],
    queryFn: footballApi.scorers,
    select: (d: { scorers: Scorer[] }) => d.scorers,
    staleTime: 5 * 60_000,
  })
}
