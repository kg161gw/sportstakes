// TheSportsDB free tier — no key required, CORS: Allow-Origin: *
const TSDB_BASE = 'https://www.thesportsdb.com/api/v1/json/3'

async function tsdbFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${TSDB_BASE}${path}`)
  if (!res.ok) throw new Error(`TheSportsDB error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

export interface TsdbPlayer {
  idPlayer: string
  strPlayer: string
  strTeam: string
  strNationality: string
  strPosition: string
  strThumb: string | null        // player portrait photo
  strCutout: string | null       // transparent background cutout
  strDescriptionEN: string | null
  dateBorn: string | null
  strHeight: string | null       // e.g. "5'11"
  strWeight: string | null       // e.g. "176 lbs"
  strInstagram: string | null
  strFacebook: string | null
  strTwitter: string | null
  strNumber: string | null       // shirt number
}

export interface TsdbTeam {
  idTeam: string
  strTeam: string
  strTeamShort: string | null
  strAlternate: string | null
  strSport: string
  strLeague: string | null
  strStadium: string | null
  strStadiumLocation: string | null
  intStadiumCapacity: string | null
  strWebsite: string | null
  strDescriptionEN: string | null
  strBadge: string | null
  strLogo: string | null
  strFanart1: string | null
  strFanart2: string | null
  strFanart3: string | null
  strFanart4: string | null
  strBanner: string | null
  strCountry: string | null
  strColour1: string | null
  strColour2: string | null
  intFormedYear: string | null
  strEquipment: string | null
}

interface SearchPlayersResponse {
  player: TsdbPlayer[] | null
}

interface SearchTeamsResponse {
  teams: TsdbTeam[] | null
}

export const theSportsDbApi = {
  searchPlayer: (name: string) =>
    tsdbFetch<SearchPlayersResponse>(`/searchplayers.php?p=${encodeURIComponent(name)}`),
  searchTeam: (name: string) =>
    tsdbFetch<SearchTeamsResponse>(`/searchteams.php?t=${encodeURIComponent(name)}`),
}
