import { useState } from 'react'
import PageWrapper from '../components/shared/PageWrapper'
import SlidingTabs from '../components/shared/SlidingTabs'
import { useTeams } from '../hooks/useTeams'
import TeamCard from '../components/teams/TeamCard'
import { SkeletonCard } from '../components/shared/LoadingSkeleton'

const CONFS = ['All', 'UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC']

// Map country/area names → confederation
const AREA_CONF: Record<string, string> = {
  // UEFA
  England: 'UEFA', France: 'UEFA', Germany: 'UEFA', Spain: 'UEFA',
  Portugal: 'UEFA', Netherlands: 'UEFA', Belgium: 'UEFA', Croatia: 'UEFA',
  Switzerland: 'UEFA', Serbia: 'UEFA', Denmark: 'UEFA', Austria: 'UEFA',
  Scotland: 'UEFA', Türkiye: 'UEFA', Turkey: 'UEFA', Hungary: 'UEFA',
  Slovenia: 'UEFA', Romania: 'UEFA', 'Czech Republic': 'UEFA', Czechia: 'UEFA',
  Slovakia: 'UEFA', Albania: 'UEFA', Ukraine: 'UEFA', Georgia: 'UEFA',
  Poland: 'UEFA', Iceland: 'UEFA', Sweden: 'UEFA', Norway: 'UEFA',
  Finland: 'UEFA', Greece: 'UEFA', Italy: 'UEFA', 'Bosnia and Herzegovina': 'UEFA',
  'Bosnia Herzegovina': 'UEFA', Montenegro: 'UEFA', Kosovo: 'UEFA',
  // CONMEBOL
  Brazil: 'CONMEBOL', Argentina: 'CONMEBOL', Colombia: 'CONMEBOL',
  Uruguay: 'CONMEBOL', Ecuador: 'CONMEBOL', Paraguay: 'CONMEBOL',
  Bolivia: 'CONMEBOL', Venezuela: 'CONMEBOL', Chile: 'CONMEBOL', Peru: 'CONMEBOL',
  // CONCACAF
  'United States': 'CONCACAF', USA: 'CONCACAF', Mexico: 'CONCACAF',
  Canada: 'CONCACAF', 'Costa Rica': 'CONCACAF', Honduras: 'CONCACAF',
  Jamaica: 'CONCACAF', Trinidad: 'CONCACAF', 'Trinidad and Tobago': 'CONCACAF',
  Panama: 'CONCACAF', 'El Salvador': 'CONCACAF', Guatemala: 'CONCACAF',
  Cuba: 'CONCACAF', Haiti: 'CONCACAF',
  // CAF
  Morocco: 'CAF', Senegal: 'CAF', Nigeria: 'CAF', Egypt: 'CAF', Ghana: 'CAF',
  'Côte d\'Ivoire': 'CAF', 'Ivory Coast': 'CAF', Cameroon: 'CAF', Algeria: 'CAF',
  Tunisia: 'CAF', 'South Africa': 'CAF', 'DR Congo': 'CAF',
  'Democratic Republic of Congo': 'CAF', 'Cape Verde': 'CAF', Guinea: 'CAF',
  Mali: 'CAF', Mozambique: 'CAF', Uganda: 'CAF', Tanzania: 'CAF',
  Zimbabwe: 'CAF', Zambia: 'CAF', Angola: 'CAF', Benin: 'CAF',
  Mauritania: 'CAF', Comoros: 'CAF', Kenya: 'CAF', Ethiopia: 'CAF',
  // AFC
  Japan: 'AFC', 'South Korea': 'AFC', 'Saudi Arabia': 'AFC', Iran: 'AFC',
  Australia: 'AFC', Qatar: 'AFC', Iraq: 'AFC', Jordan: 'AFC',
  UAE: 'AFC', 'United Arab Emirates': 'AFC', Oman: 'AFC', Bahrain: 'AFC',
  Kuwait: 'AFC', Uzbekistan: 'AFC', Indonesia: 'AFC', China: 'AFC',
  Thailand: 'AFC', Vietnam: 'AFC', India: 'AFC', Syria: 'AFC', Palestine: 'AFC',
  // OFC
  'New Zealand': 'OFC', Fiji: 'OFC', 'Papua New Guinea': 'OFC',
  Tahiti: 'OFC', 'Solomon Islands': 'OFC', Vanuatu: 'OFC',
}

function getConf(areaName: string | undefined): string {
  if (!areaName) return 'Other'
  return AREA_CONF[areaName] ?? 'Other'
}

export default function TeamsPage() {
  const { data: teams = [], isLoading } = useTeams()
  const [search, setSearch] = useState('')
  const [conf, setConf] = useState('All')

  const filtered = teams.filter(t => {
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.shortName?.toLowerCase().includes(search.toLowerCase()) ||
      t.area?.name?.toLowerCase().includes(search.toLowerCase())
    const matchesConf = conf === 'All' || getConf(t.area?.name) === conf
    return matchesSearch && matchesConf
  })

  const confTabs = CONFS.map(c => ({
    id: c,
    label: c,
    count: c === 'All'
      ? teams.length
      : teams.filter(t => getConf(t.area?.name) === c).length || undefined,
  }))

  return (
    <PageWrapper>
      <h1 className="font-heading text-xl text-gold mb-4 uppercase tracking-wide">Teams</h1>

      <input
        type="search"
        placeholder="Search teams or country..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-pitch-mid border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/40 transition-colors mb-3"
      />

      <SlidingTabs tabs={confTabs} active={conf} onChange={setConf} />

      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {Array.from({ length: 16 }).map((_, i) => (
            <SkeletonCard key={i} className="h-24" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">No teams found</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {filtered.map((team, i) => (
            <TeamCard key={team.id} team={team} index={i} />
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
