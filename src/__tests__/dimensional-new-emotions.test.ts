import { describe, it, expect } from 'vitest'
import { dimensionalModel } from '../models/dimensional'

const NEW_EMOTION_IDS = ['apathetic', 'melancholic', 'resigned', 'pensive', 'contemplative']

describe('new dimensional emotions (Phase 3.3)', () => {
  it('all new emotions exist in allEmotions', () => {
    for (const id of NEW_EMOTION_IDS) {
      expect(dimensionalModel.allEmotions[id], `${id} should exist`).toBeDefined()
    }
  })

  it('all new emotions have bilingual labels', () => {
    for (const id of NEW_EMOTION_IDS) {
      const emotion = dimensionalModel.allEmotions[id]
      expect(emotion.label.en, `${id} missing en label`).toBeTruthy()
      expect(emotion.label.ro, `${id} missing ro label`).toBeTruthy()
    }
  })

  it('all new emotions have bilingual descriptions', () => {
    for (const id of NEW_EMOTION_IDS) {
      const emotion = dimensionalModel.allEmotions[id]
      expect(emotion.description?.en, `${id} missing en description`).toBeTruthy()
      expect(emotion.description?.ro, `${id} missing ro description`).toBeTruthy()
    }
  })

  it('all new emotions are in unpleasant or near-neutral territory', () => {
    for (const id of NEW_EMOTION_IDS) {
      const emotion = dimensionalModel.allEmotions[id]
      // All should have valence <= 0.1 (unpleasant or near-neutral)
      expect(emotion.valence).toBeLessThanOrEqual(0.1)
    }
  })

  it('all new emotions are in calm territory (low arousal)', () => {
    for (const id of NEW_EMOTION_IDS) {
      const emotion = dimensionalModel.allEmotions[id]
      // All should have negative or low arousal
      expect(emotion.arousal).toBeLessThan(0)
    }
  })

  it('apathetic is in the unpleasant-calm quadrant', () => {
    const e = dimensionalModel.allEmotions['apathetic']
    expect(e.valence).toBeLessThan(0)
    expect(e.arousal).toBeLessThan(0)
    expect(e.quadrant).toBe('unpleasant-calm')
  })

  it('contemplative is near-neutral on valence', () => {
    const e = dimensionalModel.allEmotions['contemplative']
    expect(e.valence).toBeGreaterThan(-0.2)
    expect(e.valence).toBeLessThan(0.3)
  })
})
