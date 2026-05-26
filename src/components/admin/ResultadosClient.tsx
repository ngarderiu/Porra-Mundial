'use client'

import { useState, useCallback } from 'react'
import { actionSaveMatchResult } from '@/app/admin/actions'
import type { MatchData, ResultData } from '@/app/admin/resultados/page'
import { TEAM_FLAGS } from '@/lib/constants'

type SaveStatus = 'idle' | 'live' | 'saving' | 'saved' | 'error'

interface InputState {
  homeGoals: number | ''
  awayGoals: number | ''
  penWinner: 'home' | 'away' | null
}

const PHASE_TABS = [
  { key: 'group', label: 'Grupos' },
  { key: 'r32', label: 'R32' },
  { key: 'r16', label: 'Octavos' },
  { key: 'qf', label: 'Cuartos' },
  { key: 'sf', label: 'Semis' },
  { key: 'final_group', label: 'Final + 3º' },
] as const

type PhaseKey = (typeof PHASE_TABS)[number]['key']

function matchesPhase(phase: string, tabKey: PhaseKey): boolean {
  if (tabKey === 'final_group') return phase === 'third' || phase === 'final'
  return phase === tabKey
}

function isResolved(slot: string | null): boolean {
  if (!slot) return false
  return !/^[1-4][A-L]$|^3rd_\d+$|^[WL]\d+$/.test(slot)
}

function getTeamDisplay(
  team: MatchData['home_team'],
  slot: string | null
): { name: string; flag: string | null; placeholder: boolean } {
  if (team) {
    return { name: team.name, flag: team.flag_emoji ?? TEAM_FLAGS[team.name] ?? '🏳', placeholder: false }
  }
  return { name: slot ?? '?', flag: null, placeholder: true }
}

function StatusBadge({ status, hasResult }: { status: SaveStatus; hasResult: boolean }) {
  if (status === 'saving')
    return <span className="text-xs px-2 py-0.5 rounded bg-blue-700 text-blue-100">Guardando…</span>
  if (status === 'saved')
    return <span className="text-xs px-2 py-0.5 rounded bg-green-700 text-green-100">Guardado ✓</span>
  if (status === 'error')
    return <span className="text-xs px-2 py-0.5 rounded bg-red-700 text-red-100">Error ✗</span>
  if (status === 'live')
    return <span className="text-xs px-2 py-0.5 rounded bg-orange-700 text-orange-100">En juego 🔴</span>
  if (hasResult)
    return <span className="text-xs px-2 py-0.5 rounded bg-green-800 text-green-300">Guardado ✓</span>
  return <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-400">Sin resultado</span>
}

export default function ResultadosClient({
  matches,
  initialResults,
}: {
  matches: MatchData[]
  initialResults: Record<number, ResultData>
}) {
  const [activeTab, setActiveTab] = useState<PhaseKey>('group')

  // match.id → InputState
  const [inputs, setInputs] = useState<Record<number, InputState>>(() => {
    const init: Record<number, InputState> = {}
    for (const m of matches) {
      const r = initialResults[m.id]
      init[m.id] = r
        ? { homeGoals: r.homeGoals, awayGoals: r.awayGoals, penWinner: r.penWinner }
        : { homeGoals: '', awayGoals: '', penWinner: null }
    }
    return init
  })

  const [saveStatus, setSaveStatus] = useState<Record<number, SaveStatus>>({})

  const setField = useCallback(
    (matchId: number, field: keyof InputState, value: number | '' | 'home' | 'away' | null) => {
      setInputs((prev) => ({ ...prev, [matchId]: { ...prev[matchId], [field]: value } }))
      setSaveStatus((prev) => ({ ...prev, [matchId]: 'live' }))
    },
    []
  )

  const handleSave = useCallback(
    async (match: MatchData) => {
      const input = inputs[match.id]
      if (input.homeGoals === '' || input.awayGoals === '') return
      setSaveStatus((prev) => ({ ...prev, [match.id]: 'saving' }))
      const result = await actionSaveMatchResult(
        match.match_number,
        input.homeGoals as number,
        input.awayGoals as number,
        input.penWinner
      )
      if (result.error) {
        setSaveStatus((prev) => ({ ...prev, [match.id]: 'error' }))
      } else {
        setSaveStatus((prev) => ({ ...prev, [match.id]: 'saved' }))
        setTimeout(() => setSaveStatus((prev) => ({ ...prev, [match.id]: 'idle' })), 2000)
      }
    },
    [inputs]
  )

  const tabMatches = matches.filter((m) => matchesPhase(m.phase, activeTab))

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-100 mb-4">Resultados</h1>

      {/* Phase tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-700 pb-0">
        {PHASE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-t transition-colors -mb-px border-b-2 ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-400 bg-gray-800'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Match rows */}
      <div className="flex flex-col gap-2">
        {tabMatches.map((match) => {
          const input = inputs[match.id]
          const status = saveStatus[match.id] ?? 'idle'
          const hasResult = !!initialResults[match.id] || status === 'saved'
          const isKO = match.phase !== 'group'
          const isDraw =
            isKO &&
            input.homeGoals !== '' &&
            input.awayGoals !== '' &&
            input.homeGoals === input.awayGoals
          const home = getTeamDisplay(match.home_team, match.home_slot)
          const away = getTeamDisplay(match.away_team, match.away_slot)

          return (
            <div
              key={match.id}
              className="bg-gray-800 rounded-lg px-4 py-3 flex flex-wrap items-center gap-3"
            >
              {/* Match number */}
              <span className="text-xs text-gray-500 w-6 shrink-0 font-mono">
                {match.match_number}
              </span>

              {/* Home team */}
              <div className={`flex items-center gap-1.5 w-36 justify-end ${home.placeholder ? 'opacity-40' : ''}`}>
                <span className="text-sm truncate">{home.name}</span>
                {home.flag && <span className="text-base">{home.flag}</span>}
              </div>

              {/* Score inputs */}
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={input.homeGoals}
                  onChange={(e) =>
                    setField(match.id, 'homeGoals', e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-10 h-8 text-center text-sm bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-gray-500">–</span>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={input.awayGoals}
                  onChange={(e) =>
                    setField(match.id, 'awayGoals', e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-10 h-8 text-center text-sm bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              {/* Away team */}
              <div className={`flex items-center gap-1.5 w-36 ${away.placeholder ? 'opacity-40' : ''}`}>
                {away.flag && <span className="text-base">{away.flag}</span>}
                <span className="text-sm truncate">{away.name}</span>
              </div>

              {/* Pen winner for KO draws */}
              {isDraw && (
                <div className="flex items-center gap-1.5 ml-1">
                  <span className="text-xs text-gray-400">Pen:</span>
                  <button
                    onClick={() => setField(match.id, 'penWinner', 'home')}
                    className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                      input.penWinner === 'home'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'border-gray-600 text-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {home.name.split(' ')[0]}
                  </button>
                  <button
                    onClick={() => setField(match.id, 'penWinner', 'away')}
                    className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                      input.penWinner === 'away'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'border-gray-600 text-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {away.name.split(' ')[0]}
                  </button>
                </div>
              )}

              {/* Status badge */}
              <div className="ml-auto flex items-center gap-2">
                <StatusBadge status={status} hasResult={hasResult} />
                <button
                  onClick={() => handleSave(match)}
                  disabled={
                    status === 'saving' ||
                    input.homeGoals === '' ||
                    input.awayGoals === '' ||
                    (isDraw && !input.penWinner)
                  }
                  className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded transition-colors"
                >
                  Guardar
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
