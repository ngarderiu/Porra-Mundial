'use client'

import { useRef } from 'react'
import { TEAM_FLAGS } from '@/lib/constants'
import type { MatchScore, PredictionMap } from '@/lib/bracket'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface Props {
  matchNumber: number
  home: string
  away: string
  prediction: MatchScore | undefined
  status: SaveStatus
  locked: boolean
  disabled: boolean
  isFinal?: boolean
  cardRef?: (el: HTMLDivElement | null) => void
  onScoreChange: (field: 'homeGoals' | 'awayGoals', value: number) => void
  onPenWinner: (winner: 'home' | 'away') => void
  onSave: () => void
}

function isResolved(name: string) {
  return !/^[1-4][A-L]$|^3rd_\d+$|^[WL]\d+$/.test(name)
}

function getWinnerSide(score: MatchScore): 'home' | 'away' | null {
  if (score.homeGoals > score.awayGoals) return 'home'
  if (score.awayGoals > score.homeGoals) return 'away'
  return score.penWinner ?? null
}

export default function BracketMatchCard({
  matchNumber,
  home,
  away,
  prediction,
  status,
  locked,
  disabled,
  isFinal = false,
  cardRef,
  onScoreChange,
  onPenWinner,
  onSave,
}: Props) {
  const prevHome = useRef(prediction?.homeGoals ?? null)
  const prevAway = useRef(prediction?.awayGoals ?? null)

  const isDraw =
    prediction != null &&
    prediction.homeGoals === prediction.awayGoals &&
    prediction.homeGoals !== undefined

  const winner = prediction ? getWinnerSide(prediction) : null
  const homeResolved = isResolved(home)
  const awayResolved = isResolved(away)

  const homeFlag = homeResolved ? (TEAM_FLAGS[home] ?? '🏳') : null
  const awayFlag = awayResolved ? (TEAM_FLAGS[away] ?? '🏳') : null

  const cardBg = locked
    ? 'bg-gray-50 dark:bg-gray-800/60'
    : isFinal
    ? 'bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-blue-700'
    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'

  const inputBase = `
    w-9 h-9 text-center text-sm font-semibold rounded border
    focus:outline-none focus:ring-2 focus:ring-blue-400
    [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none
    transition-colors duration-150
  `
  const inputEnabled = 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100'
  const inputDisabled = 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'

  function handleBlur() {
    const hg = prediction?.homeGoals ?? null
    const ag = prediction?.awayGoals ?? null
    if (hg !== null && ag !== null && (hg !== prevHome.current || ag !== prevAway.current)) {
      prevHome.current = hg
      prevAway.current = ag
      onSave()
    }
  }

  const rowHome = `flex items-center gap-1.5 px-2 py-1.5 rounded-t-lg ${
    winner === 'home'
      ? 'bg-green-50 dark:bg-green-900/20'
      : winner === 'away'
      ? ''
      : ''
  }`
  const rowAway = `flex items-center gap-1.5 px-2 py-1.5 rounded-b-lg ${
    winner === 'away'
      ? 'bg-green-50 dark:bg-green-900/20'
      : ''
  }`

  const nameHome = `flex-1 text-xs truncate ${
    winner === 'away' ? 'text-gray-400 dark:text-gray-500' : 'font-medium text-gray-800 dark:text-gray-200'
  } ${!homeResolved ? 'italic text-gray-400 dark:text-gray-500' : ''}`
  const nameAway = `flex-1 text-xs truncate ${
    winner === 'home' ? 'text-gray-400 dark:text-gray-500' : 'font-medium text-gray-800 dark:text-gray-200'
  } ${!awayResolved ? 'italic text-gray-400 dark:text-gray-500' : ''}`

  return (
    <div className="flex flex-col">
      <div
        ref={cardRef}
        role="group"
        aria-label={`Partido ${matchNumber}: ${home} vs ${away}`}
        className={`rounded-lg shadow-sm overflow-hidden ${cardBg} relative z-[1] ${isFinal ? 'shadow-md' : ''}`}
        style={{ width: 160 }}
      >
        {locked && (
          <div className="absolute top-0.5 right-1 text-[9px] text-gray-400 font-medium">🔒</div>
        )}

        {/* Home row */}
        <div className={rowHome}>
          {homeFlag && <span className="text-base shrink-0" aria-hidden="true">{homeFlag}</span>}
          <span className={nameHome}>{home}</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            value={prediction?.homeGoals ?? ''}
            disabled={disabled || !homeResolved || !awayResolved}
            aria-label={`Goles ${home}, partido ${matchNumber}`}
            className={`${inputBase} ${disabled || !homeResolved || !awayResolved ? inputDisabled : inputEnabled}`}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10)
              if (!isNaN(v) && v >= 0 && v <= 20) onScoreChange('homeGoals', v)
            }}
            onFocus={(e) => e.target.select()}
            onBlur={handleBlur}
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 dark:bg-gray-700 mx-2" />

        {/* Away row */}
        <div className={rowAway}>
          {awayFlag && <span className="text-base shrink-0" aria-hidden="true">{awayFlag}</span>}
          <span className={nameAway}>{away}</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            value={prediction?.awayGoals ?? ''}
            disabled={disabled || !homeResolved || !awayResolved}
            aria-label={`Goles ${away}, partido ${matchNumber}`}
            className={`${inputBase} ${disabled || !homeResolved || !awayResolved ? inputDisabled : inputEnabled}`}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10)
              if (!isNaN(v) && v >= 0 && v <= 20) onScoreChange('awayGoals', v)
            }}
            onFocus={(e) => e.target.select()}
            onBlur={handleBlur}
          />
        </div>

        {/* Save indicator */}
        {status === 'saving' && (
          <div className="absolute bottom-0.5 right-1 text-[9px] text-gray-400 animate-pulse">●</div>
        )}
        {status === 'saved' && (
          <div className="absolute bottom-0.5 right-1 text-[9px] text-green-500">✓</div>
        )}
        {status === 'error' && (
          <div className="absolute bottom-0.5 right-1 text-[9px] text-red-500">!</div>
        )}
      </div>

      {/* Penalty selector */}
      {isDraw && homeResolved && awayResolved && !disabled && (
        <div
          className="mt-1 flex gap-1 items-center"
          role="group"
          aria-label={`Ganador en penaltis, partido ${matchNumber}`}
        >
          <span className="text-[9px] text-gray-400 shrink-0">Pens:</span>
          <button
            onClick={() => onPenWinner('home')}
            className={`flex-1 text-[9px] font-medium py-0.5 px-1 rounded transition-colors ${
              prediction?.penWinner === 'home'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
            }`}
            aria-pressed={prediction?.penWinner === 'home'}
          >
            {home.length > 8 ? home.slice(0, 8) + '…' : home}
          </button>
          <button
            onClick={() => onPenWinner('away')}
            className={`flex-1 text-[9px] font-medium py-0.5 px-1 rounded transition-colors ${
              prediction?.penWinner === 'away'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
            }`}
            aria-pressed={prediction?.penWinner === 'away'}
          >
            {away.length > 8 ? away.slice(0, 8) + '…' : away}
          </button>
        </div>
      )}
    </div>
  )
}
