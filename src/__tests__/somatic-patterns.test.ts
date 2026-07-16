import { describe, it, expect } from 'vitest'
import { computeSomaticPatterns } from '../data/somatic-patterns'
import type { Session } from '../data/types'

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    modelId: 'wheel',
    selections: [],
    results: [],
    crisisTier: 'none',
    ...overrides,
  }
}

describe('computeSomaticPatterns', () => {
  it('returns empty patterns for empty sessions', () => {
    const result = computeSomaticPatterns([])
    expect(result.regionFrequencies).toEqual([])
    expect(result.totalSomaticSessions).toBe(0)
  })

  it('correctly counts somatic sessions and region frequencies', () => {
    const sessions = [
      makeSession({
        modelId: 'somatic',
        selections: [
          {
            emotionId: 'joy',
            label: { ro: 'Bucurie', en: 'Joy' },
            extras: { sensationType: 'warmth' }
          },
          {
            emotionId: 'joy',
            label: { ro: 'Bucurie', en: 'Joy' },
            extras: { sensationType: 'warmth' }
          },
          {
            emotionId: 'joy',
            label: { ro: 'Bucurie', en: 'Joy' },
            extras: {}
          }
        ]
      }),
      makeSession({
        modelId: 'somatic',
        selections: [
          {
            emotionId: 'sadness',
            label: { ro: 'Tristețe', en: 'Sadness' },
            extras: { sensationType: 'cold' }
          }
        ]
      }),
      makeSession({
        modelId: 'other',
        selections: [
          {
            emotionId: 'joy',
            label: { ro: 'Bucurie', en: 'Joy' }
          }
        ]
      })
    ]

    const result = computeSomaticPatterns(sessions)
    
    expect(result.totalSomaticSessions).toBe(2) // only 'somatic' modelId sessions
    expect(result.regionFrequencies).toHaveLength(2)
    
    const joyData = result.regionFrequencies.find(r => r.regionId === 'joy')
    expect(joyData?.count).toBe(3)
    expect(joyData?.sensations).toEqual({ warmth: 2 })

    const sadnessData = result.regionFrequencies.find(r => r.regionId === 'sadness')
    expect(sadnessData?.count).toBe(1)
    expect(sadnessData?.sensations).toEqual({ cold: 1 })
  })

  it('sorts regions by count descending', () => {
    const sessions = [
      makeSession({
        modelId: 'somatic',
        selections: [{ emotionId: 'a', label: { ro: 'a', en: 'a' } }],
      }),
      makeSession({
        modelId: 'somatic',
        selections: [
          { emotionId: 'b', label: { ro: 'b', en: 'b' }, extras: { sensationType: 'x' } },
          { emotionId: 'b', label: { ro: 'b', en: 'b' }, extras: { sensationType: 'x' } },
        ],
      }),
    ]

    const result = computeSomaticPatterns(sessions)
    expect(result.regionFrequencies[0].regionId).toBe('b')
    expect(result.regionFrequencies[1].regionId).toBe('a')
  })

  it('counts somatic sessions with empty selections toward total', () => {
    const sessions = [
      makeSession({ modelId: 'somatic', selections: [] }),
      makeSession({
        modelId: 'somatic',
        selections: [{ emotionId: 'joy', label: { ro: 'Bucurie', en: 'Joy' } }],
      }),
    ]

    const result = computeSomaticPatterns(sessions)

    expect(result.totalSomaticSessions).toBe(2)
    expect(result.regionFrequencies).toHaveLength(1)
    expect(result.regionFrequencies[0].regionId).toBe('joy')
    expect(result.regionFrequencies[0].count).toBe(1)
    expect(result.regionFrequencies[0].sensations).toEqual({})
  })

  it('treats undefined extras and missing sensationType as no-sensation', () => {
    const sessions = [
      makeSession({
        modelId: 'somatic',
        selections: [
          { emotionId: 'calm', label: { ro: 'Calm', en: 'Calm' }, extras: {} },
          { emotionId: 'calm', label: { ro: 'Calm', en: 'Calm' } },
          { emotionId: 'calm', label: { ro: 'Calm', en: 'Calm' }, extras: { sensationType: 'heavy' } },
        ],
      }),
    ]

    const result = computeSomaticPatterns(sessions)

    expect(result.regionFrequencies).toHaveLength(1)
    const calmData = result.regionFrequencies[0]
    expect(calmData.count).toBe(3)
    expect(calmData.sensations).toEqual({ heavy: 1 })
  })
})
