'use client'

import { useEffect } from 'react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function EliminatoriasError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[eliminatorias]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6">
      <div className="max-w-lg w-full bg-gray-900 border border-red-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-red-400">Error en Eliminatorias</h2>
        <pre className="text-xs text-gray-300 bg-gray-800 rounded p-3 overflow-x-auto whitespace-pre-wrap break-words">
          {error.message}
          {error.digest ? `\ndigest: ${error.digest}` : ''}
          {error.stack ? `\n\n${error.stack}` : ''}
        </pre>
        <button
          onClick={reset}
          className="w-full py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white text-sm font-medium transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
