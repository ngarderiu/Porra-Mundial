'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function checkDisplayNameTaken(name: string): Promise<boolean> {
  const serviceClient = getServiceClient()
  const { data } = await serviceClient
    .from('profiles')
    .select('id')
    .ilike('display_name', name.trim())
    .limit(1)
  return (data?.length ?? 0) > 0
}

export async function createProfile(displayName: string) {
  const trimmedName = displayName.trim()

  if (trimmedName.length < 2 || trimmedName.length > 20) {
    return { error: 'El nombre debe tener entre 2 y 20 caracteres.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No hay sesión activa.' }
  }

  const serviceClient = getServiceClient()

  const { data: existing } = await serviceClient
    .from('profiles')
    .select('id')
    .ilike('display_name', trimmedName)
    .neq('id', user.id)
    .limit(1)

  if (existing && existing.length > 0) {
    return { error: 'Este nombre ya está cogido.' }
  }

  const { error } = await serviceClient
    .from('profiles')
    .update({ display_name: trimmedName })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  redirect('/porra/grupos')
}
