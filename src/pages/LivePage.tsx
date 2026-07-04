import { motion } from 'framer-motion'
import PageWrapper from '../components/shared/PageWrapper'
import StreamCard from '../components/live/StreamCard'
import streamingData from '../data/streaming-links.json'
import { useLiveMatches } from '../hooks/useMatches'
import ExpandableMatchCard from '../components/fixtures/ExpandableMatchCard'

export default function LivePage() {
  const liveMatches = useLiveMatches()

  return (
    <PageWrapper>
      <h1 className="font-heading text-2xl text-gold mb-2 uppercase tracking-wide">📺 Watch Live</h1>
      <p className="text-white/50 text-sm mb-6">Stream, listen, or watch the World Cup anywhere</p>

      {/* Live scores */}
      {liveMatches.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-live animate-pulse-live" />
            <span className="font-heading text-live tracking-wider text-sm">LIVE NOW</span>
          </div>
          <div className="space-y-2">
            {liveMatches.map((m, i) => <ExpandableMatchCard key={m.id} match={m} index={i} />)}
          </div>
        </section>
      )}

      {liveMatches.length === 0 && (
        <div className="mb-8 rounded-xl bg-pitch-mid border border-white/5 p-6 text-center">
          <p className="text-3xl mb-2">⚽</p>
          <p className="text-white/50 text-sm">No matches currently live</p>
          <p className="text-white/30 text-xs mt-1">Check back on match days</p>
        </div>
      )}

      {/* Streaming categories */}
      <div className="space-y-8">
        {streamingData.categories.map((cat, ci) => (
          <motion.section
            key={cat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.08 }}
          >
            <h2 className="font-heading text-sm text-white/40 uppercase tracking-widest mb-3">
              {cat.label}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cat.services.map((service, si) => (
                <StreamCard key={service.name} service={service} index={si} />
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </PageWrapper>
  )
}
