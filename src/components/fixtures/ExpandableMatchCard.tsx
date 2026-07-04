import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Match } from '../../api/footballApi'
import { useMatchDetail } from '../../hooks/useMatches'
import Spinner from '../shared/Spinner'
import MatchCard from './MatchCard'

// ── Helpers ────────────────────────────────────────────────────────────

function lastNameOf(full: string): string {
  return full.split(' ').pop() ?? full
}

// ── Match Detail Panel ────────────────────────────────────────────────

function MatchDetailPanel({ match }: { match: Match }) {
  const { data: fd, isLoading } = useMatchDetail(match.id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Spinner />
      </div>
    )
  }

  const htHome = fd?.score.halfTime.home ?? null
  const htAway = fd?.score.halfTime.away ?? null
  const hasHT = htHome !== null && htAway !== null

  const goals = fd?.goals ?? []
  const bookings = fd?.bookings ?? []
  const subs = fd?.substitutions ?? []

  const hasEvents = goals.length > 0 || bookings.length > 0 || subs.length > 0

  if (!hasEvents && !hasHT) {
    return (
      <div className="px-3 pb-3 text-white/30 text-xs text-center py-4">
        Match events not yet available
      </div>
    )
  }

  // Build a unified event list per team
  type EventItem =
    | { kind: 'goal'; minute: number; name: string; assist: string | null; type: string }
    | { kind: 'card'; minute: number; name: string; card: string }
    | { kind: 'sub';  minute: number; out: string; in: string }

  const homeEvents: EventItem[] = []
  const awayEvents: EventItem[] = []

  for (const g of goals) {
    const isHome = g.team.id === match.homeTeam.id
    const ev: EventItem = {
      kind: 'goal',
      minute: g.minute,
      name: lastNameOf(g.scorer.name),
      assist: g.assist ? lastNameOf(g.assist.name) : null,
      type: g.type,
    }
    ;(isHome ? homeEvents : awayEvents).push(ev)
  }

  for (const b of bookings) {
    const isHome = b.team.id === match.homeTeam.id
    const ev: EventItem = {
      kind: 'card',
      minute: b.minute,
      name: lastNameOf(b.player.name),
      card: b.card,
    }
    ;(isHome ? homeEvents : awayEvents).push(ev)
  }

  for (const s of subs) {
    const isHome = s.team.id === match.homeTeam.id
    const ev: EventItem = {
      kind: 'sub',
      minute: s.minute,
      out: lastNameOf(s.playerOut.name),
      in: lastNameOf(s.playerIn.name),
    }
    ;(isHome ? homeEvents : awayEvents).push(ev)
  }

  homeEvents.sort((a, b) => a.minute - b.minute)
  awayEvents.sort((a, b) => a.minute - b.minute)

  function renderEvent(ev: EventItem, side: 'home' | 'away', i: number) {
    const isAway = side === 'away'
    const minLabel = `${ev.minute}'`

    if (ev.kind === 'goal') {
      const icon = ev.type === 'OWN' ? '⚽ OG' : ev.type === 'PENALTY' ? '⚽ P' : '⚽'
      const iconClass = ev.type === 'OWN'
        ? 'text-red-400'
        : ev.type === 'PENALTY'
        ? 'text-gold'
        : 'text-white/70'
      return (
        <div key={i} className={`flex items-start gap-1.5 ${isAway ? 'flex-row-reverse' : ''}`}>
          <span className={`text-white/30 text-xs w-7 flex-shrink-0 ${isAway ? 'text-left' : 'text-right'}`}>
            {minLabel}
          </span>
          <div className={`flex-1 min-w-0 ${isAway ? 'text-right' : ''}`}>
            <span className={`text-xs ${iconClass}`}>{icon}</span>
            <span className="text-white text-xs ml-1">{ev.name}</span>
            {ev.assist && (
              <p className={`text-white/30 text-[10px] ${isAway ? 'pr-4' : 'pl-4'}`}>
                {ev.assist}
              </p>
            )}
          </div>
        </div>
      )
    }

    if (ev.kind === 'card') {
      const cardColor =
        ev.card === 'RED'
          ? 'bg-red-500'
          : ev.card === 'YELLOW_RED'
          ? 'bg-orange-400'
          : 'bg-yellow-400'
      return (
        <div key={i} className={`flex items-center gap-1.5 ${isAway ? 'flex-row-reverse' : ''}`}>
          <span className={`text-white/30 text-xs w-7 flex-shrink-0 ${isAway ? 'text-left' : 'text-right'}`}>
            {minLabel}
          </span>
          <span className={`inline-block w-2.5 h-3.5 rounded-[2px] flex-shrink-0 ${cardColor}`} />
          <span className="text-white/60 text-xs truncate">{ev.name}</span>
        </div>
      )
    }

    if (ev.kind === 'sub') {
      return (
        <div key={i} className={`flex items-center gap-1.5 ${isAway ? 'flex-row-reverse' : ''}`}>
          <span className={`text-white/30 text-xs w-7 flex-shrink-0 ${isAway ? 'text-left' : 'text-right'}`}>
            {minLabel}
          </span>
          <div className={`min-w-0 ${isAway ? 'text-right' : ''}`}>
            <p className="text-emerald-400 text-[10px]">↑ {ev.in}</p>
            <p className="text-white/30 text-[10px]">↓ {ev.out}</p>
          </div>
        </div>
      )
    }

    return null
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

      {/* Events two-column */}
      {hasEvents && (
        <>
          <div className="border-t border-white/5" />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              {homeEvents.map((ev, i) => renderEvent(ev, 'home', i))}
            </div>
            <div className="space-y-1.5">
              {awayEvents.map((ev, i) => renderEvent(ev, 'away', i))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Outer card ────────────────────────────────────────────────────────

export default function ExpandableMatchCard({
  match,
  index = 0,
}: {
  match: Match
  index?: number
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const canExpand = match.status === 'FINISHED' || match.status === 'IN_PLAY' || match.status === 'PAUSED'

  return (
    <div
      className={`rounded-xl overflow-hidden border transition-colors ${
        isExpanded ? 'border-white/20' : 'border-white/5'
      } bg-pitch-mid`}
    >
      <div
        onClick={() => canExpand && setIsExpanded(v => !v)}
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
              <MatchDetailPanel match={match} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
