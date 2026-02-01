import { describe, it, expect } from 'vitest'
import { scoreSomaticSelections } from '../models/somatic/scoring'
import type { SomaticSelection, EmotionSignal } from '../models/somatic/types'

function makeSignal(overrides: Partial<EmotionSignal> & Pick<EmotionSignal, 'emotionId' | 'sensationType'>): EmotionSignal {
  return {
    emotionLabel: { ro: overrides.emotionId, en: overrides.emotionId },
    emotionColor: '#ff0000',
    minIntensity: 1,
    weight: 1,
    ...overrides,
  }
}

function makeSelection(
  id: string,
  sensation: SomaticSelection['selectedSensation'],
  intensity: SomaticSelection['selectedIntensity'],
  signals: EmotionSignal[] = []
): SomaticSelection {
  return {
    id,
    label: { ro: id, en: id },
    color: '#ccc',
    svgRegionId: id,
    group: 'torso',
    commonSensations: [sensation],
    emotionSignals: signals,
    selectedSensation: sensation,
    selectedIntensity: intensity,
  }
}

describe('scoreSomaticSelections', () => {
  it('returns empty array when no selections', () => {
    expect(scoreSomaticSelections([])).toEqual([])
  })

  it('scores a single matching signal', () => {
    const signal = makeSignal({ emotionId: 'anxiety', sensationType: 'tension', weight: 0.8 })
    const selection = makeSelection('chest', 'tension', 2, [signal])
    const results = scoreSomaticSelections([selection])

    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('anxiety')
    expect(results[0].score).toBeCloseTo(0.8 * 2)
  })

  it('ignores signals when sensation type does not match', () => {
    const signal = makeSignal({ emotionId: 'anxiety', sensationType: 'tension', weight: 0.8 })
    const selection = makeSelection('chest', 'warmth', 3, [signal])
    const results = scoreSomaticSelections([selection])

    expect(results).toHaveLength(0)
  })

  it('ignores signals when intensity is below minIntensity', () => {
    const signal = makeSignal({ emotionId: 'anger', sensationType: 'pressure', weight: 1, minIntensity: 3 })
    const selection = makeSelection('head', 'pressure', 2, [signal])
    const results = scoreSomaticSelections([selection])

    expect(results).toHaveLength(0)
  })

  it('includes signal when intensity equals minIntensity', () => {
    const signal = makeSignal({ emotionId: 'anger', sensationType: 'pressure', weight: 0.5, minIntensity: 2 })
    const selection = makeSelection('head', 'pressure', 2, [signal])
    const results = scoreSomaticSelections([selection])

    expect(results).toHaveLength(1)
    expect(results[0].score).toBeCloseTo(0.5 * 2)
  })

  it('aggregates scores across multiple selections for the same emotion', () => {
    const chestSignal = makeSignal({ emotionId: 'anxiety', sensationType: 'tension', weight: 0.6 })
    const stomachSignal = makeSignal({ emotionId: 'anxiety', sensationType: 'churning', weight: 0.4 })

    const chest = makeSelection('chest', 'tension', 2, [chestSignal])
    const stomach = makeSelection('stomach', 'churning', 3, [stomachSignal])

    const results = scoreSomaticSelections([chest, stomach])

    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('anxiety')
    expect(results[0].score).toBeCloseTo(0.6 * 2 + 0.4 * 3)
  })

  it('returns multiple emotions sorted by score descending', () => {
    const anxietySignal = makeSignal({ emotionId: 'anxiety', sensationType: 'tension', weight: 0.5 })
    const angerSignal = makeSignal({ emotionId: 'anger', sensationType: 'tension', weight: 0.9 })

    const selection = makeSelection('chest', 'tension', 3, [anxietySignal, angerSignal])
    const results = scoreSomaticSelections([selection])

    expect(results.length).toBeGreaterThanOrEqual(2)
    expect(results[0].id).toBe('anger')
    expect(results[1].id).toBe('anxiety')
  })

  it('limits results to at most 4', () => {
    const signals = Array.from({ length: 6 }, (_, i) =>
      makeSignal({ emotionId: `emotion-${i}`, sensationType: 'tension', weight: 0.5 + i * 0.1 })
    )
    const selection = makeSelection('chest', 'tension', 3, signals)
    const results = scoreSomaticSelections([selection])

    expect(results.length).toBeLessThanOrEqual(4)
  })

  it('includes component labels showing contributing regions', () => {
    const chestSignal = makeSignal({ emotionId: 'anxiety', sensationType: 'tension', weight: 0.6 })
    const stomachSignal = makeSignal({ emotionId: 'anxiety', sensationType: 'churning', weight: 0.4 })

    const chest = makeSelection('chest', 'tension', 2, [chestSignal])
    chest.label = { ro: 'Piept', en: 'Chest' }
    const stomach = makeSelection('stomach', 'churning', 3, [stomachSignal])
    stomach.label = { ro: 'Stomac', en: 'Stomach' }

    const results = scoreSomaticSelections([chest, stomach])

    expect(results[0].componentLabels).toBeDefined()
    expect(results[0].componentLabels).toHaveLength(2)
    expect(results[0].componentLabels![0].en).toBe('Chest')
    expect(results[0].componentLabels![1].en).toBe('Stomach')
  })

  it('includes match strength label based on score', () => {
    const strongSignal = makeSignal({ emotionId: 'joy', sensationType: 'lightness', weight: 1.0 })
    const weakSignal = makeSignal({ emotionId: 'calm', sensationType: 'lightness', weight: 0.2 })

    const selection = makeSelection('chest', 'lightness', 3, [strongSignal, weakSignal])
    const results = scoreSomaticSelections([selection])

    // Strong signal: 1.0 * 3 = 3.0, Weak signal: 0.2 * 3 = 0.6
    const strong = results.find(r => r.id === 'joy')
    const weak = results.find(r => r.id === 'calm')

    expect(strong?.matchStrength).toBeDefined()
    expect(weak?.matchStrength).toBeDefined()
  })
})
