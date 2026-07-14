import { describe, it, expect } from 'vitest'
import { emotionCatalog, getCanonicalEmotion } from '../models/catalog'
import { HIGH_DISTRESS_IDS, TIER3_COMBOS, TIER4_COMBOS } from '../models/distress'

describe('Catalog integrity', () => {
  it('has no empty IDs', () => {
    for (const [id, e] of Object.entries(emotionCatalog)) {
      expect(id).toBeTruthy()
      expect(e.id).toBe(id)
    }
  })

  it('every parent ID in the catalog exists', () => {
    for (const [id, e] of Object.entries(emotionCatalog)) {
      if (e.parents) {
        e.parents.forEach(parentId => {
          expect(emotionCatalog[parentId], `Emotion '${id}' has invalid parent '${parentId}'`).toBeDefined()
        })
      }
    }
  })

  it('every entry has bilingual label', () => {
    for (const [id, e] of Object.entries(emotionCatalog)) {
      expect(e.label.en, `${id} missing en label`).toBeTruthy()
      expect(e.label.ro, `${id} missing ro label`).toBeTruthy()
    }
  })

  it('every entry has bilingual description', () => {
    for (const [id, e] of Object.entries(emotionCatalog)) {
      expect(e.description.en, `${id} missing en description`).toBeTruthy()
      expect(e.description.ro, `${id} missing ro description`).toBeTruthy()
    }
  })

  it('every entry has bilingual needs', () => {
    for (const [id, e] of Object.entries(emotionCatalog)) {
      expect(e.needs.en, `${id} missing en needs`).toBeTruthy()
      expect(e.needs.ro, `${id} missing ro needs`).toBeTruthy()
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

  it('no duplicate canonical IDs across merged sources', () => {
    const seen = new Set<string>()
    for (const id of Object.keys(emotionCatalog)) {
      expect(seen.has(id), `Duplicate canonical ID '${id}'`).toBe(false)
      seen.add(id)
    }
  })

  it('every parent reference is also a valid catalog entry with same distressTier', () => {
    for (const [id, e] of Object.entries(emotionCatalog)) {
      if (!e.parents || e.parents.length === 0) continue
      for (const parentId of e.parents) {
        const parent = emotionCatalog[parentId]
        expect(parent, `Parent '${parentId}' not in catalog`).toBeDefined()
        if (parent?.distressTier && e.distressTier) {
          expect(
            parent.distressTier,
            `Parent '${parentId}' tier mismatch with '${id}'`
          ).toBe(e.distressTier)
        }
      }
    }
  })

  it('HIGH_DISTRESS_IDS is consistent with catalog distressTier === "high"', () => {
    const expected = new Set(
      Object.values(emotionCatalog)
        .filter((e) => e.distressTier === 'high')
        .map((e) => e.id)
    )
    expect(HIGH_DISTRESS_IDS.size).toBe(expected.size)
    for (const id of HIGH_DISTRESS_IDS) {
      expect(
        expected.has(id),
        `HIGH_DISTRESS_IDS has '${id}' but catalog tier is not high`
      ).toBe(true)
    }
  })

  it('all TIER3_COMBOS entries reference valid catalog IDs', () => {
    for (const [a, b] of TIER3_COMBOS) {
      expect(getCanonicalEmotion(a), `TIER3 combo '${a}' not in catalog`).toBeDefined()
      expect(getCanonicalEmotion(b), `TIER3 combo '${b}' not in catalog`).toBeDefined()
    }
  })

  it('all TIER4_COMBOS entries reference valid catalog IDs', () => {
    for (const [a, b, c] of TIER4_COMBOS) {
      expect(getCanonicalEmotion(a), `TIER4 combo '${a}' not in catalog`).toBeDefined()
      expect(getCanonicalEmotion(b), `TIER4 combo '${b}' not in catalog`).toBeDefined()
      expect(getCanonicalEmotion(c), `TIER4 combo '${c}' not in catalog`).toBeDefined()
    }
  })

  it('every high-distress entry has distressTier set', () => {
    for (const id of HIGH_DISTRESS_IDS) {
      const e = getCanonicalEmotion(id)
      expect(e, `HIGH_DISTRESS_IDS references '${id}' missing from catalog`).toBeDefined()
      expect(e?.distressTier).toBe('high')
    }
  })
})
