import { motion } from 'framer-motion'
import type { Match } from '../../api/footballApi'
import StatusBadge from './StatusBadge'
import ScoreBadge from './ScoreBadge'
import CountdownTimer from '../shared/CountdownTimer'
import sweepstake from '../../data/sweepstake.json'

function getParticipant(teamName: string): string | null {
  const p = sweepstake.participants.find(p =>
    p.teams.some(t => t.toLowerCase() === teamName.toLowerCase())
  )
  return p?.name ?? null
}

function TeamDisplay({ team, align }: { team: Match['homeTeam']; align: 'left' | 'right' }) {
  const participant = getParticipant(team.name)
  return (
    <div className={`flex-1 flex flex-col ${align === 'right' ? 'items-end' : 'items-start'} gap-1`}>
      <div className={`flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        {team.crest && (
          <img src={team.crest} alt={team.name} className="w-8 h-8 object-contain" loading="lazy" />
        )}
        <span className="font-heading text-sm md:text-base text-white leading-tight">
          {team.shortName || team.tla}
        </span>
      </div>
      {participant && (
        <span className="text-xs text-gold/80 font-medium">📌 {participant}</span>
      )}
    </div>
  )
}

export default function MatchCard({ match, index = 0 }: { match: Match; index?: number }) {
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const isScheduled = match.status === 'SCHEDULED' || match.status === 'TIMED'
  const matchTime = new Date(match.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const matchDate = new Date(match.utcDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className={`rounded-xl p-4 border transition-all ${
        isLive
          ? 'bg-pitch-mid border-live/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
          : 'bg-pitch-mid border-white/5 hover:border-white/20'
      }`}
    >
      <div className="flex items-center justify-between mb-3 text-xs text-white/40">
        <span>{matchDate} · {matchTime}</span>
        <span className="uppercase tracking-wider">{match.stage?.replace(/_/g, ' ')}</span>
      </div>

      <div className="flex items-center gap-3">
        <TeamDisplay team={match.homeTeam} align="left" />

        <div className="flex flex-col items-center gap-1 min-w-[80px]">
          {isLive || match.status === 'FINISHED' || match.status === 'PAUSED' ? (
            <ScoreBadge match={match} />
          ) : (
            <div className="flex flex-col items-center">
              {isScheduled && <CountdownTimer utcDate={match.utcDate} />}
            </div>
          )}
          <StatusBadge status={match.status} />
        </div>

        <TeamDisplay team={match.awayTeam} align="right" />
      </div>
    </motion.div>
  )
}
