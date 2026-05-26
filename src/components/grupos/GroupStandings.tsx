import { calcGroupStandings } from '@/lib/bracket'
import { TEAM_FLAGS } from '@/lib/constants'
import type { PredictionMap } from '@/lib/bracket'

interface Props {
  groupLetter: string
  predictions: PredictionMap
}

const rowBg: Record<number, string> = {
  0: 'bg-green-50',
  1: 'bg-green-50',
  2: 'bg-amber-50',
  3: 'bg-red-50',
}

const borderColor: Record<number, string> = {
  0: 'border-l-green-500',
  1: 'border-l-green-500',
  2: 'border-l-amber-500',
  3: 'border-l-red-300',
}

export default function GroupStandings({ groupLetter, predictions }: Props) {
  const standings = calcGroupStandings(groupLetter, predictions)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs" role="table" aria-label={`Clasificación Grupo ${groupLetter}`}>
        <thead>
          <tr className="bg-gray-100 text-gray-500 text-[10px] uppercase tracking-wide">
            <th scope="col" className="w-7 px-1.5 py-1.5 text-center">#</th>
            <th scope="col" className="px-1.5 py-1.5 text-left">Equipo</th>
            <th scope="col" className="px-1.5 py-1.5 text-center font-bold">PTS</th>
            <th scope="col" className="px-1.5 py-1.5 text-center">PJ</th>
            <th scope="col" className="px-1.5 py-1.5 text-center">G</th>
            <th scope="col" className="px-1.5 py-1.5 text-center">E</th>
            <th scope="col" className="px-1.5 py-1.5 text-center">P</th>
            <th scope="col" className="px-1.5 py-1.5 text-center">DG</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {standings.map((s, idx) => {
            const flag = TEAM_FLAGS[s.team] ?? '🏳'
            return (
              <tr key={s.team} className={rowBg[idx] ?? ''}>
                <td className={`border-l-4 ${borderColor[idx] ?? 'border-l-transparent'} px-1.5 py-1.5 text-center font-semibold text-gray-700`}>
                  {idx + 1}
                </td>
                <td className="px-1.5 py-1.5">
                  <span className="flex items-center gap-1">
                    <span aria-hidden="true">{flag}</span>
                    <span className="font-medium text-gray-900 truncate max-w-[80px] text-[11px]">{s.team}</span>
                  </span>
                </td>
                <td className="px-1.5 py-1.5 text-center font-bold text-gray-900 tabular-nums">{s.pts}</td>
                <td className="px-1.5 py-1.5 text-center text-gray-600 tabular-nums">{s.played}</td>
                <td className="px-1.5 py-1.5 text-center text-gray-600 tabular-nums">{s.won}</td>
                <td className="px-1.5 py-1.5 text-center text-gray-600 tabular-nums">{s.drawn}</td>
                <td className="px-1.5 py-1.5 text-center text-gray-600 tabular-nums">{s.lost}</td>
                <td className="px-1.5 py-1.5 text-center text-gray-700 tabular-nums">
                  {s.gd > 0 ? `+${s.gd}` : s.gd}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
