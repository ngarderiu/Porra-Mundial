import { calcGroupStandings } from '@/lib/bracket'
import { TEAM_FLAGS } from '@/lib/constants'
import type { PredictionMap } from '@/lib/bracket'

interface Props {
  groupLetter: string
  predictions: PredictionMap
}

const rowStyle: Record<number, string> = {
  0: 'bg-green-50 dark:bg-green-950/30',
  1: 'bg-green-50 dark:bg-green-950/30',
  2: 'bg-amber-50 dark:bg-amber-950/30',
}

const posIcon: Record<number, { icon: string; className: string; label: string }> = {
  0: { icon: '✓', className: 'text-green-600 dark:text-green-400', label: 'Clasifica directo' },
  1: { icon: '✓', className: 'text-green-600 dark:text-green-400', label: 'Clasifica directo' },
  2: { icon: '?', className: 'text-amber-600 dark:text-amber-400', label: 'Posible mejor 3º' },
  3: { icon: '✗', className: 'text-red-400 dark:text-red-500', label: 'Eliminado' },
}

export default function GroupStandings({ groupLetter, predictions }: Props) {
  const standings = calcGroupStandings(groupLetter, predictions)

  return (
    <div className="mt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
        Clasificación provisional
      </h3>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm" role="table" aria-label={`Clasificación Grupo ${groupLetter}`}>
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs">
              <th scope="col" className="w-6 px-2 py-2 text-center">#</th>
              <th scope="col" className="px-2 py-2 text-left">Equipo</th>
              <th scope="col" className="hidden sm:table-cell px-2 py-2 text-center">PJ</th>
              <th scope="col" className="hidden sm:table-cell px-2 py-2 text-center">G</th>
              <th scope="col" className="hidden sm:table-cell px-2 py-2 text-center">E</th>
              <th scope="col" className="hidden sm:table-cell px-2 py-2 text-center">P</th>
              <th scope="col" className="hidden sm:table-cell px-2 py-2 text-center">GF</th>
              <th scope="col" className="hidden sm:table-cell px-2 py-2 text-center">GA</th>
              <th scope="col" className="px-2 py-2 text-center">DG</th>
              <th scope="col" className="px-2 py-2 text-center font-bold">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {standings.map((s, idx) => {
              const bg = rowStyle[idx] ?? ''
              const pi = posIcon[idx] ?? posIcon[3]
              const flag = TEAM_FLAGS[s.team] ?? '🏳'

              return (
                <tr key={s.team} className={`${bg} transition-colors duration-150`}>
                  <td className="px-2 py-2 text-center">
                    <span className={`text-xs font-medium ${pi.className}`} title={pi.label} aria-label={pi.label}>
                      {pi.icon}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <span className="flex items-center gap-1.5">
                      <span aria-hidden="true">{flag}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[120px] sm:max-w-none">
                        {s.team}
                      </span>
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-2 py-2 text-center text-gray-600 dark:text-gray-300">{s.played}</td>
                  <td className="hidden sm:table-cell px-2 py-2 text-center text-gray-600 dark:text-gray-300">{s.won}</td>
                  <td className="hidden sm:table-cell px-2 py-2 text-center text-gray-600 dark:text-gray-300">{s.drawn}</td>
                  <td className="hidden sm:table-cell px-2 py-2 text-center text-gray-600 dark:text-gray-300">{s.lost}</td>
                  <td className="hidden sm:table-cell px-2 py-2 text-center text-gray-600 dark:text-gray-300">{s.gf}</td>
                  <td className="hidden sm:table-cell px-2 py-2 text-center text-gray-600 dark:text-gray-300">{s.ga}</td>
                  <td className="px-2 py-2 text-center text-gray-700 dark:text-gray-200">
                    {s.gd > 0 ? `+${s.gd}` : s.gd}
                  </td>
                  <td className="px-2 py-2 text-center font-semibold text-gray-900 dark:text-gray-100">{s.pts}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
        ✓ Clasifica directo · ? Posible mejor 3º · ✗ Eliminado
      </p>
    </div>
  )
}
