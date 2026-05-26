import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserGroupPredictions, getUserKnockoutPredictions } from '@/lib/supabase/predictions'
import { buildFullBracket } from '@/lib/bracket'
import { DEADLINE } from '@/lib/constants'
import EliminatoriaClient from '@/components/eliminatorias/EliminatoriaClient'

export default async function EliminatoriasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [groupPreds, knockoutPreds, lockedResult] = await Promise.all([
    getUserGroupPredictions(user.id),
    getUserKnockoutPredictions(user.id),
    supabase.from('matches').select('match_number').eq('is_locked', true).neq('phase', 'group'),
  ])

  const resolvedBracket = buildFullBracket(groupPreds, knockoutPreds)
  const groupsComplete = Object.keys(groupPreds).length === 72

  const lockedMatchNumbers: number[] = (lockedResult.data ?? []).map(
    (m: { match_number: number }) => m.match_number
  )

  return (
    <EliminatoriaClient
      resolvedBracket={resolvedBracket}
      knockoutPredictions={knockoutPreds}
      lockedMatchNumbers={lockedMatchNumbers}
      userId={user.id}
      deadlineIso={DEADLINE.toISOString()}
      groupsComplete={groupsComplete}
      groupPredictions={groupPreds}
      groupFilledCount={Object.keys(groupPreds).length}
    />
  )
}
