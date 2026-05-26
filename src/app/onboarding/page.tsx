'use client'

import { useState, useEffect, useRef } from 'react'
import { createProfile, checkDisplayNameTaken } from './actions'

export default function OnboardingPage() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nameTaken, setNameTaken] = useState(false)
  const [checkingName, setCheckingName] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const trimmed = name.trim()
  const isValid = trimmed.length >= 2 && trimmed.length <= 20
  const isDisabled = loading || nameTaken || !isValid || checkingName

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!isValid) {
      setNameTaken(false)
      setCheckingName(false)
      return
    }

    setCheckingName(true)
    debounceRef.current = setTimeout(async () => {
      const taken = await checkDisplayNameTaken(trimmed)
      setNameTaken(taken)
      setCheckingName(false)
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [trimmed, isValid])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isDisabled) return
    setLoading(true)
    setError(null)

    const result = await createProfile(name)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#1a3a2a]">
      <div className="bg-[#1f4a32] rounded-xl shadow-lg p-8 max-w-sm w-full border border-[#2d6044]">
        <h1 className="text-2xl font-bold text-white mb-2">Bienvenido/a</h1>
        <p className="text-green-200 mb-6 text-sm">¿Cómo quieres aparecer en el ranking?</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="display-name"
              className="block text-sm font-medium text-green-100 mb-1"
            >
              Nombre o apodo
            </label>
            <input
              id="display-name"
              type="text"
              required
              minLength={2}
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre o apodo"
              className="w-full bg-[#163526] border border-[#2d6044] rounded-lg px-3 py-2 text-sm text-white placeholder-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-green-600 text-xs mt-1">
              Entre 2 y 20 caracteres. Este nombre no se podrá cambiar después.
            </p>
            {nameTaken && (
              <p className="text-red-400 text-sm mt-1">Este nombre ya está cogido.</p>
            )}
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isDisabled}
            className="w-full bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Guardando...' : checkingName ? 'Comprobando...' : 'Confirmar'}
          </button>
        </form>
      </div>
    </main>
  )
}
