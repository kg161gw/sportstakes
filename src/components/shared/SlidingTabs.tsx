import { motion } from 'framer-motion'

interface Tab { id: string; label: string; count?: number }

interface Props {
  tabs: Tab[]
  active: string
  onChange: (id: string) => void
}

export default function SlidingTabs({ tabs, active, onChange }: Props) {
  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-none border-b border-white/10 mb-4">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative shrink-0 px-4 py-2.5 text-sm font-medium transition-colors ${
            active === tab.id ? 'text-gold' : 'text-white/50 hover:text-white'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              active === tab.id ? 'bg-gold/20 text-gold' : 'bg-white/10 text-white/40'
            }`}>
              {tab.count}
            </span>
          )}
          {active === tab.id && (
            <motion.div
              layoutId="tab-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
            />
          )}
        </button>
      ))}
    </div>
  )
}
