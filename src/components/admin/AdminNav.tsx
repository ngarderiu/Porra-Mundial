'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/admin/resultados', label: '📊 Resultados' },
  { href: '/admin/participantes', label: '👥 Participantes' },
  { href: '/admin/partidos', label: '🔒 Partidos' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
            pathname.startsWith(item.href)
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

export function AdminTabs() {
  const pathname = usePathname()
  return (
    <>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex-1 text-center py-2 text-sm font-medium border-b-2 transition-colors ${
            pathname.startsWith(item.href)
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </>
  )
}
