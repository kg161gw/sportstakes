import { useState } from 'react'
import PageWrapper from '../components/shared/PageWrapper'
import { useMatches } from '../hooks/useMatches'
import { useUIStore } from '../store/uiStore'
import MatchCard from '../components/fixtures/MatchCard'
import TeamPanel from '../components/teams/TeamPanel'
import { MatchCardSkeleton } from '../components/shared/LoadingSkeleton'
import type { Match } from '../api/footballApi'

type View = 'group' | 'knockout' | 'all'

function groupMatches(matches: Match[]) {
  const groups: Record<string, Match[]> = {}
  for (const m of matches) {
    const key = m.group ?? m.stage ?? 'Other'
    ;(groups[key] ??= []).push(m)
  }
  return groups
}

export default function FixturesPage() {
  const { data: matches = [], isLoading } = useMatches()
  const { selectedTeamId, setSelectedTeam } = useUIStore()
  const [view, setView] = useState<View>('all')

  const grouped = groupMatches(matches)
  const isKnockout = (stage: string) => !stage.startsWith('GROUP')

  const views: { id: View; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'group', label: 'Groups' },
    { id: 'knockout', label: 'Knockout' },
  ]

  return (
    <PageWrapper>
      <h1 className="font-heading text-2xl text-gold mb-6 uppercase tracking-wide">📅 Fixtures</h1>

      {/* View toggle */}
      <div className="flex gap-2 mb-6">
        {views.map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === v.id ? 'bg-gold text-black' : 'bg-pitch-mid text-white/70 hover:text-white'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <MatchCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped)
            .filter(([stage]) => {
              if (view === 'group') return !isKnockout(stage)
              if (view === 'knockout') return isKnockout(stage)
              return true
            })
            .map(([stage, stageMatches]) => (
              <section key={stage}>
                <h2 className="font-heading text-sm text-white/40 uppercase tracking-widest mb-3">
                  {stage.replace(/_/g, ' ')}
                </h2>
                <div className="space-y-2">
                  {stageMatches.map((m, i) => (
                    <MatchCard key={m.id} match={m} index={i} />
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}

      <TeamPanel teamId={selectedTeamId} onClose={() => setSelectedTeam(null)} />
    </PageWrapper>
  )
}
