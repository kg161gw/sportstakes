import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Match } from '../../api/footballApi'
import StatusBadge from './StatusBadge'
import ScoreBadge from './ScoreBadge'
import CountdownTimer from '../shared/CountdownTimer'
import sweepstake from '../../data/sweepstake.json'
import { teamFlagUrl, teamFlagEmoji, normaliseTeamName } from '../../utils/teamFlags'

function getParticipant(teamName: string | null): string | null {
  if (!teamName) return null
  const needle = normaliseTeamName(teamName)
  const p = sweepstake.participants.find(p =>
    p.teams.some(t => normaliseTeamName(t) === needle)
  )
  return p?.name ?? null
}

function TeamCrest({ team, size = 'md' }: { team: Match['homeTeam']; size?: 'sm' | 'md' }) {
  const [failed, setFailed] = useState(false)
  const imgCls = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'

  // Prefer a reliable flagcdn.com flag image; fall back to the football-data.org
  // crest only if we have no ISO mapping (clubs, unknown teams).
  const flagSrc = teamFlagUrl(team?.name ?? '', 'w40')
  const src = flagSrc ?? team?.crest

  if (!src || failed) {
    const emoji = teamFlagEmoji(team?.name ?? '')
    return emoji
      ? <span className={`${imgCls} flex-shrink-0 flex items-center justify-center leading-none text-base`}>{emoji}</span>
      : null
  }
  return (
    <img
      src={src}
      alt={team?.name}
      className={`${imgCls} flex-shrink-0 object-contain rounded-sm`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

function TeamDisplay({ team, align }: { team: Match['homeTeam']; align: 'left' | 'right' }) {
  const participant = getParticipant(team?.name ?? null)
  const displayName = team?.shortName || team?.tla || team?.name || 'TBD'
  return (
    <div className={`flex-1 flex flex-col ${align === 'right' ? 'items-end' : 'items-start'} gap-1`}>
      <div className={`flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        <TeamCrest team={team} />
        <span className="font-heading text-sm text-white leading-tight">
          {displayName}
        </span>
      </div>
      {participant && (
        <span className="text-xs text-gold/80 font-medium">📌 {participant}</span>
      )}
    </div>
  )
}

export { TeamCrest }

export default function MatchCard({
  match,
  index = 0,
  embedded = false,
}: {
  match: Match
  index?: number
  /** When true, skip the outer card background/border (used inside ExpandableMatchCard) */
  embedded?: boolean
}) {
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const isScheduled = match.status === 'SCHEDULED' || match.status === 'TIMED'
  const matchTime = new Date(match.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const matchDate = new Date(match.utcDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className={embedded ? 'p-3' : `rounded-xl p-3 border transition-all ${
        isLive
          ? 'bg-pitch-mid border-live/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
          : 'bg-pitch-mid border-white/5 hover:border-white/20'
      }`}
    >
      <div className="flex items-center justify-between mb-2 text-[11px] text-white/40">
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
