import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserGroupPredictions } from '@/lib/supabase/predictions'
import { DEADLINE } from '@/lib/constants'
import GruposClient from '@/components/grupos/GruposClient'
import type { Match, Team } from '@/types'
import type { PredictionMap } from '@/lib/bracket'

export default async function GruposPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [teamsResult, matchesResult, predictions] = await Promise.all([
    supabase.from('teams').select('*').order('name'),
    supabase
      .from('matches')
      .select('*')
      .eq('phase', 'group')
      .order('match_number'),
    getUserGroupPredictions(user.id),
  ])

  const teams: Team[] = teamsResult.data ?? []
  const matches: Match[] = matchesResult.data ?? []

  const lockedMatchNumbers = matches
    .filter((m) => m.is_locked)
    .map((m) => m.match_number)

  return (
    <GruposClient
      teams={teams}
      matches={matches}
      initialPredictions={predictions}
      lockedMatchNumbers={lockedMatchNumbers}
      userId={user.id}
      deadlineIso={DEADLINE.toISOString()}
    />
  )
}
