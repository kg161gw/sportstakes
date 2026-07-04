import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import sweepstake from '../../data/sweepstake.json'
import { useTeams } from '../../hooks/useTeams'
import { useMatches } from '../../hooks/useMatches'
import type { Match } from '../../api/footballApi'

function getCrest(teamName: string, teams: { name: string; crest: string }[]): string | null {
  return teams.find(t => t.name.toLowerCase() === teamName.toLowerCase())?.crest ?? null
}

function getTeamId(teamName: string, teams: { id: number; name: string }[]): number | null {
  return teams.find(t => t.name.toLowerCase() === teamName.toLowerCase())?.id ?? null
}

function nextFixture(teamId: number | null, matches: Match[]): Match | null {
  if (!teamId) return null
  const isTeam = (m: Match) => m.homeTeam.id === teamId || m.awayTeam.id === teamId

  // Live first
  const live = matches.find(
    m => isTeam(m) && (m.status === 'IN_PLAY' || m.status === 'PAUSED'),
  )
  if (live) return live

  // Next scheduled
  const upcoming = matches
    .filter(m => isTeam(m) && (m.status === 'SCHEDULED' || m.status === 'TIMED'))
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
  return upcoming[0] ?? null
}

function FixturePill({ teamId, matches }: {
  teamId: number | null
  matches: Match[]
}) {
  const match = nextFixture(teamId, matches)
  if (!match) return null

  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const opponent =
    match.homeTeam.id === teamId
      ? (match.awayTeam.shortName || match.awayTeam.tla || match.awayTeam.name || 'TBD')
      : (match.homeTeam.shortName || match.homeTeam.tla || match.homeTeam.name || 'TBD')

  const isHome = match.homeTeam.id === teamId
  const date = new Date(match.utcDate)
  const dateStr = date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (isLive) {
    return (
      <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
        <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse flex-shrink-0" />
        <span className="text-live font-medium">LIVE</span>
        <span className="text-white/40">vs {opponent}</span>
      </div>
    )
  }

  return (
    <div className="mt-1.5 text-[11px] text-white/40 leading-snug">
      <span className="text-white/60">{isHome ? 'vs' : '@'} {opponent}</span>
      <span className="mx-1">·</span>
      <span>{dateStr} {timeStr}</span>
    </div>
  )
}

export default function SweepstakeGrid() {
  const { data: teams = [] } = useTeams()
  const { data: matches = [] } = useMatches()

  return (
    <section>
      <h2 className="font-heading text-lg text-gold mb-3 uppercase tracking-wide">The Sweepstake</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {sweepstake.participants.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-pitch-mid rounded-xl p-3 border border-white/5"
          >
            <p className="font-heading text-white text-base mb-2">{p.name}</p>
            <div className="flex flex-col gap-2">
              {p.teams.map(teamName => {
                const crest = getCrest(teamName, teams)
                const team = teams.find(t => t.name.toLowerCase() === teamName.toLowerCase())
                const teamId = getTeamId(teamName, teams)

                const inner = (
                  <div className="bg-pitch rounded-lg px-3 py-2 hover:bg-pitch-light transition-colors">
                    <div className="flex items-center gap-2">
                      {crest && (
                        <img src={crest} alt={teamName} className="w-5 h-5 object-contain flex-shrink-0" />
                      )}
                      <span className="text-sm text-white font-medium leading-tight">{teamName}</span>
                    </div>
                    <FixturePill teamId={teamId} matches={matches} />
                  </div>
                )

                return team ? (
                  <Link key={teamName} to={`/teams/${team.id}`}>
                    {inner}
                  </Link>
                ) : (
                  <span key={teamName}>{inner}</span>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
