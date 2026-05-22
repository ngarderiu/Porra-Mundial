export type Phase = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'third' | 'final'
export type PenWinner = 'home' | 'away' | null

export interface Team {
  id: number
  name: string
  flag_emoji: string | null
  group_letter: string
}

export interface Match {
  id: number
  match_number: number
  phase: Phase
  group_letter: string | null
  home_team_id: number | null
  away_team_id: number | null
  home_slot: string | null
  away_slot: string | null
  match_date: string | null
  stadium: string | null
  is_locked: boolean
  home_team?: Team
  away_team?: Team
}

export interface MatchResult {
  id: number
  match_id: number
  home_goals: number
  away_goals: number
  pen_winner: PenWinner
  updated_at: string
}

export interface Profile {
  id: string
  display_name: string
  is_admin: boolean
  created_at: string
}

export interface Prediction {
  id: number
  user_id: string
  match_id: number
  home_goals: number
  away_goals: number
  pen_winner: PenWinner
  submitted_at: string
  updated_at: string
}

export interface GroupStanding {
  team: Team
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
}

export interface BracketSlot {
  match_number: number
  phase: Phase
  home_slot: string | null
  away_slot: string | null
  home_team: Team | null
  away_team: Team | null
  result: MatchResult | null
}

/** Map of match_id → Prediction for a given user */
export type PredictionMap = Record<number, Prediction>
