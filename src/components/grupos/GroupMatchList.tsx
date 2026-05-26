'use client'

import { useRef } from 'react'
import { TEAM_FLAGS, TEAM_ABBR } from '@/lib/constants'
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

  const homeFlag = TEAM_FLAGS[homeTeam] ?? '🏳'
  const awayFlag = TEAM_FLAGS[awayTeam] ?? '🏳'
  const homeAbbr = TEAM_ABBR[homeTeam] ?? homeTeam.slice(0, 3).toUpperCase()
  const awayAbbr = TEAM_ABBR[awayTeam] ?? awayTeam.slice(0, 3).toUpperCase()

  const hasPrediction = prediction?.homeGoals != null && prediction?.awayGoals != null

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

  const inputBase = [
    'w-12 h-9 text-center text-sm font-semibold rounded border',
    'focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200',
    'transition-colors duration-150',
    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
  ].join(' ')

  const inputEnabled = hasPrediction
    ? 'bg-white border-green-400 text-gray-900'
    : 'bg-white border-gray-300 text-gray-900'
  const inputDisabled = 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 ${locked ? 'opacity-60' : ''}`}>
      {/* Home: FLAG ABBR */}
      <div className="flex items-center gap-1 w-[58px] justify-end shrink-0">
        <span className="text-base leading-none" aria-hidden="true">{homeFlag}</span>
        <span className="text-[11px] font-mono font-semibold text-gray-600 tracking-tight">{homeAbbr}</span>
      </div>

      {/* Home input */}
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={20}
        value={prediction?.homeGoals ?? ''}
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

      {/* Separator */}
      <span className="text-gray-400 text-xs font-bold shrink-0">–</span>

      {/* Away input */}
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={20}
        value={prediction?.awayGoals ?? ''}
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

      {/* Away: ABBR FLAG */}
      <div className="flex items-center gap-1 w-[58px] shrink-0">
        <span className="text-[11px] font-mono font-semibold text-gray-600 tracking-tight">{awayAbbr}</span>
        <span className="text-base leading-none" aria-hidden="true">{awayFlag}</span>
      </div>

      {/* Status indicator */}
      <div className="w-4 shrink-0 flex items-center justify-center">
        {locked && <span className="text-[10px] text-gray-400" title="Partido bloqueado">🔒</span>}
        {!locked && status === 'saving' && (
          <span className="text-[10px] text-gray-400 animate-pulse" aria-live="polite">●</span>
        )}
        {!locked && status === 'saved' && (
          <span className="text-[10px] text-green-500" aria-live="polite" aria-label="Guardado">✓</span>
        )}
        {!locked && status === 'error' && (
          <span className="text-[10px] text-red-500 font-bold" aria-live="assertive">!</span>
        )}
      </div>
    </div>
  )
}

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
    <div className="divide-y divide-gray-100">
      {matches.map((match) => {
        const homeTeam = teamNameById[match.home_team_id!] ?? '?'
        const awayTeam = teamNameById[match.away_team_id!] ?? '?'
        const locked = lockedMatches.has(match.match_number)

        return (
          <div key={match.match_number}>
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
              <p className="px-3 pb-1.5 text-[10px] text-red-500">
                Error al guardar. Reintenta.
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
