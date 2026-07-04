import { NavLink } from 'react-router-dom'
import { useLiveMatches } from '../../hooks/useMatches'

const tabs = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/fixtures', label: 'Fixtures', icon: '📅' },
  { to: '/teams', label: 'Teams', icon: '👕' },
  { to: '/live', label: 'LIVE', icon: '📺' },
]

export default function MobileTabBar() {
  const liveMatches = useLiveMatches()
  const hasLive = liveMatches.length > 0

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-pitch-mid border-t border-white/10 z-50">
      <div className="flex">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive ? 'text-gold' : 'text-white/50'
              }`
            }
          >
            <span className="relative text-xl">
              {tab.icon}
              {tab.label === 'LIVE' && hasLive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-live rounded-full animate-pulse-live" />
              )}
            </span>
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
