import { useQuery } from '@tanstack/react-query'
import { theSportsDbApi, type TsdbPlayer } from '../api/theSportsDbApi'

// Fetch and cache enrichment data for a single player by name.
// Results are cached for 24h — player bio/photos don't change during a tournament.
export function usePlayerEnrichment(name: string | undefined) {
  return useQuery({
    queryKey: ['tsdb', 'player', name],
    queryFn: async () => {
      const data = await theSportsDbApi.searchPlayer(name!)
      // TheSportsDB may return multiple results — pick the football player
      const players = data.player ?? []
      const footballer = players.find(
        p => p.strPosition !== null && p.strPosition !== '',
      ) ?? players[0] ?? null
      return footballer as TsdbPlayer | null
    },
    enabled: !!name,
    staleTime: 24 * 60 * 60_000, // 24h
    retry: 1,
    retryDelay: 2000,
  })
}

// Batch-fetch enrichment data for a list of player names.
// Returns a map of name → TsdbPlayer | null for easy lookup.
export function useSquadEnrichment(names: string[]) {
  return useQuery({
    queryKey: ['tsdb', 'squad', ...names.slice().sort()],
    queryFn: async () => {
      const results = await Promise.allSettled(
        names.map(name => theSportsDbApi.searchPlayer(name)),
      )
      const map: Record<string, TsdbPlayer | null> = {}
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          const players = r.value.player ?? []
          map[names[i]] =
            players.find(p => p.strPosition !== null && p.strPosition !== '') ??
            players[0] ??
            null
        } else {
          map[names[i]] = null
        }
      })
      return map
    },
    enabled: names.length > 0,
    staleTime: 24 * 60 * 60_000,
    retry: 1,
    retryDelay: 2000,
  })
}
