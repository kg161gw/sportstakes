import { motion } from 'framer-motion'

interface Service {
  name: string
  description: string
  url: string
  logo: string
  badge: string
}

const badgeColors: Record<string, string> = {
  FREE: 'bg-win text-white',
  SUB: 'bg-blue-600 text-white',
  CABLE: 'bg-orange-500 text-white',
}

export default function StreamCard({ service, index = 0 }: { service: Service; index?: number }) {
  return (
    <motion.a
      href={service.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="block bg-pitch-mid rounded-xl p-4 border border-white/5 hover:border-gold/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">{service.logo}</span>
          <div>
            <p className="font-heading text-white text-sm">{service.name}</p>
            <p className="text-xs text-white/50 mt-0.5">{service.description}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded font-heading shrink-0 ${badgeColors[service.badge] ?? 'bg-white/10 text-white'}`}>
          {service.badge}
        </span>
      </div>
    </motion.a>
  )
}
