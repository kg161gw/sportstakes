import { useState } from 'react'
import PageWrapper from '../components/shared/PageWrapper'
import { useTeams } from '../hooks/useTeams'
import { useUIStore } from '../store/uiStore'
import TeamCard from '../components/teams/TeamCard'
import TeamPanel from '../components/teams/TeamPanel'
import { SkeletonCard } from '../components/shared/LoadingSkeleton'

export default function TeamsPage() {
  const { data: teams = [], isLoading } = useTeams()
  const { selectedTeamId, setSelectedTeam } = useUIStore()
  const [search, setSearch] = useState('')

  const filtered = teams.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.area?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageWrapper>
      <h1 className="font-heading text-2xl text-gold mb-6 uppercase tracking-wide">👕 Teams</h1>

      <div className="mb-6">
        <input
          type="search"
          placeholder="Search teams..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-pitch-mid border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-gold/40 transition-colors"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map((team, i) => (
            <TeamCard
              key={team.id}
              team={team}
              index={i}
              onClick={() => setSelectedTeam(team.id)}
            />
          ))}
        </div>
      )}

      <TeamPanel teamId={selectedTeamId} onClose={() => setSelectedTeam(null)} />
    </PageWrapper>
  )
}
