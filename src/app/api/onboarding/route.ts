import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const displayName: string = (body.displayName ?? '').trim()

  if (displayName.length < 2 || displayName.length > 30) {
    return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 })
  }

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await adminClient.from('profiles').insert({
    id: user.id,
    display_name: displayName,
  })

  if (error) {
    // If a profile was already created by the DB trigger, upsert instead
    if (error.code === '23505') {
      const { error: upsertError } = await adminClient
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id)
      if (upsertError) {
        return NextResponse.json({ error: upsertError.message }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
