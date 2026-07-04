import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Match } from '../../api/footballApi'
import type { AfTeamStats, AfEvent } from '../../api/apiFootballApi'
import { afAvailable } from '../../api/apiFootballApi'
import { useFixtureId, useFixtureStats, useFixtureEvents, nameMatch } from '../../hooks/useApiFootball'
import { useMatchDetail } from '../../hooks/useMatches'
import Spinner from '../shared/Spinner'
import MatchCard from './MatchCard'

// ── Helpers ────────────────────────────────────────────────────────────

function getStat(teamStats: AfTeamStats, type: string): string | number | null {
  return teamStats.statistics.find(s => s.type === type)?.value ?? null
}

function parseNum(v: string | number | null): number | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'number') return v
  const n = parseFloat(v)
  return isNaN(n) ? null : n
}

function lastNameOf(full: string): string {
  return full.split(' ').pop() ?? full
}

// ── Card chip ─────────────────────────────────────────────────────────

function CardChip({ type }: { type: string }) {
  if (type === 'Red Card') return <span className="inline-block w-3 h-4 rounded-[2px] bg-red-500 flex-shrink-0" />
  if (type === 'Yellow-Red Card') return <span className="inline-block w-3 h-4 rounded-[2px] bg-orange-400 flex-shrink-0" />
  return <span className="inline-block w-3 h-4 rounded-[2px] bg-yellow-400 flex-shrink-0" />
}

// ── Match Detail Panel ────────────────────────────────────────────────

function MatchDetailPanel({ match }: { match: Match }) {
  const fixtureId = useFixtureId(match.homeTeam.name, match.awayTeam.name, match.utcDate)
  const { data: statsData = [], isLoading: statsLoading } = useFixtureStats(fixtureId)
  const { data: events = [], isLoading: eventsLoading } = useFixtureEvents(fixtureId)
  const { data: fdDetail } = useMatchDetail(match.id)

  // Loading
  if ((statsLoading || eventsLoading) && afAvailable) {
    return (
      <div className="flex items-center justify-center py-6">
        <Spinner />
      </div>
    )
  }

  // No API key
  if (!afAvailable) {
    return (
      <div className="px-3 pb-3 text-white/30 text-xs text-center">
        Add VITE_API_FOOTBALL_KEY for full stats
      </div>
    )
  }

  // No data after loading
  if (statsData.length === 0 && events.length === 0) {
    return (
      <div className="px-3 pb-3 text-white/30 text-xs text-center">
        Stats not yet available
      </div>
    )
  }

  const homeStats = statsData.find(t => nameMatch(t.team.name, match.homeTeam.name))
  const awayStats = statsData.find(t => !nameMatch(t.team.name, match.homeTeam.name))

  // Half-time from football-data.org
  const htHome = fdDetail?.score.halfTime.home ?? null
  const htAway = fdDetail?.score.halfTime.away ?? null
  const hasHT = htHome !== null && htAway !== null

  // Sort events by elapsed time
  const sortedEvents = [...events].sort((a, b) => a.time.elapsed - b.time.elapsed)

  const homeEvents = sortedEvents.filter(e => nameMatch(e.team.name, match.homeTeam.name))
  const awayEvents = sortedEvents.filter(e => !nameMatch(e.team.name, match.homeTeam.name))

  // Possession
  const homePossRaw = homeStats ? getStat(homeStats, 'Ball Possession') : null
  const awayPossRaw = awayStats ? getStat(awayStats, 'Ball Possession') : null
  const homePossNum = parseNum(typeof homePossRaw === 'string' ? homePossRaw.replace('%', '') : homePossRaw)
  const awayPossNum = parseNum(typeof awayPossRaw === 'string' ? awayPossRaw.replace('%', '') : awayPossRaw)
  const hasPossession = homePossNum !== null && awayPossNum !== null

  // Stat rows config
  const statRows: Array<{ type: string; label: string }> = [
    { type: 'Total Shots', label: 'Shots' },
    { type: 'Shots on Goal', label: 'On Target' },
    { type: 'Corner Kicks', label: 'Corners' },
    { type: 'Fouls', label: 'Fouls' },
    { type: 'Offsides', label: 'Offsides' },
    { type: 'Goalkeeper Saves', label: 'Saves' },
    { type: 'Passes %', label: 'Pass Acc.' },
  ]

  function renderEventSide(evs: AfEvent[], side: 'home' | 'away') {
    return evs.map((e, i) => {
      const minute = `${e.time.elapsed}${e.time.extra ? `+${e.time.extra}` : ''}'`
      const isAway = side === 'away'

      if (e.type === 'Goal') {
        const isOG = e.detail === 'Own Goal'
        const isPen = e.detail === 'Penalty'
        const icon = isOG ? (
          <span className="text-red-400 text-xs">⚽ OG</span>
        ) : isPen ? (
          <span className="text-gold text-xs">⚽ P</span>
        ) : (
          <span className="text-white/60 text-xs">⚽</span>
        )
        return (
          <div key={i} className={`flex items-start gap-1.5 ${isAway ? 'flex-row-reverse' : ''}`}>
            <span className={`text-white/30 text-xs w-8 flex-shrink-0 ${isAway ? 'text-left' : 'text-right'}`}>{minute}</span>
            <div className={`flex-1 min-w-0 ${isAway ? 'text-right' : ''}`}>
              {isAway ? (
                <>
                  <span className="text-white text-xs mr-1">{lastNameOf(e.player.name)}</span>
                  {icon}
                </>
              ) : (
                <>
                  {icon}
                  <span className="text-white text-xs ml-1">{lastNameOf(e.player.name)}</span>
                </>
              )}
              {e.assist.name && (
                <p className={`text-white/30 text-[10px] ${isAway ? 'pr-4' : 'pl-4'}`}>
                  {lastNameOf(e.assist.name)}
                </p>
              )}
            </div>
          </div>
        )
      }

      if (e.type === 'Card') {
        return (
          <div key={i} className={`flex items-center gap-1.5 ${isAway ? 'flex-row-reverse' : ''}`}>
            <span className={`text-white/30 text-xs w-8 flex-shrink-0 ${isAway ? 'text-left' : 'text-right'}`}>{minute}</span>
            <CardChip type={e.detail} />
            <span className="text-white/60 text-xs truncate">{lastNameOf(e.player.name)}</span>
          </div>
        )
      }

      if (e.type === 'subst') {
        return (
          <div key={i} className={`flex items-center gap-1.5 ${isAway ? 'flex-row-reverse' : ''}`}>
            <span className={`text-white/30 text-xs w-8 flex-shrink-0 ${isAway ? 'text-left' : 'text-right'}`}>{minute}</span>
            <div className={`min-w-0 ${isAway ? 'text-right' : ''}`}>
              <span className="text-emerald-400 text-[10px]">
                {isAway ? `${lastNameOf(e.player.name)} ↑` : `↑ ${lastNameOf(e.player.name)}`}
              </span>
              <br />
              {e.assist.name && (
                <span className="text-white/30 text-[10px]">
                  {isAway ? `${lastNameOf(e.assist.name)} ↓` : `↓ ${lastNameOf(e.assist.name)}`}
                </span>
              )}
            </div>
          </div>
        )
      }

      return null
    })
  }

  const hasEvents = homeEvents.length > 0 || awayEvents.length > 0

  return (
    <div className="px-3 pb-3 space-y-3">
      {/* Half-time score */}
      {hasHT && (
        <div className="flex items-center justify-center gap-2 text-xs text-white/40">
          <span>Half-time:</span>
          <span className="font-heading text-white/60">{htHome} – {htAway}</span>
        </div>
      )}

      {/* Possession bar */}
      {hasPossession && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-xs w-8 text-right">{homePossNum}%</span>
            <div className="flex flex-1 h-2 rounded-full overflow-hidden">
              <div className="bg-gold" style={{ width: `${homePossNum}%` }} />
              <div className="bg-white/20 flex-1" />
            </div>
            <span className="text-white/60 text-xs w-8">{awayPossNum}%</span>
          </div>
          <p className="text-center text-white/30 text-[10px] uppercase tracking-wider">Possession</p>
        </div>
      )}

      {/* Stats rows */}
      {homeStats && awayStats && (
        <div className="space-y-1.5">
          {statRows.map(({ type, label }) => {
            const hv = parseNum(getStat(homeStats, type))
            const av = parseNum(getStat(awayStats, type))
            if ((hv === null || hv === 0) && (av === null || av === 0)) return null
            const hDisplay = hv !== null ? hv : '-'
            const aDisplay = av !== null ? av : '-'
            return (
              <div key={type} className="grid grid-cols-3 items-center text-xs">
                <span className="text-white/70 font-heading text-right pr-2">{hDisplay}</span>
                <span className="text-white/30 text-center text-[10px] uppercase tracking-wider">{label}</span>
                <span className="text-white/70 font-heading text-left pl-2">{aDisplay}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Events */}
      {hasEvents && (
        <>
          <div className="border-t border-white/5" />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              {renderEventSide(homeEvents, 'home')}
            </div>
            <div className="space-y-1.5">
              {renderEventSide(awayEvents, 'away')}
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
      {/* The card itself — clickable if there's something to expand */}
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
              <MatchDetailPanel match={match} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
