import { useState } from 'react'
import PageWrapper from '../components/shared/PageWrapper'
import SlidingTabs from '../components/shared/SlidingTabs'
import SweepstakeGrid from '../components/sweepstake/SweepstakeGrid'
import { useMatches, useTodayMatches, useLiveMatches } from '../hooks/useMatches'
import ExpandableMatchCard from '../components/fixtures/ExpandableMatchCard'
import { MatchCardSkeleton } from '../components/shared/LoadingSkeleton'

export default function HomePage() {
  const { isLoading } = useMatches()
  const liveMatches = useLiveMatches()
  const todayMatches = useTodayMatches()
  const [tab, setTab] = useState(liveMatches.length > 0 ? 'live' : 'sweepstake')

  const tabs = [
    { id: 'sweepstake', label: 'Sweepstake' },
    { id: 'today', label: "Today's Matches", count: todayMatches.length },
    { id: 'live', label: 'Live', count: liveMatches.length },
  ]

  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-4">
        <span className="font-heading text-2xl text-gold">SPORTSTAKES</span>
        <span className="text-white/30 text-sm">World Cup 2026</span>
      </div>

      <SlidingTabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'sweepstake' && (
        <SweepstakeGrid />
      )}

      {tab === 'today' && (
        <div className="space-y-2">
          {isLoading ? (
            [1, 2, 3].map(i => <MatchCardSkeleton key={i} />)
          ) : todayMatches.length === 0 ? (
            <div className="text-center py-12 text-white/30">No matches today</div>
          ) : (
            todayMatches.map((m, i) => <ExpandableMatchCard key={m.id} match={m} index={i} />)
          )}
        </div>
      )}

      {tab === 'live' && (
        <div className="space-y-2">
          {liveMatches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">⚽</p>
              <p className="text-white/40">No matches live right now</p>
            </div>
          ) : (
            liveMatches.map((m, i) => <ExpandableMatchCard key={m.id} match={m} index={i} />)
          )}
        </div>
      )}
    </PageWrapper>
  )
}
