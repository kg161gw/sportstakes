import { useState, useEffect, useRef } from 'react'
import PageWrapper from '../components/shared/PageWrapper'
import SlidingTabs from '../components/shared/SlidingTabs'
import { useMatches } from '../hooks/useMatches'
import { useStandings } from '../hooks/useStandings'
import { useUIStore } from '../store/uiStore'
import MatchCard from '../components/fixtures/MatchCard'
import TeamPanel from '../components/teams/TeamPanel'
import { MatchCardSkeleton } from '../components/shared/LoadingSkeleton'
import type { Match, StandingGroup } from '../api/footballApi'

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
  return (
    <div className="bg-pitch-light border border-white/10 rounded-lg overflow-hidden w-40 shrink-0">
      {matchNum && (
        <div className="px-2 py-0.5 bg-white/5 text-white/30 text-[10px] font-heading tracking-wider">
          {matchNum}
        </div>
      )}
      <BracketTeamRow
        team={match.homeTeam}
        score={finished ? match.score.fullTime.home : null}
        isHome
      />
      <BracketTeamRow
        team={match.awayTeam}
        score={finished ? match.score.fullTime.away : null}
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
          <MatchCard key={m.id} match={m} index={i} />
        ))}
      </div>
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

      <TeamPanel teamId={selectedTeamId} onClose={() => setSelectedTeam(null)} />
    </PageWrapper>
  )
}
