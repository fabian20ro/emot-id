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

  it('initial state seeds every region at count zero', () => {
    const initialState = somaticModel.initialState
    // makeVisibleMap pre-seeds all 14 body regions at 0
    expect(initialState.currentGeneration).toBe(0)
    for (const [, v] of initialState.visibleEmotionIds) {
      expect(v).toBe(0)
    }
    // Every known region id is present
    const known = Object.values(somaticModel.allEmotions).map(r => r.id)
    for (const id of known) {
      expect(initialState.visibleEmotionIds.has(id)).toBe(true)
    }
  })

  it('selecting a different region increments only that region without affecting others', () => {
    const initialState = somaticModel.initialState
    const regions = Object.values(somaticModel.allEmotions)
    // Pick two distinct regions from the seeded set
    const head = regions.find(r => r.id === 'head')!
    const torsoFront = regions.find(r => r.group === 'torso' && !r.id.startsWith('torsoBack'))!

    const selectHead = somaticModel.onSelect(head, initialState, [])
    expect(selectHead.newState.visibleEmotionIds.get('head')).toBe(1)
    // torso front was 0 and stays 0 — only head changed
    expect(selectHead.newState.visibleEmotionIds.get(torsoFront.id)).toBe(0)

    const selectTorso = somaticModel.onSelect(torsoFront, selectHead.newState, [])
    expect(selectTorso.newState.visibleEmotionIds.get('head')).toBe(1) // untouched
    expect(selectTorso.newState.visibleEmotionIds.get(torsoFront.id)).toBe(1) // just incremented
    // generation advanced twice: 0 → 2
    expect(selectTorso.newState.currentGeneration).toBe(2)
  })

  it('deselect removes the region from visibleEmotionIds entirely', () => {
    const initialState = somaticModel.initialState
    const head = Object.values(somaticModel.allEmotions).find(r => r.id === 'head')!

    const selected = somaticModel.onSelect(head, initialState, [])
    expect(selected.newState.visibleEmotionIds.has('head')).toBe(true)

    const deselected = somaticModel.onDeselect(head, selected.newState)
    expect(deselected.newState.visibleEmotionIds.has('head')).toBe(false)
    // generation advances on deselect as well
    expect(deselected.newState.currentGeneration).toBe(2)
  })
})
