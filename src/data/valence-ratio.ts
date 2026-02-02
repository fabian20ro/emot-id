import type { Session } from './types'

export interface ValenceRatio {
  pleasant: number
  unpleasant: number
  neutral: number
  total: number
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export function computeValenceRatio(sessions: Session[]): ValenceRatio {
  const cutoff = Date.now() - SEVEN_DAYS_MS
  const recentSessions = sessions.filter((s) => s.timestamp >= cutoff)

  let pleasant = 0
  let unpleasant = 0
  let neutral = 0

  for (const session of recentSessions) {
    for (const result of session.results) {
      if (result.valence === undefined) continue

      if (result.valence > 0.1) {
        pleasant++
      } else if (result.valence < -0.1) {
        unpleasant++
      } else {
        neutral++
      }
    }
  }

  return {
    pleasant,
    unpleasant,
    neutral,
    total: pleasant + unpleasant + neutral,
  }
}
