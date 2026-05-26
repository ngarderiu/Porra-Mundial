'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  userId: string
}

export default function OnboardingClient({ userId }: Props) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = displayName.trim()
    if (trimmed.length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.')
      return
    }
    if (trimmed.length > 30) {
      setError('El nombre no puede superar los 30 caracteres.')
      return
    }

    setLoading(true)
    setError(null)

    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, displayName: trimmed }),
    })

    if (res.ok) {
      router.push('/porra/grupos')
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Error al guardar el nombre. Reintenta.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-green-900">
      <div className="bg-green-950 rounded-xl shadow-xl p-8 max-w-sm w-full mx-4">
        <h1 className="text-2xl font-bold text-white mb-1">
          ¡Bienvenido a la Porra Mundial 2026!
        </h1>
        <p className="text-green-300 text-sm mb-6">
          Antes de empezar, dinos cómo te llamas.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-green-200 mb-1"
            >
              ¿Cómo te llamas?
            </label>
            <input
              id="displayName"
              type="text"
              required
              minLength={2}
              maxLength={30}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full bg-green-800 border border-green-700 rounded-lg px-3 py-2 text-sm text-white placeholder-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-semibold transition-colors"
          >
            {loading ? 'Guardando...' : 'Entrar a la porra'}
          </button>
        </form>
      </div>
    </main>
  )
}
