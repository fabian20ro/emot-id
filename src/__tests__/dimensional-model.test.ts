import { describe, it, expect } from 'vitest'
import { dimensionalModel, findNearest } from '../models/dimensional'

const allEmotions = dimensionalModel.allEmotions
const emotionCount = Object.keys(allEmotions).length

describe('dimensional model', () => {
  it('has at least 28 emotions', () => {
    expect(emotionCount).toBeGreaterThanOrEqual(28)
  })

  it('initialState shows all emotions', () => {
    const state = dimensionalModel.initialState
    expect(state.visibleEmotionIds.size).toBe(emotionCount)
  })

  it('onSelect returns same state (all always visible)', () => {
    const state = dimensionalModel.initialState
    const emotion = allEmotions['happy']
    const effect = dimensionalModel.onSelect(emotion, state, [])
    expect(effect.newState.visibleEmotionIds.size).toBe(emotionCount)
  })

  it('onDeselect returns same state', () => {
    const state = dimensionalModel.initialState
    const emotion = allEmotions['happy']
    const effect = dimensionalModel.onDeselect(emotion, state)
    expect(effect.newState.visibleEmotionIds.size).toBe(emotionCount)
  })

  it('onClear returns initial state', () => {
    const state = dimensionalModel.onClear()
    expect(state.visibleEmotionIds.size).toBe(emotionCount)
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

  it('classifies emotions in all four quadrants correctly', () => {
    // Pleasant-intense: high valence, high arousal (top-right)
    const pi = findNearest(0.8, 0.7, allEmotions, 1)[0]
    expect(pi.quadrant).toBe('pleasant-intense')

    // Unpleasant-intense: low valence, high arousal (top-left)
    const ui = findNearest(-0.8, 0.7, allEmotions, 1)[0]
    expect(ui.quadrant).toBe('unpleasant-intense')

    // Pleasant-calm: high valence, low arousal (bottom-right)
    const pc = findNearest(0.8, -0.7, allEmotions, 1)[0]
    expect(pc.quadrant).toBe('pleasant-calm')

    // Unpleasant-calm: low valence, low arousal (bottom-left)
    const uc = findNearest(-0.8, -0.7, allEmotions, 1)[0]
    expect(uc.quadrant).toBe('unpleasant-calm')
  })

  it('handles count=0 correctly', () => {
    const nearest = findNearest(0, 0, allEmotions, 0)
    expect(nearest.length).toBe(0)
  })

  it('returns emotions sorted by distance ascending', () => {
    const nearest = findNearest(0.5, 0.3, allEmotions, 5)
    for (let i = 0; i < nearest.length - 1; i++) {
      const distA = Math.sqrt((nearest[i].valence - 0.5) ** 2 + (nearest[i].arousal - 0.3) ** 2)
      const distB = Math.sqrt((nearest[i + 1].valence - 0.5) ** 2 + (nearest[i + 1].arousal - 0.3) ** 2)
      expect(distA).toBeLessThanOrEqual(distB)
    }
  })

  it('returns emotions with unique IDs', () => {
    const nearest = findNearest(0, 0, allEmotions, 10)
    const ids = new Set(nearest.map((e) => e.id))
    expect(ids.size).toBe(nearest.length)
  })

  it('works with emotions at exact coordinates', () => {
    // Find emotion closest to (-0.5, 0.2)
    const nearest = findNearest(-0.5, 0.2, allEmotions, 1)[0]
    expect(nearest).toBeDefined()
    expect(typeof nearest.id).toBe('string')
    expect(typeof nearest.valence).toBe('number')
    expect(typeof nearest.arousal).toBe('number')
  })
})
