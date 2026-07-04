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

// ── Lineups ────────────────────────────────────────────────────────────

export interface AfLineupPlayer {
  id: number
  name: string
  number: number
  pos: string
  grid: string | null
}

export interface AfLineup {
  team: { id: number; name: string; logo: string }
  coach: { id: number | null; name: string | null }
  formation: string | null
  startXI: Array<{ player: AfLineupPlayer }>
  substitutes: Array<{ player: AfLineupPlayer }>
}

// ── Team Season Statistics ─────────────────────────────────────────────

export interface AfTeamSeasonStats {
  team: { id: number; name: string }
  league: { id: number; season: number }
  form: string | null
  fixtures: {
    played: { home: number; away: number; total: number }
    wins: { home: number; away: number; total: number }
    draws: { home: number; away: number; total: number }
    loses: { home: number; away: number; total: number }
  }
  goals: {
    for: {
      total: { home: number; away: number; total: number }
      average: { home: string; away: string; total: string }
    }
    against: {
      total: { home: number; away: number; total: number }
      average: { home: string; away: string; total: string }
    }
  }
  cleanSheet: { home: number; away: number; total: number }
  failedToScore: { home: number; away: number; total: number }
  cards: {
    yellow: Record<string, { total: number | null; percentage: string | null }>
    red: Record<string, { total: number | null; percentage: string | null }>
  }
  lineups: Array<{ formation: string; played: number }>
  biggest: {
    wins: { home: string | null; away: string | null }
    loses: { home: string | null; away: string | null }
    goals: { for: { home: number; away: number }; against: { home: number; away: number } }
    streak: { wins: number; draws: number; loses: number }
  }
  penalty: {
    scored: { total: number | null; percentage: string | null }
    missed: { total: number | null; percentage: string | null }
    total: number
  }
}

// ── Injuries ───────────────────────────────────────────────────────────

export interface AfInjury {
  player: {
    id: number
    name: string
    type: string
    reason: string | null
    photo: string | null
  }
  team: { id: number; name: string }
}

// ── Top Scorers / Assists ──────────────────────────────────────────────

export interface AfTopPlayer {
  player: {
    id: number
    name: string
    nationality: string
    photo: string | null
  }
  statistics: Array<{
    team: { id: number; name: string; logo: string }
    games: { appearences: number | null; minutes: number | null }
    goals: { total: number | null; assists: number | null }
  }>
}

// ── Fixture Player Match Stats ─────────────────────────────────────────

export interface AfFixturePlayerEntry {
  player: { id: number; name: string; photo: string | null }
  statistics: Array<{
    games: {
      minutes: number | null
      rating: string | null
      position: string | null
      captain: boolean
    }
    goals: {
      total: number | null
      assists: number | null
      conceded: number | null
      saves: number | null
    }
    shots: { total: number | null; on: number | null }
    passes: { total: number | null; key: number | null; accuracy: string | null }
    tackles: { total: number | null; blocks: number | null; interceptions: number | null }
    duels: { total: number | null; won: number | null }
    dribbles: { attempts: number | null; success: number | null; past: number | null }
    fouls: { drawn: number | null; committed: number | null }
    cards: { yellow: number; red: number }
  }>
}

export interface AfFixtureTeamPlayers {
  team: { id: number; name: string; logo: string }
  players: AfFixturePlayerEntry[]
}

// ── API client ─────────────────────────────────────────────────────────

export const apiFootballApi = {
  wcFixtures: () => afFetch<AfFixture[]>('/fixtures?league=1&season=2026'),
  fixtureStats: (id: number) => afFetch<AfTeamStats[]>(`/fixtures/statistics?fixture=${id}`),
  fixtureEvents: (id: number) => afFetch<AfEvent[]>(`/fixtures/events?fixture=${id}`),
  fixtureLineups: (id: number) => afFetch<AfLineup[]>(`/fixtures/lineups?fixture=${id}`),
  fixturePlayers: (id: number) => afFetch<AfFixtureTeamPlayers[]>(`/fixtures/players?fixture=${id}`),
  playerStats: (name: string) => afFetch<AfPlayerStat[]>(`/players?search=${encodeURIComponent(name)}&league=1&season=2026`),
  teamSeasonStats: (teamId: number, leagueId = 1, season = 2026) =>
    afFetch<AfTeamSeasonStats>(`/teams/statistics?league=${leagueId}&season=${season}&team=${teamId}`),
  teamInjuries: (teamId: number, leagueId = 1, season = 2026) =>
    afFetch<AfInjury[]>(`/injuries?league=${leagueId}&season=${season}&team=${teamId}`),
  topScorers: (leagueId = 1, season = 2026) =>
    afFetch<AfTopPlayer[]>(`/players/topscorers?league=${leagueId}&season=${season}`),
  topAssists: (leagueId = 1, season = 2026) =>
    afFetch<AfTopPlayer[]>(`/players/topassists?league=${leagueId}&season=${season}`),
}
