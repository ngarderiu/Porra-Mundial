'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export async function loginWithEmail(email: string): Promise<{ error: string } | undefined> {
  const normalizedEmail = email.trim().toLowerCase()

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: { users }, error: listError } = await serviceClient.auth.admin.listUsers({
    perPage: 1000,
  })

  if (listError) {
    return { error: 'Error al verificar el email. Inténtalo de nuevo.' }
  }

  const userExists = users.some((u) => u.email?.toLowerCase() === normalizedEmail)

  if (!userExists) {
    return {
      error: 'Este email no está en la lista de participantes. Contacta con el organizador.',
    }
  }

  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: process.env.MASTER_PASSWORD!,
  })

  if (signInError) {
    return { error: 'Error al iniciar sesión. Contacta con el organizador.' }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Error al obtener la sesión.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  if (!profile?.display_name) {
    redirect('/onboarding')
  }

  redirect('/porra/grupos')
}
