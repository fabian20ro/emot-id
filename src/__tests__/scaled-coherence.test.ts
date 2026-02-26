import { describe, it, expect } from 'vitest'
import { scoreSomaticSelections } from '../models/somatic/scoring'
import type { SomaticSelection, SensationType } from '../models/somatic/types'
import { somaticRegions as somaticData } from '../models/somatic'

function makeSomaticSelection(
  regionId: string,
  sensation: SensationType,
  intensity: 1 | 2 | 3,
): SomaticSelection {
  const region = somaticData[regionId as keyof typeof somaticData] as unknown as SomaticSelection
  return {
    ...region,
    selectedSensation: sensation,
    selectedIntensity: intensity,
  }
}

describe('scaled coherence bonus', () => {
  it('returns results for multi-region selections', () => {
    // chest + stomach are both in torso group (1 group = no bonus)
    const results = scoreSomaticSelections([
      makeSomaticSelection('chest', 'tension', 3),
      makeSomaticSelection('stomach', 'tension', 3),
    ])

    expect(results.length).toBeGreaterThan(0)
  })

  it('multi-group selections produce higher anxiety scores than single-group', () => {
    // Anxiety has tension signal in head (head group) and chest (torso group)
    // 1 group only: chest tension
    const oneGroup = scoreSomaticSelections([
      makeSomaticSelection('chest', 'tension', 3),
    ])

    // 2 groups: chest (torso) + head (head group) — anxiety has tension signals in both
    const twoGroups = scoreSomaticSelections([
      makeSomaticSelection('chest', 'tension', 3),
      makeSomaticSelection('head', 'tension', 3),
    ])

    const anxietyOne = oneGroup.find((r) => r.id === 'anxiety')
    const anxietyTwo = twoGroups.find((r) => r.id === 'anxiety')

    expect(anxietyOne).toBeDefined()
    expect(anxietyTwo).toBeDefined()
    // 2 groups: additive signals + 1.2x coherence bonus
    // should exceed single-group score
    expect(anxietyTwo!.score).toBeGreaterThan(anxietyOne!.score)
  })

  it('3-group selection scores higher than 2-group for same emotion', () => {
    // 2 groups: chest (torso) + head (head group)
    const twoGroups = scoreSomaticSelections([
      makeSomaticSelection('chest', 'tension', 3),
      makeSomaticSelection('head', 'tension', 3),
    ])

    // 3 groups: chest (torso) + head (head group) + hands (arms, tingling for anxiety)
    const threeGroups = scoreSomaticSelections([
      makeSomaticSelection('chest', 'tension', 3),
      makeSomaticSelection('head', 'tension', 3),
      makeSomaticSelection('hands', 'tingling', 3),
    ])

    const anxietyTwo = twoGroups.find((r) => r.id === 'anxiety')
    const anxietyThree = threeGroups.find((r) => r.id === 'anxiety')

    expect(anxietyTwo).toBeDefined()
    expect(anxietyThree).toBeDefined()
    // 3 groups get 1.3x bonus vs 2 groups' 1.2x, plus extra signal weight
    expect(anxietyThree!.score).toBeGreaterThan(anxietyTwo!.score)
  })
})
