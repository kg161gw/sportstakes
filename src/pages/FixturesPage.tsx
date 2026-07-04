import { useState, useEffect, useRef } from 'react'
import PageWrapper from '../components/shared/PageWrapper'
import SlidingTabs from '../components/shared/SlidingTabs'
import { useMatches } from '../hooks/useMatches'
import { useStandings } from '../hooks/useStandings'
import { useScorers } from '../hooks/useTeams'
import { useUIStore } from '../store/uiStore'
import ExpandableMatchCard from '../components/fixtures/ExpandableMatchCard'
import TeamPanel from '../components/teams/TeamPanel'
import { MatchCardSkeleton } from '../components/shared/LoadingSkeleton'
import type { Match, StandingGroup, Scorer, Standing } from '../api/footballApi'

// ── Group Standings ──────────────────────────────────────────────────
function GroupTable({ group }: { group: StandingGroup }) {
  const letter = group.group ?? ''
  return (
    <div className="bg-pitch-mid rounded-xl overflow-hidden">
      <div className="px-3 py-2 bg-pitch-light/50 flex items-center gap-2">
        <span className="font-heading text-xs text-gold tracking-wider">{letter}</span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-white/30 border-b border-white/5">
            <th className="text-left px-3 py-1.5">Team</th>
            <th className="px-2 py-1.5 text-center">P</th>
            <th className="px-2 py-1.5 text-center">W</th>
            <th className="px-2 py-1.5 text-center">D</th>
            <th className="px-2 py-1.5 text-center">L</th>
            <th className="px-2 py-1.5 text-center">GD</th>
            <th className="px-2 py-1.5 text-center font-bold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {group.table.map((row, i) => (
            <tr key={row.team.id} className="border-b border-white/5 last:border-0">
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-white/30 w-3 text-right">{row.position}</span>
                  {row.team.crest && (
                    <img src={row.team.crest} alt={row.team.name} className="w-4 h-4 object-contain" />
                  )}
                  <span className={`text-white ${i < 2 ? 'font-medium' : 'text-white/70'}`}>
                    {row.team.shortName || row.team.name}
                  </span>
                  {i < 2 && <span className="w-1.5 h-1.5 rounded-full bg-win ml-auto" />}
                </div>
              </td>
              <td className="px-2 py-2 text-center text-white/60">{row.playedGames}</td>
              <td className="px-2 py-2 text-center text-white/60">{row.won}</td>
              <td className="px-2 py-2 text-center text-white/60">{row.draw}</td>
              <td className="px-2 py-2 text-center text-white/60">{row.lost}</td>
              <td className="px-2 py-2 text-center text-white/60">
                {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
              </td>
              <td className="px-2 py-2 text-center font-heading text-white">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Bracket ──────────────────────────────────────────────────────────
import sweepstake from '../data/sweepstake.json'

function getParticipant(teamName: string | null | undefined): string | null {
  if (!teamName) return null
  const p = sweepstake.participants.find(p =>
    p.teams.some(t => t.toLowerCase() === teamName.toLowerCase())
  )
  return p?.name ?? null
}

function BracketTeamRow({
  team,
  score,
  isHome,
}: {
  team: Match['homeTeam'] | null | undefined
  score: number | null
  isHome: boolean
}) {
  const name = team?.shortName || team?.tla || team?.name || 'TBD'
  const participant = getParticipant(team?.name ?? null)
  const hasTbd = !team?.name

  return (
    <div className={`px-2 py-1.5 ${isHome ? 'border-b border-white/10' : ''}`}>
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          {team?.crest && (
            <img src={team.crest} alt={name} className="w-3.5 h-3.5 object-contain flex-shrink-0" />
          )}
          <span className={`text-xs font-medium truncate ${hasTbd ? 'text-white/30' : 'text-white'}`}>
            {name}
          </span>
        </div>
        {score !== null && (
          <span className="font-heading text-xs text-gold flex-shrink-0">{score}</span>
        )}
      </div>
      {participant && (
        <p className="text-[10px] text-gold/60 truncate mt-0.5 pl-5">{participant}</p>
      )}
    </div>
  )
}

function BracketMatch({
  match,
  matchNum,
}: {
  match: Match
  matchNum?: string
}) {
  const finished = match.status === 'FINISHED'
  const inPlay = match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const date = new Date(match.utcDate)
  const dateLabel = date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })
  const timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="bg-pitch-light border border-white/10 rounded-lg overflow-hidden w-44 shrink-0">
      <div className="px-2 py-0.5 bg-white/5 flex items-center justify-between gap-1">
        <span className="text-white/30 text-[10px] font-heading tracking-wider">
          {matchNum ?? ''}
        </span>
        <span className={`text-[10px] ${inPlay ? 'text-live' : 'text-white/25'}`}>
          {inPlay ? 'LIVE' : finished ? dateLabel : `${dateLabel} · ${timeLabel}`}
        </span>
      </div>
      <BracketTeamRow
        team={match.homeTeam}
        score={finished || inPlay ? match.score.fullTime.home : null}
        isHome
      />
      <BracketTeamRow
        team={match.awayTeam}
        score={finished || inPlay ? match.score.fullTime.away : null}
        isHome={false}
      />
    </div>
  )
}

function BracketView({ matches }: { matches: Match[] }) {
  const rounds = [
    'LAST_32',
    'LAST_16',
    'QUARTER_FINALS',
    'SEMI_FINALS',
    'THIRD_PLACE',
    'FINAL',
  ]
  const labels: Record<string, string> = {
    LAST_32: 'Round of 32',
    LAST_16: 'Round of 16',
    QUARTER_FINALS: 'Quarters',
    SEMI_FINALS: 'Semis',
    THIRD_PLACE: '3rd Place',
    FINAL: 'Final',
  }

  const byRound: Record<string, Match[]> = {}
  for (const m of matches) {
    if (rounds.includes(m.stage)) {
      ;(byRound[m.stage] ??= []).push(m)
    }
  }

  if (Object.keys(byRound).length === 0) {
    return (
      <div className="text-center py-12 text-white/30">
        <p className="text-3xl mb-2">🏆</p>
        <p>Knockout bracket will appear once the group stage is complete</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden rounded-xl bg-pitch-mid border border-white/10 p-3">
      <div className="overflow-x-auto scrollbar-none pb-2">
        <div className="flex gap-4 min-w-max items-start">
          {rounds
            .filter(r => byRound[r]?.length)
            .map(round => (
              <div key={round} className="flex flex-col gap-2">
                <p className="font-heading text-[11px] text-gold/70 tracking-wider uppercase text-center">
                  {labels[round]}
                </p>
                <div className="flex flex-col gap-2">
                  {byRound[round].map((m, i) => (
                    <BracketMatch
                      key={m.id}
                      match={m}
                      matchNum={byRound[round].length > 1 ? `M${i + 1}` : undefined}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

// ── Schedule with date tabs ──────────────────────────────────────────
function ScheduleView({ matches }: { matches: Match[] }) {
  const byDate: Record<string, Match[]> = {}
  for (const m of matches) {
    const key = new Date(m.utcDate).toDateString()
    ;(byDate[key] ??= []).push(m)
  }
  const dates = Object.keys(byDate)
  const todayStr = new Date().toDateString()
  const todayIndex = dates.indexOf(todayStr)
  const [activeDate, setActiveDate] = useState(todayIndex >= 0 ? todayStr : dates[0] ?? '')

  const dateTabs = dates.map(d => ({
    id: d,
    label:
      d === todayStr
        ? 'Today'
        : new Date(d).toLocaleDateString([], {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          }),
  }))

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const active = container.querySelector<HTMLElement>('[data-active="true"]')
    if (!active) return
    active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeDate])

  return (
    <div>
      <div ref={scrollRef} className="flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-4">
        {dateTabs.map(dt => (
          <button
            key={dt.id}
            data-active={activeDate === dt.id ? 'true' : undefined}
            onClick={() => setActiveDate(dt.id)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeDate === dt.id
                ? 'bg-gold text-black'
                : 'bg-pitch-mid text-white/50 hover:text-white'
            }`}
          >
            {dt.label}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {(byDate[activeDate] ?? []).map((m, i) => (
          <ExpandableMatchCard key={m.id} match={m} index={i} />
        ))}
      </div>
    </div>
  )
}

// ── Stats helpers ─────────────────────────────────────────────────────

function StatBadge({ value, label, gold }: { value: string | number; label: string; gold?: boolean }) {
  return (
    <div className="text-center">
      <p className={`font-heading text-lg ${gold ? 'text-gold' : 'text-white'}`}>{value}</p>
      <p className="text-white/30 text-[10px]">{label}</p>
    </div>
  )
}

// ── Player leaderboard rows ───────────────────────────────────────────

function ScorerRow({ rank, scorer, sortKey }: {
  rank: number
  scorer: Scorer
  sortKey: 'goals' | 'assists' | 'playedMatches'
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-white/30 font-heading w-5 text-right text-sm flex-shrink-0">{rank}</span>
      <div className="w-8 h-8 rounded-full bg-pitch-light flex items-center justify-center flex-shrink-0 overflow-hidden">
        {scorer.team.crest
          ? <img src={scorer.team.crest} alt={scorer.team.name} className="w-5 h-5 object-contain" />
          : <span className="text-white/30 text-xs font-heading">{scorer.player.name.charAt(0)}</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{scorer.player.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-white/40 text-xs truncate">{scorer.team.shortName || scorer.team.name}</p>
          {scorer.player.position && (
            <span className="text-white/20 text-[10px] uppercase">
              {scorer.player.position === 'Goalkeeper' ? 'GK'
                : scorer.player.position === 'Defence' ? 'DEF'
                : scorer.player.position === 'Midfield' ? 'MID'
                : 'FWD'}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-3 flex-shrink-0 text-right">
        {sortKey !== 'playedMatches' && (
          <>
            <StatBadge value={scorer.goals} label="G" gold={sortKey === 'goals'} />
            <StatBadge value={scorer.assists ?? 0} label="A" gold={sortKey === 'assists'} />
          </>
        )}
        <StatBadge value={scorer.playedMatches} label="Apps" gold={sortKey === 'playedMatches'} />
        {sortKey === 'goals' && (scorer.penalties ?? 0) > 0 && (
          <StatBadge value={`${scorer.penalties}P`} label="Pen" />
        )}
      </div>
    </div>
  )
}

// ── Team stat rows ────────────────────────────────────────────────────

function TeamStatRow({ rank, row, sortKey, cleanSheets }: {
  rank: number
  row: Standing
  sortKey: 'goalsFor' | 'goalsAgainst' | 'points'
  cleanSheets?: number
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-white/30 font-heading w-5 text-right text-sm flex-shrink-0">{rank}</span>
      <div className="w-6 h-6 flex-shrink-0">
        {row.team.crest && <img src={row.team.crest} alt={row.team.name} className="w-full h-full object-contain" />}
      </div>
      <p className="text-white text-sm flex-1 min-w-0 truncate">{row.team.shortName || row.team.name}</p>
      <div className="flex gap-3 flex-shrink-0 text-right">
        {sortKey === 'goalsFor' && (
          <>
            <StatBadge value={row.goalsFor} label="GF" gold />
            <StatBadge value={row.playedGames > 0 ? (row.goalsFor / row.playedGames).toFixed(1) : '–'} label="Per G" />
            <StatBadge value={row.won} label="W" />
          </>
        )}
        {sortKey === 'goalsAgainst' && (
          <>
            <StatBadge value={row.goalsAgainst} label="GA" gold />
            <StatBadge value={cleanSheets ?? '–'} label="CS" />
            <StatBadge value={row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference} label="GD" />
          </>
        )}
        {sortKey === 'points' && (
          <>
            <StatBadge value={row.points} label="Pts" gold />
            <StatBadge value={`${row.won}/${row.draw}/${row.lost}`} label="W/D/L" />
            <StatBadge value={row.playedGames} label="P" />
          </>
        )}
      </div>
    </div>
  )
}

// ── Stats View ────────────────────────────────────────────────────────

function StatsView({ matches }: { matches: Match[] }) {
  const { data: allScorers = [], isLoading: scorersLoading } = useScorers()
  const { data: standings = [] } = useStandings()

  const [view, setView] = useState<'players' | 'teams'>('players')
  const [playerSort, setPlayerSort] = useState<'goals' | 'assists' | 'playedMatches'>('goals')
  const [teamSort, setTeamSort] = useState<'goalsFor' | 'goalsAgainst' | 'points'>('goalsFor')

  // Flatten all group standings into one list (deduplicate by team id)
  const teamRows = (() => {
    const seen = new Set<number>()
    const rows: Standing[] = []
    for (const g of standings.filter(s => s.type === 'TOTAL')) {
      for (const row of g.table) {
        if (!seen.has(row.team.id)) {
          seen.add(row.team.id)
          rows.push(row)
        }
      }
    }
    return rows
  })()

  // Compute clean sheets per team from finished match scores
  const cleanSheetsByTeam = (() => {
    const cs: Record<number, number> = {}
    for (const m of matches) {
      if (m.status !== 'FINISHED') continue
      const hg = m.score.fullTime.home ?? 0
      const ag = m.score.fullTime.away ?? 0
      if (ag === 0) cs[m.homeTeam.id] = (cs[m.homeTeam.id] ?? 0) + 1
      if (hg === 0) cs[m.awayTeam.id] = (cs[m.awayTeam.id] ?? 0) + 1
    }
    return cs
  })()

  const sortedScorers = [...allScorers]
    .filter(s =>
      playerSort === 'goals' ? s.goals > 0
      : playerSort === 'assists' ? (s.assists ?? 0) > 0
      : s.playedMatches > 0
    )
    .sort((a, b) =>
      playerSort === 'goals' ? b.goals - a.goals
      : playerSort === 'assists' ? (b.assists ?? 0) - (a.assists ?? 0)
      : b.playedMatches - a.playedMatches
    )

  const sortedTeams = [...teamRows].sort((a, b) =>
    teamSort === 'goalsFor' ? b.goalsFor - a.goalsFor
    : teamSort === 'goalsAgainst' ? a.goalsAgainst - b.goalsAgainst
    : b.points - a.points
  )

  const noData = allScorers.length === 0 && teamRows.length === 0

  if (scorersLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton rounded-xl h-14" />)}
      </div>
    )
  }

  if (noData) {
    return (
      <div className="text-center py-16 text-white/30">
        <p className="text-3xl mb-2">⚽</p>
        <p>Stats will appear once matches begin</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Top-level view toggle */}
      <div className="flex gap-2">
        {(['players', 'teams'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              view === v ? 'bg-gold text-black' : 'bg-pitch-mid text-white/50 hover:text-white'
            }`}
          >
            {v === 'players' ? 'Players' : 'Teams'}
          </button>
        ))}
      </div>

      {view === 'players' && (
        <>
          {/* Player sort tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {([
              { key: 'goals', label: 'Top Scorers' },
              { key: 'assists', label: 'Top Assists' },
              { key: 'playedMatches', label: 'Appearances' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPlayerSort(key)}
                className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  playerSort === key ? 'bg-white/15 text-white' : 'bg-pitch-mid text-white/40 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {sortedScorers.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">No data yet</p>
          ) : (
            <div className="bg-pitch-mid rounded-xl overflow-hidden">
              {sortedScorers.slice(0, 25).map((s, i) => (
                <ScorerRow key={s.player.id} rank={i + 1} scorer={s} sortKey={playerSort} />
              ))}
            </div>
          )}
        </>
      )}

      {view === 'teams' && (
        <>
          {/* Team sort tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {([
              { key: 'goalsFor', label: 'Best Attack' },
              { key: 'goalsAgainst', label: 'Best Defence' },
              { key: 'points', label: 'Most Points' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTeamSort(key)}
                className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  teamSort === key ? 'bg-white/15 text-white' : 'bg-pitch-mid text-white/40 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {sortedTeams.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">Standings not yet available</p>
          ) : (
            <div className="bg-pitch-mid rounded-xl overflow-hidden">
              {sortedTeams.map((row, i) => (
                <TeamStatRow
                  key={row.team.id}
                  rank={i + 1}
                  row={row}
                  sortKey={teamSort}
                  cleanSheets={cleanSheetsByTeam[row.team.id]}
                />
              ))}
            </div>
          )}
        </>
      )}

      <p className="text-white/20 text-[10px] text-center">WC 2026 · football-data.org</p>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────
export default function FixturesPage() {
  const { data: matches = [], isLoading } = useMatches()
  const { data: standings = [] } = useStandings()
  const { selectedTeamId, setSelectedTeam } = useUIStore()
  const [tab, setTab] = useState('schedule')

  const groupStandings = standings.filter(s => s.type === 'TOTAL')

  const tabs = [
    { id: 'schedule', label: 'Schedule' },
    { id: 'groups', label: 'Groups' },
    { id: 'bracket', label: 'Bracket' },
    { id: 'stats', label: 'Stats' },
  ]

  return (
    <PageWrapper>
      <h1 className="font-heading text-xl text-gold mb-4 uppercase tracking-wide">Fixtures</h1>
      <SlidingTabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'schedule' &&
        (isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <MatchCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <ScheduleView matches={matches} />
        ))}

      {tab === 'groups' &&
        (isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton rounded-xl h-40" />
            ))}
          </div>
        ) : groupStandings.length === 0 ? (
          <div className="text-center py-12 text-white/30">Group standings loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {groupStandings.map(g => (
              <GroupTable key={g.group} group={g} />
            ))}
          </div>
        ))}

      {tab === 'bracket' &&
        (isLoading ? (
          <div className="skeleton rounded-xl h-64" />
        ) : (
          <BracketView matches={matches} />
        ))}

      {tab === 'stats' && <StatsView matches={matches} />}

      <TeamPanel teamId={selectedTeamId} onClose={() => setSelectedTeam(null)} />
    </PageWrapper>
  )
}
