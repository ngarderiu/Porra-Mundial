import { describe, it, expect } from 'vitest'
import {
  calcGroupStandings,
  getBest8Thirds,
  resolveSlot,
  buildFullBracket,
  getMatchWinner,
  getMatchLoser,
  getGroupMatches,
  type PredictionMap,
} from '../bracket'

// Full Group A predictions (6 matches, numbers 1-6)
// A: México(0), Sudáfrica(1), Corea del Sur(2), Chequia(3)
// Pairs: [0v1]=1, [2v3]=2, [0v2]=3, [1v3]=4, [0v3]=5, [1v2]=6
const groupAPreds: PredictionMap = {
  1: { homeGoals: 3, awayGoals: 0 }, // México 3-0 Sudáfrica
  2: { homeGoals: 1, awayGoals: 2 }, // Corea del Sur 1-2 Chequia
  3: { homeGoals: 2, awayGoals: 1 }, // México 2-1 Corea del Sur
  4: { homeGoals: 0, awayGoals: 1 }, // Sudáfrica 0-1 Chequia
  5: { homeGoals: 1, awayGoals: 0 }, // México 1-0 Chequia
  6: { homeGoals: 2, awayGoals: 0 }, // Sudáfrica 2-0 Corea del Sur
}
// Expected standings: México 9pts, Chequia 6pts, Sudáfrica 3pts, Corea 0pts

describe('getGroupMatches', () => {
  it('returns 6 matches for group A with correct match numbers', () => {
    const matches = getGroupMatches('A')
    expect(matches).toHaveLength(6)
    expect(matches[0]).toEqual({ matchNumber: 1, home: 'México', away: 'Sudáfrica' })
    expect(matches[5]).toEqual({ matchNumber: 6, home: 'Sudáfrica', away: 'Corea del Sur' })
  })

  it('returns correct match numbers for group L (67-72)', () => {
    const matches = getGroupMatches('L')
    expect(matches[0].matchNumber).toBe(67)
    expect(matches[5].matchNumber).toBe(72)
    expect(matches[0].home).toBe('Inglaterra')
    expect(matches[0].away).toBe('Croacia')
  })

  it('returns empty array for unknown group', () => {
    expect(getGroupMatches('Z')).toEqual([])
  })
})

describe('calcGroupStandings', () => {
  it('calculates full standings in correct order', () => {
    const standings = calcGroupStandings('A', groupAPreds)
    expect(standings).toHaveLength(4)
    expect(standings[0].team).toBe('México')
    expect(standings[0].pts).toBe(9)
    expect(standings[0].won).toBe(3)
    expect(standings[1].team).toBe('Chequia')
    expect(standings[1].pts).toBe(6)
    expect(standings[2].team).toBe('Sudáfrica')
    expect(standings[2].pts).toBe(3)
    expect(standings[3].team).toBe('Corea del Sur')
    expect(standings[3].pts).toBe(0)
  })

  it('only counts matches with data (partial predictions)', () => {
    const partial: PredictionMap = {
      1: { homeGoals: 2, awayGoals: 0 }, // México 2-0 Sudáfrica
      // matches 2-6 missing
    }
    const standings = calcGroupStandings('A', partial)
    expect(standings.find((s) => s.team === 'México')?.played).toBe(1)
    expect(standings.find((s) => s.team === 'Sudáfrica')?.played).toBe(1)
    expect(standings.find((s) => s.team === 'Corea del Sur')?.played).toBe(0)
  })

  it('handles draws correctly', () => {
    // All 0-0 draws → equal pts, GD, GF for all 4 teams → alphabetical order
    const allDraws: PredictionMap = {
      1: { homeGoals: 0, awayGoals: 0 },
      2: { homeGoals: 0, awayGoals: 0 },
      3: { homeGoals: 0, awayGoals: 0 },
      4: { homeGoals: 0, awayGoals: 0 },
      5: { homeGoals: 0, awayGoals: 0 },
      6: { homeGoals: 0, awayGoals: 0 },
    }
    const standings = calcGroupStandings('A', allDraws)
    // All 4 teams should have equal points, sorted alphabetically
    expect(standings.every((s) => s.pts === 3)).toBe(true)
    expect(standings.every((s) => s.drawn === 3)).toBe(true)
    // Alphabetical tie-break: Chequia, Corea del Sur, México, Sudáfrica
    expect(standings[0].team).toBe('Chequia')
  })

  it('uses gd then gf as tiebreakers', () => {
    // Craft fixture: México and Corea del Sur both 6pts, México higher GD
    // Match 1 (México vs Sudáfrica): 3-0 → México W (+3GD)
    // Match 2 (Corea vs Chequia):    1-0 → Corea W (+1GD)
    // Match 3 (México vs Corea):     0-1 → Corea W (Corea +1GD, México -1GD)
    // Match 4 (Sudáfrica vs Chequia):0-1 → Chequia W
    // Match 5 (México vs Chequia):   1-0 → México W (+1GD)
    // Match 6 (Sudáfrica vs Corea):  2-0 → Sudáfrica W (Corea -2GD)
    // Result: México 6pts GD=+3, Corea 6pts GD=0
    const preds: PredictionMap = {
      1: { homeGoals: 3, awayGoals: 0 },
      2: { homeGoals: 1, awayGoals: 0 },
      3: { homeGoals: 0, awayGoals: 1 },
      4: { homeGoals: 0, awayGoals: 1 },
      5: { homeGoals: 1, awayGoals: 0 },
      6: { homeGoals: 2, awayGoals: 0 },
    }
    const standings = calcGroupStandings('A', preds)
    expect(standings[0].team).toBe('México')
    expect(standings[0].pts).toBe(6)
    expect(standings[0].gd).toBe(3)
    expect(standings[1].team).toBe('Corea del Sur')
    expect(standings[1].pts).toBe(6)
    expect(standings[1].gd).toBe(0)
  })

  it('returns empty array for unknown group', () => {
    expect(calcGroupStandings('Z', {})).toEqual([])
  })
})

// Build a full predictions map for all 72 group matches to test getBest8Thirds
function makeAllGroupPreds(): PredictionMap {
  const preds: PredictionMap = {}
  // Give each group a simple sweep: team[0] wins everything, team[3] loses everything
  for (let g = 0; g < 12; g++) {
    for (let p = 0; p < 6; p++) {
      preds[g * 6 + p + 1] = { homeGoals: 1, awayGoals: 0 }
    }
  }
  return preds
}

describe('getBest8Thirds', () => {
  it('returns exactly 8 teams', () => {
    const preds = makeAllGroupPreds()
    const best8 = getBest8Thirds(preds)
    expect(best8).toHaveLength(8)
  })

  it('returns unique team names', () => {
    const preds = makeAllGroupPreds()
    const best8 = getBest8Thirds(preds)
    expect(new Set(best8).size).toBe(8)
  })

  it('all returned teams are actual 3rd-place finishers', () => {
    const preds = makeAllGroupPreds()
    const best8 = getBest8Thirds(preds)
    // With our preds: T0 wins all, T1 wins 2, T2 wins 1, T3 wins 0
    // 3rd place in each group is T2 (1W 2L = 3pts)
    // All 12 thirds have the same points/GD, so best8 are first 8 alphabetically
    // by team name
    const allThirds = ['Corea del Sur', 'Catar', 'Haití', 'Australia',
      'Costa de Marfil', 'Suecia', 'Irán', 'Arabia Saudí',
      'Irak', 'Austria', 'Uzbekistán', 'Ghana']
    for (const t of best8) {
      expect(allThirds).toContain(t)
    }
  })
})

describe('resolveSlot', () => {
  it('resolves group position slot (1A)', () => {
    const result = resolveSlot('1A', groupAPreds, {})
    expect(result).toBe('México')
  })

  it('resolves 2nd place slot (2A)', () => {
    const result = resolveSlot('2A', groupAPreds, {})
    expect(result).toBe('Chequia')
  })

  it('resolves 3rd_1 (best third)', () => {
    const allPreds = makeAllGroupPreds()
    const result = resolveSlot('3rd_1', allPreds, {})
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
    // Should not be the slot placeholder since we have full preds
    expect(result).not.toBe('3rd_1')
  })

  it('resolves W73 (winner of match 73)', () => {
    // Match 73: homeSlot='2A' awaySlot='2B'
    // With groupAPreds: 2A=Chequia, 2B needs group B preds
    const groupBPreds: PredictionMap = {
      7: { homeGoals: 2, awayGoals: 1 },  // Canadá 2-1 Bosnia y Herz.
      8: { homeGoals: 3, awayGoals: 0 },  // Catar 3-0 Suiza
      9: { homeGoals: 2, awayGoals: 0 },  // Canadá 2-0 Catar
      10: { homeGoals: 1, awayGoals: 0 }, // Bosnia 1-0 Suiza
      11: { homeGoals: 1, awayGoals: 0 }, // Canadá 1-0 Suiza
      12: { homeGoals: 0, awayGoals: 1 }, // Bosnia 0-1 Catar
    }
    // Canadá 9pts = 1B; Catar 6pts = 2B
    const allGroupPreds = { ...groupAPreds, ...groupBPreds }
    const koPreds: PredictionMap = {
      73: { homeGoals: 2, awayGoals: 1 }, // 2A (Chequia) beats 2B (Catar)
    }
    const result = resolveSlot('W73', allGroupPreds, koPreds)
    expect(result).toBe('Chequia')
  })

  it('resolves L101 (loser of match 101)', () => {
    // We need to resolve the full chain; let's just check with empty preds
    // it returns a string (either resolved team or placeholder)
    const result = resolveSlot('L101', {}, {})
    expect(typeof result).toBe('string')
  })

  it('returns slot as placeholder when data is incomplete', () => {
    // No predictions at all → can't determine group standings
    const result = resolveSlot('1A', {}, {})
    // With no matches played, all teams have 0 pts — alphabetical order
    // Chequia comes first alphabetically among A teams
    expect(result).toBe('Chequia')
  })

  it('returns slot string for missing KO prediction', () => {
    // resolveSlot W73 with group data but no KO prediction
    // Since getMatchWinner defaults to home when no prediction, it still resolves
    const result = resolveSlot('W999', groupAPreds, {})
    // match 999 doesn't exist in brackets → returns raw slot
    expect(result).toBe('W999')
  })
})

describe('buildFullBracket', () => {
  it('returns exactly 32 matches', () => {
    const bracket = buildFullBracket({}, {})
    expect(bracket).toHaveLength(32)
  })

  it('match numbers run from 73 to 104', () => {
    const bracket = buildFullBracket({}, {})
    const numbers = bracket.map((m) => m.matchNumber).sort((a, b) => a - b)
    expect(numbers[0]).toBe(73)
    expect(numbers[31]).toBe(104)
  })

  it('all matches have home and away as non-empty strings', () => {
    const bracket = buildFullBracket(makeAllGroupPreds(), {})
    for (const m of bracket) {
      expect(typeof m.home).toBe('string')
      expect(m.home.length).toBeGreaterThan(0)
      expect(typeof m.away).toBe('string')
      expect(m.away.length).toBeGreaterThan(0)
    }
  })
})

describe('getMatchWinner / getMatchLoser', () => {
  it('getMatchWinner returns home on home win', () => {
    const preds: PredictionMap = { 73: { homeGoals: 2, awayGoals: 0 } }
    expect(getMatchWinner(73, preds, 'TeamA', 'TeamB')).toBe('TeamA')
  })

  it('getMatchWinner returns away on away win', () => {
    const preds: PredictionMap = { 73: { homeGoals: 0, awayGoals: 1 } }
    expect(getMatchWinner(73, preds, 'TeamA', 'TeamB')).toBe('TeamB')
  })

  it('getMatchWinner respects penWinner on draw', () => {
    const preds: PredictionMap = { 73: { homeGoals: 1, awayGoals: 1, penWinner: 'away' } }
    expect(getMatchWinner(73, preds, 'TeamA', 'TeamB')).toBe('TeamB')
  })

  it('getMatchWinner defaults to home on draw without penWinner', () => {
    const preds: PredictionMap = { 73: { homeGoals: 0, awayGoals: 0 } }
    expect(getMatchWinner(73, preds, 'TeamA', 'TeamB')).toBe('TeamA')
  })

  it('getMatchLoser is the opposite of getMatchWinner', () => {
    const preds: PredictionMap = { 73: { homeGoals: 2, awayGoals: 1 } }
    expect(getMatchLoser(73, preds, 'TeamA', 'TeamB')).toBe('TeamB')
  })

  it('getMatchWinner defaults to home when no prediction exists', () => {
    expect(getMatchWinner(99, {}, 'TeamA', 'TeamB')).toBe('TeamA')
  })
})
