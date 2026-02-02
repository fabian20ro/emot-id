/** Emotion IDs considered high-distress across all models */
export const HIGH_DISTRESS_IDS = new Set([
  'despair', 'rage', 'terror', 'grief', 'shame', 'loathing',
  // Wheel leaf emotions signalling severe distress:
  'worthless', 'helpless', 'apathetic',
  // Additional distress signals:
  'empty', 'powerless', 'abandoned', 'victimized', 'numb',
  'violated', 'depressed', 'distressed',
])

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
]

export type CrisisTier = 'none' | 'tier1' | 'tier2' | 'tier3'

/**
 * Determine crisis tier from analysis results.
 * - tier1: 1 match — warm invitation
 * - tier2: 2+ matches — amber alert
 * - tier3: specific severe combos — most direct
 */
export function getCrisisTier(resultIds: string[]): CrisisTier {
  const distressIds = resultIds.filter((id) => HIGH_DISTRESS_IDS.has(id))

  if (distressIds.length === 0) return 'none'

  // Check tier 3 combos
  for (const [a, b] of TIER3_COMBOS) {
    if (distressIds.includes(a) && distressIds.includes(b)) {
      return 'tier3'
    }
  }

  if (distressIds.length >= 2) return 'tier2'
  return 'tier1'
}
