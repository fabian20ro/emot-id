import { describe, it, expect } from 'vitest'
import { hasTemporalCrisisPattern, escalateCrisisTier } from '../data/temporal-crisis'
import type { Session } from '../data/types'

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    modelId: 'wheel',
    selections: [],
    results: [],
    crisisTier: 'none',
    ...overrides,
  }
}

describe('hasTemporalCrisisPattern', () => {
  it('returns false for empty sessions', () => {
    expect(hasTemporalCrisisPattern([])).toBe(false)
  })

  it('returns false for fewer than 3 high-distress sessions', () => {
    const sessions = [
      makeSession({ crisisTier: 'tier2' }),
      makeSession({ crisisTier: 'tier3' }),
    ]
    expect(hasTemporalCrisisPattern(sessions)).toBe(false)
  })

  it('returns true for 3+ tier2/tier3/tier4 sessions in last 7 days', () => {
    const sessions = [
      makeSession({ crisisTier: 'tier2' }),
      makeSession({ crisisTier: 'tier3' }),
      makeSession({ crisisTier: 'tier4' }),
    ]
    expect(hasTemporalCrisisPattern(sessions)).toBe(true)
  })

  it('excludes sessions older than 7 days', () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000
    const sessions = [
      makeSession({ crisisTier: 'tier2', timestamp: eightDaysAgo }),
      makeSession({ crisisTier: 'tier3', timestamp: eightDaysAgo }),
      makeSession({ crisisTier: 'tier2', timestamp: eightDaysAgo }),
    ]
    expect(hasTemporalCrisisPattern(sessions)).toBe(false)
  })
})

describe('escalateCrisisTier', () => {
  it('does not escalate when no temporal pattern', () => {
    expect(escalateCrisisTier('none', [])).toBe('none')
  })

  it('escalates none to tier1 when pattern detected', () => {
    const sessions = [
      makeSession({ crisisTier: 'tier2' }),
      makeSession({ crisisTier: 'tier2' }),
      makeSession({ crisisTier: 'tier2' }),
    ]
    expect(escalateCrisisTier('none', sessions)).toBe('tier1')
  })

  it('escalates tier1 to tier2', () => {
    const sessions = [
      makeSession({ crisisTier: 'tier3' }),
      makeSession({ crisisTier: 'tier2' }),
      makeSession({ crisisTier: 'tier3' }),
    ]
    expect(escalateCrisisTier('tier1', sessions)).toBe('tier2')
  })

  it('caps at tier3', () => {
    const sessions = [
      makeSession({ crisisTier: 'tier3' }),
      makeSession({ crisisTier: 'tier3' }),
      makeSession({ crisisTier: 'tier3' }),
    ]
    expect(escalateCrisisTier('tier3', sessions)).toBe('tier3')
  })

  it('preserves tier4 when already at highest tier', () => {
    const sessions = [
      makeSession({ crisisTier: 'tier4' }),
      makeSession({ crisisTier: 'tier3' }),
      makeSession({ crisisTier: 'tier2' }),
    ]
    expect(escalateCrisisTier('tier4', sessions)).toBe('tier4')
  })
})
