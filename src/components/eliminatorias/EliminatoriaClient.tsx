'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { buildFullBracket } from '@/lib/bracket'
import { upsertPrediction } from '@/lib/supabase/predictions-client'
import BracketTree from './BracketTree'
import BracketList from './BracketList'
import type { ResolvedMatch, PredictionMap } from '@/lib/bracket'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
type View = 'tree' | 'list'

interface Props {
  resolvedBracket: ResolvedMatch[]
  knockoutPredictions: PredictionMap
  lockedMatchNumbers: number[]
  userId: string
  deadlineIso: string
  groupsComplete: boolean
  groupPredictions: PredictionMap
  groupFilledCount: number
}

export default function EliminatoriaClient({
  resolvedBracket: initialBracket,
  knockoutPredictions,
  lockedMatchNumbers,
  userId,
  deadlineIso,
  groupsComplete,
  groupPredictions,
  groupFilledCount,
}: Props) {
  const [predictions, setPredictions] = useState<PredictionMap>(knockoutPredictions)
  const [savingStatus, setSavingStatus] = useState<Record<number, SaveStatus>>({})
  const [view, setView] = useState<View>('tree')

  const lockedMatches = useMemo(() => new Set(lockedMatchNumbers), [lockedMatchNumbers])
  const deadlinePassed = Date.now() > new Date(deadlineIso).getTime()

  // Recompute bracket whenever KO predictions change
  const resolvedBracket = useMemo(
    () => buildFullBracket(groupPredictions, predictions),
    [groupPredictions, predictions]
  )

  const filledKO = Object.keys(predictions).filter(
    (k) => Number(k) >= 73 && Number(k) <= 104
  ).length

  const handleScoreChange = useCallback(
    (mn: number, field: 'homeGoals' | 'awayGoals', value: number) => {
      setPredictions((prev) => ({
        ...prev,
        [mn]: {
          homeGoals: field === 'homeGoals' ? value : (prev[mn]?.homeGoals ?? 0),
          awayGoals: field === 'awayGoals' ? value : (prev[mn]?.awayGoals ?? 0),
          penWinner: prev[mn]?.penWinner ?? null,
        },
      }))
    },
    []
  )

  const handlePenWinner = useCallback(
    async (mn: number, winner: 'home' | 'away') => {
      setPredictions((prev) => ({
        ...prev,
        [mn]: { ...(prev[mn] ?? { homeGoals: 0, awayGoals: 0 }), penWinner: winner },
      }))
      setSavingStatus((prev) => ({ ...prev, [mn]: 'saving' }))
      try {
        const score = predictions[mn]
        await upsertPrediction(
          userId,
          mn,
          score?.homeGoals ?? 0,
          score?.awayGoals ?? 0,
          winner
        )
        setSavingStatus((prev) => ({ ...prev, [mn]: 'saved' }))
        setTimeout(() => setSavingStatus((prev) => ({ ...prev, [mn]: 'idle' })), 1500)
      } catch {
        setSavingStatus((prev) => ({ ...prev, [mn]: 'error' }))
      }
    },
    [predictions, userId]
  )

  const handleSave = useCallback(
    async (mn: number) => {
      const score = predictions[mn]
      if (score == null) return
      setSavingStatus((prev) => ({ ...prev, [mn]: 'saving' }))
      try {
        await upsertPrediction(userId, mn, score.homeGoals, score.awayGoals, score.penWinner)
        setSavingStatus((prev) => ({ ...prev, [mn]: 'saved' }))
        setTimeout(() => setSavingStatus((prev) => ({ ...prev, [mn]: 'idle' })), 1500)
      } catch {
        setSavingStatus((prev) => ({ ...prev, [mn]: 'error' }))
      }
    },
    [predictions, userId]
  )

  const sharedProps = {
    resolvedBracket,
    predictions,
    savingStatus,
    lockedMatches,
    deadlinePassed,
    onScoreChange: handleScoreChange,
    onPenWinner: handlePenWinner,
    onSave: handleSave,
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Link href="/porra/grupos" className="text-sm text-blue-600 hover:underline">
                ← Grupos
              </Link>
              <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Mi Porra · Eliminatorias
              </h1>
            </div>
            <span className="text-sm text-gray-500">
              <span className={filledKO === 32 ? 'text-green-600 font-medium' : 'text-blue-600 font-medium'}>
                {filledKO}
              </span>
              /32
            </span>
          </div>

          {/* View toggle */}
          <div className="flex gap-1" role="tablist" aria-label="Vista del bracket">
            {(['tree', 'list'] as const).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  view === v
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {v === 'tree' ? '🌳 Árbol' : '📋 Lista'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Incomplete groups banner */}
      {!groupsComplete && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-3">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            ⚠️ Te faltan{' '}
            <strong>{72 - groupFilledCount} partidos de grupos</strong> por rellenar.
            Los equipos en el bracket son provisionales.{' '}
            <Link href="/porra/grupos" className="underline font-medium">
              Ir a grupos →
            </Link>
          </p>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 py-4">
        {view === 'tree' ? (
          <div className="px-4">
            <p className="text-xs text-gray-400 mb-3 md:hidden text-center">
              ← Desliza para ver el árbol completo →
            </p>
            <div className="overflow-x-auto pb-4">
              <div style={{ minWidth: 1100 }}>
                <BracketTree {...sharedProps} />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-4">
            <BracketList {...sharedProps} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/ranking"
            className="block w-full text-center py-3 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Ver mi ranking →
          </Link>
        </div>
      </footer>
    </div>
  )
}
