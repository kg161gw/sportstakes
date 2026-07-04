export const qk = {
  matches: () => ['wc', 'matches'] as const,
  standings: () => ['wc', 'standings'] as const,
  teams: () => ['wc', 'teams'] as const,
  team: (id: number) => ['wc', 'team', id] as const,
  teamMatches: (id: number) => ['wc', 'team', id, 'matches'] as const,
}
