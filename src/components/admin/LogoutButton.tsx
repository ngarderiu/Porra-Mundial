'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded transition-colors"
    >
      Logout
    </button>
  )
}
