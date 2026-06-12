import { describe, it, expect } from 'vitest'
import { somaticModel } from '../models/somatic'

describe('somaticModel onSelect', () => {
  it('increments the intensity for the selected region', () => {
    const initialState = somaticModel.initialState
    const regionId = 'head' // This assumes 'head' exists in somaticRegions
    
    // Find a region in the model
    const region = Object.values(somaticModel.allEmotions).find(r => r.id === regionId)
    if (!region) {
        throw new Error(`Region ${regionId} not found in somaticModel`)
    }

    const result1 = somaticModel.onSelect(region, initialState, [])
    expect(result1.newState.visibleEmotionIds.get(regionId)).toBe(1)

    const result2 = somaticModel.onSelect(region, result1.newState, [region])
    expect(result2.newState.visibleEmotionIds.get(regionId)).toBe(2)
  })
})
