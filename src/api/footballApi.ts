const BASE = 'https://api.football-data.org/v4'
const API_KEY = import.meta.env.VITE_API_KEY as string

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'X-Auth-Token': API_KEY },
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

export interface Team {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string
  area: { name: string; flag: string }
  coach?: { name: string; nationality: string }
  squad?: Player[]
}

export interface Player {
  id: number
  name: string
  position: string
  dateOfBirth: string
  nationality: string
}

export interface Match {
  id: number
  utcDate: string
  status: 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'CANCELLED'
  stage: string
  group?: string
  homeTeam: { id: number; name: string; shortName: string; tla: string; crest: string }
  awayTeam: { id: number; name: string; shortName: string; tla: string; crest: string }
  score: {
    winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null
    fullTime: { home: number | null; away: number | null }
    halfTime: { home: number | null; away: number | null }
  }
  odds?: { homeWin: number; draw: number; awayWin: number }
}

export interface Standing {
  position: number
  team: { id: number; name: string; shortName: string; crest: string }
  playedGames: number
  won: number
  draw: number
  lost: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  form: string
}

export interface StandingGroup {
  stage: string
  group: string
  table: Standing[]
}

export const footballApi = {
  matches: () => apiFetch<{ matches: Match[] }>('/competitions/WC/matches'),
  standings: () => apiFetch<{ standings: StandingGroup[] }>('/competitions/WC/standings'),
  teams: () => apiFetch<{ teams: Team[] }>('/competitions/WC/teams'),
  team: (id: number) => apiFetch<Team>(`/teams/${id}`),
  teamMatches: (id: number) => apiFetch<{ matches: Match[] }>(`/teams/${id}/matches?competitions=WC`),
}
