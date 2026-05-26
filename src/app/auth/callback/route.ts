import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/porra/grupos'

  if (code) {
    const cookieStore = await cookies()
    // Collect cookies set during exchangeCodeForSession so we can copy them
    // onto whichever redirect response we end up returning.
    const collectedCookies: Array<{ name: string; value: string; options: object }> = []
    const response = NextResponse.redirect(new URL(next, origin))

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              response.cookies.set(name, value, options)
              collectedCookies.push({ name, value, options })
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const adminClient = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        const { data: profile } = await adminClient
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!profile) {
          const onboardingResponse = NextResponse.redirect(new URL('/onboarding', origin))
          collectedCookies.forEach(({ name, value, options }) =>
            onboardingResponse.cookies.set(name, value, options as Parameters<typeof onboardingResponse.cookies.set>[2])
          )
          return onboardingResponse
        }
      }

      return response
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_callback_failed', origin))
}
