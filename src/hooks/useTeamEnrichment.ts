import { useQuery } from '@tanstack/react-query'
import { theSportsDbApi } from '../api/theSportsDbApi'
import type { TsdbTeam } from '../api/theSportsDbApi'

export function useTeamSdbData(teamName: string | undefined): {
  data: TsdbTeam | null | undefined
  isLoading: boolean
} {
  const { data, isLoading } = useQuery({
    queryKey: ['tsdb', 'team', teamName],
    queryFn: async () => {
      const res = await theSportsDbApi.searchTeam(teamName!)
      if (!res.teams?.length) return null
      // Prefer football/soccer teams; among those prefer national teams
      const footballTeams = res.teams.filter(
        t => t.strSport === 'Soccer' || t.strSport === 'Football',
      )
      return footballTeams[0] ?? res.teams[0]
    },
    enabled: !!teamName,
    staleTime: 24 * 60 * 60_000,
    retry: 1,
  })
  return { data: data ?? null, isLoading }
}
