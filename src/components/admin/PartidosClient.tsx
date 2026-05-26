'use client'

import { useState, useCallback } from 'react'
import {
  actionToggleMatchLock,
  actionLockGroupMatches,
  actionLockR32Matches,
  actionUnlockAll,
  actionUpdateDeadline,
} from '@/app/admin/actions'
import type { MatchLock } from '@/app/admin/partidos/page'

const PHASE_GROUPS = [
  { key: 'group', label: 'Grupos' },
  { key: 'r32', label: 'R32 (Ronda de 32)' },
  { key: 'r16', label: 'Octavos de final' },
  { key: 'qf', label: 'Cuartos de final' },
  { key: 'sf', label: 'Semifinales' },
  { key: 'third', label: 'Tercer puesto' },
  { key: 'final', label: 'Final' },
]

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-red-600' : 'bg-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export default function PartidosClient({
  matches,
  deadline,
  completedCount,
}: {
  matches: MatchLock[]
  deadline: string
  completedCount: number
}) {
  const [deadlineInput, setDeadlineInput] = useState(toDatetimeLocal(deadline))
  const [deadlineStatus, setDeadlineStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const [lockState, setLockState] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {}
    for (const m of matches) init[m.match_number] = m.is_locked
    return init
  })
  const [lockPending, setLockPending] = useState<Record<number, boolean>>({})
  const [bulkMsg, setBulkMsg] = useState<string | null>(null)

  const handleDeadlineSave = async () => {
    setDeadlineStatus('saving')
    const iso = new Date(deadlineInput).toISOString()
    const res = await actionUpdateDeadline(iso)
    if (res.error) {
      setDeadlineStatus('error')
    } else {
      setDeadlineStatus('saved')
      setTimeout(() => setDeadlineStatus('idle'), 2000)
    }
  }

  const handleToggle = useCallback(async (matchNumber: number, locked: boolean) => {
    setLockState((prev) => ({ ...prev, [matchNumber]: locked }))
    setLockPending((prev) => ({ ...prev, [matchNumber]: true }))
    const res = await actionToggleMatchLock(matchNumber, locked)
    setLockPending((prev) => ({ ...prev, [matchNumber]: false }))
    if (res.error) {
      setLockState((prev) => ({ ...prev, [matchNumber]: !locked }))
    }
  }, [])

  const handleBulk = async (
    action: () => Promise<{ error?: string }>,
    newState: Record<number, boolean> | null,
    msg: string
  ) => {
    setBulkMsg('Aplicando…')
    const res = await action()
    if (res.error) {
      setBulkMsg(`Error: ${res.error}`)
    } else {
      if (newState) setLockState((prev) => ({ ...prev, ...newState }))
      setBulkMsg(msg)
      setTimeout(() => setBulkMsg(null), 2000)
    }
  }

  const groupLockMap = (phase: string, locked: boolean) => {
    const update: Record<number, boolean> = {}
    for (const m of matches) {
      if (m.phase === phase) update[m.match_number] = locked
    }
    return update
  }

  const allUnlockMap = () => {
    const update: Record<number, boolean> = {}
    for (const m of matches) update[m.match_number] = false
    return update
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-gray-100">Partidos</h1>

      {/* Deadline section */}
      <section className="bg-gray-800 rounded-lg p-5 border border-gray-700">
        <h2 className="text-base font-semibold text-gray-200 mb-4">Deadline global</h2>
        <div className="flex flex-wrap items-end gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Fecha y hora límite (hora local)</label>
            <input
              type="datetime-local"
              value={deadlineInput}
              onChange={(e) => setDeadlineInput(e.target.value)}
              className="px-3 py-1.5 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleDeadlineSave}
            disabled={deadlineStatus === 'saving'}
            className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 rounded transition-colors"
          >
            {deadlineStatus === 'saving'
              ? 'Guardando…'
              : deadlineStatus === 'saved'
              ? 'Guardado ✓'
              : 'Actualizar deadline'}
          </button>
          {deadlineStatus === 'error' && (
            <span className="text-red-400 text-sm">Error al guardar</span>
          )}
        </div>
        <p className="text-sm text-gray-400">
          {completedCount} participante{completedCount !== 1 ? 's' : ''} ha{completedCount !== 1 ? 'n' : ''} completado la porra antes del deadline
        </p>
      </section>

      {/* Quick lock buttons */}
      <section className="bg-gray-800 rounded-lg p-5 border border-gray-700">
        <h2 className="text-base font-semibold text-gray-200 mb-4">Acciones rápidas</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              handleBulk(
                () => actionLockGroupMatches(true),
                groupLockMap('group', true),
                'Fase de grupos bloqueada ✓'
              )
            }
            className="px-3 py-1.5 text-sm bg-red-700 hover:bg-red-600 rounded transition-colors"
          >
            🔒 Bloquear fase de grupos
          </button>
          <button
            onClick={() =>
              handleBulk(
                () => actionLockR32Matches(true),
                groupLockMap('r32', true),
                'Ronda de 32 bloqueada ✓'
              )
            }
            className="px-3 py-1.5 text-sm bg-red-700 hover:bg-red-600 rounded transition-colors"
          >
            🔒 Bloquear Ronda de 32
          </button>
          <button
            onClick={() =>
              handleBulk(
                () => actionUnlockAll(),
                allUnlockMap(),
                'Todo desbloqueado ✓'
              )
            }
            className="px-3 py-1.5 text-sm bg-green-700 hover:bg-green-600 rounded transition-colors"
          >
            🔓 Desbloquear todo
          </button>
        </div>
        {bulkMsg && (
          <p className="mt-2 text-sm text-gray-300">{bulkMsg}</p>
        )}
      </section>

      {/* Match list by phase */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-gray-200">Bloqueo individual</h2>
        {PHASE_GROUPS.map((group) => {
          const phaseMatches = matches.filter((m) => m.phase === group.key)
          if (phaseMatches.length === 0) return null
          const lockedCount = phaseMatches.filter((m) => lockState[m.match_number]).length

          return (
            <div key={group.key} className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
                <h3 className="text-sm font-medium text-gray-300">
                  {group.label}
                </h3>
                <span className="text-xs text-gray-500">
                  {lockedCount}/{phaseMatches.length} bloqueados
                </span>
              </div>
              <div className="divide-y divide-gray-700/50">
                {phaseMatches.map((match) => {
                  const locked = lockState[match.match_number]
                  const pending = lockPending[match.match_number]
                  const homeName = match.home_team?.name ?? match.home_slot ?? '?'
                  const awayName = match.away_team?.name ?? match.away_slot ?? '?'

                  return (
                    <div
                      key={match.id}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-750 hover:bg-gray-700/30 transition-colors"
                    >
                      <span className="text-xs text-gray-600 w-6 font-mono shrink-0">
                        {match.match_number}
                      </span>
                      <span className="text-sm text-gray-300 flex-1 truncate">
                        {homeName} vs {awayName}
                      </span>
                      <span className={`text-xs ${locked ? 'text-red-400' : 'text-gray-500'}`}>
                        {locked ? 'Bloqueado' : 'Abierto'}
                      </span>
                      <ToggleSwitch
                        checked={locked}
                        onChange={(v) => handleToggle(match.match_number, v)}
                        disabled={pending}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}
