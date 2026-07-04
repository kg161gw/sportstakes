import { useState } from 'react'
import PageWrapper from '../components/shared/PageWrapper'
import SlidingTabs from '../components/shared/SlidingTabs'
import { useTeams } from '../hooks/useTeams'
import { useUIStore } from '../store/uiStore'
import TeamCard from '../components/teams/TeamCard'
import TeamPanel from '../components/teams/TeamPanel'
import { SkeletonCard } from '../components/shared/LoadingSkeleton'

const CONFS = ['All', 'UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC']

export default function TeamsPage() {
  const { data: teams = [], isLoading } = useTeams()
  const { selectedTeamId, setSelectedTeam } = useUIStore()
  const [search, setSearch] = useState('')
  const [conf, setConf] = useState('All')

  const filtered = teams.filter(t => {
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.area?.name?.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  const confTabs = CONFS.map(c => ({
    id: c,
    label: c,
    count: c === 'All' ? teams.length : undefined,
  }))

  return (
    <PageWrapper>
      <h1 className="font-heading text-xl text-gold mb-4 uppercase tracking-wide">Teams</h1>

      <input
        type="search"
        placeholder="Search teams or country..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-pitch-mid border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/40 transition-colors mb-3"
      />

      <SlidingTabs tabs={confTabs} active={conf} onChange={setConf} />

      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {Array.from({ length: 16 }).map((_, i) => (
            <SkeletonCard key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {filtered.map((team, i) => (
            <TeamCard key={team.id} team={team} index={i} onClick={() => setSelectedTeam(team.id)} />
          ))}
        </div>
      )}

      <TeamPanel teamId={selectedTeamId} onClose={() => setSelectedTeam(null)} />
    </PageWrapper>
  )
}
