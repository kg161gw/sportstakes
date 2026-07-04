import { AnimatePresence, motion } from 'framer-motion'
import type { Match } from '../../api/footballApi'

export default function ScoreBadge({ match }: { match: Match }) {
  const { status, score } = match
  const isLive = status === 'IN_PLAY' || status === 'PAUSED'
  const isDone = status === 'FINISHED'
  const home = score.fullTime.home
  const away = score.fullTime.away

  if (!isLive && !isDone) return null

  const scoreKey = `${home}-${away}`

  return (
    <div className={`flex items-center gap-1.5 font-heading text-2xl tabular-nums ${isLive ? 'text-gold' : 'text-white'}`}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={`h-${scoreKey}`}
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 12, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {home ?? 0}
        </motion.span>
      </AnimatePresence>
      <span className="text-white/40 text-base">–</span>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={`a-${scoreKey}`}
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 12, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {away ?? 0}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
