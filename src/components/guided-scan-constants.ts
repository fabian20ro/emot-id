/** Body groups with their region IDs, ordered head-to-feet */
export const BODY_GROUPS = [
  { id: 'head', regions: ['head', 'jaw'] },
  { id: 'neck', regions: ['throat', 'shoulders', 'upper-back'] },
  { id: 'torso', regions: ['chest', 'stomach', 'lower-back'] },
  { id: 'arms', regions: ['arms', 'hands'] },
  { id: 'legs', regions: ['legs', 'feet'] },
] as const

/** Flat scan order derived from groups */
export const SCAN_ORDER = BODY_GROUPS.flatMap((g) => g.regions)

export const CENTERING_DURATION_MS = 10000
export const EXTENDED_CENTERING_MS = 30000
export const BREATH_CYCLE_MS = 5000

// Invariant checks: verify behavioral contract at module load time
const expectedRegions = [
  'head', 'jaw',
  'throat', 'shoulders', 'upper-back',
  'chest', 'stomach', 'lower-back',
  'arms', 'hands',
  'legs', 'feet'
]

if (SCAN_ORDER.length !== expectedRegions.length || !expectedRegions.every((r, i) => SCAN_ORDER[i] === r)) {
  throw new Error('guided-scan-constants: SCAN_ORDER does not match expected region sequence')
}

for (let i = 0; i < SCAN_ORDER.length; i++) {
  const group = getGroupForIndex(i)
  if (!BODY_GROUPS.some(g => g.id === group)) {
    throw new Error(`guided-scan-constants: index ${i} (${SCAN_ORDER[i]}) has no valid group`)
  }
}

if (getNextGroupStartIndex(SCAN_ORDER.length - 1) !== SCAN_ORDER.length) {
  throw new Error('guided-scan-constants: last region should return SCAN_ORDER.length')
}

const timingOk =
  CENTERING_DURATION_MS > 0 && EXTENDED_CENTERING_MS > CENTERING_DURATION_MS && BREATH_CYCLE_MS > 0
if (!timingOk) {
  throw new Error('guided-scan-constants: timing constants have invalid values')
}

/** Find which group a region index belongs to.
 * Returns the group `id` string for any index in [0, SCAN_ORDER.length),
 * or undefined when the index is out of bounds (negative or beyond the last region).
 */
export function getGroupForIndex(index: number): string | undefined {
  let offset = 0
  for (const group of BODY_GROUPS) {
    if (index < offset + group.regions.length) return group.id
    offset += group.regions.length
  }
  return undefined
}

/** Get the next index after skipping the current group.
 * Returns the starting region index of the NEXT body group, or SCAN_ORDER.length
 * when the current index is already past the last region (i.e. no more groups).
 */
export function getNextGroupStartIndex(currentIndex: number): number {
  let offset = 0
  for (const group of BODY_GROUPS) {
    const groupEnd = offset + group.regions.length
    if (currentIndex < groupEnd) return groupEnd
    offset = groupEnd
  }
  return SCAN_ORDER.length
}
