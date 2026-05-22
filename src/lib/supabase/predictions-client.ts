import { createClient } from '@/lib/supabase/client'
import { DEADLINE } from '@/lib/constants'

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

  const supabase = createClient()

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
