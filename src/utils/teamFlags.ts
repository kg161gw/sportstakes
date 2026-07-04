// Maps football-data.org team names to ISO 3166-1 alpha-2 country codes.
// Used to generate reliable flag images from flagcdn.com instead of
// the football-data.org SVG crests which are blank for many national teams.

// Canonical name aliases — maps every known alternative spelling/abbreviation
// to the key used in TEAM_ISO. Checked before TEAM_ISO for lookups.
const ALIASES: Record<string, string> = {
  'usa':                            'United States',
  'united states of america':       'United States',
  'cape verde':                     'Cabo Verde',
  'bosnia herzegovina':             'Bosnia and Herzegovina',
  'bosnia & herzegovina':           'Bosnia and Herzegovina',
  'bosnia-herzegovina':             'Bosnia and Herzegovina',
  'bih':                            'Bosnia and Herzegovina',
  'bosna i hercegovina':            'Bosnia and Herzegovina',
  'cabo verde':                     'Cape Verde',
  'cape verde islands':             'Cape Verde',
  'dr congo':                       'Congo DR',
  'democratic republic of congo':   'Congo DR',
  'democratic republic of the congo': 'Congo DR',
  'republic of ireland':            'Ireland',
  'ivory coast':                    'Côte d\'Ivoire',
  "cote d'ivoire":                  'Côte d\'Ivoire',
  'south korea':                    'Korea Republic',
  'trinidad & tobago':              'Trinidad and Tobago',
}

const TEAM_ISO: Record<string, string> = {
  // Group stage & likely knockouts — WC 2026 participants
  'Argentina':                  'AR',
  'Australia':                  'AU',
  'Belgium':                    'BE',
  'Bolivia':                    'BO',
  'Bosnia and Herzegovina':     'BA',
  'Brazil':                     'BR',
  'Cameroon':                   'CM',
  'Canada':                     'CA',
  'Chile':                      'CL',
  'China PR':                   'CN',
  'Colombia':                   'CO',
  'Costa Rica':                 'CR',
  'Croatia':                    'HR',
  'Cuba':                       'CU',
  'DR Congo':                   'CD',
  'Congo DR':                   'CD',
  'Ecuador':                    'EC',
  'Egypt':                      'EG',
  'England':                    'GB-ENG',
  'France':                     'FR',
  'Germany':                    'DE',
  'Ghana':                      'GH',
  'Honduras':                   'HN',
  'Hungary':                    'HU',
  'Indonesia':                  'ID',
  'Iran':                       'IR',
  'Italy':                      'IT',
  'Ivory Coast':                'CI',
  "Côte d'Ivoire":              'CI',
  'Jamaica':                    'JM',
  'Japan':                      'JP',
  'Kenya':                      'KE',
  'Mali':                       'ML',
  'Mexico':                     'MX',
  'Morocco':                    'MA',
  'Netherlands':                'NL',
  'New Zealand':                'NZ',
  'Nicaragua':                  'NI',
  'Nigeria':                    'NG',
  'Panama':                     'PA',
  'Paraguay':                   'PY',
  'Peru':                       'PE',
  'Portugal':                   'PT',
  'Qatar':                      'QA',
  'Saudi Arabia':               'SA',
  'Scotland':                   'GB-SCT',
  'Senegal':                    'SN',
  'Serbia':                     'RS',
  'Slovenia':                   'SI',
  'South Korea':                'KR',
  'Korea Republic':             'KR',
  'Spain':                      'ES',
  'Tanzania':                   'TZ',
  'Trinidad and Tobago':        'TT',
  'Tunisia':                    'TN',
  'Turkey':                     'TR',
  'Ukraine':                    'UA',
  'United States':              'US',
  'USA':                        'US',
  'Uruguay':                    'UY',
  'Venezuela':                  'VE',
  'Wales':                      'GB-WLS',
  'Cabo Verde':                 'CV',
  'Cape Verde':                 'CV',
  'Algeria':                    'DZ',
  'Benin':                      'BJ',
  'Burkina Faso':               'BF',
  'Comoros':                    'KM',
  'Djibouti':                   'DJ',
  'Ethiopia':                   'ET',
  'Gabon':                      'GA',
  'Guinea':                     'GN',
  'Liberia':                    'LR',
  'Mozambique':                 'MZ',
  'Namibia':                    'NA',
  'South Africa':               'ZA',
  'Sudan':                      'SD',
  'Uganda':                     'UG',
  'Zambia':                     'ZM',
  'Zimbabwe':                   'ZW',
  'Bahrain':                    'BH',
  'Iraq':                       'IQ',
  'Jordan':                     'JO',
  'Kuwait':                     'KW',
  'Lebanon':                    'LB',
  'Oman':                       'OM',
  'Palestine':                  'PS',
  'Philippines':                'PH',
  'Syria':                      'SY',
  'Thailand':                   'TH',
  'Vietnam':                    'VN',
  'Uzbekistan':                 'UZ',
}

/** Resolve a team name (any spelling/abbreviation) to its ISO code. */
function resolveIso(teamName: string): string | null {
  const canonical = ALIASES[teamName.toLowerCase().trim()] ?? teamName
  return TEAM_ISO[canonical] ?? TEAM_ISO[teamName] ?? null
}

/**
 * Returns a flagcdn.com image URL for the given team name, or null if unknown.
 * flagcdn.com always returns a real flag image — reliable for all countries.
 * Sizes available: w20, w40, w80, w160, w320, w640, w1280, w2560
 */
export function teamFlagUrl(teamName: string, size: 'w20' | 'w40' | 'w80' = 'w40'): string | null {
  const iso = resolveIso(teamName)
  if (!iso) return null
  return `https://flagcdn.com/${size}/${iso.toLowerCase()}.png`
}

/** Returns a flag emoji for the given team name, or '' if unknown. */
export function teamFlagEmoji(teamName: string): string {
  const iso = resolveIso(teamName)
  if (!iso) return ''
  // GB subdivisions: use the parent GB flag for emoji
  const base = iso.startsWith('GB-') ? 'GB' : iso.toUpperCase()
  return base
    .split('')
    .map(c => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join('')
}

/**
 * Normalise a team name for fuzzy matching across data sources.
 * Lowercases, trims, and resolves known aliases so that "USA" === "United States".
 */
export function normaliseTeamName(name: string): string {
  const lower = name.toLowerCase().trim()
  return (ALIASES[lower] ?? name).toLowerCase().trim()
}
