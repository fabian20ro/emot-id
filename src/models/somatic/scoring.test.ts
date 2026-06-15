import { describe, it, expect } from 'vitest'
import { scoreSomaticSelections } from './scoring'

describe('scoreSomaticSelections', () => {
  it('should return an empty array if no selections are provided', () => {
    const results = scoreSomaticSelections([])
    expect(results).toEqual([])
  })

  it('should correctly calculate score for a single selection', () => {
    const selections: any[] = [{
      group: 'head',
      selectedSensation: 'pressure',
      selectedIntensity: 2,
      emotionSignals: [
        {
          emotionId: 'anger',
          sensationType: 'pressure',
          minIntensity: 2,
          weight: 1.0,
          source: 'clinical',
          contextDescription: { ro: 'desc', en: 'desc' },
          contextNeeds: { ro: 'needs', en: 'needs' }
        }
      ]
    }]

    const results = scoreSomaticSelections(selections)
    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('anger')
    expect(results[0].score).toBe(2.0)
  })

  it('should apply coherence bonus when multiple body groups are selected', () => {
    const selections: any[] = [
      {
        group: 'head',
        selectedSensation: 'pressure',
        selectedIntensity: 2,
        emotionSignals: [{
          emotionId: 'anger',
          sensationType: 'pressure',
          minIntensity: 2,
          weight: 1.0,
          source: 'clinical'
        }]
      },
      {
        group: 'torso',
        selectedSensation: 'pressure',
        selectedIntensity: 2,
        emotionSignals: [{
          emotionId: 'anger',
          sensationType: 'pressure',
          minIntensity: 2,
          weight: 1.0,
          source: 'clinical'
        }]
      }
    ]

    const results = scoreSomaticSelections(selections)
    expect(results).toHaveLength(1)
    expect(results[0].score).toBeCloseTo(4.8)
  })

  it('should not apply bonus if all selections are from the same body group', () => {
    const selections: any[] = [
      {
        group: 'head',
        selectedSensation: 'pressure',
        selectedIntensity: 2,
        emotionSignals: [{
          emotionId: 'anger',
          sensationType: 'pressure',
          minIntensity: 2,
          weight: 1.0,
          source: 'clinical'
        }]
      },
      {
        group: 'head',
        selectedSensation: 'pressure',
        selectedIntensity: 2,
        emotionSignals: [{
          emotionId: 'anger',
          sensationType: 'pressure',
          minIntensity: 2,
          weight: 1.0,
          source: 'clinical'
        }]
      }
    ]

    const results = scoreSomaticSelections(selections)
    expect(results).toHaveLength(1)
    expect(results[0].score).toBe(4.0)
  })
})
