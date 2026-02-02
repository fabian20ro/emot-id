import { describe, it, expect } from 'vitest'
import { getCrisisTier, HIGH_DISTRESS_IDS, TIER3_COMBOS } from '../models/distress'

describe('getCrisisTier', () => {
  it('returns none when no distress IDs present', () => {
    expect(getCrisisTier(['joy', 'trust', 'serenity'])).toBe('none')
  })

  it('returns none for empty results', () => {
    expect(getCrisisTier([])).toBe('none')
  })

  it('returns tier1 for single distress match', () => {
    expect(getCrisisTier(['despair'])).toBe('tier1')
    expect(getCrisisTier(['joy', 'grief'])).toBe('tier1')
  })

  it('returns tier2 for 2+ distress matches without combo', () => {
    expect(getCrisisTier(['rage', 'terror'])).toBe('tier2')
    expect(getCrisisTier(['shame', 'apathetic', 'joy'])).toBe('tier2')
  })

  it('returns tier3 for specific severe combos', () => {
    expect(getCrisisTier(['despair', 'helpless'])).toBe('tier3')
    expect(getCrisisTier(['grief', 'worthless'])).toBe('tier3')
    expect(getCrisisTier(['shame', 'loathing'])).toBe('tier3')
  })

  it('returns tier3 even when other non-distress IDs present', () => {
    expect(getCrisisTier(['joy', 'despair', 'helpless', 'trust'])).toBe('tier3')
  })

  it('includes expanded distress IDs', () => {
    for (const id of ['empty', 'powerless', 'abandoned', 'victimized', 'numb', 'violated', 'depressed', 'distressed']) {
      expect(HIGH_DISTRESS_IDS.has(id)).toBe(true)
    }
  })

  it('has valid TIER3_COMBOS referencing distress IDs', () => {
    for (const [a, b] of TIER3_COMBOS) {
      expect(HIGH_DISTRESS_IDS.has(a)).toBe(true)
      expect(HIGH_DISTRESS_IDS.has(b)).toBe(true)
    }
  })
})
