import type { CrisisTier } from '../models/distress'
import type { Session } from './types'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
const MIN_HIGH_DISTRESS_SESSIONS = 3

export function hasTemporalCrisisPattern(sessions: Session[]): boolean {
  const cutoff = Date.now() - SEVEN_DAYS_MS
  const recentHighDistress = sessions.filter(
    (s) =>
      s.timestamp >= cutoff &&
      (s.crisisTier === 'tier2' || s.crisisTier === 'tier3'),
  )
  return recentHighDistress.length >= MIN_HIGH_DISTRESS_SESSIONS
}

export function escalateCrisisTier(
  currentTier: CrisisTier,
  sessions: Session[],
): CrisisTier {
  if (!hasTemporalCrisisPattern(sessions)) {
    return currentTier
  }

  if (currentTier === 'none') return 'tier1'
  if (currentTier === 'tier1') return 'tier2'
  return 'tier3'
}
