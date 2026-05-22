import {
  ALL_KO_BRACKETS,
  DEADLINE,
  GROUPS,
  GROUP_MATCH_PAIRS,
} from './constants'

export type MatchScore = {
  homeGoals: number
  awayGoals: number
  penWinner?: 'home' | 'away' | null
}

export type PredictionMap = Record<number, MatchScore>

export type TeamStanding = {
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  gd: number
  pts: number
}

export type ResolvedMatch = { matchNumber: number; home: string; away: string }

const GROUP_LETTERS = Object.keys(GROUPS)

export function getGroupMatches(
  groupLetter: string
): Array<{ matchNumber: number; home: string; away: string }> {
  const groupIdx = GROUP_LETTERS.indexOf(groupLetter)
  if (groupIdx === -1) return []
  const teams = GROUPS[groupLetter]
  return GROUP_MATCH_PAIRS.map(([hi, ai], pairIdx) => ({
    matchNumber: groupIdx * 6 + pairIdx + 1,
    home: teams[hi],
    away: teams[ai],
  }))
}

export function calcGroupStandings(
  groupLetter: string,
  predictions: PredictionMap
): TeamStanding[] {
  const teams = GROUPS[groupLetter]
  if (!teams) return []

  const standings: Record<string, TeamStanding> = {}
  for (const team of teams) {
    standings[team] = {
      team, played: 0, won: 0, drawn: 0, lost: 0,
      gf: 0, ga: 0, gd: 0, pts: 0,
    }
  }

  for (const { matchNumber, home, away } of getGroupMatches(groupLetter)) {
    const score = predictions[matchNumber]
    if (score == null) continue

    const { homeGoals, awayGoals } = score
    standings[home].played++
    standings[away].played++
    standings[home].gf += homeGoals
    standings[home].ga += awayGoals
    standings[away].gf += awayGoals
    standings[away].ga += homeGoals

    if (homeGoals > awayGoals) {
      standings[home].won++
      standings[home].pts += 3
      standings[away].lost++
    } else if (awayGoals > homeGoals) {
      standings[away].won++
      standings[away].pts += 3
      standings[home].lost++
    } else {
      standings[home].drawn++
      standings[home].pts += 1
      standings[away].drawn++
      standings[away].pts += 1
    }
  }

  for (const s of Object.values(standings)) {
    s.gd = s.gf - s.ga
  }

  return Object.values(standings).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    if (b.gd !== a.gd) return b.gd - a.gd
    if (b.gf !== a.gf) return b.gf - a.gf
    return a.team.localeCompare(b.team)
  })
}

export function getBest8Thirds(allGroupPredictions: PredictionMap): string[] {
  const thirds = GROUP_LETTERS.map((letter) => {
    const standings = calcGroupStandings(letter, allGroupPredictions)
    return standings[2] ?? null
  }).filter((s): s is TeamStanding => s !== null)

  return thirds
    .sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts
      if (b.gd !== a.gd) return b.gd - a.gd
      if (b.gf !== a.gf) return b.gf - a.gf
      return a.team.localeCompare(b.team)
    })
    .slice(0, 8)
    .map((s) => s.team)
}

export function getMatchWinner(
  matchNumber: number,
  predictions: PredictionMap,
  home: string,
  away: string
): string {
  const score = predictions[matchNumber]
  if (!score) return home
  const { homeGoals, awayGoals, penWinner } = score
  if (homeGoals > awayGoals) return home
  if (awayGoals > homeGoals) return away
  if (penWinner === 'away') return away
  return home
}

export function getMatchLoser(
  matchNumber: number,
  predictions: PredictionMap,
  home: string,
  away: string
): string {
  const winner = getMatchWinner(matchNumber, predictions, home, away)
  return winner === home ? away : home
}

export function resolveSlot(
  slot: string,
  groupPredictions: PredictionMap,
  knockoutPredictions: PredictionMap
): string {
  // Group position slots: '1A', '2B', etc.
  const groupPosMatch = slot.match(/^([1-4])([A-L])$/)
  if (groupPosMatch) {
    const pos = parseInt(groupPosMatch[1], 10) - 1
    const letter = groupPosMatch[2]
    const standings = calcGroupStandings(letter, groupPredictions)
    return standings[pos]?.team ?? slot
  }

  // Best-third slots: '3rd_1' through '3rd_8'
  const thirdMatch = slot.match(/^3rd_(\d+)$/)
  if (thirdMatch) {
    const idx = parseInt(thirdMatch[1], 10) - 1
    const best8 = getBest8Thirds(groupPredictions)
    return best8[idx] ?? slot
  }

  // Winner/Loser slots: 'W73', 'L101', etc.
  const koMatch = slot.match(/^([WL])(\d+)$/)
  if (koMatch) {
    const side = koMatch[1] as 'W' | 'L'
    const matchNumber = parseInt(koMatch[2], 10)
    const entry = ALL_KO_BRACKETS.find((b) => b.matchNumber === matchNumber)
    if (!entry) return slot
    const home = resolveSlot(entry.homeSlot, groupPredictions, knockoutPredictions)
    const away = resolveSlot(entry.awaySlot, groupPredictions, knockoutPredictions)
    return side === 'W'
      ? getMatchWinner(matchNumber, knockoutPredictions, home, away)
      : getMatchLoser(matchNumber, knockoutPredictions, home, away)
  }

  return slot
}

export function buildFullBracket(
  groupPredictions: PredictionMap,
  knockoutPredictions: PredictionMap
): ResolvedMatch[] {
  return ALL_KO_BRACKETS.map(({ matchNumber, homeSlot, awaySlot }) => ({
    matchNumber,
    home: resolveSlot(homeSlot, groupPredictions, knockoutPredictions),
    away: resolveSlot(awaySlot, groupPredictions, knockoutPredictions),
  }))
}

export function isDeadlinePassed(): boolean {
  return Date.now() > DEADLINE.getTime()
}
