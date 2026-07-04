import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import PageWrapper from '../components/shared/PageWrapper'
import SlidingTabs from '../components/shared/SlidingTabs'
import { useTeamDetail, useTeamMatches, useScorers } from '../hooks/useTeams'
import { useSquadEnrichment, usePlayerEnrichment } from '../hooks/usePlayerEnrichment'
import { useTeamSdbData } from '../hooks/useTeamEnrichment'
import ExpandableMatchCard from '../components/fixtures/ExpandableMatchCard'
import { SkeletonCard, SkeletonText } from '../components/shared/LoadingSkeleton'
import Spinner from '../components/shared/Spinner'
import { useApiPlayerStats, useAfTeamId, useTeamSeasonStats, useTeamInjuries } from '../hooks/useApiFootball'
import { afAvailable } from '../api/apiFootballApi'
import { calcTeamStatsFromMatches, calcTeamSeasonRatings, calcPlayerStats } from '../utils/calcStats'
import type { Match, Player } from '../api/footballApi'
import type { TsdbPlayer } from '../api/theSportsDbApi'

function age(dob: string) {
  const d = new Date(dob)
  const now = new Date()
  let a = now.getFullYear() - d.getFullYear()
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) a--
  return a
}

const POSITION_ORDER = ['Goalkeeper', 'Defence', 'Midfield', 'Offence']
const POSITION_LABEL: Record<string, string> = {
  Goalkeeper: 'Goalkeepers',
  Defence: 'Defenders',
  Midfield: 'Midfielders',
  Offence: 'Forwards',
}

// ── Rating bar ─────────────────────────────────────────────────────────

function RatingBar({
  label,
  value,
  color = 'bg-gold',
}: {
  label: string
  value: number | null
  color?: string
}) {
  if (value === null) return null
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-white/50">{label}</span>
        <span className="text-white/70 font-heading">{value}</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  )
}

// ── Player Detail Panel ────────────────────────────────────────────────
function PlayerPanel({
  player,
  onClose,
}: {
  player: Player
  onClose: () => void
}) {
  const { data: enriched, isLoading } = usePlayerEnrichment(player.name)
  const { data: playerStats, isLoading: statsLoading } = useApiPlayerStats(player.name)
  const stat = playerStats?.[0]?.statistics?.[0]

  const derived = stat ? calcPlayerStats(stat, player.position ?? '') : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        className="relative w-full max-w-md bg-pitch-mid rounded-t-2xl pb-8 overflow-hidden max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {/* drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* photo + name header */}
        <div className="flex items-start gap-4 px-5 py-3">
          <div className="w-24 h-28 rounded-xl overflow-hidden bg-pitch-light flex-shrink-0">
            {isLoading && statsLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Spinner />
              </div>
            ) : isLoading ? (
              <div className="w-full h-full animate-pulse bg-white/10" />
            ) : enriched?.strThumb ? (
              <img
                src={enriched.strThumb}
                alt={player.name}
                className="w-full h-full object-cover object-top"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-white/20">
                {player.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 pt-1">
            <h2 className="font-heading text-xl text-white leading-tight">{player.name}</h2>
            <p className="text-white/50 text-sm mt-0.5">{player.nationality}</p>
            <p className="text-gold text-xs font-medium uppercase tracking-wider mt-1">
              {player.position === 'Offence' ? 'Forward' : player.position}
            </p>
            {player.dateOfBirth && (
              <p className="text-white/30 text-xs mt-1">Age {age(player.dateOfBirth)}</p>
            )}
          </div>
        </div>

        {/* enriched bio */}
        {!isLoading && enriched && (
          <div className="px-5 mt-2 space-y-3">
            {(enriched.strHeight || enriched.strWeight || enriched.strNumber) && (
              <div className="flex gap-3">
                {enriched.strNumber && (
                  <div className="bg-pitch-light rounded-lg px-4 py-2 text-center">
                    <p className="font-heading text-2xl text-white">#{enriched.strNumber}</p>
                    <p className="text-white/40 text-xs">Shirt</p>
                  </div>
                )}
                {enriched.strHeight && (
                  <div className="bg-pitch-light rounded-lg px-4 py-2 text-center flex-1">
                    <p className="font-heading text-lg text-white">{enriched.strHeight}</p>
                    <p className="text-white/40 text-xs">Height</p>
                  </div>
                )}
                {enriched.strWeight && (
                  <div className="bg-pitch-light rounded-lg px-4 py-2 text-center flex-1">
                    <p className="font-heading text-lg text-white">{enriched.strWeight}</p>
                    <p className="text-white/40 text-xs">Weight</p>
                  </div>
                )}
              </div>
            )}
            {enriched.strDescriptionEN && (
              <div className="bg-pitch-light rounded-xl p-3">
                <p className="text-white/60 text-xs leading-relaxed line-clamp-5">
                  {enriched.strDescriptionEN}
                </p>
              </div>
            )}
          </div>
        )}

        {/* WC 2026 stats from API-Football */}
        {afAvailable && (
          <div className="px-5 mt-3">
            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">WC 2026 Stats</p>
            {statsLoading ? (
              <div className="flex justify-center py-3"><Spinner /></div>
            ) : stat ? (
              <div className="grid grid-cols-3 gap-2">
                {(() => {
                  const ratingRaw = stat.games.rating ? parseFloat(stat.games.rating) : null
                  const ratingColor = ratingRaw !== null
                    ? ratingRaw >= 7.5 ? 'text-gold' : ratingRaw >= 6.5 ? 'text-white' : 'text-white/40'
                    : 'text-white'

                  const items: Array<{ value: string | number | null; label: string; color?: string }> = [
                    { value: ratingRaw !== null ? ratingRaw.toFixed(1) : null, label: 'Rating', color: ratingColor },
                    { value: stat.games.minutes, label: 'Mins' },
                    { value: stat.goals.total, label: 'Goals' },
                    { value: stat.goals.assists, label: 'Assists' },
                    { value: stat.shots.on, label: 'On Target' },
                    { value: stat.passes.accuracy, label: 'Pass Acc' },
                    { value: stat.tackles.total, label: 'Tackles' },
                    { value: stat.cards.yellow > 0 ? stat.cards.yellow : null, label: 'Yellows' },
                  ]

                  return items
                    .filter(item => item.value !== null && item.value !== 0 && item.value !== '')
                    .map(item => (
                      <div key={item.label} className="bg-pitch-light rounded-lg p-2 text-center">
                        <p className={`font-heading text-base ${item.color ?? 'text-white'}`}>{item.value}</p>
                        <p className="text-white/40 text-[10px]">{item.label}</p>
                      </div>
                    ))
                })()}
              </div>
            ) : (
              <p className="text-white/25 text-xs text-center py-2">
                No WC 2026 stats recorded yet
              </p>
            )}
          </div>
        )}

        {/* Per-90 stats */}
        {afAvailable && derived && (stat?.games.minutes ?? 0) >= 45 && (
          <div className="px-5 mt-3">
            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Per 90 Minutes</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: derived.goalsP90, label: 'Goals/90' },
                { value: derived.assistsP90, label: 'Ast/90' },
                { value: derived.involvementP90, label: 'G+A/90' },
                { value: derived.shotsP90, label: 'Shots/90' },
                { value: derived.tacklesP90, label: 'Tkl/90' },
                { value: derived.shotAccuracy !== null ? `${derived.shotAccuracy}%` : null, label: 'Shot Acc' },
              ]
                .filter(item => item.value !== null && item.value !== 0)
                .map(item => (
                  <div key={item.label} className="bg-pitch-light rounded-lg p-2 text-center">
                    <p className="font-heading text-sm text-white/80">{item.value}</p>
                    <p className="text-white/40 text-[10px]">{item.label}</p>
                  </div>
                ))}
            </div>
            <p className="text-white/20 text-[9px] mt-2">{derived.positionRatingFormula}</p>
          </div>
        )}

        {/* close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white text-xl leading-none"
        >
          ×
        </button>
      </motion.div>
    </motion.div>
  )
}

// ── Player Row with lazy photo ─────────────────────────────────────────
function PlayerRow({
  player,
  enriched,
  onClick,
}: {
  player: Player
  enriched: TsdbPlayer | null | undefined
  onClick: () => void
}) {
  const photo = enriched?.strThumb ?? enriched?.strCutout ?? null

  return (
    <button
      className="w-full flex items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors text-left"
      onClick={onClick}
    >
      {/* avatar */}
      <div className="w-9 h-9 rounded-full overflow-hidden bg-pitch-light flex-shrink-0 flex items-center justify-center">
        {photo ? (
          <img
            src={photo}
            alt={player.name}
            className="w-full h-full object-cover object-top"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <span className="text-white/30 text-sm font-heading">{player.name.charAt(0)}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{player.name}</p>
        <p className="text-white/40 text-xs">{player.nationality}</p>
      </div>
      {player.dateOfBirth && (
        <div className="text-right flex-shrink-0">
          <p className="text-white/50 text-sm">{age(player.dateOfBirth)}</p>
          <p className="text-white/30 text-xs">yrs</p>
        </div>
      )}
      <span className="text-white/20 text-xs ml-1">›</span>
    </button>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────
export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const teamId = id ? parseInt(id) : null
  const [tab, setTab] = useState('overview')
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

  const { data: team, isLoading: teamLoading } = useTeamDetail(teamId)
  const { data: matches = [], isLoading: matchesLoading } = useTeamMatches(teamId)
  const { data: allScorers = [], isLoading: scorersLoading } = useScorers()

  // TheSportsDB team enrichment
  const { data: sdbTeam } = useTeamSdbData(team?.name)

  // API-Football team enrichment
  const afTeamId = useAfTeamId(team?.name)
  const { data: afSeasonStats } = useTeamSeasonStats(afTeamId)
  const { data: injuries = [] } = useTeamInjuries(afTeamId)

  const squad = team?.squad ?? []
  const squadNames = squad.map(p => p.name)
  const { data: enrichmentMap = {} } = useSquadEnrichment(squadNames)

  const teamScorers = allScorers.filter(s => s.team.id === teamId)
  const finishedMatches = matches.filter((m: Match) => m.status === 'FINISHED')
  const upcomingMatches = matches.filter((m: Match) => m.status === 'SCHEDULED' || m.status === 'TIMED')

  // Calculated stats
  const matchStats = calcTeamStatsFromMatches(matches, teamId ?? 0)
  const seasonRatings = afSeasonStats ? calcTeamSeasonRatings(afSeasonStats) : null

  // Prefer AF season stats where available, else fall back to match calculation
  const attackScore = seasonRatings?.attackScore ?? matchStats.attackScore
  const defenceScore = seasonRatings?.defenceScore ?? matchStats.defenceScore
  const disciplineScore = seasonRatings?.disciplineScore ?? null

  function getResult(m: Match) {
    if (!team) return 'D'
    const isHome = m.homeTeam.id === teamId
    const homeGoals = m.score.fullTime.home ?? 0
    const awayGoals = m.score.fullTime.away ?? 0
    if (homeGoals === awayGoals) return 'D'
    if (isHome) return homeGoals > awayGoals ? 'W' : 'L'
    return awayGoals > homeGoals ? 'W' : 'L'
  }
  const form = finishedMatches.slice(-5).map(getResult)

  const byPosition: Record<string, Player[]> = {}
  for (const p of squad) {
    const key = p.position || 'Offence'
    ;(byPosition[key] ??= []).push(p)
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'squad', label: 'Squad', count: squad.length },
    { id: 'goals', label: 'Goals' },
    { id: 'matches', label: 'Matches', count: matches.length },
  ]

  if (teamLoading) {
    return (
      <PageWrapper>
        <div className="space-y-4">
          <SkeletonCard className="h-24" />
          <SkeletonText className="w-48" />
          {[1, 2, 3].map(i => <SkeletonCard key={i} className="h-12" />)}
        </div>
      </PageWrapper>
    )
  }

  if (!team) {
    return (
      <PageWrapper>
        <div className="text-center py-20 text-white/30">Team not found</div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-4 transition-colors"
      >
        ← Back
      </button>

      {/* Header — with optional SportsDB banner */}
      {sdbTeam?.strFanart1 && (
        <div className="relative w-full h-28 rounded-xl overflow-hidden mb-4">
          <img
            src={sdbTeam.strFanart1}
            alt={team.name}
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).closest('div')!.style.display = 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-pitch-mid/90 to-transparent" />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-5"
      >
        {team.crest && (
          <img src={team.crest} alt={team.name} className="w-16 h-16 object-contain" />
        )}
        <div>
          <h1 className="font-heading text-2xl text-white">{team.name}</h1>
          <p className="text-white/40 text-sm">{team.area?.name}</p>
          {sdbTeam?.strStadium && (
            <p className="text-white/30 text-xs mt-0.5">🏟 {sdbTeam.strStadium}</p>
          )}
          {form.length > 0 && (
            <div className="flex gap-1 mt-2">
              {form.map((r, i) => (
                <span
                  key={i}
                  className={`w-6 h-6 rounded text-xs font-heading flex items-center justify-center ${
                    r === 'W' ? 'bg-win text-white' : r === 'L' ? 'bg-loss text-white' : 'bg-white/20 text-white'
                  }`}
                >
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <SlidingTabs tabs={tabs} active={tab} onChange={setTab} />

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {/* Coach */}
          {team.coach && (
            <div className="bg-pitch-mid rounded-xl p-4">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Head Coach</p>
              <div className="flex items-center justify-between">
                <p className="text-white font-medium">{team.coach.name}</p>
                <div className="text-right">
                  <p className="text-white/60 text-sm">{team.coach.nationality}</p>
                  {team.coach.dateOfBirth && (
                    <p className="text-white/30 text-xs">Age {age(team.coach.dateOfBirth)}</p>
                  )}
                </div>
              </div>
              {seasonRatings?.preferredFormation && (
                <p className="text-white/30 text-xs mt-2">
                  Preferred formation: <span className="text-white/60">{seasonRatings.preferredFormation}</span>
                </p>
              )}
            </div>
          )}

          {/* Season stats summary */}
          {matchStats.played > 0 ? (
            <div className="bg-pitch-mid rounded-xl p-4">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">WC 2026 Record</p>
              <div className="grid grid-cols-4 gap-2 text-center mb-4">
                <div>
                  <p className="font-heading text-xl text-white">{matchStats.played}</p>
                  <p className="text-white/40 text-xs">Played</p>
                </div>
                <div>
                  <p className="font-heading text-xl text-win">{matchStats.wins}</p>
                  <p className="text-white/40 text-xs">Won</p>
                </div>
                <div>
                  <p className="font-heading text-xl text-white/60">{matchStats.draws}</p>
                  <p className="text-white/40 text-xs">Drawn</p>
                </div>
                <div>
                  <p className="font-heading text-xl text-loss">{matchStats.losses}</p>
                  <p className="text-white/40 text-xs">Lost</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div>
                  <p className="font-heading text-2xl text-gold">{matchStats.goalsFor}</p>
                  <p className="text-white/40 text-xs">Goals For</p>
                </div>
                <div>
                  <p className="font-heading text-2xl text-white">
                    {matchStats.goalDiff > 0 ? `+${matchStats.goalDiff}` : matchStats.goalDiff}
                  </p>
                  <p className="text-white/40 text-xs">GD</p>
                </div>
                <div>
                  <p className="font-heading text-2xl text-white/50">{matchStats.goalsAgainst}</p>
                  <p className="text-white/40 text-xs">Against</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center text-xs text-white/40 border-t border-white/5 pt-3">
                {matchStats.goalsPerMatch !== null && (
                  <span>{matchStats.goalsPerMatch} goals/game</span>
                )}
                {matchStats.cleanSheetPct !== null && (
                  <span>{matchStats.cleanSheets} clean sheet{matchStats.cleanSheets !== 1 ? 's' : ''} ({matchStats.cleanSheetPct}%)</span>
                )}
                {matchStats.winPct !== null && (
                  <span>{matchStats.winPct}% win rate</span>
                )}
                {afSeasonStats && (
                  <span>{afSeasonStats.failedToScore.total} failed to score</span>
                )}
              </div>
            </div>
          ) : (
            /* No results yet — show upcoming schedule */
            upcomingMatches.length > 0 && (
              <div className="bg-pitch-mid rounded-xl p-4">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-3">WC 2026 Fixtures</p>
                <div className="space-y-2">
                  {upcomingMatches.slice(0, 3).map((m: Match, i: number) => (
                    <ExpandableMatchCard key={m.id} match={m} index={i} />
                  ))}
                </div>
              </div>
            )
          )}

          {/* Ratings bars */}
          {(attackScore !== null || defenceScore !== null || disciplineScore !== null) && (
            <div className="bg-pitch-mid rounded-xl p-4 space-y-3">
              <p className="text-white/40 text-xs uppercase tracking-wider">Team Ratings</p>
              <RatingBar label="Attack" value={attackScore} color="bg-gold" />
              <RatingBar label="Defence" value={defenceScore} color="bg-emerald-500" />
              <RatingBar label="Discipline" value={disciplineScore} color="bg-blue-400" />
              {seasonRatings && (
                <p className="text-white/20 text-[9px]">
                  team-v1 · attack: gf/match×33 · defence: 100−ga/match×33 · discipline: 100−cards/match×15
                </p>
              )}
            </div>
          )}

          {/* Injuries */}
          {injuries.length > 0 && (
            <div className="bg-pitch-mid rounded-xl p-4">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Injuries / Doubts</p>
              <div className="space-y-2">
                {injuries.slice(0, 5).map((inj, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <p className="text-white text-sm">{inj.player.name}</p>
                    <div className="text-right">
                      <p className="text-orange-400 text-xs">{inj.player.type}</p>
                      {inj.player.reason && (
                        <p className="text-white/30 text-[10px]">{inj.player.reason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Squad count */}
          <div className="bg-pitch-mid rounded-xl p-4">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Squad</p>
            <div className="grid grid-cols-4 gap-2">
              {POSITION_ORDER.map(pos => (
                <div key={pos} className="text-center">
                  <p className="font-heading text-xl text-white">{byPosition[pos]?.length ?? 0}</p>
                  <p className="text-white/40 text-xs">
                    {pos === 'Goalkeeper' ? 'GKs' : pos === 'Defence' ? 'DEFs' : pos === 'Midfield' ? 'MIDs' : 'FWDs'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top scorer */}
          {teamScorers.length > 0 && (
            <div className="bg-pitch-mid rounded-xl p-4">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Top Scorer</p>
              <div className="flex items-center gap-3">
                {(() => {
                  const enriched = enrichmentMap[teamScorers[0].player.name]
                  const photo = enriched?.strThumb ?? null
                  return (
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-pitch-light flex-shrink-0 flex items-center justify-center">
                      {photo ? (
                        <img src={photo} alt={teamScorers[0].player.name} className="w-full h-full object-cover object-top" />
                      ) : (
                        <span className="text-white/30 font-heading">{teamScorers[0].player.name.charAt(0)}</span>
                      )}
                    </div>
                  )
                })()}
                <p className="text-white font-medium flex-1">{teamScorers[0].player.name}</p>
                <div className="flex gap-3 text-sm">
                  <span className="text-gold font-heading">
                    {teamScorers[0].goals}{' '}
                    <span className="text-white/40 text-xs font-normal">goals</span>
                  </span>
                  {teamScorers[0].assists != null && (
                    <span className="text-white/60">
                      {teamScorers[0].assists} <span className="text-white/40 text-xs">ast</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Team description from SportsDB */}
          {sdbTeam?.strDescriptionEN && (
            <div className="bg-pitch-mid rounded-xl p-4">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">About</p>
              <p className="text-white/50 text-xs leading-relaxed line-clamp-6">
                {sdbTeam.strDescriptionEN}
              </p>
            </div>
          )}

          {/* Recent results */}
          {finishedMatches.length > 0 && (
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Recent Results</p>
              <div className="space-y-2">
                {finishedMatches.slice(-3).reverse().map((m: Match, i: number) => (
                  <ExpandableMatchCard key={m.id} match={m} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SQUAD */}
      {tab === 'squad' && (
        <div className="space-y-4">
          <p className="text-white/30 text-xs">Tap a player for photos and bio</p>
          {POSITION_ORDER.filter(pos => byPosition[pos]?.length).map(pos => (
            <div key={pos}>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">{POSITION_LABEL[pos]}</p>
              <div className="bg-pitch-mid rounded-xl overflow-hidden">
                {byPosition[pos].map((player) => (
                  <PlayerRow
                    key={player.id}
                    player={player}
                    enriched={enrichmentMap[player.name]}
                    onClick={() => setSelectedPlayer(player)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GOALS */}
      {tab === 'goals' && (
        <div className="space-y-4">
          {scorersLoading ? (
            [1, 2, 3].map(i => <SkeletonCard key={i} className="h-14" />)
          ) : teamScorers.length > 0 ? (
            <div className="bg-pitch-mid rounded-xl overflow-hidden">
              <div className="grid grid-cols-4 gap-2 px-4 py-2 border-b border-white/10 text-white/30 text-xs uppercase tracking-wider">
                <span className="col-span-2">Player</span>
                <span className="text-center">Goals</span>
                <span className="text-center">Assists</span>
              </div>
              {teamScorers.map((s, i) => {
                const enriched = enrichmentMap[s.player.name]
                const photo = enriched?.strThumb ?? null
                return (
                  <motion.div
                    key={s.player.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="grid grid-cols-4 gap-2 px-4 py-3 border-b border-white/5 last:border-0 items-center"
                  >
                    <div className="col-span-2 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-pitch-light flex-shrink-0 flex items-center justify-center">
                        {photo ? (
                          <img src={photo} alt={s.player.name} className="w-full h-full object-cover object-top" />
                        ) : (
                          <span className="text-white/30 text-xs font-heading">{s.player.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{s.player.name}</p>
                        <p className="text-white/40 text-xs">{s.playedMatches} apps</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="font-heading text-gold text-lg">{s.goals}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-white/60 text-sm">{s.assists ?? '-'}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <>
              {finishedMatches.length > 0 ? (
                <>
                  <div className="bg-pitch-mid rounded-xl p-4">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Goals Summary</p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="font-heading text-3xl text-gold">{matchStats.goalsFor}</p>
                        <p className="text-white/40 text-xs mt-1">Goals For</p>
                      </div>
                      <div>
                        <p className="font-heading text-3xl text-white/60">{matchStats.goalsAgainst}</p>
                        <p className="text-white/40 text-xs mt-1">Goals Against</p>
                      </div>
                      <div>
                        <p className="font-heading text-3xl text-white">
                          {matchStats.goalDiff > 0 ? `+${matchStats.goalDiff}` : matchStats.goalDiff}
                        </p>
                        <p className="text-white/40 text-xs mt-1">Difference</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-white/20 text-xs text-center">
                    Individual scorer data not yet available for this team
                  </p>
                </>
              ) : (
                <div className="text-center py-12 text-white/30">No matches played yet</div>
              )}
            </>
          )}
        </div>
      )}

      {/* MATCHES */}
      {tab === 'matches' && (
        <div className="space-y-4">
          {matchesLoading ? (
            [1, 2, 3].map(i => <SkeletonCard key={i} className="h-16" />)
          ) : (
            <>
              {finishedMatches.length > 0 && (
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Results</p>
                  <div className="space-y-2">
                    {finishedMatches.map((m: Match, i: number) => (
                      <ExpandableMatchCard key={m.id} match={m} index={i} />
                    ))}
                  </div>
                </div>
              )}
              {upcomingMatches.length > 0 && (
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Upcoming</p>
                  <div className="space-y-2">
                    {upcomingMatches.map((m: Match, i: number) => (
                      <ExpandableMatchCard key={m.id} match={m} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Player detail panel */}
      <AnimatePresence>
        {selectedPlayer && (
          <PlayerPanel
            player={selectedPlayer}
            onClose={() => setSelectedPlayer(null)}
          />
        )}
      </AnimatePresence>
    </PageWrapper>
  )
}
