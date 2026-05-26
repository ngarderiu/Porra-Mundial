import { createClient } from '@/lib/supabase/server'
import ResultadosClient from '@/components/admin/ResultadosClient'

export type MatchData = {
  id: number
  match_number: number
  phase: string
  group_letter: string | null
  home_team_id: number | null
  away_team_id: number | null
  home_slot: string | null
  away_slot: string | null
  home_team: { name: string; flag_emoji: string | null } | null
  away_team: { name: string; flag_emoji: string | null } | null
}

export type ResultData = {
  homeGoals: number
  awayGoals: number
  penWinner: 'home' | 'away' | null
}

export default async function ResultadosPage() {
  const supabase = await createClient()

  const [matchesResult, teamsResult, resultsResult] = await Promise.all([
    supabase.from('matches').select('*').order('match_number'),
    supabase.from('teams').select('id, name, flag_emoji'),
    supabase.from('match_results').select('match_id, home_goals, away_goals, pen_winner'),
  ])

  const teamById = new Map(
    (teamsResult.data ?? []).map((t: { id: number; name: string; flag_emoji: string | null }) => [
      t.id,
      t,
    ])
  )

  const matches: MatchData[] = (matchesResult.data ?? []).map(
    (m: {
      id: number
      match_number: number
      phase: string
      group_letter: string | null
      home_team_id: number | null
      away_team_id: number | null
      home_slot: string | null
      away_slot: string | null
    }) => ({
      ...m,
      home_team: m.home_team_id ? (teamById.get(m.home_team_id) ?? null) : null,
      away_team: m.away_team_id ? (teamById.get(m.away_team_id) ?? null) : null,
    })
  )

  const initialResults: Record<number, ResultData> = {}
  for (const r of resultsResult.data ?? []) {
    initialResults[r.match_id] = {
      homeGoals: r.home_goals,
      awayGoals: r.away_goals,
      penWinner: r.pen_winner as 'home' | 'away' | null,
    }
  }

  return <ResultadosClient matches={matches} initialResults={initialResults} />
}
