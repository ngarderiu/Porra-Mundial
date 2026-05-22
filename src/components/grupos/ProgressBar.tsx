import { GROUPS } from '@/lib/constants'
import type { PredictionMap } from '@/lib/bracket'

interface Props {
  predictions: PredictionMap
}

export default function ProgressBar({ predictions }: Props) {
  const filled = Object.keys(predictions).filter(
    (k) => Number(k) >= 1 && Number(k) <= 72
  ).length
  const pct = Math.round((filled / 72) * 100)
  const complete = filled === 72

  const groupLetters = Object.keys(GROUPS)
  const completedGroups = groupLetters.filter((letter) => {
    const idx = groupLetters.indexOf(letter)
    for (let p = 0; p < 6; p++) {
      if (predictions[idx * 6 + p + 1] == null) return false
    }
    return true
  }).length

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="font-medium">
          <span className={complete ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}>
            {filled}
          </span>
          {' / 72 partidos'}
        </span>
        <span>{completedGroups} de 12 grupos completos</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            complete ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={filled}
          aria-valuemin={0}
          aria-valuemax={72}
        />
      </div>
    </div>
  )
}
