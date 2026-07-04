import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/HomePage'
import FixturesPage from './pages/FixturesPage'
import TeamsPage from './pages/TeamsPage'
import LivePage from './pages/LivePage'
import TeamDetailPage from './pages/TeamDetailPage'

export default function App() {
  const location = useLocation()
  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/fixtures" element={<FixturesPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/live" element={<LivePage />} />
          <Route path="/teams/:id" element={<TeamDetailPage />} />
        </Routes>
      </AnimatePresence>
    </AppShell>
  )
}
