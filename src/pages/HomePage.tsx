import PageWrapper from '../components/shared/PageWrapper'
import SweepstakeGrid from '../components/sweepstake/SweepstakeGrid'
import { useMatches, useTodayMatches, useLiveMatches } from '../hooks/useMatches'
import MatchCard from '../components/fixtures/MatchCard'
import { MatchCardSkeleton } from '../components/shared/LoadingSkeleton'
import { useTeams } from '../hooks/useTeams'
import { useUIStore } from '../store/uiStore'
import TeamPanel from '../components/teams/TeamPanel'

export default function HomePage() {
  const { isLoading } = useMatches()
  const { data: teams = [] } = useTeams()
  const liveMatches = useLiveMatches()
  const todayMatches = useTodayMatches()
  const { selectedTeamId, setSelectedTeam } = useUIStore()

  function handleTeamClick(name: string) {
    const team = teams.find(t => t.name.toLowerCase() === name.toLowerCase())
    if (team) setSelectedTeam(team.id)
  }

  return (
    <PageWrapper>
      {/* Live banner */}
      {liveMatches.length > 0 && (
        <div className="mb-6 rounded-xl border border-live/40 bg-live/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-live animate-pulse-live" />
            <span className="font-heading text-live tracking-wider text-sm">LIVE NOW</span>
          </div>
          <div className="space-y-2">
            {liveMatches.map((m, i) => <MatchCard key={m.id} match={m} index={i} />)}
          </div>
        </div>
      )}

      <SweepstakeGrid onTeamClick={handleTeamClick} />

      {/* Today's matches */}
      {todayMatches.length > 0 && (
        <section className="mt-8">
          <h2 className="font-heading text-xl text-gold mb-4 uppercase tracking-wide">📅 Today's Matches</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <MatchCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="space-y-3">
              {todayMatches.map((m, i) => <MatchCard key={m.id} match={m} index={i} />)}
            </div>
          )}
        </section>
      )}

      <TeamPanel teamId={selectedTeamId} onClose={() => setSelectedTeam(null)} />
    </PageWrapper>
  )
}
