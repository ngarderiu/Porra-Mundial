'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { GROUPS } from '@/lib/constants'
import { upsertPrediction } from '@/lib/supabase/predictions-client'
import GroupCard from './GroupCard'
import type { Match, Team } from '@/types'
import type { PredictionMap } from '@/lib/bracket'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface Props {
  teams: Team[]
  matches: Match[]
  initialPredictions: PredictionMap
  lockedMatchNumbers: number[]
  userId: string
  deadlineIso: string
}

const GROUP_LETTERS = Object.keys(GROUPS)

export default function GruposClient({
  teams,
  matches,
  initialPredictions,
  lockedMatchNumbers,
  userId,
  deadlineIso,
}: Props) {
  const [predictions, setPredictions] = useState<PredictionMap>(initialPredictions)
  const [savingStatus, setSavingStatus] = useState<Record<number, SaveStatus>>({})

  const lockedMatches = useMemo(() => new Set(lockedMatchNumbers), [lockedMatchNumbers])
  const deadlinePassed = Date.now() > new Date(deadlineIso).getTime()

  const teamNameById = useMemo(() => {
    const map: Record<number, string> = {}
    for (const t of teams) map[t.id] = t.name
    return map
  }, [teams])

  const matchesByGroup = useMemo(() => {
    const byGroup: Record<string, Match[]> = {}
    for (const letter of GROUP_LETTERS) byGroup[letter] = []
    for (const m of matches) {
      if (m.group_letter && byGroup[m.group_letter]) {
        byGroup[m.group_letter].push(m)
      }
    }
    return byGroup
  }, [matches])

  const filledCount = useMemo(() => {
    let count = 0
    for (let i = 1; i <= 72; i++) {
      if (predictions[i] != null) count++
    }
    return count
  }, [predictions])

  const completedGroups = useMemo(() => {
    return GROUP_LETTERS.filter((_, idx) => {
      for (let p = 0; p < 6; p++) {
        if (predictions[idx * 6 + p + 1] == null) return false
      }
      return true
    }).length
  }, [predictions])

  const allComplete = filledCount >= 72

  const handleScoreChange = useCallback(
    (matchNumber: number, field: 'homeGoals' | 'awayGoals', value: number) => {
      setPredictions((prev) => ({
        ...prev,
        [matchNumber]: {
          homeGoals: field === 'homeGoals' ? value : (prev[matchNumber]?.homeGoals ?? 0),
          awayGoals: field === 'awayGoals' ? value : (prev[matchNumber]?.awayGoals ?? 0),
          penWinner: prev[matchNumber]?.penWinner ?? null,
        },
      }))
    },
    []
  )

  const handleSave = useCallback(
    async (matchNumber: number) => {
      const score = predictions[matchNumber]
      if (score == null) return
      setSavingStatus((prev) => ({ ...prev, [matchNumber]: 'saving' }))
      try {
        await upsertPrediction(userId, matchNumber, score.homeGoals, score.awayGoals)
        setSavingStatus((prev) => ({ ...prev, [matchNumber]: 'saved' }))
        setTimeout(() => {
          setSavingStatus((prev) => ({ ...prev, [matchNumber]: 'idle' }))
        }, 1500)
      } catch {
        setSavingStatus((prev) => ({ ...prev, [matchNumber]: 'error' }))
      }
    },
    [predictions, userId]
  )

  return (
    <div className="min-h-screen bg-green-900">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-green-950 text-white shadow-lg">
        {/* Title row */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <h1 className="text-base font-bold whitespace-nowrap">🏆 Porra Mundial 2026</h1>
          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              href="/ranking"
              className="text-xs px-2.5 py-1.5 rounded-md bg-green-800 hover:bg-green-700 text-green-100 transition-colors"
            >
              Ranking
            </Link>
            <Link
              href={allComplete ? '/porra/eliminatorias' : '#'}
              aria-disabled={!allComplete}
              className={`text-xs px-2.5 py-1.5 rounded-md font-semibold transition-colors ${
                allComplete
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-green-800 text-green-500 pointer-events-none'
              }`}
            >
              Eliminatorias →
            </Link>
          </div>
        </div>

        {/* Phase tabs */}
        <div className="max-w-7xl mx-auto px-4 pb-2 flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-green-900 text-sm font-semibold">
            ⚽ Fase de Grupos
          </span>
          <Link
            href={allComplete ? '/porra/eliminatorias' : '#'}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              allComplete
                ? 'bg-green-700 text-white hover:bg-green-600'
                : 'bg-green-800/50 text-green-400 pointer-events-none'
            }`}
          >
            🏆 Eliminatorias
          </Link>
        </div>

        {/* Progress bar row */}
        <div className="max-w-7xl mx-auto px-4 py-2.5 border-t border-green-800/60 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-green-200">
              <span className="font-semibold text-white">Progreso: {completedGroups}/12</span>
              {' grupos completos'}
              <span className="text-green-400 ml-1.5 hidden sm:inline">· Ingrese los resultados de cada partido</span>
            </p>
            <div className="mt-1 h-1.5 w-full max-w-[240px] rounded-full bg-green-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  allComplete ? 'bg-green-400' : 'bg-amber-400'
                }`}
                style={{ width: `${Math.round((filledCount / 72) * 100)}%` }}
                role="progressbar"
                aria-valuenow={filledCount}
                aria-valuemin={0}
                aria-valuemax={72}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!allComplete && (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
              >
                Complete todos los partidos
              </button>
            )}
            <Link
              href={allComplete ? '/porra/eliminatorias' : '#'}
              aria-disabled={!allComplete}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                allComplete
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-green-700/40 text-green-500 pointer-events-none opacity-60'
              }`}
            >
              Generar Eliminatorias →
            </Link>
          </div>
        </div>
      </header>

      {/* Groups grid */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GROUP_LETTERS.map((letter) => (
            <GroupCard
              key={letter}
              groupLetter={letter}
              matches={matchesByGroup[letter] ?? []}
              predictions={predictions}
              savingStatus={savingStatus}
              lockedMatches={lockedMatches}
              deadlinePassed={deadlinePassed}
              teamNameById={teamNameById}
              onScoreChange={handleScoreChange}
              onSave={handleSave}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
