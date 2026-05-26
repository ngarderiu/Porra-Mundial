'use client'

import { useState, useMemo } from 'react'
import type { ParticipantStats } from '@/lib/supabase/admin'

type SortKey = keyof ParticipantStats
type SortDir = 'asc' | 'desc'

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  const color = pct === 100 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-gray-500'
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400">
        {value}
      </span>
    </div>
  )
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ParticipantesClient({
  participants,
}: {
  participants: ParticipantStats[]
}) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('totalScore')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [expanded, setExpanded] = useState<string | null>(null)

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return participants.filter((p) => p.displayName.toLowerCase().includes(q))
  }, [participants, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av ?? '').localeCompare(String(bv ?? ''))
      return sortDir === 'desc' ? -cmp : cmp
    })
  }, [filtered, sortKey, sortDir])

  const completed = participants.filter(
    (p) => p.groupPredictions === 72 && p.koPredictions === 32
  ).length

  function exportCSV() {
    const headers = ['#', 'Nombre', 'Grupos', 'KO', 'Puntos', 'Exactos', 'Ganador', 'Último acceso']
    const rows = sorted.map((p, i) => [
      i + 1,
      `"${p.displayName}"`,
      p.groupPredictions,
      p.koPredictions,
      p.totalScore,
      p.exactCount,
      p.winnerCount,
      p.lastActive ?? 'Nunca',
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `participantes-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      <span className="ml-0.5 text-blue-400">{sortDir === 'desc' ? '↓' : '↑'}</span>
    ) : (
      <span className="ml-0.5 text-gray-600">↕</span>
    )

  const thCls = 'px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wide cursor-pointer hover:text-gray-200 select-none whitespace-nowrap'

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-100">Participantes</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {completed} de {participants.length} participantes han completado la porra
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar por nombre…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded text-gray-200 transition-colors"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              <th className={thCls} onClick={() => handleSort('totalScore')}>#</th>
              <th className={thCls} onClick={() => handleSort('displayName')}>
                Nombre <SortIcon k="displayName" />
              </th>
              <th className={thCls} onClick={() => handleSort('groupPredictions')}>
                Grupos (X/72) <SortIcon k="groupPredictions" />
              </th>
              <th className={thCls} onClick={() => handleSort('koPredictions')}>
                KO (X/32) <SortIcon k="koPredictions" />
              </th>
              <th className={thCls} onClick={() => handleSort('totalScore')}>
                Puntos <SortIcon k="totalScore" />
              </th>
              <th className={thCls} onClick={() => handleSort('exactCount')}>
                Exactos <SortIcon k="exactCount" />
              </th>
              <th className={thCls} onClick={() => handleSort('winnerCount')}>
                Ganador <SortIcon k="winnerCount" />
              </th>
              <th className={thCls} onClick={() => handleSort('lastActive')}>
                Último acceso <SortIcon k="lastActive" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, idx) => {
              const full = p.groupPredictions === 72 && p.koPredictions === 32
              const groupsOnly = p.groupPredictions === 72 && p.koPredictions < 32
              const rowBg = full
                ? 'bg-green-950/40 hover:bg-green-950/60'
                : groupsOnly
                ? 'bg-amber-950/30 hover:bg-amber-950/50'
                : 'bg-gray-900 hover:bg-gray-800'
              const isExpanded = expanded === p.userId

              return (
                <>
                  <tr
                    key={p.userId}
                    className={`${rowBg} cursor-pointer border-b border-gray-800 transition-colors`}
                    onClick={() => setExpanded(isExpanded ? null : p.userId)}
                  >
                    <td className="px-3 py-2 text-gray-400">{idx + 1}</td>
                    <td className="px-3 py-2 font-medium text-gray-100">
                      <span className="flex items-center gap-1">
                        {p.displayName}
                        <span className="text-gray-600 text-xs">{isExpanded ? '▲' : '▼'}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <MiniBar value={p.groupPredictions} max={72} />
                    </td>
                    <td className="px-3 py-2">
                      <MiniBar value={p.koPredictions} max={32} />
                    </td>
                    <td className="px-3 py-2 font-bold text-white">{p.totalScore}</td>
                    <td className="px-3 py-2 text-green-400">{p.exactCount}</td>
                    <td className="px-3 py-2 text-blue-400">{p.winnerCount}</td>
                    <td className="px-3 py-2 text-gray-400 text-xs">{formatDate(p.lastActive)}</td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${p.userId}-detail`} className="border-b border-gray-800">
                      <td colSpan={8} className="px-6 py-3 bg-gray-850 bg-gray-900/80">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="bg-gray-800 rounded p-3">
                            <div className="text-gray-400 text-xs mb-1">Predicciones grupos</div>
                            <div className="text-xl font-bold text-white">{p.groupPredictions}<span className="text-gray-500 text-sm">/72</span></div>
                          </div>
                          <div className="bg-gray-800 rounded p-3">
                            <div className="text-gray-400 text-xs mb-1">Predicciones KO</div>
                            <div className="text-xl font-bold text-white">{p.koPredictions}<span className="text-gray-500 text-sm">/32</span></div>
                          </div>
                          <div className="bg-gray-800 rounded p-3">
                            <div className="text-gray-400 text-xs mb-1">Puntuación total</div>
                            <div className="text-xl font-bold text-white">{p.totalScore}</div>
                          </div>
                          <div className="bg-gray-800 rounded p-3">
                            <div className="text-gray-400 text-xs mb-1">Exactos / Ganador</div>
                            <div className="text-xl font-bold">
                              <span className="text-green-400">{p.exactCount}</span>
                              <span className="text-gray-500 text-sm"> / </span>
                              <span className="text-blue-400">{p.winnerCount}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                  No se encontraron participantes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
