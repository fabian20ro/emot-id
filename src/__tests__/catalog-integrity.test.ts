import { describe, it, expect } from 'vitest'
import { emotionCatalog, getCanonicalEmotion } from '../models/catalog'
import { HIGH_DISTRESS_IDS } from '../models/distress'

describe('Catalog integrity', () => {
  it('has no empty IDs', () => {
    for (const [id, e] of Object.entries(emotionCatalog)) {
      expect(id).toBeTruthy()
      expect(e.id).toBe(id)
    }
  })

  it('every entry has bilingual label', () => {
    for (const [id, e] of Object.entries(emotionCatalog)) {
      expect(e.label.en, `${id} missing en label`).toBeTruthy()
      expect(e.label.ro, `${id} missing ro label`).toBeTruthy()
    }
  })

  it('every entry has a color', () => {
    for (const [id, e] of Object.entries(emotionCatalog)) {
      expect(e.color, `${id} missing color`).toBeTruthy()
    }
  })

  it('distressTier values are valid', () => {
    for (const [, e] of Object.entries(emotionCatalog)) {
      if (e.distressTier) {
        expect(['high', 'watch']).toContain(e.distressTier)
      }
    }
  })

  it('all current HIGH_DISTRESS_IDS exist in catalog', () => {
    for (const id of HIGH_DISTRESS_IDS) {
      expect(
        getCanonicalEmotion(id),
        `Distress ID '${id}' not in catalog`
      ).toBeDefined()
    }
  })

  it('getCanonicalEmotion returns undefined for unknown IDs', () => {
    expect(getCanonicalEmotion('nonexistent_xyz')).toBeUndefined()
  })

  it('catalog has at least 250 entries', () => {
    expect(Object.keys(emotionCatalog).length).toBeGreaterThanOrEqual(250)
  })
})
