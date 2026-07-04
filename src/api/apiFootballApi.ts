const AF_KEY = import.meta.env.VITE_API_FOOTBALL_KEY as string | undefined
const AF_BASE = '/api/apifootball'
export const afAvailable = !!AF_KEY

async function afFetch<T>(path: string): Promise<T> {
  if (!AF_KEY) throw new Error('VITE_API_FOOTBALL_KEY not set')
  const res = await fetch(`${AF_BASE}${path}`)
  if (!res.ok) throw new Error(`API-Football ${res.status}`)
  const json = (await res.json()) as { response: T }
  return json.response
}

export interface AfFixture {
  fixture: { id: number; date: string; status: { short: string; elapsed: number | null } }
  league: { id: number; round: string }
  teams: { home: { id: number; name: string; logo: string }; away: { id: number; name: string; logo: string } }
  goals: { home: number | null; away: number | null }
}

export interface AfStatValue { type: string; value: string | number | null }
export interface AfTeamStats { team: { id: number; name: string }; statistics: AfStatValue[] }

export interface AfEvent {
  time: { elapsed: number; extra: number | null }
  team: { id: number; name: string }
  player: { id: number; name: string }
  assist: { id: number | null; name: string | null }
  type: string
  detail: string
}

export interface AfPlayerStat {
  player: { id: number; name: string; nationality: string; height: string | null; weight: string | null; photo: string | null }
  statistics: Array<{
    team: { id: number; name: string }
    games: { minutes: number | null; rating: string | null; captain: boolean }
    goals: { total: number | null; assists: number | null; saves: number | null }
    shots: { total: number | null; on: number | null }
    tackles: { total: number | null; blocks: number | null; interceptions: number | null }
    passes: { total: number | null; accuracy: string | null; key: number | null }
    dribbles: { attempts: number | null; success: number | null }
    fouls: { drawn: number | null; committed: number | null }
    cards: { yellow: number; red: number }
  }>
}

export const apiFootballApi = {
  wcFixtures: () => afFetch<AfFixture[]>('/fixtures?league=1&season=2026'),
  fixtureStats: (id: number) => afFetch<AfTeamStats[]>(`/fixtures/statistics?fixture=${id}`),
  fixtureEvents: (id: number) => afFetch<AfEvent[]>(`/fixtures/events?fixture=${id}`),
  playerStats: (name: string) => afFetch<AfPlayerStat[]>(`/players?search=${encodeURIComponent(name)}&league=1&season=2026`),
}
