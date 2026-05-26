'use client'

import GroupStandings from './GroupStandings'
import GroupMatchList from './GroupMatchList'
import type { Match } from '@/types'
import type { PredictionMap } from '@/lib/bracket'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface Props {
  groupLetter: string
  matches: Match[]
  predictions: PredictionMap
  savingStatus: Record<number, SaveStatus>
  lockedMatches: Set<number>
  deadlinePassed: boolean
  teamNameById: Record<number, string>
  onScoreChange: (matchNumber: number, field: 'homeGoals' | 'awayGoals', value: number) => void
  onSave: (matchNumber: number) => void
}

export default function GroupCard({
  groupLetter,
  matches,
  predictions,
  savingStatus,
  lockedMatches,
  deadlinePassed,
  teamNameById,
  onScoreChange,
  onSave,
}: Props) {
  const filledInGroup = matches.filter((m) => predictions[m.match_number] != null).length
  const total = matches.length || 6
  const isComplete = filledInGroup === total

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 bg-gray-50">
        <h2 className="text-sm font-bold text-gray-900">Grupo {groupLetter}</h2>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            isComplete
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {filledInGroup}/{total}
        </span>
      </div>

      {/* Standings */}
      <div className="py-1">
        <GroupStandings groupLetter={groupLetter} predictions={predictions} />
      </div>

      {/* Separator + matches section */}
      <div className="border-t border-gray-100">
        <p className="px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Partidos
        </p>
        <div className="pb-1">
          <GroupMatchList
            matches={matches}
            predictions={predictions}
            savingStatus={savingStatus}
            lockedMatches={lockedMatches}
            deadlinePassed={deadlinePassed}
            teamNameById={teamNameById}
            onScoreChange={onScoreChange}
            onSave={onSave}
          />
        </div>
      </div>
    </div>
  )
}
