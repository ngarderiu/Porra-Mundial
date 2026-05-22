'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { GROUPS } from '@/lib/constants'
import { upsertPrediction } from '@/lib/supabase/predictions-client'
import GroupTabs from './GroupTabs'
import GroupMatchList from './GroupMatchList'
import GroupStandings from './GroupStandings'
import ProgressBar from './ProgressBar'
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

export default function GruposClient({
  teams,
  matches,
  initialPredictions,
  lockedMatchNumbers,
  userId,
  deadlineIso,
}: Props) {
  const [predictions, setPredictions] = useState<PredictionMap>(initialPredictions)
  const [activeGroup, setActiveGroup] = useState('A')
  const [savingStatus, setSavingStatus] = useState<Record<number, SaveStatus>>({})

  const lockedMatches = useMemo(() => new Set(lockedMatchNumbers), [lockedMatchNumbers])
  const deadlinePassed = Date.now() > new Date(deadlineIso).getTime()

  const teamNameById = useMemo(() => {
    const map: Record<number, string> = {}
    for (const t of teams) map[t.id] = t.name
    return map
  }, [teams])

  const groupLetters = Object.keys(GROUPS)
  const activeGroupIdx = groupLetters.indexOf(activeGroup)

  const groupMatches = useMemo(() => {
    return matches.filter((m) => m.group_letter === activeGroup)
  }, [matches, activeGroup])

  const filledCount = useMemo(() => {
    let count = 0
    for (let i = 1; i <= 72; i++) {
      if (predictions[i] != null) count++
    }
    return count
  }, [predictions])

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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Fixed header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Mi Porra · Grupos
            </h1>
            <Link
              href={filledCount >= 72 ? '/porra/eliminatorias' : '#'}
              aria-disabled={filledCount < 72}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors duration-150 ${
                filledCount >= 72
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 pointer-events-none'
              }`}
            >
              Eliminatorias →
            </Link>
          </div>
          <ProgressBar predictions={predictions} />
        </div>
        <GroupTabs
          activeGroup={activeGroup}
          predictions={predictions}
          onSelect={setActiveGroup}
        />
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-0 sm:px-4 py-4">
        <div className="bg-white dark:bg-gray-900 sm:rounded-xl sm:border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Group header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Grupo {activeGroup}
            </h2>
          </div>

          {/* Match list */}
          <GroupMatchList
            matches={groupMatches}
            predictions={predictions}
            savingStatus={savingStatus}
            lockedMatches={lockedMatches}
            deadlinePassed={deadlinePassed}
            teamNameById={teamNameById}
            onScoreChange={handleScoreChange}
            onSave={handleSave}
          />
        </div>

        {/* Standings */}
        <div className="px-4 sm:px-0">
          <GroupStandings groupLetter={activeGroup} predictions={predictions} />
        </div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 max-w-2xl mx-auto w-full">
        <Link
          href={filledCount >= 72 ? '/porra/eliminatorias' : '#'}
          aria-disabled={filledCount < 72}
          className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors duration-150 ${
            filledCount >= 72
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 pointer-events-none'
          }`}
        >
          {filledCount >= 72
            ? 'Ir a Eliminatorias →'
            : `Rellena ${72 - filledCount} partidos más para continuar`}
        </Link>
      </footer>
    </div>
  )
}
