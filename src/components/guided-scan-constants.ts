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

/** Find which group a region index belongs to */
export function getGroupForIndex(index: number): string | undefined {
  let offset = 0
  for (const group of BODY_GROUPS) {
    if (index < offset + group.regions.length) return group.id
    offset += group.regions.length
  }
  return undefined
}

/** Get the next index after skipping the current group */
export function getNextGroupStartIndex(currentIndex: number): number {
  let offset = 0
  for (const group of BODY_GROUPS) {
    const groupEnd = offset + group.regions.length
    if (currentIndex < groupEnd) return groupEnd
    offset = groupEnd
  }
  return SCAN_ORDER.length
}
