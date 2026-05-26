'use client'

import { useLayoutEffect, useRef, useState, useCallback, useMemo } from 'react'
import {
  BRACKET_R32,
  BRACKET_R16,
  BRACKET_QF,
  BRACKET_SF,
  BRACKET_THIRD,
  BRACKET_FINAL,
} from '@/lib/constants'
import BracketMatchCard from './BracketMatchCard'
import RoundHeader from './RoundHeader'
import type { ResolvedMatch, PredictionMap, MatchScore } from '@/lib/bracket'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface SvgLine {
  d: string
  color: string
  key: string
}

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
const CARD_H = 72 // approximate — actual height includes penalty selector
const COL_GAP = 56
const ROW_GAP_R32 = 8
const CONNECTOR_OFFSET = COL_GAP / 2

const ROUNDS = [
  { brackets: BRACKET_R32, label: 'Ronda de 32', key: 'r32' },
  { brackets: BRACKET_R16, label: 'Octavos', key: 'r16' },
  { brackets: BRACKET_QF, label: 'Cuartos', key: 'qf' },
  { brackets: BRACKET_SF, label: 'Semis', key: 'sf' },
  { brackets: BRACKET_FINAL, label: 'Final', key: 'final' },
]

// Map matchNumber → which two parent matchNumbers feed into it
const PARENT_MAP: Record<number, [number, number]> = {}
;[...BRACKET_R16, ...BRACKET_QF, ...BRACKET_SF, ...BRACKET_FINAL].forEach(({ matchNumber, homeSlot, awaySlot }) => {
  const hm = homeSlot.match(/^W(\d+)$/)
  const am = awaySlot.match(/^W(\d+)$/)
  if (hm && am) {
    PARENT_MAP[matchNumber] = [parseInt(hm[1]), parseInt(am[1])]
  }
})

function filledCount(brackets: typeof BRACKET_R32, preds: PredictionMap) {
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
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)
  const [lines, setLines] = useState<SvgLine[]>([])

  const setRef = useCallback((mn: number) => (el: HTMLDivElement | null) => {
    if (el) cardRefs.current.set(mn, el)
    else cardRefs.current.delete(mn)
  }, [])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const containerRect = container.getBoundingClientRect()
    const newLines: SvgLine[] = []

    const allChildBrackets = [...BRACKET_R16, ...BRACKET_QF, ...BRACKET_SF, ...BRACKET_FINAL]

    for (const { matchNumber, homeSlot, awaySlot } of allChildBrackets) {
      const hm = homeSlot.match(/^W(\d+)$/)
      const am = awaySlot.match(/^W(\d+)$/)
      if (!hm || !am) continue

      const parentA = parseInt(hm[1])
      const parentB = parseInt(am[1])

      const elA = cardRefs.current.get(parentA)
      const elB = cardRefs.current.get(parentB)
      const elChild = cardRefs.current.get(matchNumber)
      if (!elA || !elB || !elChild) continue

      const rA = elA.getBoundingClientRect()
      const rB = elB.getBoundingClientRect()
      const rC = elChild.getBoundingClientRect()

      const x1 = rA.right - containerRect.left
      const y1 = rA.top + rA.height / 2 - containerRect.top
      const x1b = rB.right - containerRect.left
      const y1b = rB.top + rB.height / 2 - containerRect.top
      const x2 = rC.left - containerRect.left
      const y2 = rC.top + rC.height / 2 - containerRect.top

      const mid = x1 + CONNECTOR_OFFSET
      const midChild = x2 - CONNECTOR_OFFSET

      // Line from parent A to midpoint vertical
      newLines.push({
        d: `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${mid} ${y2}`,
        color: predictions[matchNumber] ? '#86efac' : matchMap.get(matchNumber)?.home !== homeSlot ? '#93c5fd' : '#e5e7eb',
        key: `${parentA}-mid`,
      })
      // Line from parent B to midpoint vertical
      newLines.push({
        d: `M ${x1b} ${y1b} C ${mid} ${y1b}, ${mid} ${y2}, ${mid} ${y2}`,
        color: predictions[matchNumber] ? '#86efac' : matchMap.get(matchNumber)?.away !== awaySlot ? '#93c5fd' : '#e5e7eb',
        key: `${parentB}-mid`,
      })
      // Line from midpoint to child
      newLines.push({
        d: `M ${mid} ${y2} C ${midChild} ${y2}, ${midChild} ${y2}, ${x2} ${y2}`,
        color: predictions[matchNumber] ? '#86efac' : '#e5e7eb',
        key: `mid-${matchNumber}`,
      })
    }

    setLines(newLines)
  }, [resolvedBracket, predictions, matchMap])

  function renderColumn(
    brackets: typeof BRACKET_R32,
    label: string,
    isFinalRound = false
  ) {
    const count = filledCount(brackets, predictions)
    return (
      <div className="flex flex-col items-center shrink-0">
        <RoundHeader title={label} total={brackets.length} filled={count} />
        <div
          className="flex flex-col justify-around"
          style={{ gap: isFinalRound ? 0 : ROW_GAP_R32 }}
        >
          {brackets.map(({ matchNumber }) => {
            const m = matchMap.get(matchNumber)
            if (!m) return null
            return (
              <BracketMatchCard
                key={matchNumber}
                matchNumber={matchNumber}
                home={m.home}
                away={m.away}
                prediction={predictions[matchNumber]}
                status={savingStatus[matchNumber] ?? 'idle'}
                locked={lockedMatches.has(matchNumber)}
                disabled={lockedMatches.has(matchNumber) || deadlinePassed}
                isFinal={isFinalRound}
                cardRef={setRef(matchNumber)}
                onScoreChange={(f, v) => onScoreChange(matchNumber, f, v)}
                onPenWinner={(w) => onPenWinner(matchNumber, w)}
                onSave={() => onSave(matchNumber)}
              />
            )
          })}
        </div>
      </div>
    )
  }

  // Third place — rendered separately below semis area
  const thirdMatch = matchMap.get(103)

  return (
    <div className="relative" ref={containerRef}>
      {/* SVG connector lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
        style={{ zIndex: 0 }}
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

      <div className="flex gap-[56px] items-start relative" style={{ zIndex: 1 }}>
        {/* R32 */}
        <div className="flex flex-col items-center shrink-0">
          <RoundHeader
            title="Ronda de 32"
            total={BRACKET_R32.length}
            filled={filledCount(BRACKET_R32, predictions)}
          />
          {/* Two visual sub-columns of 8 to mirror real bracket split */}
          <div className="flex flex-col gap-2">
            {BRACKET_R32.map(({ matchNumber }) => {
              const m = matchMap.get(matchNumber)
              if (!m) return null
              return (
                <BracketMatchCard
                  key={matchNumber}
                  matchNumber={matchNumber}
                  home={m.home}
                  away={m.away}
                  prediction={predictions[matchNumber]}
                  status={savingStatus[matchNumber] ?? 'idle'}
                  locked={lockedMatches.has(matchNumber)}
                  disabled={lockedMatches.has(matchNumber) || deadlinePassed}
                  cardRef={setRef(matchNumber)}
                  onScoreChange={(f, v) => onScoreChange(matchNumber, f, v)}
                  onPenWinner={(w) => onPenWinner(matchNumber, w)}
                  onSave={() => onSave(matchNumber)}
                />
              )
            })}
          </div>
        </div>

        {/* R16 */}
        {renderColumn(BRACKET_R16, 'Octavos')}

        {/* QF */}
        {renderColumn(BRACKET_QF, 'Cuartos')}

        {/* SF + 3rd + Final */}
        <div className="flex flex-col items-center shrink-0">
          <RoundHeader
            title="Semis"
            total={BRACKET_SF.length}
            filled={filledCount(BRACKET_SF, predictions)}
          />
          <div className="flex flex-col gap-2">
            {BRACKET_SF.map(({ matchNumber }) => {
              const m = matchMap.get(matchNumber)
              if (!m) return null
              return (
                <BracketMatchCard
                  key={matchNumber}
                  matchNumber={matchNumber}
                  home={m.home}
                  away={m.away}
                  prediction={predictions[matchNumber]}
                  status={savingStatus[matchNumber] ?? 'idle'}
                  locked={lockedMatches.has(matchNumber)}
                  disabled={lockedMatches.has(matchNumber) || deadlinePassed}
                  cardRef={setRef(matchNumber)}
                  onScoreChange={(f, v) => onScoreChange(matchNumber, f, v)}
                  onPenWinner={(w) => onPenWinner(matchNumber, w)}
                  onSave={() => onSave(matchNumber)}
                />
              )
            })}
          </div>

          {/* Third place */}
          {thirdMatch && (
            <div className="mt-6 flex flex-col items-center">
              <span className="text-[10px] text-gray-400 font-medium mb-1 uppercase tracking-wide">
                3er y 4º puesto
              </span>
              <BracketMatchCard
                matchNumber={103}
                home={thirdMatch.home}
                away={thirdMatch.away}
                prediction={predictions[103]}
                status={savingStatus[103] ?? 'idle'}
                locked={lockedMatches.has(103)}
                disabled={lockedMatches.has(103) || deadlinePassed}
                cardRef={setRef(103)}
                onScoreChange={(f, v) => onScoreChange(103, f, v)}
                onPenWinner={(w) => onPenWinner(103, w)}
                onSave={() => onSave(103)}
              />
            </div>
          )}
        </div>

        {/* Final */}
        <div className="flex flex-col items-center shrink-0">
          <RoundHeader
            title="Final"
            total={1}
            filled={predictions[104] != null ? 1 : 0}
          />
          {matchMap.get(104) && (
            <BracketMatchCard
              matchNumber={104}
              home={matchMap.get(104)!.home}
              away={matchMap.get(104)!.away}
              prediction={predictions[104]}
              status={savingStatus[104] ?? 'idle'}
              locked={lockedMatches.has(104)}
              disabled={lockedMatches.has(104) || deadlinePassed}
              isFinal
              cardRef={setRef(104)}
              onScoreChange={(f, v) => onScoreChange(104, f, v)}
              onPenWinner={(w) => onPenWinner(104, w)}
              onSave={() => onSave(104)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
