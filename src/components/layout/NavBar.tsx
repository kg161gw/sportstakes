import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLiveMatches } from '../../hooks/useMatches'

const links = [
  { to: '/', label: 'Home' },
  { to: '/fixtures', label: 'Fixtures' },
  { to: '/teams', label: 'Teams' },
  { to: '/live', label: 'LIVE' },
]

export default function NavBar() {
  const liveMatches = useLiveMatches()
  const hasLive = liveMatches.length > 0

  return (
    <nav className="hidden md:flex items-center justify-between px-6 py-4 border-b border-white/10 bg-pitch/80 backdrop-blur sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <span className="text-2xl">⚽</span>
        <span className="font-heading text-xl text-gold">SPORTSTAKES</span>
      </div>
      <div className="flex items-center gap-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'text-gold' : 'text-white/70 hover:text-white'
              } ${link.label === 'LIVE' ? 'flex items-center gap-2' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                {link.label === 'LIVE' && (
                  <AnimatePresence>
                    {hasLive && (
                      <motion.span
                        key="dot"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="w-2 h-2 rounded-full bg-live animate-pulse-live"
                      />
                    )}
                  </AnimatePresence>
                )}
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-gold rounded"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
