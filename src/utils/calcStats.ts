import type { Match } from '../api/footballApi'
import type { AfTeamSeasonStats, AfPlayerStat } from '../api/apiFootballApi'

// ── Team stats derived from match results ──────────────────────────────

export interface TeamMatchStats {
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: number
  cleanSheets: number
  winPct: number | null        // 0-100
  goalsPerMatch: number | null
  concededPerMatch: number | null
  cleanSheetPct: number | null
  form: ('W' | 'D' | 'L')[]   // last 5
  formScore: number | null     // 0-100 (15 pts = 100%)
  attackScore: number | null   // 0-100
  defenceScore: number | null  // 0-100
}

export function calcTeamStatsFromMatches(matches: Match[], teamId: number): TeamMatchStats {
  const finished = matches.filter(m => m.status === 'FINISHED')
  let wins = 0, draws = 0, losses = 0, gf = 0, ga = 0, cleanSheets = 0
  const form: ('W' | 'D' | 'L')[] = []

  for (const m of finished) {
    const isHome = m.homeTeam.id === teamId
    const myGoals = isHome ? (m.score.fullTime.home ?? 0) : (m.score.fullTime.away ?? 0)
    const oppGoals = isHome ? (m.score.fullTime.away ?? 0) : (m.score.fullTime.home ?? 0)
    gf += myGoals
    ga += oppGoals
    if (myGoals > oppGoals) { wins++; form.push('W') }
    else if (myGoals === oppGoals) { draws++; form.push('D') }
    else { losses++; form.push('L') }
    if (oppGoals === 0) cleanSheets++
  }

  const played = finished.length
  const last5 = form.slice(-5)
  const formPoints = last5.reduce((acc, r) => acc + (r === 'W' ? 3 : r === 'D' ? 1 : 0), 0)

  return {
    played,
    wins,
    draws,
    losses,
    goalsFor: gf,
    goalsAgainst: ga,
    goalDiff: gf - ga,
    cleanSheets,
    winPct: played > 0 ? Math.round((wins / played) * 100) : null,
    goalsPerMatch: played > 0 ? Math.round((gf / played) * 10) / 10 : null,
    concededPerMatch: played > 0 ? Math.round((ga / played) * 10) / 10 : null,
    cleanSheetPct: played > 0 ? Math.round((cleanSheets / played) * 100) : null,
    form: last5,
    formScore: last5.length > 0 ? Math.round((formPoints / (last5.length * 3)) * 100) : null,
    // Attack: 0 = 0 gpm, 100 = 3+ gpm
    attackScore: played > 0 ? Math.min(100, Math.round((gf / played) * 33)) : null,
    // Defence: 0 = 3+ conceded pm, 100 = 0 conceded
    defenceScore: played > 0 ? Math.min(100, Math.max(0, Math.round(100 - (ga / played) * 33))) : null,
  }
}

// ── Team ratings from API-Football season stats ────────────────────────

export interface TeamSeasonRatings {
  attackScore: number | null    // 0-100
  defenceScore: number | null   // 0-100
  disciplineScore: number | null // 0-100
  overallScore: number | null   // 0-100
  preferredFormation: string | null
  totalYellows: number
  totalReds: number
  /** formula: attack-v1 */
  formulaVersion: string
}

export function calcTeamSeasonRatings(stats: AfTeamSeasonStats): TeamSeasonRatings {
  const played = stats.fixtures.played.total
  const gf = stats.goals.for.total.total
  const ga = stats.goals.against.total.total

  const attackScore = played > 0 ? Math.min(100, Math.round((gf / played) * 33)) : null
  const defenceScore = played > 0 ? Math.min(100, Math.max(0, Math.round(100 - (ga / played) * 33))) : null

  let totalYellows = 0
  let totalReds = 0
  for (const p of Object.values(stats.cards.yellow)) totalYellows += p.total ?? 0
  for (const p of Object.values(stats.cards.red)) totalReds += p.total ?? 0

  // Discipline: penalty per card (lower is better). 0 cards = 100, 5 yellows/match = ~0
  const cardsPerMatch = played > 0 ? (totalYellows + totalReds * 3) / played : null
  const disciplineScore = cardsPerMatch !== null
    ? Math.min(100, Math.max(0, Math.round(100 - cardsPerMatch * 15)))
    : null

  const preferredFormation = stats.lineups.length > 0
    ? [...stats.lineups].sort((a, b) => b.played - a.played)[0].formation
    : null

  const scores = [attackScore, defenceScore, disciplineScore].filter((s): s is number => s !== null)
  const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null

  return {
    attackScore,
    defenceScore,
    disciplineScore,
    overallScore,
    preferredFormation,
    totalYellows,
    totalReds,
    formulaVersion: 'team-v1',
  }
}

// ── Player per-90 and position-aware rating ────────────────────────────

export interface PlayerCalcStats {
  goalsP90: number | null
  assistsP90: number | null
  involvementP90: number | null
  shotsP90: number | null
  tacklesP90: number | null
  cardsP90: number | null
  shotAccuracy: number | null   // %
  passAccuracyNum: number | null // %
  positionRating: number | null
  positionRatingFormula: string
}

export function calcPlayerStats(
  stat: AfPlayerStat['statistics'][0],
  position: string,
): PlayerCalcStats {
  const mins = stat.games.minutes ?? 0
  const nineties = mins > 0 ? mins / 90 : 0

  function per90(val: number | null): number | null {
    if (val === null || nineties === 0) return null
    return Math.round((val / nineties) * 10) / 10
  }

  const goals = stat.goals.total ?? 0
  const assists = stat.goals.assists ?? 0
  const shots = stat.shots.total ?? 0
  const shotsOn = stat.shots.on ?? 0
  const tackles = stat.tackles.total ?? 0
  const yellows = stat.cards.yellow
  const reds = stat.cards.red
  const passAccStr = stat.passes.accuracy
  const passAccuracyNum = passAccStr ? parseInt(passAccStr) : null
  const shotAccuracy = shots > 0 ? Math.round((shotsOn / shots) * 100) : null

  // Use provider rating as the primary position-aware rating where available
  const providerRating = stat.games.rating ? parseFloat(stat.games.rating) : null

  const pos = position.toLowerCase()
  let positionRatingFormula: string

  if (pos.includes('goalkeep') || pos === 'gk') {
    positionRatingFormula = 'goalkeeper-v1: provider rating (saves/clean sheets/mins weighted)'
  } else if (pos.includes('def') || pos.includes('back')) {
    positionRatingFormula = 'defender-v1: provider rating (tackles/interceptions/duels weighted)'
  } else if (pos.includes('mid')) {
    positionRatingFormula = 'midfielder-v1: provider rating (passes/assists/tackles weighted)'
  } else {
    positionRatingFormula = 'attacker-v1: provider rating (goals/assists/shots weighted)'
  }

  return {
    goalsP90: per90(goals),
    assistsP90: per90(assists),
    involvementP90: per90(goals + assists),
    shotsP90: per90(shots),
    tacklesP90: per90(tackles),
    cardsP90: per90(yellows + reds * 3),
    shotAccuracy,
    passAccuracyNum,
    positionRating: providerRating,
    positionRatingFormula,
  }
}
