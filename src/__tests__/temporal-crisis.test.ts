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
    expect(hasTemporalCrisisPattern([], 1_000_000)).toBe(false)
  })

  it('returns false for fewer than 3 high-distress sessions', () => {
    const sessions = [
      makeSession({ crisisTier: 'tier2' }),
      makeSession({ crisisTier: 'tier3' }),
    ]
    expect(hasTemporalCrisisPattern(sessions, 1_000_000)).toBe(false)
  })

  it('returns true for 3+ tier2/tier3/tier4 sessions in last 7 days', () => {
    const sessions = [
      makeSession({ crisisTier: 'tier2' }),
      makeSession({ crisisTier: 'tier3' }),
      makeSession({ crisisTier: 'tier4' }),
    ]
    expect(hasTemporalCrisisPattern(sessions, 1_000_000)).toBe(true)
  })

  it('excludes sessions older than 7 days', () => {
    const now = 1_000_000
    const eightDaysAgo = now - 8 * 24 * 60 * 60 * 1000
    const sessions = [
      makeSession({ crisisTier: 'tier2', timestamp: eightDaysAgo }),
      makeSession({ crisisTier: 'tier3', timestamp: eightDaysAgo }),
      makeSession({ crisisTier: 'tier2', timestamp: eightDaysAgo }),
    ]
    expect(hasTemporalCrisisPattern(sessions, now)).toBe(false)
  })

  it('includes sessions exactly on the 7-day boundary', () => {
    const now = 1_000_000
    const boundary = now - 7 * 24 * 60 * 60 * 1000
    const sessions = [
      makeSession({ crisisTier: 'tier2', timestamp: boundary }),
      makeSession({ crisisTier: 'tier3', timestamp: boundary + 1 }),
      makeSession({ crisisTier: 'tier4', timestamp: boundary + 2 }),
    ]
    expect(hasTemporalCrisisPattern(sessions, now)).toBe(true)
  })
})

describe('escalateCrisisTier', () => {
  it('does not escalate when no temporal pattern', () => {
    expect(escalateCrisisTier('none', [], 1_000_000)).toBe('none')
  })

  it('escalates none to tier1 when pattern detected', () => {
    const sessions = [
      makeSession({ crisisTier: 'tier2' }),
      makeSession({ crisisTier: 'tier2' }),
      makeSession({ crisisTier: 'tier2' }),
    ]
    expect(escalateCrisisTier('none', sessions, 1_000_000)).toBe('tier1')
  })

  it('escalates tier1 to tier2', () => {
    const sessions = [
      makeSession({ crisisTier: 'tier3' }),
      makeSession({ crisisTier: 'tier2' }),
      makeSession({ crisisTier: 'tier3' }),
    ]
    expect(escalateCrisisTier('tier1', sessions, 1_000_000)).toBe('tier2')
  })

  it('escalates tier2 to tier3', () => {
    const sessions = [
      makeSession({ crisisTier: 'tier4' }),
      makeSession({ crisisTier: 'tier2' }),
      makeSession({ crisisTier: 'tier3' }),
    ]
    expect(escalateCrisisTier('tier2', sessions, 1_000_000)).toBe('tier3')
  })

  it('caps at tier3', () => {
    const sessions = [
      makeSession({ crisisTier: 'tier3' }),
      makeSession({ crisisTier: 'tier3' }),
      makeSession({ crisisTier: 'tier3' }),
    ]
    expect(escalateCrisisTier('tier3', sessions, 1_000_000)).toBe('tier3')
  })

  it('preserves tier4 when already at highest tier', () => {
    const sessions = [
      makeSession({ crisisTier: 'tier4' }),
      makeSession({ crisisTier: 'tier3' }),
      makeSession({ crisisTier: 'tier2' }),
    ]
    expect(escalateCrisisTier('tier4', sessions, 1_000_000)).toBe('tier4')
  })
})
