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

interface SearchPlayersResponse {
  player: TsdbPlayer[] | null
}

export const theSportsDbApi = {
  searchPlayer: (name: string) =>
    tsdbFetch<SearchPlayersResponse>(`/searchplayers.php?p=${encodeURIComponent(name)}`),
}
