import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar, AdminTabs } from '@/components/admin/AdminNav'
import LogoutButton from '@/components/admin/LogoutButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/')

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <span className="font-semibold text-sm md:text-base">
          ⚙️ Admin Panel · Porra Mundial 2026
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 hidden sm:block">{profile.display_name ?? ''}</span>
          <LogoutButton />
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-53px)]">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-48 bg-gray-800 border-r border-gray-700 p-3 shrink-0">
          <AdminSidebar />
        </aside>

        <div className="flex-1 flex flex-col">
          {/* Mobile tabs */}
          <div className="md:hidden flex bg-gray-800 border-b border-gray-700">
            <AdminTabs />
          </div>

          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
