// Maps football-data.org team names to ISO 3166-1 alpha-2 country codes.
// Used as a fallback when a team's crest image fails to load.

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

/** Convert an ISO alpha-2 code to a flag emoji (e.g. "US" → "🇺🇸"). */
function isoToFlagEmoji(code: string): string {
  // GB subdivisions: use the parent GB flag
  const base = code.startsWith('GB-') ? 'GB' : code.toUpperCase()
  return base
    .split('')
    .map(c => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join('')
}

/** Returns a flag emoji for the given team name, or '' if unknown. */
export function teamFlagEmoji(teamName: string): string {
  const iso = TEAM_ISO[teamName]
  return iso ? isoToFlagEmoji(iso) : ''
}
