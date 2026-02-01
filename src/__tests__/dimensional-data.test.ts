import { describe, it, expect } from 'vitest'
import emotionsData from '../models/dimensional/data.json'
import type { DimensionalEmotion } from '../models/dimensional/types'

const emotions = Object.values(emotionsData) as DimensionalEmotion[]

describe('dimensional data', () => {
  it('has at least 28 reference emotions', () => {
    expect(emotions.length).toBeGreaterThanOrEqual(28)
  })

  it('has at least 7 emotions per quadrant', () => {
    const quadrants = {
      'pleasant-intense': 0,
      'pleasant-calm': 0,
      'unpleasant-intense': 0,
      'unpleasant-calm': 0,
    }
    for (const e of emotions) {
      quadrants[e.quadrant]++
    }
    expect(quadrants['pleasant-intense']).toBeGreaterThanOrEqual(7)
    expect(quadrants['pleasant-calm']).toBeGreaterThanOrEqual(7)
    expect(quadrants['unpleasant-intense']).toBeGreaterThanOrEqual(7)
    expect(quadrants['unpleasant-calm']).toBeGreaterThanOrEqual(7)
  })

  it('all emotions have coordinates in -1 to +1 range', () => {
    for (const e of emotions) {
      expect(e.valence).toBeGreaterThanOrEqual(-1)
      expect(e.valence).toBeLessThanOrEqual(1)
      expect(e.arousal).toBeGreaterThanOrEqual(-1)
      expect(e.arousal).toBeLessThanOrEqual(1)
    }
  })

  it('all emotions have bilingual labels', () => {
    for (const e of emotions) {
      expect(e.label.en).toBeTruthy()
      expect(e.label.ro).toBeTruthy()
    }
  })

  it('all emotions have bilingual descriptions', () => {
    for (const e of emotions) {
      expect(e.description?.en).toBeTruthy()
      expect(e.description?.ro).toBeTruthy()
    }
  })

  it('all emotions have bilingual needs', () => {
    for (const e of emotions) {
      expect(e.needs?.en).toBeTruthy()
      expect(e.needs?.ro).toBeTruthy()
    }
  })

  it('all emotions have valid colors', () => {
    for (const e of emotions) {
      expect(e.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })

  it('quadrant assignment matches coordinates', () => {
    for (const e of emotions) {
      if (e.quadrant === 'pleasant-intense') {
        expect(e.valence).toBeGreaterThan(0)
        expect(e.arousal).toBeGreaterThan(0)
      } else if (e.quadrant === 'pleasant-calm') {
        expect(e.valence).toBeGreaterThan(0)
        expect(e.arousal).toBeLessThan(0)
      } else if (e.quadrant === 'unpleasant-intense') {
        expect(e.valence).toBeLessThan(0)
        expect(e.arousal).toBeGreaterThan(0)
      } else if (e.quadrant === 'unpleasant-calm') {
        expect(e.valence).toBeLessThan(0)
        expect(e.arousal).toBeLessThan(0)
      }
    }
  })

  it('all emotions have unique IDs', () => {
    const ids = emotions.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
