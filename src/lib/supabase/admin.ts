import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { buildFullBracket } from '@/lib/bracket'
import { calcUserScore } from '@/lib/scoring'
import type { MatchScore, PredictionMap } from '@/lib/bracket'

export type ParticipantStats = {
  userId: string
  displayName: string
  groupPredictions: number
  koPredictions: number
  totalScore: number
  exactCount: number
  winnerCount: number
  lastActive: string | null
}

function getServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function saveMatchResult(
  matchNumber: number,
  homeGoals: number,
  awayGoals: number,
  penWinner?: 'home' | 'away' | null
): Promise<void> {
  const supabase = getServiceClient()

  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('id')
    .eq('match_number', matchNumber)
    .single()

  if (matchError || !match) throw new Error('Partido no encontrado')

  const { error } = await supabase.from('match_results').upsert(
    {
      match_id: match.id,
      home_goals: homeGoals,
      away_goals: awayGoals,
      pen_winner: penWinner ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'match_id' }
  )

  if (error) throw new Error(error.message)

  await resolveKnockoutTeams()
}

export async function resolveKnockoutTeams(): Promise<void> {
  const supabase = getServiceClient()

  const { data: results } = await supabase
    .from('match_results')
    .select('home_goals, away_goals, pen_winner, matches!inner(match_number, phase)')

  if (!results || results.length === 0) return

  const actualGroupResults: PredictionMap = {}
  const actualKnockoutResults: PredictionMap = {}

  for (const r of results) {
    const match = r.matches as unknown as { match_number: number; phase: string }
    if (!match?.match_number) continue
    const score: MatchScore = {
      homeGoals: r.home_goals,
      awayGoals: r.away_goals,
      penWinner: (r.pen_winner as 'home' | 'away' | null) ?? null,
    }
    if (match.phase === 'group') {
      actualGroupResults[match.match_number] = score
    } else {
      actualKnockoutResults[match.match_number] = score
    }
  }

  const resolvedBracket = buildFullBracket(actualGroupResults, actualKnockoutResults)

  const { data: teams } = await supabase.from('teams').select('id, name')
  if (!teams) return
  const teamByName = new Map<string, number>(
    teams.map((t: { id: number; name: string }) => [t.name, t.id])
  )

  const { data: koMatches } = await supabase
    .from('matches')
    .select('id, match_number, home_team_id, away_team_id')
    .neq('phase', 'group')

  if (!koMatches) return

  for (const match of koMatches) {
    const resolved = resolvedBracket.find((r) => r.matchNumber === match.match_number)
    if (!resolved) continue

    const homeTeamId = teamByName.get(resolved.home) ?? null
    const awayTeamId = teamByName.get(resolved.away) ?? null

    const updates: Record<string, number | null> = {}
    if (homeTeamId !== null && match.home_team_id !== homeTeamId) {
      updates.home_team_id = homeTeamId
    }
    if (awayTeamId !== null && match.away_team_id !== awayTeamId) {
      updates.away_team_id = awayTeamId
    }
    if (Object.keys(updates).length > 0) {
      await supabase.from('matches').update(updates).eq('id', match.id)
    }
  }
}

export async function lockMatchesByPhase(phase: string, locked: boolean): Promise<void> {
  const supabase = getServiceClient()
  const { error } = await supabase
    .from('matches')
    .update({ is_locked: locked })
    .eq('phase', phase)
  if (error) throw new Error(error.message)
}

export async function lockAllGroupMatches(locked: boolean): Promise<void> {
  return lockMatchesByPhase('group', locked)
}

export async function lockAllR32Matches(locked: boolean): Promise<void> {
  return lockMatchesByPhase('r32', locked)
}

export async function unlockAllMatches(): Promise<void> {
  const supabase = getServiceClient()
  const { error } = await supabase
    .from('matches')
    .update({ is_locked: false })
    .gte('match_number', 1)
  if (error) throw new Error(error.message)
}

export async function toggleMatchLock(matchNumber: number, locked: boolean): Promise<void> {
  const supabase = getServiceClient()
  const { error } = await supabase
    .from('matches')
    .update({ is_locked: locked })
    .eq('match_number', matchNumber)
  if (error) throw new Error(error.message)
}

export async function updateDeadline(isoString: string): Promise<void> {
  const supabase = getServiceClient()
  const { error } = await supabase.from('settings').upsert(
    { key: 'deadline', value: isoString, updated_at: new Date().toISOString() },
    { onConflict: 'key' }
  )
  if (error) throw new Error(error.message)
}

export async function getAllParticipantsWithStats(): Promise<ParticipantStats[]> {
  const supabase = getServiceClient()

  const [profilesResult, predsResult, resultsResult] = await Promise.all([
    supabase.from('profiles').select('id, display_name'),
    supabase
      .from('predictions')
      .select('user_id, home_goals, away_goals, pen_winner, updated_at, matches!inner(match_number, phase)'),
    supabase
      .from('match_results')
      .select('home_goals, away_goals, pen_winner, matches!inner(match_number, phase)'),
  ])

  const profiles = profilesResult.data ?? []

  // Build actual results maps
  const actualGroupResults: PredictionMap = {}
  const actualKnockoutResults: PredictionMap = {}
  for (const r of resultsResult.data ?? []) {
    const match = r.matches as unknown as { match_number: number; phase: string }
    if (!match?.match_number) continue
    const score: MatchScore = {
      homeGoals: r.home_goals,
      awayGoals: r.away_goals,
      penWinner: (r.pen_winner as 'home' | 'away' | null) ?? null,
    }
    if (match.phase === 'group') {
      actualGroupResults[match.match_number] = score
    } else {
      actualKnockoutResults[match.match_number] = score
    }
  }

  // Build per-user prediction maps
  const userGroupPreds: Record<string, PredictionMap> = {}
  const userKoPreds: Record<string, PredictionMap> = {}
  const userLastActive: Record<string, string> = {}

  for (const pred of predsResult.data ?? []) {
    const match = pred.matches as unknown as { match_number: number; phase: string }
    if (!match?.match_number) continue
    const score: MatchScore = {
      homeGoals: pred.home_goals,
      awayGoals: pred.away_goals,
      penWinner: (pred.pen_winner as 'home' | 'away' | null) ?? null,
    }
    if (match.phase === 'group') {
      userGroupPreds[pred.user_id] ??= {}
      userGroupPreds[pred.user_id][match.match_number] = score
    } else {
      userKoPreds[pred.user_id] ??= {}
      userKoPreds[pred.user_id][match.match_number] = score
    }
    if (!userLastActive[pred.user_id] || pred.updated_at > userLastActive[pred.user_id]) {
      userLastActive[pred.user_id] = pred.updated_at
    }
  }

  return profiles.map((profile: { id: string; display_name: string | null }) => {
    const groupPreds = userGroupPreds[profile.id] ?? {}
    const koPreds = userKoPreds[profile.id] ?? {}
    const { total, breakdown } = calcUserScore(
      profile.id,
      groupPreds,
      koPreds,
      actualGroupResults,
      actualKnockoutResults
    )
    return {
      userId: profile.id,
      displayName: profile.display_name ?? '',
      groupPredictions: Object.keys(groupPreds).length,
      koPredictions: Object.keys(koPreds).length,
      totalScore: total,
      exactCount: breakdown.exact,
      winnerCount: breakdown.winner,
      lastActive: userLastActive[profile.id] ?? null,
    }
  })
}
