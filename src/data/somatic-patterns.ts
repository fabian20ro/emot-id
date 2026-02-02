/**
 * Derives recurring somatic patterns from session history.
 * Tracks which body regions and sensations recur across sessions.
 * Clinically valuable: chronic patterns may reveal holding tendencies.
 */
import type { Session } from './types'

export interface RegionFrequency {
  regionId: string
  count: number
  sensations: Record<string, number>
}

export interface SomaticPatterns {
  regionFrequencies: RegionFrequency[]
  totalSomaticSessions: number
}

/**
 * Compute region/sensation frequency from somatic model sessions.
 * Sorted by frequency (most activated regions first).
 */
export function computeSomaticPatterns(sessions: Session[]): SomaticPatterns {
  const somaticSessions = sessions.filter((s) => s.modelId === 'somatic')
  const regionMap = new Map<string, { count: number; sensations: Record<string, number> }>()

  for (const session of somaticSessions) {
    for (const sel of session.selections) {
      const extras = sel.extras as { sensationType?: string } | undefined
      const existing = regionMap.get(sel.emotionId) ?? { count: 0, sensations: {} }
      existing.count++
      if (extras?.sensationType) {
        existing.sensations[extras.sensationType] = (existing.sensations[extras.sensationType] ?? 0) + 1
      }
      regionMap.set(sel.emotionId, existing)
    }
  }

  const regionFrequencies: RegionFrequency[] = []
  for (const [regionId, data] of regionMap.entries()) {
    regionFrequencies.push({
      regionId,
      count: data.count,
      sensations: data.sensations,
    })
  }
  regionFrequencies.sort((a, b) => b.count - a.count)

  return {
    regionFrequencies,
    totalSomaticSessions: somaticSessions.length,
  }
}
