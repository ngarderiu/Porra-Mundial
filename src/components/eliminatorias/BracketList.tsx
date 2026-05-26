'use client'

import { useMemo } from 'react'
import {
  BRACKET_R32,
  BRACKET_R16,
  BRACKET_QF,
  BRACKET_SF,
  BRACKET_THIRD,
  BRACKET_FINAL,
} from '@/lib/constants'
import BracketMatchCard from './BracketMatchCard'
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

const ROUND_SECTIONS = [
  { brackets: BRACKET_R32, label: 'Ronda de 32' },
  { brackets: BRACKET_R16, label: 'Octavos de final' },
  { brackets: BRACKET_QF, label: 'Cuartos de final' },
  { brackets: BRACKET_SF, label: 'Semifinales' },
  { brackets: BRACKET_THIRD, label: '3er y 4º puesto' },
  { brackets: BRACKET_FINAL, label: 'Final' },
]

export default function BracketList({
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

  return (
    <div className="space-y-6">
      {ROUND_SECTIONS.map(({ brackets, label }) => (
        <section key={label}>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 px-4 mb-3">
            {label}
          </h3>
          <div className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {brackets.map(({ matchNumber }) => {
              const m = matchMap.get(matchNumber)
              if (!m) return null
              const isFinal = matchNumber === 104
              return (
                <div key={matchNumber} className="px-4 py-3 flex justify-center">
                  <BracketMatchCard
                    matchNumber={matchNumber}
                    home={m.home}
                    away={m.away}
                    prediction={predictions[matchNumber]}
                    status={savingStatus[matchNumber] ?? 'idle'}
                    locked={lockedMatches.has(matchNumber)}
                    disabled={lockedMatches.has(matchNumber) || deadlinePassed}
                    isFinal={isFinal}
                    onScoreChange={(f, v) => onScoreChange(matchNumber, f, v)}
                    onPenWinner={(w) => onPenWinner(matchNumber, w)}
                    onSave={() => onSave(matchNumber)}
                  />
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
