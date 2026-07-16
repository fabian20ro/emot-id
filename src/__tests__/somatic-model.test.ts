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

  it('should increment currentGeneration on select, not reset to 0', () => {
    const initialState: ModelState = {
      visibleEmotionIds: new Map([['test-emotion', 1]]),
      currentGeneration: 5
    }

    const result = somaticModel.onSelect(mockEmotion, initialState, [])

    expect(result.newState.currentGeneration).toBe(6)
    expect(result.newState.visibleEmotionIds.get('test-emotion')).toBe(2)
  })

  it('should preserve existing visibleEmotionIds and increment the counter', () => {
    const initialState: ModelState = {
      visibleEmotionIds: new Map([['test-emotion', 1]]),
      currentGeneration: 0
    }
    
    const result = somaticModel.onSelect(mockEmotion, initialState, [])
    
    expect(result.newState.visibleEmotionIds.has('test-emotion')).toBe(true)
    // New selection count for this emotion should be prev + 1
    expect(result.newState.visibleEmotionIds.get('test-emotion')).toBe(2)
  })

  it('should accumulate selections across calls', () => {
    const initialState: ModelState = {
      visibleEmotionIds: new Map<string, number>(),
      currentGeneration: 0
    }
    const r1 = somaticModel.onSelect(mockEmotion, initialState, [])
    expect(r1.newState.currentGeneration).toBe(1)
    expect(r1.newState.visibleEmotionIds.get('test-emotion')).toBe(1)

    const r2 = somaticModel.onSelect(mockEmotion, r1.newState, [])
    expect(r2.newState.currentGeneration).toBe(2)
    expect(r2.newState.visibleEmotionIds.get('test-emotion')).toBe(2)

    const r3 = somaticModel.onSelect(mockEmotion, r2.newState, [])
    expect(r3.newState.currentGeneration).toBe(3)
    expect(r3.newState.visibleEmotionIds.get('test-emotion')).toBe(3)
  })

  it('should not include deselected emotion in visible state', () => {
    const initialState: ModelState = {
      visibleEmotionIds: new Map([['test-emotion', 1]]),
      currentGeneration: 0
    }

    const afterSelect = somaticModel.onSelect(mockEmotion, initialState, [])
    expect(afterSelect.newState.visibleEmotionIds.has('test-emotion')).toBe(true)

    const afterDeselect = somaticModel.onDeselect(mockEmotion, afterSelect.newState)
    expect(afterDeselect.newState.visibleEmotionIds.has('test-emotion')).toBe(false)
    // generation advances on deselect too (0→1 via onSelect, 1→2 via deselect)
    expect(afterDeselect.newState.currentGeneration).toBe(2)
  })

  it('should reset state to initial visible map and generation 0 via onClear', () => {
    const cleared = somaticModel.onClear()
    // makeVisibleMap seeds all region IDs at count 0 (size=14 in this build)
    expect(cleared.visibleEmotionIds.size).toBeGreaterThan(0)
    expect(cleared.currentGeneration).toBe(0)
    // Every entry is initialized to zero
    for (const [, v] of cleared.visibleEmotionIds) {
      expect(v).toBe(0)
    }
  })
})
