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

export function useApiPlayerStats(name: string | undefined) {
  return useQuery({
    queryKey: ['apf', 'player', name],
    queryFn: () => apiFootballApi.playerStats(name!),
    enabled: afAvailable && !!name,
    staleTime: 24 * 60 * 60_000,
    retry: 1,
  })
}
