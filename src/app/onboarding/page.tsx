'use client'

import { useState } from 'react'
import { createProfile } from './actions'

export default function OnboardingPage() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)

    const result = await createProfile(name.trim())
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#1a3a2a]">
      <div className="bg-[#1f4a32] rounded-xl shadow-lg p-8 max-w-sm w-full border border-[#2d6044]">
        <h1 className="text-2xl font-bold text-white mb-2">Bienvenido/a</h1>
        <p className="text-green-200 mb-6 text-sm">
          Ya casi está. Solo necesitamos un nombre.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="display-name"
              className="block text-sm font-medium text-green-100 mb-1"
            >
              ¿Cómo quieres que te llamen?
            </label>
            <input
              id="display-name"
              type="text"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre o apodo"
              className="w-full bg-[#163526] border border-[#2d6044] rounded-lg px-3 py-2 text-sm text-white placeholder-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Guardando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  )
}
