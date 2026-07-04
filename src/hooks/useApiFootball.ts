import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiFootballApi, afAvailable } from '../api/apiFootballApi'
import type { AfFixture } from '../api/apiFootballApi'

function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')
}

const ALIASES: Record<string, string> = {
  unitedstates: 'usa',
  southkorea: 'korearepublic',
  ivorycoast: 'cotedivoire',
  drcongo: 'congodr',
  democraticrepublicofcongo: 'congodr',
  bosniaandherzegovina: 'bosniaaherzegovina',
}

function resolve(n: string): string { return ALIASES[norm(n)] ?? norm(n) }

export function nameMatch(a: string, b: string): boolean {
  const ra = resolve(a), rb = resolve(b)
  if (ra === rb) return true
  if (ra.includes(rb) || rb.includes(ra)) return true
  if (ra.length >= 4 && rb.length >= 4 && ra.substring(0, 4) === rb.substring(0, 4)) return true
  return false
}

function findFixtureId(fixtures: AfFixture[], homeTeam: string, awayTeam: string, utcDate: string): number | null {
  const dateStr = utcDate.substring(0, 10)
  for (const f of fixtures) {
    if (!f.fixture.date.startsWith(dateStr)) continue
    const fh = f.teams.home.name, fa = f.teams.away.name
    if ((nameMatch(homeTeam, fh) && nameMatch(awayTeam, fa)) ||
        (nameMatch(homeTeam, fa) && nameMatch(awayTeam, fh))) {
      return f.fixture.id
    }
  }
  return null
}

export function useWcFixtureLookup() {
  return useQuery({
    queryKey: ['apf', 'wc-fixtures'],
    queryFn: apiFootballApi.wcFixtures,
    enabled: afAvailable,
    staleTime: 60 * 60_000,
    retry: 1,
    retryDelay: 3000,
  })
}

export function useFixtureId(homeTeamName: string, awayTeamName: string, utcDate: string): number | null {
  const { data: fixtures = [] } = useWcFixtureLookup()
  return useMemo(
    () => (fixtures.length > 0 ? findFixtureId(fixtures, homeTeamName, awayTeamName, utcDate) : null),
    [fixtures, homeTeamName, awayTeamName, utcDate],
  )
}

export function useFixtureStats(fixtureId: number | null) {
  return useQuery({
    queryKey: ['apf', 'stats', fixtureId],
    queryFn: () => apiFootballApi.fixtureStats(fixtureId!),
    enabled: afAvailable && fixtureId !== null,
    staleTime: 5 * 60_000,
    retry: 1,
  })
}

export function useFixtureEvents(fixtureId: number | null) {
  return useQuery({
    queryKey: ['apf', 'events', fixtureId],
    queryFn: () => apiFootballApi.fixtureEvents(fixtureId!),
    enabled: afAvailable && fixtureId !== null,
    staleTime: 5 * 60_000,
    retry: 1,
  })
}

export function useFixtureLineups(fixtureId: number | null) {
  return useQuery({
    queryKey: ['apf', 'lineups', fixtureId],
    queryFn: () => apiFootballApi.fixtureLineups(fixtureId!),
    enabled: afAvailable && fixtureId !== null,
    staleTime: 60 * 60_000,
    retry: 1,
  })
}

export function useFixturePlayers(fixtureId: number | null) {
  return useQuery({
    queryKey: ['apf', 'fixture-players', fixtureId],
    queryFn: () => apiFootballApi.fixturePlayers(fixtureId!),
    enabled: afAvailable && fixtureId !== null,
    staleTime: 60 * 60_000,
    retry: 1,
  })
}

export function useApiPlayerStats(name: string | undefined) {
  return useQuery({
    queryKey: ['apf', 'player', name],
    queryFn: () => apiFootballApi.playerStats(name!),
    enabled: afAvailable && !!name,
    staleTime: 24 * 60 * 60_000,
    retry: 1,
  })
}

/** Resolve an API-Football team ID from the WC fixture list by fuzzy team name match */
export function useAfTeamId(teamName: string | undefined): number | null {
  const { data: fixtures = [] } = useWcFixtureLookup()
  return useMemo(() => {
    if (!teamName || !fixtures.length) return null
    for (const f of fixtures) {
      if (nameMatch(teamName, f.teams.home.name)) return f.teams.home.id
      if (nameMatch(teamName, f.teams.away.name)) return f.teams.away.id
    }
    return null
  }, [fixtures, teamName])
}

export function useTeamSeasonStats(afTeamId: number | null) {
  return useQuery({
    queryKey: ['apf', 'team-season-stats', afTeamId],
    queryFn: () => apiFootballApi.teamSeasonStats(afTeamId!),
    enabled: afAvailable && afTeamId !== null,
    staleTime: 60 * 60_000,
    retry: 1,
  })
}

export function useTeamInjuries(afTeamId: number | null) {
  return useQuery({
    queryKey: ['apf', 'team-injuries', afTeamId],
    queryFn: () => apiFootballApi.teamInjuries(afTeamId!),
    enabled: afAvailable && afTeamId !== null,
    staleTime: 30 * 60_000,
    retry: 1,
  })
}

export function useTopScorers() {
  return useQuery({
    queryKey: ['apf', 'top-scorers'],
    queryFn: () => apiFootballApi.topScorers(),
    enabled: afAvailable,
    staleTime: 30 * 60_000,
    retry: 1,
  })
}

export function useTopAssists() {
  return useQuery({
    queryKey: ['apf', 'top-assists'],
    queryFn: () => apiFootballApi.topAssists(),
    enabled: afAvailable,
    staleTime: 30 * 60_000,
    retry: 1,
  })
}
