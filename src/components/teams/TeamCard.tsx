import { motion } from 'framer-motion'
import type { Team } from '../../api/footballApi'
import sweepstake from '../../data/sweepstake.json'

function getParticipant(teamName: string): string | null {
  const p = sweepstake.participants.find(p =>
    p.teams.some(t => t.toLowerCase() === teamName.toLowerCase())
  )
  return p?.name ?? null
}

export default function TeamCard({
  team,
  onClick,
  index = 0,
}: {
  team: Team
  onClick: () => void
  index?: number
}) {
  const participant = getParticipant(team.name)

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="bg-pitch-mid rounded-xl p-2.5 border border-white/5 hover:border-gold/30 transition-colors text-left w-full flex flex-col items-center gap-2 cursor-pointer"
    >
      {team.crest ? (
        <img src={team.crest} alt={team.name} className="w-10 h-10 object-contain" loading="lazy" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-pitch-light flex items-center justify-center text-base font-heading">
          {team.tla}
        </div>
      )}
      <div className="text-center">
        <p className="font-heading text-xs text-white leading-tight">{team.shortName || team.name}</p>
        <p className="text-xs text-white/40 mt-0.5">{team.area?.name}</p>
      </div>
      {participant && (
        <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">
          📌 {participant}
        </span>
      )}
    </motion.button>
  )
}
