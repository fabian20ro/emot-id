import { describe, it, expect } from 'vitest'
import { scoreSomaticSelections } from '../models/somatic/scoring'
import type { SomaticSelection, EmotionSignal, BodyGroup } from '../models/somatic/types'

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
  signals: EmotionSignal[] = [],
  group: BodyGroup = 'torso'
): SomaticSelection {
  return {
    id,
    label: { ro: id, en: id },
    color: '#ccc',
    svgRegionId: id,
    group,
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

    const chest = makeSelection('chest', 'tension', 2, [chestSignal], 'torso')
    const stomach = makeSelection('stomach', 'churning', 3, [stomachSignal], 'torso')

    const results = scoreSomaticSelections([chest, stomach])

    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('anxiety')
    // Both from same group (torso), no coherence bonus
    expect(results[0].score).toBeCloseTo(0.6 * 2 + 0.4 * 3)
  })

  it('applies coherence bonus when emotion matched from 2+ body groups', () => {
    const chestSignal = makeSignal({ emotionId: 'anxiety', sensationType: 'tension', weight: 0.6 })
    const legSignal = makeSignal({ emotionId: 'anxiety', sensationType: 'tingling', weight: 0.4 })

    const chest = makeSelection('chest', 'tension', 2, [chestSignal], 'torso')
    const legs = makeSelection('legs', 'tingling', 3, [legSignal], 'legs')

    const results = scoreSomaticSelections([chest, legs])

    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('anxiety')
    // Cross-group: (0.6*2 + 0.4*3) * 1.2 = 2.88
    expect(results[0].score).toBeCloseTo((0.6 * 2 + 0.4 * 3) * 1.2)
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

  it('filters out emotions below threshold of 0.5', () => {
    const weakSignal = makeSignal({ emotionId: 'calm', sensationType: 'warmth', weight: 0.15 })
    const selection = makeSelection('feet', 'warmth', 2, [weakSignal], 'legs')
    const results = scoreSomaticSelections([selection])

    // 0.15 * 2 = 0.3 < 0.5 threshold
    expect(results).toHaveLength(0)
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

  it('uses resonance-based match strength labels', () => {
    const strongSignal = makeSignal({ emotionId: 'joy', sensationType: 'lightness', weight: 1.0 })
    const weakSignal = makeSignal({ emotionId: 'calm', sensationType: 'lightness', weight: 0.2 })

    const selection = makeSelection('chest', 'lightness', 3, [strongSignal, weakSignal])
    const results = scoreSomaticSelections([selection])

    const strong = results.find(r => r.id === 'joy')
    expect(strong?.matchStrength.en).toBe('strong resonance')

    const weak = results.find(r => r.id === 'calm')
    expect(weak?.matchStrength.en).toBe('worth exploring')
  })
})
