'use client'

import { useRef } from 'react'
import { TEAM_FLAGS } from '@/lib/constants'
import type { Match } from '@/types'
import type { MatchScore, PredictionMap } from '@/lib/bracket'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface Props {
  matches: Match[]
  predictions: PredictionMap
  savingStatus: Record<number, SaveStatus>
  lockedMatches: Set<number>
  deadlinePassed: boolean
  teamNameById: Record<number, string>
  onScoreChange: (matchNumber: number, field: 'homeGoals' | 'awayGoals', value: number) => void
  onSave: (matchNumber: number) => void
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'saving') {
    return (
      <span className="text-xs text-gray-400 animate-pulse" aria-live="polite">
        ●
      </span>
    )
  }
  if (status === 'saved') {
    return (
      <span className="text-xs text-green-500" aria-live="polite" aria-label="Guardado">
        ✓
      </span>
    )
  }
  if (status === 'error') {
    return (
      <span className="text-xs text-red-500 font-medium" aria-live="assertive">
        Error
      </span>
    )
  }
  return null
}

interface MatchRowProps {
  match: Match
  prediction: MatchScore | undefined
  status: SaveStatus
  locked: boolean
  disabled: boolean
  homeTeam: string
  awayTeam: string
  onScoreChange: (field: 'homeGoals' | 'awayGoals', value: number) => void
  onSave: () => void
}

function MatchRow({
  match,
  prediction,
  status,
  locked,
  disabled,
  homeTeam,
  awayTeam,
  onScoreChange,
  onSave,
}: MatchRowProps) {
  const prevHome = useRef(prediction?.homeGoals ?? null)
  const prevAway = useRef(prediction?.awayGoals ?? null)

  const inputBase = `
    w-12 h-12 text-center text-lg font-semibold rounded-lg border
    focus:outline-none focus:ring-2 focus:ring-blue-500
    transition-colors duration-150
    [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
  `
  const inputEnabled = 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100'
  const inputDisabled = 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'

  const homeVal = prediction?.homeGoals
  const awayVal = prediction?.awayGoals

  function handleBlur() {
    const hg = prediction?.homeGoals ?? null
    const ag = prediction?.awayGoals ?? null
    const changed = hg !== prevHome.current || ag !== prevAway.current
    if (changed && hg !== null && ag !== null) {
      prevHome.current = hg
      prevAway.current = ag
      onSave()
    }
  }

  const homeFlag = TEAM_FLAGS[homeTeam] ?? '🏳'
  const awayFlag = TEAM_FLAGS[awayTeam] ?? '🏳'

  return (
    <div
      className={`flex items-center gap-2 px-4 py-3 ${
        locked ? 'bg-gray-50 dark:bg-gray-800/50' : ''
      }`}
    >
      {/* Home team */}
      <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate text-right">
          {homeTeam}
        </span>
        <span className="text-lg shrink-0" aria-hidden="true">{homeFlag}</span>
      </div>

      {/* Score inputs */}
      <div className="flex items-center gap-1.5 shrink-0">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={20}
          value={homeVal ?? ''}
          disabled={disabled}
          aria-label={`Goles ${homeTeam}, partido ${match.match_number}`}
          className={`${inputBase} ${disabled ? inputDisabled : inputEnabled}`}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10)
            if (!isNaN(v) && v >= 0 && v <= 20) onScoreChange('homeGoals', v)
          }}
          onFocus={(e) => e.target.select()}
          onBlur={handleBlur}
        />
        <span className="text-gray-400 font-bold text-sm">–</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={20}
          value={awayVal ?? ''}
          disabled={disabled}
          aria-label={`Goles ${awayTeam}, partido ${match.match_number}`}
          className={`${inputBase} ${disabled ? inputDisabled : inputEnabled}`}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10)
            if (!isNaN(v) && v >= 0 && v <= 20) onScoreChange('awayGoals', v)
          }}
          onFocus={(e) => e.target.select()}
          onBlur={handleBlur}
        />
      </div>

      {/* Away team */}
      <div className="flex items-center gap-1.5 flex-1 justify-start min-w-0">
        <span className="text-lg shrink-0" aria-hidden="true">{awayFlag}</span>
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
          {awayTeam}
        </span>
      </div>

      {/* Status + locked badge */}
      <div className="w-8 shrink-0 flex justify-center">
        {locked ? (
          <span
            className="text-[10px] font-medium text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5"
            title="Partido bloqueado"
          >
            🔒
          </span>
        ) : (
          <SaveIndicator status={status} />
        )}
      </div>
    </div>
  )
}

const JORNADA_LABEL = ['Jornada 1', 'Jornada 1', 'Jornada 2', 'Jornada 2', 'Jornada 3', 'Jornada 3']

export default function GroupMatchList({
  matches,
  predictions,
  savingStatus,
  lockedMatches,
  deadlinePassed,
  teamNameById,
  onScoreChange,
  onSave,
}: Props) {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {matches.map((match, idx) => {
        const jornada = JORNADA_LABEL[idx]
        const showJornada = idx === 0 || jornada !== JORNADA_LABEL[idx - 1]
        const homeTeam = teamNameById[match.home_team_id!] ?? '?'
        const awayTeam = teamNameById[match.away_team_id!] ?? '?'
        const locked = lockedMatches.has(match.match_number)

        return (
          <div key={match.match_number}>
            {showJornada && (
              <div className="px-4 pt-3 pb-1">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {jornada}
                </span>
              </div>
            )}
            <MatchRow
              match={match}
              prediction={predictions[match.match_number]}
              status={savingStatus[match.match_number] ?? 'idle'}
              locked={locked}
              disabled={locked || deadlinePassed}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              onScoreChange={(field, value) => onScoreChange(match.match_number, field, value)}
              onSave={() => onSave(match.match_number)}
            />
            {(savingStatus[match.match_number] ?? 'idle') === 'error' && (
              <p className="px-4 pb-2 text-xs text-red-500">
                Error al guardar el partido {match.match_number}. Reintenta cambiando el valor.
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
