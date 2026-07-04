import { useQuery } from '@tanstack/react-query'
import { theSportsDbApi } from '../api/theSportsDbApi'
import type { TsdbTeam } from '../api/theSportsDbApi'

function pickNationalTeam(teams: TsdbTeam[], searchName: string): TsdbTeam | null {
  const footballTeams = teams.filter(t => t.strSport === 'Soccer' || t.strSport === 'Football')
  if (!footballTeams.length) return teams[0] ?? null

  const needle = searchName.toLowerCase().trim()

  // 1. Exact case-insensitive name match
  const exact = footballTeams.find(t => t.strTeam.toLowerCase() === needle)
  if (exact) return exact

  // 2. Prefer "International" league over club leagues (national teams use this)
  const international = footballTeams.find(
    t => t.strLeague?.toLowerCase().includes('international') ||
         t.strLeague?.toLowerCase().includes('national'),
  )
  if (international) return international

  // 3. Prefer teams where strTeam starts with the search name (not "New England Revolution")
  const startsWith = footballTeams.find(t => t.strTeam.toLowerCase().startsWith(needle))
  if (startsWith) return startsWith

  return footballTeams[0]
}

export function useTeamSdbData(teamName: string | undefined): {
  data: TsdbTeam | null | undefined
  isLoading: boolean
} {
  const { data, isLoading } = useQuery({
    queryKey: ['tsdb', 'team', teamName],
    queryFn: async () => {
      const res = await theSportsDbApi.searchTeam(teamName!)
      if (!res.teams?.length) return null
      return pickNationalTeam(res.teams, teamName!)
    },
    enabled: !!teamName,
    staleTime: 7 * 24 * 60 * 60_000, // 7 days — team profiles don't change
    retry: 1,
  })
  return { data: data ?? null, isLoading }
}
