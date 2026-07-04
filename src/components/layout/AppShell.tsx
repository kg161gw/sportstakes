import type { ReactNode } from 'react'
import NavBar from './NavBar'
import MobileTabBar from './MobileTabBar'

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh grass-bg flex flex-col">
      <NavBar />
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <MobileTabBar />
    </div>
  )
}
