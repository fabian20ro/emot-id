/**
 * Temporal crisis pattern detection.
 * Tracks anonymized session-level distress scores (tier + timestamp).
 * Escalates crisis response when tier 2/3 detected in 3+ sessions within 7 days.
 */
import type { CrisisTier } from '../models/distress'
import type { Session } from './types'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
const MIN_HIGH_DISTRESS_SESSIONS = 3

/**
 * Check if recent sessions show a pattern of high distress.
 * Returns true when 3+ sessions with tier2/tier3 occurred in the last 7 days.
 */
export function hasTemporalCrisisPattern(sessions: Session[]): boolean {
  const cutoff = Date.now() - SEVEN_DAYS_MS
  const recentHighDistress = sessions.filter(
    (s) =>
      s.timestamp >= cutoff &&
      (s.crisisTier === 'tier2' || s.crisisTier === 'tier3'),
  )
  return recentHighDistress.length >= MIN_HIGH_DISTRESS_SESSIONS
}

/**
 * Escalate a crisis tier by one level if temporal pattern detected.
 * none → tier1, tier1 → tier2, tier2/tier3 → tier3
 */
export function escalateCrisisTier(
  currentTier: CrisisTier,
  sessions: Session[],
): CrisisTier {
  if (!hasTemporalCrisisPattern(sessions)) return currentTier

  switch (currentTier) {
    case 'none':
      return 'tier1'
    case 'tier1':
      return 'tier2'
    case 'tier2':
    case 'tier3':
      return 'tier3'
  }
}
