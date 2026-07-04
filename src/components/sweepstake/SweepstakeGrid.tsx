import { motion } from 'framer-motion'
import sweepstake from '../../data/sweepstake.json'
import { useTeams } from '../../hooks/useTeams'

function getCrest(teamName: string, teams: { name: string; crest: string }[]): string | null {
  return teams.find(t => t.name.toLowerCase() === teamName.toLowerCase())?.crest ?? null
}

export default function SweepstakeGrid({ onTeamClick }: { onTeamClick: (name: string) => void }) {
  const { data: teams = [] } = useTeams()

  return (
    <section>
      <h2 className="font-heading text-lg text-gold mb-3 uppercase tracking-wide">The Sweepstake</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {sweepstake.participants.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-pitch-mid rounded-xl p-3 border border-white/5"
          >
            <p className="font-heading text-white text-base mb-2">{p.name}</p>
            <div className="flex flex-wrap gap-2">
              {p.teams.map(teamName => {
                const crest = getCrest(teamName, teams)
                return (
                  <button
                    key={teamName}
                    onClick={() => onTeamClick(teamName)}
                    className="flex items-center gap-2 bg-pitch rounded-lg px-3 py-2 hover:bg-pitch-light transition-colors"
                  >
                    {crest && (
                      <img src={crest} alt={teamName} className="w-6 h-6 object-contain" />
                    )}
                    <span className="text-sm text-white font-medium">{teamName}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
