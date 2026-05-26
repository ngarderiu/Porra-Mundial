'use client'

import { useMemo } from 'react'
import {
  BRACKET_R32,
  BRACKET_R16,
  BRACKET_QF,
  BRACKET_SF,
  BRACKET_FINAL,
} from '@/lib/constants'
import BracketMatchCard from './BracketMatchCard'
import RoundHeader from './RoundHeader'
import type { ResolvedMatch, PredictionMap } from '@/lib/bracket'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface Props {
  resolvedBracket: ResolvedMatch[]
  predictions: PredictionMap
  savingStatus: Record<number, SaveStatus>
  lockedMatches: Set<number>
  deadlinePassed: boolean
  onScoreChange: (mn: number, field: 'homeGoals' | 'awayGoals', val: number) => void
  onPenWinner: (mn: number, winner: 'home' | 'away') => void
  onSave: (mn: number) => void
}

const CARD_W = 160
const CARD_H = 72
const COL_GAP = 56
const SLOT_H = CARD_H + 8 // 80 — vertical slot per card in R32

// Round columns in display order
const ROUND_COLS = [BRACKET_R32, BRACKET_R16, BRACKET_QF, BRACKET_SF, BRACKET_FINAL]
const ROUND_X = ROUND_COLS.map((_, i) => i * (CARD_W + COL_GAP))
const TOTAL_W = ROUND_X[4] + CARD_W // 1024
const CONTAINER_H = BRACKET_R32.length * SLOT_H // 1280

// Y center for each match: sequential index within its round column
const MATCH_Y: Record<number, number> = {}
const MATCH_COL: Record<number, number> = {}
ROUND_COLS.forEach((round, colIdx) => {
  round.forEach(({ matchNumber }, i) => {
    MATCH_Y[matchNumber] = i * SLOT_H + CARD_H / 2
    MATCH_COL[matchNumber] = colIdx
  })
})
// Third place sits in the SF column after both SF cards
const THIRD_TOP = 2 * SLOT_H + 24 // 24px gap below SF matches
MATCH_COL[103] = 3

// Parent map: child → [homeParent, awayParent]
const PARENT_MAP: Record<number, [number, number]> = {}
;[...BRACKET_R16, ...BRACKET_QF, ...BRACKET_SF, ...BRACKET_FINAL].forEach(
  ({ matchNumber, homeSlot, awaySlot }) => {
    const hm = homeSlot.match(/^W(\d+)$/)
    const am = awaySlot.match(/^W(\d+)$/)
    if (hm && am) {
      PARENT_MAP[matchNumber] = [parseInt(hm[1]), parseInt(am[1])]
    }
  }
)

const COLUMNS = [
  { key: 'r32', label: 'Ronda de 32', brackets: BRACKET_R32 },
  { key: 'r16', label: 'Octavos', brackets: BRACKET_R16 },
  { key: 'qf', label: 'Cuartos', brackets: BRACKET_QF },
  { key: 'sf', label: 'Semis', brackets: BRACKET_SF },
  { key: 'final', label: 'Final', brackets: BRACKET_FINAL },
]

function filledCount(brackets: { matchNumber: number }[], preds: PredictionMap) {
  return brackets.filter((b) => preds[b.matchNumber] != null).length
}

export default function BracketTree({
  resolvedBracket,
  predictions,
  savingStatus,
  lockedMatches,
  deadlinePassed,
  onScoreChange,
  onPenWinner,
  onSave,
}: Props) {
  const matchMap = useMemo(
    () => new Map(resolvedBracket.map((m) => [m.matchNumber, m])),
    [resolvedBracket]
  )

  // Compute connector lines purely from precomputed positions — no DOM access
  const lines = useMemo(() => {
    const result: { d: string; color: string; key: string }[] = []

    ;[...BRACKET_R16, ...BRACKET_QF, ...BRACKET_SF, ...BRACKET_FINAL].forEach(
      ({ matchNumber, homeSlot, awaySlot }) => {
        const hm = homeSlot.match(/^W(\d+)$/)
        const am = awaySlot.match(/^W(\d+)$/)
        if (!hm || !am) return

        const parentA = parseInt(hm[1])
        const parentB = parseInt(am[1])

        const yA = MATCH_Y[parentA]
        const yB = MATCH_Y[parentB]
        const yC = MATCH_Y[matchNumber]

        const colParent = MATCH_COL[parentA]
        const xParentRight = ROUND_X[colParent] + CARD_W
        const xChildLeft = ROUND_X[MATCH_COL[matchNumber]]
        const midX = xParentRight + COL_GAP / 2

        const hasPred = predictions[matchNumber] != null
        const m = matchMap.get(matchNumber)
        const colorA = hasPred ? '#86efac' : m?.home !== homeSlot ? '#93c5fd' : '#e5e7eb'
        const colorB = hasPred ? '#86efac' : m?.away !== awaySlot ? '#93c5fd' : '#e5e7eb'
        const colorMid = hasPred ? '#86efac' : '#e5e7eb'

        result.push({
          d: `M ${xParentRight} ${yA} C ${midX} ${yA}, ${midX} ${yC}, ${midX} ${yC}`,
          color: colorA,
          key: `${parentA}-${matchNumber}-a`,
        })
        result.push({
          d: `M ${xParentRight} ${yB} C ${midX} ${yB}, ${midX} ${yC}, ${midX} ${yC}`,
          color: colorB,
          key: `${parentB}-${matchNumber}-b`,
        })
        result.push({
          d: `M ${midX} ${yC} L ${xChildLeft} ${yC}`,
          color: colorMid,
          key: `mid-${matchNumber}`,
        })
      }
    )

    return result
  }, [predictions, matchMap])

  const allMatches = [
    ...BRACKET_R32,
    ...BRACKET_R16,
    ...BRACKET_QF,
    ...BRACKET_SF,
    ...BRACKET_FINAL,
  ]

  return (
    <div>
      {/* Round headers */}
      <div className="flex" style={{ gap: COL_GAP }}>
        {COLUMNS.map((col) => (
          <div key={col.key} className="shrink-0" style={{ width: CARD_W }}>
            <RoundHeader
              title={col.label}
              total={col.brackets.length}
              filled={filledCount(col.brackets, predictions)}
            />
          </div>
        ))}
      </div>

      {/* Cards and SVG connector lines */}
      <div className="relative" style={{ width: TOTAL_W, height: CONTAINER_H }}>
        <svg
          className="absolute inset-0 pointer-events-none"
          width={TOTAL_W}
          height={CONTAINER_H}
          aria-hidden="true"
        >
          {lines.map((l) => (
            <path
              key={l.key}
              d={l.d}
              stroke={l.color}
              strokeWidth={1.5}
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </svg>

        {/* Main bracket matches */}
        {allMatches.map(({ matchNumber }) => {
          const m = matchMap.get(matchNumber)
          if (!m) return null
          return (
            <div
              key={matchNumber}
              style={{
                position: 'absolute',
                left: ROUND_X[MATCH_COL[matchNumber]],
                top: MATCH_Y[matchNumber] - CARD_H / 2,
                width: CARD_W,
              }}
            >
              <BracketMatchCard
                matchNumber={matchNumber}
                home={m.home}
                away={m.away}
                prediction={predictions[matchNumber]}
                status={savingStatus[matchNumber] ?? 'idle'}
                locked={lockedMatches.has(matchNumber)}
                disabled={lockedMatches.has(matchNumber) || deadlinePassed}
                isFinal={matchNumber === 104}
                onScoreChange={(f, v) => onScoreChange(matchNumber, f, v)}
                onPenWinner={(w) => onPenWinner(matchNumber, w)}
                onSave={() => onSave(matchNumber)}
              />
            </div>
          )
        })}

        {/* Third place match */}
        {matchMap.get(103) && (
          <div
            style={{
              position: 'absolute',
              left: ROUND_X[3],
              top: THIRD_TOP,
              width: CARD_W,
            }}
          >
            <span className="block text-[10px] text-gray-400 font-medium mb-1 uppercase tracking-wide text-center">
              3er y 4º puesto
            </span>
            <BracketMatchCard
              matchNumber={103}
              home={matchMap.get(103)!.home}
              away={matchMap.get(103)!.away}
              prediction={predictions[103]}
              status={savingStatus[103] ?? 'idle'}
              locked={lockedMatches.has(103)}
              disabled={lockedMatches.has(103) || deadlinePassed}
              onScoreChange={(f, v) => onScoreChange(103, f, v)}
              onPenWinner={(w) => onPenWinner(103, w)}
              onSave={() => onSave(103)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
