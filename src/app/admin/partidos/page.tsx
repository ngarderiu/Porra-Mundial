import { createClient } from '@/lib/supabase/server'
import PartidosClient from '@/components/admin/PartidosClient'

export type MatchLock = {
  id: number
  match_number: number
  phase: string
  is_locked: boolean
  home_slot: string | null
  away_slot: string | null
  home_team: { name: string } | null
  away_team: { name: string } | null
}

export default async function PartidosPage() {
  const supabase = await createClient()

  const [matchesResult, teamsResult, settingsResult, predsResult] = await Promise.all([
    supabase.from('matches').select('*').order('match_number'),
    supabase.from('teams').select('id, name'),
    supabase.from('settings').select('value').eq('key', 'deadline').single(),
    // count profiles that have all 72+32 predictions (completed before deadline)
    supabase
      .from('predictions')
      .select('user_id')
      .then(async (res) => {
        // We'll compute this client-side from the raw prediction data
        return res
      }),
  ])

  const teamById = new Map(
    (teamsResult.data ?? []).map((t: { id: number; name: string }) => [t.id, t])
  )

  const matches: MatchLock[] = (matchesResult.data ?? []).map(
    (m: {
      id: number
      match_number: number
      phase: string
      is_locked: boolean
      home_slot: string | null
      away_slot: string | null
      home_team_id: number | null
      away_team_id: number | null
    }) => ({
      id: m.id,
      match_number: m.match_number,
      phase: m.phase,
      is_locked: m.is_locked,
      home_slot: m.home_slot,
      away_slot: m.away_slot,
      home_team: m.home_team_id ? (teamById.get(m.home_team_id) ?? null) : null,
      away_team: m.away_team_id ? (teamById.get(m.away_team_id) ?? null) : null,
    })
  )

  // Count completed participants
  const allPreds = predsResult.data ?? []
  const userPredCount: Record<string, number> = {}
  for (const p of allPreds) {
    userPredCount[p.user_id] = (userPredCount[p.user_id] ?? 0) + 1
  }
  const completedCount = Object.values(userPredCount).filter((c) => c >= 104).length

  const deadline = settingsResult.data?.value ?? '2026-06-10T22:00:00Z'

  return (
    <PartidosClient matches={matches} deadline={deadline} completedCount={completedCount} />
  )
}
