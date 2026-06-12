import { describe, it, expect } from 'vitest'
import { somaticModel } from '../models/somatic/index'
import type { SomaticRegion, ModelState } from '../models/somatic/types'

describe('somaticModel.onSelect', () => {
  const mockEmotion = {
    id: 'test-emotion',
    label: { ro: 'test', en: 'test' },
    color: '#ff0000',
    description: { ro: 'desc', en: 'desc' },
    svgRegionId: 'test-id',
    group: 'torso',
    commonSensations: ['tension'],
    emotionSignals: []
  } as unknown as SomaticRegion

  it('should not reset currentGeneration on select', () => {
    const initialState: ModelState = {
      visibleEmotionIds: new Map([['test-emotion', 1]]),
      currentGeneration: 5
    }
    
    const result = somaticModel.onSelect(mockEmotion, initialState, [])
    
    // The current implementation resets it to 0
    expect(result.newState.currentGeneration).toBe(6)
  })

  it('should preserve existing visibleEmotionIds', () => {
    const initialState: ModelState = {
      visibleEmotionIds: new Map([['test-emotion', 1]]),
      currentGeneration: 0
    }
    
    const result = somaticModel.onSelect(mockEmotion, initialState, [])
    
    expect(result.newState.visibleEmotionIds.has('test-emotion')).toBe(true)
  })
})
