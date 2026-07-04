import { create } from 'zustand'

interface UIStore {
  selectedTeamId: number | null
  setSelectedTeam: (id: number | null) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (v: boolean) => void
}

export const useUIStore = create<UIStore>(set => ({
  selectedTeamId: null,
  setSelectedTeam: id => set({ selectedTeamId: id }),
  mobileMenuOpen: false,
  setMobileMenuOpen: v => set({ mobileMenuOpen: v }),
}))
