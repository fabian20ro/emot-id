import { describe, it, expect } from 'vitest'
import { dimensionalModel, findNearest } from '../models/dimensional'

const allEmotions = dimensionalModel.allEmotions

describe('dimensional model', () => {
  it('has all 28 emotions', () => {
    expect(Object.keys(allEmotions).length).toBe(28)
  })

  it('initialState shows all emotions', () => {
    const state = dimensionalModel.initialState
    expect(state.visibleEmotionIds.size).toBe(28)
  })

  it('onSelect returns same state (all always visible)', () => {
    const state = dimensionalModel.initialState
    const emotion = allEmotions['happy']
    const effect = dimensionalModel.onSelect(emotion, state, [])
    expect(effect.newState.visibleEmotionIds.size).toBe(28)
  })

  it('onDeselect returns same state', () => {
    const state = dimensionalModel.initialState
    const emotion = allEmotions['happy']
    const effect = dimensionalModel.onDeselect(emotion, state)
    expect(effect.newState.visibleEmotionIds.size).toBe(28)
  })

  it('onClear returns initial state', () => {
    const state = dimensionalModel.onClear()
    expect(state.visibleEmotionIds.size).toBe(28)
  })

  it('analyze returns results with valence and arousal', () => {
    const selections = [allEmotions['happy'], allEmotions['calm']]
    const results = dimensionalModel.analyze(selections)
    expect(results.length).toBe(2)
    expect(results[0].valence).toBe(allEmotions['happy'].valence)
    expect(results[0].arousal).toBe(allEmotions['happy'].arousal)
    expect(results[1].valence).toBe(allEmotions['calm'].valence)
    expect(results[1].arousal).toBe(allEmotions['calm'].arousal)
  })

  it('analyze includes description and needs', () => {
    const results = dimensionalModel.analyze([allEmotions['angry']])
    expect(results[0].description?.en).toBeTruthy()
    expect(results[0].needs?.en).toBeTruthy()
  })
})

describe('findNearest', () => {
  it('returns the closest emotion to given coordinates', () => {
    // Happy is at (0.7, 0.4) — search near it
    const nearest = findNearest(0.7, 0.4, allEmotions, 1)
    expect(nearest[0].id).toBe('happy')
  })

  it('returns requested count of emotions', () => {
    const nearest = findNearest(0, 0, allEmotions, 3)
    expect(nearest.length).toBe(3)
  })

  it('returns emotions sorted by distance', () => {
    const nearest = findNearest(0.7, 0.4, allEmotions, 3)
    // First should be closest
    const distances = nearest.map((e) =>
      Math.sqrt((e.valence - 0.7) ** 2 + (e.arousal - 0.4) ** 2)
    )
    expect(distances[0]).toBeLessThanOrEqual(distances[1])
    expect(distances[1]).toBeLessThanOrEqual(distances[2])
  })

  it('finds unpleasant-calm emotions correctly', () => {
    const nearest = findNearest(-0.8, -0.6, allEmotions, 1)
    expect(nearest[0].quadrant).toBe('unpleasant-calm')
  })
})
