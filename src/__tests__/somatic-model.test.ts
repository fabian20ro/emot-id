import { describe, it, expect } from 'vitest'
import { somaticModel } from '../models/somatic'
import type { SomaticRegion, SomaticSelection } from '../models/somatic/types'

describe('somaticModel', () => {
  it('has correct id and name', () => {
    expect(somaticModel.id).toBe('somatic')
    expect(somaticModel.name.en).toBe('Body Map')
  })

  it('has bilingual description', () => {
    expect(somaticModel.description.en).toBeTruthy()
    expect(somaticModel.description.ro).toBeTruthy()
  })

  it('has 12 body regions in allEmotions', () => {
    const ids = Object.keys(somaticModel.allEmotions)
    expect(ids).toHaveLength(12)
  })

  it('initialState shows all 12 regions', () => {
    const state = somaticModel.initialState
    expect(state.visibleEmotionIds.size).toBe(12)
    expect(state.currentGeneration).toBe(0)
  })

  describe('onSelect', () => {
    it('returns state with all regions still visible', () => {
      const region = somaticModel.allEmotions['chest'] as SomaticRegion
      const state = somaticModel.initialState
      const effect = somaticModel.onSelect(region, state, [])

      // All regions should remain visible
      expect(effect.newState.visibleEmotionIds.size).toBe(12)
    })

    it('does not modify selections (handled externally by BodyMap)', () => {
      const region = somaticModel.allEmotions['chest'] as SomaticRegion
      const state = somaticModel.initialState
      const effect = somaticModel.onSelect(region, state, [])

      // Model returns newSelections as-is (undefined means default add behavior)
      // The BodyMap component will intercept and enrich with sensation data
      expect(effect.newSelections).toBeUndefined()
    })
  })

  describe('onDeselect', () => {
    it('returns state with all regions visible', () => {
      const region = somaticModel.allEmotions['chest'] as SomaticRegion
      const state = somaticModel.initialState
      const effect = somaticModel.onDeselect(region, state)

      expect(effect.newState.visibleEmotionIds.size).toBe(12)
    })
  })

  describe('onClear', () => {
    it('returns initial state', () => {
      const state = somaticModel.onClear()
      expect(state.visibleEmotionIds.size).toBe(12)
      expect(state.currentGeneration).toBe(0)
    })
  })

  describe('getEmotionSize', () => {
    it('returns medium for all regions (uniform size)', () => {
      expect(somaticModel.getEmotionSize('chest', somaticModel.initialState)).toBe('medium')
      expect(somaticModel.getEmotionSize('head', somaticModel.initialState)).toBe('medium')
    })
  })

  describe('analyze', () => {
    it('returns empty for no selections', () => {
      const results = somaticModel.analyze([])
      expect(results).toEqual([])
    })

    it('produces results from enriched somatic selections', () => {
      const chest = somaticModel.allEmotions['chest'] as SomaticRegion
      const enriched: SomaticSelection = {
        ...chest,
        selectedSensation: 'tension',
        selectedIntensity: 3,
      }
      const results = somaticModel.analyze([enriched])

      expect(results.length).toBeGreaterThan(0)
      // Anxiety should be top result for chest tension
      expect(results[0].id).toBe('anxiety')
    })

    it('aggregates signals from multiple regions', () => {
      const chest = somaticModel.allEmotions['chest'] as SomaticRegion
      const stomach = somaticModel.allEmotions['stomach'] as SomaticRegion

      const selections: SomaticSelection[] = [
        { ...chest, selectedSensation: 'tension', selectedIntensity: 2 },
        { ...stomach, selectedSensation: 'tension', selectedIntensity: 2 },
      ]
      const results = somaticModel.analyze(selections)

      // Anxiety has signals in both chest and stomach for tension
      const anxiety = results.find(r => r.id === 'anxiety')
      expect(anxiety).toBeDefined()
      expect(anxiety!.componentLabels!.length).toBe(2)
    })
  })
})
