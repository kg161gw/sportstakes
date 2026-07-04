import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import PageWrapper from '../components/shared/PageWrapper'
import SlidingTabs from '../components/shared/SlidingTabs'
import { useTeamDetail, useTeamMatches, useScorers } from '../hooks/useTeams'
import MatchCard from '../components/fixtures/MatchCard'
import { SkeletonCard, SkeletonText } from '../components/shared/LoadingSkeleton'
import type { Match } from '../api/footballApi'

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

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const teamId = id ? parseInt(id) : null
  const [tab, setTab] = useState('overview')

  const { data: team, isLoading: teamLoading } = useTeamDetail(teamId)
  const { data: matches = [], isLoading: matchesLoading } = useTeamMatches(teamId)
  const { data: allScorers = [] } = useScorers()

  const teamScorers = allScorers.filter(s => s.team.id === teamId)
  const finishedMatches = matches.filter((m: Match) => m.status === 'FINISHED')
  const upcomingMatches = matches.filter((m: Match) => m.status === 'SCHEDULED' || m.status === 'TIMED')

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

  const squad = team?.squad ?? []
  const byPosition: Record<string, typeof squad> = {}
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

      {/* Header */}
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
            </div>
          )}

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

          {teamScorers.length > 0 && (
            <div className="bg-pitch-mid rounded-xl p-4">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Top Scorer</p>
              <div className="flex items-center justify-between">
                <p className="text-white font-medium">{teamScorers[0].player.name}</p>
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

          {finishedMatches.length > 0 && (
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Recent Results</p>
              <div className="space-y-2">
                {finishedMatches.slice(-3).reverse().map((m: Match, i: number) => (
                  <MatchCard key={m.id} match={m} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SQUAD */}
      {tab === 'squad' && (
        <div className="space-y-4">
          {POSITION_ORDER.filter(pos => byPosition[pos]?.length).map(pos => (
            <div key={pos}>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">{POSITION_LABEL[pos]}</p>
              <div className="bg-pitch-mid rounded-xl overflow-hidden">
                {byPosition[pos].map((player, i) => (
                  <div
                    key={player.id ?? i}
                    className="flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">{player.name}</p>
                      <p className="text-white/40 text-xs">{player.nationality}</p>
                    </div>
                    {player.dateOfBirth && (
                      <div className="text-right">
                        <p className="text-white/60 text-sm">{age(player.dateOfBirth)}</p>
                        <p className="text-white/30 text-xs">yrs</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GOALS */}
      {tab === 'goals' && (
        <div>
          {teamScorers.length === 0 ? (
            <div className="text-center py-12 text-white/30">No scorers yet</div>
          ) : (
            <div className="bg-pitch-mid rounded-xl overflow-hidden">
              <div className="grid grid-cols-4 gap-2 px-4 py-2 border-b border-white/10 text-white/30 text-xs uppercase tracking-wider">
                <span className="col-span-2">Player</span>
                <span className="text-center">Goals</span>
                <span className="text-center">Assists</span>
              </div>
              {teamScorers.map((s, i) => (
                <motion.div
                  key={s.player.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-4 gap-2 px-4 py-3 border-b border-white/5 last:border-0 items-center"
                >
                  <div className="col-span-2">
                    <p className="text-white text-sm font-medium">{s.player.name}</p>
                    <p className="text-white/40 text-xs">{s.player.nationality} · {s.playedMatches} apps</p>
                  </div>
                  <div className="text-center">
                    <span className="font-heading text-gold text-lg">{s.goals}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-white/60 text-sm">{s.assists ?? '-'}</span>
                  </div>
                </motion.div>
              ))}
            </div>
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
                    {finishedMatches.map((m: Match, i: number) => <MatchCard key={m.id} match={m} index={i} />)}
                  </div>
                </div>
              )}
              {upcomingMatches.length > 0 && (
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Upcoming</p>
                  <div className="space-y-2">
                    {upcomingMatches.map((m: Match, i: number) => <MatchCard key={m.id} match={m} index={i} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </PageWrapper>
  )
}
