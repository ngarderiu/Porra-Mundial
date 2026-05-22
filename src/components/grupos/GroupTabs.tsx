import { GROUPS } from '@/lib/constants'
import type { PredictionMap } from '@/lib/bracket'

interface Props {
  activeGroup: string
  predictions: PredictionMap
  onSelect: (letter: string) => void
}

export default function GroupTabs({ activeGroup, predictions, onSelect }: Props) {
  const groupLetters = Object.keys(GROUPS)

  return (
    <div
      className="flex overflow-x-auto scrollbar-none border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
      role="tablist"
      aria-label="Grupos del torneo"
    >
      {groupLetters.map((letter) => {
        const idx = groupLetters.indexOf(letter)
        const groupFilled = Array.from({ length: 6 }, (_, p) => predictions[idx * 6 + p + 1]).every(
          (s) => s != null
        )
        const isActive = letter === activeGroup

        return (
          <button
            key={letter}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(letter)}
            className={`
              relative flex flex-col items-center justify-center gap-0.5
              min-w-[48px] min-h-[52px] px-3 py-2 text-sm font-medium
              transition-colors duration-150 shrink-0
              focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset
              ${isActive
                ? 'text-blue-700 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border-b-2 border-transparent'
              }
            `}
          >
            <span>Grupo {letter}</span>
            <span
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-150 ${
                groupFilled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              aria-hidden="true"
            />
          </button>
        )
      })}
    </div>
  )
}
