import type { Session } from './types'

interface RegionFrequency {
  regionId: string
  count: number
  sensations: Record<string, number>
}

export interface SomaticPatterns {
  regionFrequencies: RegionFrequency[]
  totalSomaticSessions: number
}

export function computeSomaticPatterns(sessions: Session[]): SomaticPatterns {
  const somaticSessions = sessions.filter((s) => s.modelId === 'somatic')
  const regionMap = new Map<
    string,
    { count: number; sensations: Record<string, number> }
  >()

  for (const session of somaticSessions) {
    for (const sel of session.selections) {
      const extras = sel.extras as { sensationType?: string } | undefined
      const existing = regionMap.get(sel.emotionId) ?? {
        count: 0,
        sensations: {},
      }
      existing.count++
      if (extras?.sensationType) {
        const currentCount = existing.sensations[extras.sensationType] ?? 0
        existing.sensations[extras.sensationType] = currentCount + 1
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
