import { describe, it, expect } from 'vitest'
import { computeValenceRatio } from '../data/valence-ratio'
import type { Session } from '../data/types'

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    modelId: 'dimensional',
    selections: [],
    results: [],
    crisisTier: 'none',
    ...overrides,
  }
}

describe('computeValenceRatio', () => {
  it('returns zero counts for empty sessions', () => {
    const result = computeValenceRatio([])
    expect(result.total).toBe(0)
    expect(result.pleasant).toBe(0)
    expect(result.unpleasant).toBe(0)
    expect(result.weeks).toHaveLength(4)
  })

  it('categorizes by valence', () => {
    const sessions = [
      makeSession({
        results: [
          { id: 'happy', label: { ro: 'fericit', en: 'happy' }, color: '#fff', valence: 0.8 },
          { id: 'sad', label: { ro: 'trist', en: 'sad' }, color: '#aaa', valence: -0.6 },
          { id: 'calm', label: { ro: 'calm', en: 'calm' }, color: '#bbb', valence: 0.05 },
        ],
      }),
    ]
    const result = computeValenceRatio(sessions)
    expect(result.pleasant).toBe(1)
    expect(result.unpleasant).toBe(1)
    expect(result.neutral).toBe(1)
    expect(result.total).toBe(3)
    expect(result.weeks[result.weeks.length - 1].total).toBe(3)
  })

  it('excludes sessions older than 7 days', () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000
    const sessions = [
      makeSession({
        timestamp: eightDaysAgo,
        results: [
          { id: 'happy', label: { ro: 'fericit', en: 'happy' }, color: '#fff', valence: 0.8 },
        ],
      }),
    ]
    const result = computeValenceRatio(sessions)
    expect(result.total).toBe(0)
    const historicalTotal = result.weeks.reduce((sum, week) => sum + week.total, 0)
    expect(historicalTotal).toBe(1)
  })
})
