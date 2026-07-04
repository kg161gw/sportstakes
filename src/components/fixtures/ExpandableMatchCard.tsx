import { AnimatePresence, motion } from 'framer-motion'
import type { Match } from '../../api/footballApi'
import type { GoalEvent, BookingEvent, SubstitutionEvent } from '../../api/footballApi'
import MatchCard from './MatchCard'
import { useMatchDetail } from '../../hooks/useMatches'

function CardIcon({ card }: { card: BookingEvent['card'] }) {
  if (card === 'RED') return <span className="inline-block w-3 h-4 rounded-[2px] bg-red-500 flex-shrink-0" />
  if (card === 'YELLOW_RED') return <span className="inline-block w-3 h-4 rounded-[2px] bg-orange-400 flex-shrink-0" />
  return <span className="inline-block w-3 h-4 rounded-[2px] bg-yellow-400 flex-shrink-0" />
}

function GoalIcon({ type }: { type: GoalEvent['type'] }) {
  if (type === 'OWN') return <span className="text-red-400 text-xs">⚽ OG</span>
  if (type === 'PENALTY') return <span className="text-gold text-xs">⚽ P</span>
  return <span className="text-white/60 text-xs">⚽</span>
}

function MatchDetailPanel({ matchId, homeTeamId, awayTeamId }: {
  matchId: number
  homeTeamId: number
  awayTeamId: number
}) {
  const { data, isLoading } = useMatchDetail(matchId)

  if (isLoading) {
    return (
      <div className="px-3 pb-3 space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-5 rounded bg-white/10 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!data) return null

  const homeGoals = (data.goals ?? []).filter(g => g.team.id === homeTeamId)
  const awayGoals = (data.goals ?? []).filter(g => g.team.id === awayTeamId)
  const homeBookings = (data.bookings ?? []).filter(b => b.team.id === homeTeamId)
  const awayBookings = (data.bookings ?? []).filter(b => b.team.id === awayTeamId)
  const homeSubs = (data.substitutions ?? []).filter(s => s.team.id === homeTeamId)
  const awaySubs = (data.substitutions ?? []).filter(s => s.team.id === awayTeamId)
  const htHome = data.score.halfTime.home
  const htAway = data.score.halfTime.away

  const hasGoals = (data.goals ?? []).length > 0
  const hasBookings = (data.bookings ?? []).length > 0
  const hasSubs = (data.substitutions ?? []).length > 0
  const hasHT = htHome !== null && htAway !== null

  if (!hasGoals && !hasBookings && !hasSubs) {
    return (
      <div className="px-3 pb-3 text-white/30 text-xs text-center">No detailed events available</div>
    )
  }

  return (
    <div className="px-3 pb-3 space-y-3">
      {/* Half-time score */}
      {hasHT && (
        <div className="flex items-center justify-center gap-2 text-xs text-white/40">
          <span>Half-time:</span>
          <span className="font-heading text-white/60">{htHome} – {htAway}</span>
        </div>
      )}

      {/* Goals side by side */}
      {hasGoals && (
        <div className="grid grid-cols-2 gap-2">
          {/* Home goals */}
          <div className="space-y-1">
            {homeGoals.map((g, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-white/30 text-xs w-6 flex-shrink-0 text-right">{g.minute}'</span>
                <div className="flex-1 min-w-0">
                  <GoalIcon type={g.type} />
                  <span className="text-white text-xs ml-1">{g.scorer.name.split(' ').pop()}</span>
                  {g.assist && (
                    <p className="text-white/30 text-[10px] pl-4">{g.assist.name.split(' ').pop()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Away goals */}
          <div className="space-y-1">
            {awayGoals.map((g, i) => (
              <div key={i} className="flex items-start gap-1.5 flex-row-reverse">
                <span className="text-white/30 text-xs w-6 flex-shrink-0 text-left">{g.minute}'</span>
                <div className="flex-1 min-w-0 text-right">
                  <span className="text-white text-xs mr-1">{g.scorer.name.split(' ').pop()}</span>
                  <GoalIcon type={g.type} />
                  {g.assist && (
                    <p className="text-white/30 text-[10px] pr-4">{g.assist.name.split(' ').pop()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookings */}
      {hasBookings && (
        <>
          <div className="border-t border-white/5" />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              {homeBookings.map((b, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="text-white/30 text-xs w-6 text-right">{b.minute}'</span>
                  <CardIcon card={b.card} />
                  <span className="text-white/60 text-xs truncate">{b.player.name.split(' ').pop()}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {awayBookings.map((b, i) => (
                <div key={i} className="flex items-center gap-1.5 flex-row-reverse">
                  <span className="text-white/30 text-xs w-6 text-left">{b.minute}'</span>
                  <CardIcon card={b.card} />
                  <span className="text-white/60 text-xs truncate">{b.player.name.split(' ').pop()}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Substitutions */}
      {hasSubs && (
        <>
          <div className="border-t border-white/5" />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              {homeSubs.map((s: SubstitutionEvent, i: number) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="text-white/30 text-xs w-6 text-right">{s.minute}'</span>
                  <div className="min-w-0">
                    <span className="text-emerald-400 text-[10px]">↑ {s.playerIn.name.split(' ').pop()}</span>
                    <br />
                    <span className="text-white/30 text-[10px]">↓ {s.playerOut.name.split(' ').pop()}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {awaySubs.map((s: SubstitutionEvent, i: number) => (
                <div key={i} className="flex items-center gap-1.5 flex-row-reverse">
                  <span className="text-white/30 text-xs w-6 text-left">{s.minute}'</span>
                  <div className="min-w-0 text-right">
                    <span className="text-emerald-400 text-[10px]">{s.playerIn.name.split(' ').pop()} ↑</span>
                    <br />
                    <span className="text-white/30 text-[10px]">{s.playerOut.name.split(' ').pop()} ↓</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function ExpandableMatchCard({
  match,
  index = 0,
  expandedId,
  onToggle,
}: {
  match: Match
  index?: number
  expandedId: number | null
  onToggle: (id: number) => void
}) {
  const isExpanded = expandedId === match.id
  const canExpand = match.status === 'FINISHED' || match.status === 'IN_PLAY' || match.status === 'PAUSED'

  return (
    <div
      className={`rounded-xl overflow-hidden border transition-colors ${
        isExpanded ? 'border-white/20' : 'border-white/5'
      } bg-pitch-mid`}
    >
      {/* The card itself — clickable if there's something to expand */}
      <div
        onClick={() => canExpand && onToggle(match.id)}
        className={canExpand ? 'cursor-pointer' : ''}
      >
        <MatchCard match={match} index={index} embedded />
        {canExpand && (
          <div className="flex justify-center pb-1">
            <motion.span
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-white/20 text-xs leading-none select-none"
            >
              ▾
            </motion.span>
          </div>
        )}
      </div>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="border-t border-white/10 pt-3">
              <MatchDetailPanel
                matchId={match.id}
                homeTeamId={match.homeTeam.id}
                awayTeamId={match.awayTeam.id}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
