export const GROUPS: Record<string, string[]> = {
  A: ['México', 'Sudáfrica', 'Corea del Sur', 'Chequia'],
  B: ['Canadá', 'Bosnia y Herz.', 'Catar', 'Suiza'],
  C: ['Brasil', 'Marruecos', 'Haití', 'Escocia'],
  D: ['EE.UU.', 'Paraguay', 'Australia', 'Turquía'],
  E: ['Alemania', 'Curaçao', 'Costa de Marfil', 'Ecuador'],
  F: ['Países Bajos', 'Japón', 'Suecia', 'Túnez'],
  G: ['Bélgica', 'Egipto', 'Irán', 'Nueva Zelanda'],
  H: ['España', 'Cabo Verde', 'Arabia Saudí', 'Uruguay'],
  I: ['Francia', 'Senegal', 'Irak', 'Noruega'],
  J: ['Argentina', 'Argelia', 'Austria', 'Jordania'],
  K: ['Portugal', 'RD Congo', 'Uzbekistán', 'Colombia'],
  L: ['Inglaterra', 'Croacia', 'Ghana', 'Panamá'],
}

// Index pairs [homeIdx, awayIdx] within each group's team array
export const GROUP_MATCH_PAIRS: [number, number][] = [
  [0, 1],
  [2, 3],
  [0, 2],
  [1, 3],
  [0, 3],
  [1, 2],
]

export const TEAM_ABBR: Record<string, string> = {
  México: 'MEX',
  Sudáfrica: 'ZAF',
  'Corea del Sur': 'KOR',
  Chequia: 'CZE',
  Canadá: 'CAN',
  'Bosnia y Herz.': 'BIH',
  Catar: 'QAT',
  Suiza: 'SUI',
  Brasil: 'BRA',
  Marruecos: 'MAR',
  Haití: 'HTI',
  Escocia: 'SCO',
  'EE.UU.': 'USA',
  Paraguay: 'PRY',
  Australia: 'AUS',
  Turquía: 'TUR',
  Alemania: 'GER',
  Curaçao: 'CUW',
  'Costa de Marfil': 'CIV',
  Ecuador: 'ECU',
  'Países Bajos': 'NED',
  Japón: 'JPN',
  Suecia: 'SWE',
  Túnez: 'TUN',
  Bélgica: 'BEL',
  Egipto: 'EGY',
  Irán: 'IRN',
  'Nueva Zelanda': 'NZL',
  España: 'ESP',
  'Cabo Verde': 'CPV',
  'Arabia Saudí': 'KSA',
  Uruguay: 'URU',
  Francia: 'FRA',
  Senegal: 'SEN',
  Irak: 'IRQ',
  Noruega: 'NOR',
  Argentina: 'ARG',
  Argelia: 'ALG',
  Austria: 'AUT',
  Jordania: 'JOR',
  Portugal: 'POR',
  'RD Congo': 'COD',
  Uzbekistán: 'UZB',
  Colombia: 'COL',
  Inglaterra: 'ENG',
  Croacia: 'CRO',
  Ghana: 'GHA',
  Panamá: 'PAN',
}

export const TEAM_FLAGS: Record<string, string> = {
  México: '🇲🇽',
  Sudáfrica: '🇿🇦',
  'Corea del Sur': '🇰🇷',
  Chequia: '🇨🇿',
  Canadá: '🇨🇦',
  'Bosnia y Herz.': '🇧🇦',
  Catar: '🇶🇦',
  Suiza: '🇨🇭',
  Brasil: '🇧🇷',
  Marruecos: '🇲🇦',
  Haití: '🇭🇹',
  Escocia: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'EE.UU.': '🇺🇸',
  Paraguay: '🇵🇾',
  Australia: '🇦🇺',
  Turquía: '🇹🇷',
  Alemania: '🇩🇪',
  Curaçao: '🇨🇼',
  'Costa de Marfil': '🇨🇮',
  Ecuador: '🇪🇨',
  'Países Bajos': '🇳🇱',
  Japón: '🇯🇵',
  Suecia: '🇸🇪',
  Túnez: '🇹🇳',
  Bélgica: '🇧🇪',
  Egipto: '🇪🇬',
  Irán: '🇮🇷',
  'Nueva Zelanda': '🇳🇿',
  España: '🇪🇸',
  'Cabo Verde': '🇨🇻',
  'Arabia Saudí': '🇸🇦',
  Uruguay: '🇺🇾',
  Francia: '🇫🇷',
  Senegal: '🇸🇳',
  Irak: '🇮🇶',
  Noruega: '🇳🇴',
  Argentina: '🇦🇷',
  Argelia: '🇩🇿',
  Austria: '🇦🇹',
  Jordania: '🇯🇴',
  Portugal: '🇵🇹',
  'RD Congo': '🇨🇩',
  Uzbekistán: '🇺🇿',
  Colombia: '🇨🇴',
  Inglaterra: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  Croacia: '🇭🇷',
  Ghana: '🇬🇭',
  Panamá: '🇵🇦',
}

export interface BracketEntry {
  matchNumber: number
  homeSlot: string
  awaySlot: string
}

export const BRACKET_R32: BracketEntry[] = [
  { matchNumber: 73, homeSlot: '2A', awaySlot: '2B' },
  { matchNumber: 74, homeSlot: '1E', awaySlot: '3rd_1' },
  { matchNumber: 75, homeSlot: '1F', awaySlot: '2C' },
  { matchNumber: 76, homeSlot: '1C', awaySlot: '2F' },
  { matchNumber: 77, homeSlot: '1I', awaySlot: '3rd_2' },
  { matchNumber: 78, homeSlot: '2E', awaySlot: '2I' },
  { matchNumber: 79, homeSlot: '1A', awaySlot: '3rd_3' },
  { matchNumber: 80, homeSlot: '1L', awaySlot: '3rd_4' },
  { matchNumber: 81, homeSlot: '1D', awaySlot: '3rd_5' },
  { matchNumber: 82, homeSlot: '1G', awaySlot: '3rd_6' },
  { matchNumber: 83, homeSlot: '2K', awaySlot: '2L' },
  { matchNumber: 84, homeSlot: '1H', awaySlot: '2J' },
  { matchNumber: 85, homeSlot: '1B', awaySlot: '3rd_7' },
  { matchNumber: 86, homeSlot: '1J', awaySlot: '2H' },
  { matchNumber: 87, homeSlot: '1K', awaySlot: '3rd_8' },
  { matchNumber: 88, homeSlot: '2D', awaySlot: '2G' },
]

export const BRACKET_R16: BracketEntry[] = [
  { matchNumber: 89, homeSlot: 'W73', awaySlot: 'W77' },
  { matchNumber: 90, homeSlot: 'W74', awaySlot: 'W75' },
  { matchNumber: 91, homeSlot: 'W76', awaySlot: 'W78' },
  { matchNumber: 92, homeSlot: 'W79', awaySlot: 'W80' },
  { matchNumber: 93, homeSlot: 'W83', awaySlot: 'W84' },
  { matchNumber: 94, homeSlot: 'W81', awaySlot: 'W82' },
  { matchNumber: 95, homeSlot: 'W86', awaySlot: 'W88' },
  { matchNumber: 96, homeSlot: 'W85', awaySlot: 'W87' },
]

export const BRACKET_QF: BracketEntry[] = [
  { matchNumber: 97, homeSlot: 'W89', awaySlot: 'W90' },
  { matchNumber: 98, homeSlot: 'W93', awaySlot: 'W94' },
  { matchNumber: 99, homeSlot: 'W91', awaySlot: 'W92' },
  { matchNumber: 100, homeSlot: 'W95', awaySlot: 'W96' },
]

export const BRACKET_SF: BracketEntry[] = [
  { matchNumber: 101, homeSlot: 'W97', awaySlot: 'W98' },
  { matchNumber: 102, homeSlot: 'W99', awaySlot: 'W100' },
]

export const BRACKET_THIRD: BracketEntry[] = [
  { matchNumber: 103, homeSlot: 'L101', awaySlot: 'L102' },
]

export const BRACKET_FINAL: BracketEntry[] = [
  { matchNumber: 104, homeSlot: 'W101', awaySlot: 'W102' },
]

export const ALL_KO_BRACKETS: BracketEntry[] = [
  ...BRACKET_R32,
  ...BRACKET_R16,
  ...BRACKET_QF,
  ...BRACKET_SF,
  ...BRACKET_THIRD,
  ...BRACKET_FINAL,
]

export const DEADLINE = new Date(
  process.env.NEXT_PUBLIC_DEADLINE ?? '2026-06-10T22:00:00Z'
)
