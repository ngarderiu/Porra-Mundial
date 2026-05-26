'use server'

import {
  saveMatchResult,
  lockMatchesByPhase,
  lockAllGroupMatches,
  lockAllR32Matches,
  unlockAllMatches,
  toggleMatchLock,
  updateDeadline,
} from '@/lib/supabase/admin'

export async function actionSaveMatchResult(
  matchNumber: number,
  homeGoals: number,
  awayGoals: number,
  penWinner?: 'home' | 'away' | null
): Promise<{ error?: string }> {
  try {
    await saveMatchResult(matchNumber, homeGoals, awayGoals, penWinner)
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

export async function actionLockGroupMatches(locked: boolean): Promise<{ error?: string }> {
  try {
    await lockAllGroupMatches(locked)
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

export async function actionLockR32Matches(locked: boolean): Promise<{ error?: string }> {
  try {
    await lockAllR32Matches(locked)
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

export async function actionUnlockAll(): Promise<{ error?: string }> {
  try {
    await unlockAllMatches()
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

export async function actionToggleMatchLock(
  matchNumber: number,
  locked: boolean
): Promise<{ error?: string }> {
  try {
    await toggleMatchLock(matchNumber, locked)
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

export async function actionLockMatchesByPhase(
  phase: string,
  locked: boolean
): Promise<{ error?: string }> {
  try {
    await lockMatchesByPhase(phase, locked)
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

export async function actionUpdateDeadline(isoString: string): Promise<{ error?: string }> {
  try {
    await updateDeadline(isoString)
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}
