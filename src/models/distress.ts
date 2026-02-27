import { emotionCatalog } from './catalog'

/** Emotion IDs considered high-distress — derived from catalog distressTier */
export const HIGH_DISTRESS_IDS = new Set(
  Object.values(emotionCatalog)
    .filter((e) => e.distressTier === 'high')
    .map((e) => e.id)
)

/** Specific combinations that indicate tier 3 (most severe) crisis */
export const TIER3_COMBOS: ReadonlyArray<readonly [string, string]> = [
  ['despair', 'helpless'],
  ['despair', 'worthless'],
  ['despair', 'empty'],
  ['grief', 'helpless'],
  ['grief', 'worthless'],
  ['shame', 'loathing'],
  ['shame', 'worthless'],
  ['rage', 'helpless'],
  ['depressed', 'helpless'],
  ['depressed', 'worthless'],
  ['despair', 'hopeless'],
  ['depressed', 'hopeless'],
]

/** Specific high-risk triples that indicate tier 4 crisis */
export const TIER4_COMBOS: ReadonlyArray<readonly [string, string, string]> = [
  ['despair', 'worthless', 'empty'],
  ['helpless', 'numb', 'abandoned'],
  ['despair', 'helpless', 'numb'],
  ['shame', 'worthless', 'empty'],
  ['depressed', 'worthless', 'helpless'],
  ['despair', 'hopeless', 'empty'],
  ['depressed', 'hopeless', 'worthless'],
]

export type CrisisTier = 'none' | 'tier1' | 'tier2' | 'tier3' | 'tier4'

/**
 * Determine crisis tier from analysis results.
 * - tier1: 1 match — warm invitation
 * - tier2: 2+ matches — amber alert
 * - tier3: specific severe pairs — most direct
 * - tier4: high-risk triples — emergency language + explicit acknowledgment
 */
export function getCrisisTier(resultIds: string[]): CrisisTier {
  const distressIds = resultIds.filter((id) => HIGH_DISTRESS_IDS.has(id))

  if (distressIds.length === 0) return 'none'

  // Check tier 4 triples first (highest severity)
  for (const [a, b, c] of TIER4_COMBOS) {
    if (distressIds.includes(a) && distressIds.includes(b) && distressIds.includes(c)) {
      return 'tier4'
    }
  }

  // Check tier 3 combos
  for (const [a, b] of TIER3_COMBOS) {
    if (distressIds.includes(a) && distressIds.includes(b)) {
      return 'tier3'
    }
  }

  if (distressIds.length >= 2) return 'tier2'
  return 'tier1'
}
