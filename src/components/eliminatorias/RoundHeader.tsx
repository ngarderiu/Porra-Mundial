interface Props {
  title: string
  total: number
  filled: number
}

export default function RoundHeader({ title, total, filled }: Props) {
  const allFilled = filled === total
  return (
    <div className="flex flex-col items-center gap-1 mb-3">
      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide whitespace-nowrap">
        {title}
      </span>
      <span
        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
          allFilled
            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
        }`}
      >
        {filled}/{total}
      </span>
    </div>
  )
}
