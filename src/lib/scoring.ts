import { buildFullBracket } from './bracket'
import type { MatchScore, PredictionMap } from './bracket'

export type { MatchScore }
type MatchResult = MatchScore

export function scoreGroupMatch(
  prediction: MatchScore | undefined,
  result: MatchResult | undefined
): number {
  if (!prediction || !result) return 0
  if (
    prediction.homeGoals === result.homeGoals &&
    prediction.awayGoals === result.awayGoals
  ) {
    return 3
  }
  if (
    Math.sign(prediction.homeGoals - prediction.awayGoals) ===
    Math.sign(result.homeGoals - result.awayGoals)
  ) {
    return 1
  }
  return 0
}

export function getKnockoutWinnerSide(
  score: MatchScore
): 'home' | 'away' | null {
  if (score.homeGoals > score.awayGoals) return 'home'
  if (score.awayGoals > score.homeGoals) return 'away'
  return score.penWinner ?? null
}

export function scoreKnockoutMatch(
  prediction: MatchScore | undefined,
  result: MatchResult | undefined,
  predictedHome: string,
  predictedAway: string,
  actualHome: string,
  actualAway: string
): number {
  if (predictedHome !== actualHome || predictedAway !== actualAway) return 0
  if (!prediction || !result) return 0

  const predictedWinner = getKnockoutWinnerSide(prediction)
  const actualWinner = getKnockoutWinnerSide(result)

  const exactScore =
    prediction.homeGoals === result.homeGoals &&
    prediction.awayGoals === result.awayGoals

  // Exact goals match AND winner side (including penalties) must match for 3pts
  if (exactScore && predictedWinner !== null && predictedWinner === actualWinner) {
    return 3
  }
  if (predictedWinner !== null && predictedWinner === actualWinner) {
    return 1
  }
  return 0
}

export function calcUserScore(
  _userId: string,
  userGroupPreds: PredictionMap,
  userKnockoutPreds: PredictionMap,
  actualGroupResults: PredictionMap,
  actualKnockoutResults: PredictionMap
): { total: number; breakdown: { exact: number; winner: number; zero: number } } {
  let total = 0
  const breakdown = { exact: 0, winner: 0, zero: 0 }

  // Group stage: match numbers 1-72
  for (let mn = 1; mn <= 72; mn++) {
    const pts = scoreGroupMatch(userGroupPreds[mn], actualGroupResults[mn])
    total += pts
    if (pts === 3) breakdown.exact++
    else if (pts === 1) breakdown.winner++
    else breakdown.zero++
  }

  // Knockout stage: match numbers 73-104
  const userBracket = buildFullBracket(userGroupPreds, userKnockoutPreds)
  const actualBracket = buildFullBracket(actualGroupResults, actualKnockoutResults)

  const actualByNum = new Map(actualBracket.map((m) => [m.matchNumber, m]))

  for (const { matchNumber, home: predHome, away: predAway } of userBracket) {
    const actual = actualByNum.get(matchNumber)
    if (!actual) continue
    const pts = scoreKnockoutMatch(
      userKnockoutPreds[matchNumber],
      actualKnockoutResults[matchNumber],
      predHome,
      predAway,
      actual.home,
      actual.away
    )
    total += pts
    if (pts === 3) breakdown.exact++
    else if (pts === 1) breakdown.winner++
    else breakdown.zero++
  }

  return { total, breakdown }
}
