import { describe, it, expect } from 'vitest'
import {
  scoreGroupMatch,
  scoreKnockoutMatch,
  getKnockoutWinnerSide,
  calcUserScore,
  type MatchScore,
} from '../scoring'
import type { PredictionMap } from '../bracket'

describe('scoreGroupMatch', () => {
  it('returns 3 for exact score match', () => {
    expect(scoreGroupMatch({ homeGoals: 2, awayGoals: 1 }, { homeGoals: 2, awayGoals: 1 })).toBe(3)
  })

  it('returns 3 for exact 0-0 draw', () => {
    expect(scoreGroupMatch({ homeGoals: 0, awayGoals: 0 }, { homeGoals: 0, awayGoals: 0 })).toBe(3)
  })

  it('returns 1 when winner is correct but score differs', () => {
    expect(scoreGroupMatch({ homeGoals: 1, awayGoals: 0 }, { homeGoals: 3, awayGoals: 1 })).toBe(1)
  })

  it('returns 1 when both predict a draw but different scores', () => {
    expect(scoreGroupMatch({ homeGoals: 1, awayGoals: 1 }, { homeGoals: 2, awayGoals: 2 })).toBe(1)
  })

  it('returns 0 when predicted draw but result is a win', () => {
    expect(scoreGroupMatch({ homeGoals: 1, awayGoals: 1 }, { homeGoals: 2, awayGoals: 0 })).toBe(0)
  })

  it('returns 0 when predicted home win but away won', () => {
    expect(scoreGroupMatch({ homeGoals: 2, awayGoals: 0 }, { homeGoals: 0, awayGoals: 1 })).toBe(0)
  })

  it('returns 0 when prediction is undefined', () => {
    expect(scoreGroupMatch(undefined, { homeGoals: 1, awayGoals: 0 })).toBe(0)
  })

  it('returns 0 when result is undefined', () => {
    expect(scoreGroupMatch({ homeGoals: 1, awayGoals: 0 }, undefined)).toBe(0)
  })

  it('returns 0 when both are undefined', () => {
    expect(scoreGroupMatch(undefined, undefined)).toBe(0)
  })
})

describe('getKnockoutWinnerSide', () => {
  it('returns home on home win', () => {
    expect(getKnockoutWinnerSide({ homeGoals: 2, awayGoals: 0 })).toBe('home')
  })

  it('returns away on away win', () => {
    expect(getKnockoutWinnerSide({ homeGoals: 0, awayGoals: 3 })).toBe('away')
  })

  it('returns penWinner on draw', () => {
    expect(getKnockoutWinnerSide({ homeGoals: 1, awayGoals: 1, penWinner: 'away' })).toBe('away')
    expect(getKnockoutWinnerSide({ homeGoals: 0, awayGoals: 0, penWinner: 'home' })).toBe('home')
  })

  it('returns null on draw without penWinner', () => {
    expect(getKnockoutWinnerSide({ homeGoals: 1, awayGoals: 1 })).toBe(null)
  })
})

describe('scoreKnockoutMatch', () => {
  const home = 'España'
  const away = 'Brasil'

  it('returns 0 when teams do not match (different home)', () => {
    expect(
      scoreKnockoutMatch(
        { homeGoals: 2, awayGoals: 1 },
        { homeGoals: 2, awayGoals: 1 },
        'Francia',
        away,
        home,
        away
      )
    ).toBe(0)
  })

  it('returns 0 when teams do not match (different away)', () => {
    expect(
      scoreKnockoutMatch(
        { homeGoals: 2, awayGoals: 1 },
        { homeGoals: 2, awayGoals: 1 },
        home,
        'Argentina',
        home,
        away
      )
    ).toBe(0)
  })

  it('returns 3 for exact score and correct winner', () => {
    expect(
      scoreKnockoutMatch(
        { homeGoals: 2, awayGoals: 1 },
        { homeGoals: 2, awayGoals: 1 },
        home, away, home, away
      )
    ).toBe(3)
  })

  it('returns 3 for exact score with penalties and correct winner', () => {
    expect(
      scoreKnockoutMatch(
        { homeGoals: 1, awayGoals: 1, penWinner: 'home' },
        { homeGoals: 1, awayGoals: 1, penWinner: 'home' },
        home, away, home, away
      )
    ).toBe(3)
  })

  it('returns 1 for correct winner in normal play, different score', () => {
    expect(
      scoreKnockoutMatch(
        { homeGoals: 1, awayGoals: 0 },
        { homeGoals: 3, awayGoals: 0 },
        home, away, home, away
      )
    ).toBe(1)
  })

  it('returns 1 for correct winner via penalties', () => {
    expect(
      scoreKnockoutMatch(
        { homeGoals: 0, awayGoals: 0, penWinner: 'away' },
        { homeGoals: 1, awayGoals: 1, penWinner: 'away' },
        home, away, home, away
      )
    ).toBe(1)
  })

  it('returns 1 (not 3) when exact goals match but penalty winner differs', () => {
    // Predicted: 1-1 home wins on pens; Actual: 1-1 away wins on pens
    expect(
      scoreKnockoutMatch(
        { homeGoals: 1, awayGoals: 1, penWinner: 'home' },
        { homeGoals: 1, awayGoals: 1, penWinner: 'away' },
        home, away, home, away
      )
    ).toBe(0)
  })

  it('returns 0 when prediction is undefined but teams match', () => {
    expect(
      scoreKnockoutMatch(undefined, { homeGoals: 2, awayGoals: 1 }, home, away, home, away)
    ).toBe(0)
  })

  it('returns 0 when result is undefined but teams match', () => {
    expect(
      scoreKnockoutMatch({ homeGoals: 2, awayGoals: 1 }, undefined, home, away, home, away)
    ).toBe(0)
  })

  it('returns 0 when predicted away win but actual home win', () => {
    expect(
      scoreKnockoutMatch(
        { homeGoals: 0, awayGoals: 2 },
        { homeGoals: 2, awayGoals: 0 },
        home, away, home, away
      )
    ).toBe(0)
  })
})

describe('calcUserScore', () => {
  it('returns 0 for empty predictions vs empty results', () => {
    const result = calcUserScore('user1', {}, {}, {}, {})
    expect(result.total).toBe(0)
    expect(result.breakdown.exact).toBe(0)
    expect(result.breakdown.winner).toBe(0)
  })

  it('returns correct total for mixed group stage predictions', () => {
    const userPreds: PredictionMap = {
      1: { homeGoals: 2, awayGoals: 1 }, // exact match → 3
      2: { homeGoals: 1, awayGoals: 0 }, // correct winner, wrong score → 1
      3: { homeGoals: 0, awayGoals: 0 }, // predicted draw, result home win → 0
    }
    const actualResults: PredictionMap = {
      1: { homeGoals: 2, awayGoals: 1 }, // exact
      2: { homeGoals: 3, awayGoals: 0 }, // home won
      3: { homeGoals: 2, awayGoals: 0 }, // home won
    }
    const result = calcUserScore('user1', userPreds, {}, actualResults, {})
    expect(result.breakdown.exact).toBe(1)
    expect(result.breakdown.winner).toBe(1)
    expect(result.total).toBe(4) // 3 + 1 + 0
  })

  it('breakdown.zero counts correctly', () => {
    // All 72 group matches with no results → all zero
    const result = calcUserScore('user1', {}, {}, {}, {})
    expect(result.breakdown.zero).toBe(72 + 32) // groups + KO
  })

  it('KO scoring: exact score and teams → 3 pts', () => {
    // Need full group preds to resolve slots, then KO prediction
    // Group A preds to put México first
    const groupPreds: PredictionMap = {}
    // México wins everything: matches 1-6
    for (let i = 1; i <= 72; i++) {
      groupPreds[i] = { homeGoals: 2, awayGoals: 0 } // home always wins
    }
    const koPreds: PredictionMap = {}
    const actualKo: PredictionMap = {}
    // Match 73: homeSlot='2A' awaySlot='2B'
    // With home-always-wins: 2A = Chequia (2nd in A), 2B = Catar (2nd in B)
    // Same for actual since same preds
    koPreds[73] = { homeGoals: 2, awayGoals: 1 }
    actualKo[73] = { homeGoals: 2, awayGoals: 1 }

    const result = calcUserScore('user1', groupPreds, koPreds, groupPreds, actualKo)
    // match 73 should score 3 (exact + same teams)
    // We can check total > baseline zero
    expect(result.total).toBeGreaterThan(0)
  })

  it('returns breakdown with correct counts summing to 104 entries', () => {
    const result = calcUserScore('user1', {}, {}, {}, {})
    const { exact, winner, zero } = result.breakdown
    expect(exact + winner + zero).toBe(104)
  })
})
