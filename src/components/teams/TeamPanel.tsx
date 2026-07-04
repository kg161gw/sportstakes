import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTeamDetail, useTeamMatches } from '../../hooks/useTeams'
import { SkeletonCard, SkeletonText } from '../shared/LoadingSkeleton'
import MatchCard from '../fixtures/MatchCard'

const positions = ['Goalkeeper', 'Defence', 'Midfield', 'Offence']

function groupByPosition(squad: { name: string; position: string; nationality: string }[]) {
  const map: Record<string, typeof squad> = {}
  for (const p of squad) {
    const key = p.position || 'Unknown'
    ;(map[key] ??= []).push(p)
  }
  return map
}

export default function TeamPanel({
  teamId,
  onClose,
}: {
  teamId: number | null
  onClose: () => void
}) {
  const { data: team, isLoading } = useTeamDetail(teamId)
  const { data: matches = [] } = useTeamMatches(teamId)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const recentMatches = matches.slice(-5)
  const grouped = team?.squad ? groupByPosition(team.squad) : {}

  return (
    <AnimatePresence>
      {teamId !== null && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[480px] bg-pitch-mid border-l border-white/10 z-50 overflow-y-auto"
          >
            <div className="sticky top-0 bg-pitch-mid border-b border-white/10 p-4 flex items-center justify-between">
              {isLoading ? (
                <SkeletonText className="w-40 h-6" />
              ) : (
                <div className="flex items-center gap-3">
                  {team?.crest && (
                    <img src={team.crest} alt={team.name} className="w-10 h-10 object-contain" />
                  )}
                  <div>
                    <h2 className="font-heading text-lg text-white">{team?.name}</h2>
                    <p className="text-xs text-white/50">{team?.area?.name}</p>
                  </div>
                </div>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-6">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} className="h-12" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Coach */}
                  {team?.coach && (
                    <div className="bg-pitch rounded-xl p-3 flex items-center justify-between">
                      <span className="text-white/50 text-sm">Head Coach</span>
                      <span className="text-white font-medium text-sm">{team.coach.name}</span>
                    </div>
                  )}

                  {/* Recent form */}
                  {recentMatches.length > 0 && (
                    <section>
                      <h3 className="font-heading text-sm text-white/50 uppercase tracking-wider mb-3">
                        Recent Matches
                      </h3>
                      <div className="space-y-2">
                        {recentMatches.map((m, i) => (
                          <MatchCard key={m.id} match={m} index={i} />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Squad */}
                  {Object.keys(grouped).length > 0 && (
                    <section>
                      <h3 className="font-heading text-sm text-white/50 uppercase tracking-wider mb-3">
                        Squad
                      </h3>
                      <div className="space-y-4">
                        {positions.filter(p => grouped[p]).map(pos => (
                          <div key={pos}>
                            <p className="text-xs text-white/30 uppercase tracking-wider mb-2">{pos}</p>
                            <div className="space-y-1">
                              {grouped[pos].map(player => (
                                <div
                                  key={player.name}
                                  className="flex items-center justify-between bg-pitch rounded-lg px-3 py-2"
                                >
                                  <span className="text-sm text-white">{player.name}</span>
                                  <span className="text-xs text-white/40">{player.nationality}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
