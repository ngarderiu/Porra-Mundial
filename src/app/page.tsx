import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Porra Mundial 2026</h1>
        <p className="text-gray-500">WIP</p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="text-blue-600 hover:underline">Entrar</Link>
          <Link href="/ranking" className="text-blue-600 hover:underline">Ranking</Link>
        </div>
      </div>
    </main>
  )
}
