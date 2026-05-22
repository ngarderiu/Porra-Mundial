import { createClient } from '@/lib/supabase/server'
import { DEADLINE } from '@/lib/constants'
import type { MatchScore, PredictionMap } from '@/lib/bracket'

export async function getUserGroupPredictions(userId: string): Promise<PredictionMap> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('predictions')
    .select('match_id, home_goals, away_goals, matches!inner(match_number, phase)')
    .eq('user_id', userId)
    .eq('matches.phase', 'group')

  if (error || !data) return {}

  const map: PredictionMap = {}
  for (const row of data) {
    const matchRaw = row.matches as unknown as { match_number: number; phase: string } | null
    if (matchRaw?.match_number) {
      map[matchRaw.match_number] = {
        homeGoals: row.home_goals,
        awayGoals: row.away_goals,
      }
    }
  }
  return map
}

export async function getUserKnockoutPredictions(userId: string): Promise<PredictionMap> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('predictions')
    .select('match_id, home_goals, away_goals, pen_winner, matches!inner(match_number, phase)')
    .eq('user_id', userId)
    .neq('matches.phase', 'group')

  if (error || !data) return {}

  const map: PredictionMap = {}
  for (const row of data) {
    const matchRaw = row.matches as unknown as { match_number: number; phase: string } | null
    if (matchRaw?.match_number) {
      map[matchRaw.match_number] = {
        homeGoals: row.home_goals,
        awayGoals: row.away_goals,
        penWinner: (row.pen_winner as 'home' | 'away' | null) ?? null,
      }
    }
  }
  return map
}

export async function upsertPrediction(
  userId: string,
  matchNumber: number,
  homeGoals: number,
  awayGoals: number,
  penWinner?: 'home' | 'away' | null
): Promise<void> {
  if (Date.now() > DEADLINE.getTime()) {
    throw new Error('El plazo para enviar predicciones ha pasado.')
  }

  const supabase = await createClient()

  const { data: matchData, error: matchError } = await supabase
    .from('matches')
    .select('id, is_locked')
    .eq('match_number', matchNumber)
    .single()

  if (matchError || !matchData) throw new Error('Partido no encontrado')
  if (matchData.is_locked) throw new Error('Este partido está bloqueado')

  const { error } = await supabase.from('predictions').upsert(
    {
      user_id: userId,
      match_id: matchData.id,
      home_goals: homeGoals,
      away_goals: awayGoals,
      pen_winner: penWinner ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,match_id' }
  )

  if (error) throw new Error(error.message)
}
