import { describe, it, expect } from 'vitest'
import { computeVocabulary } from '../data/vocabulary'
import type { Session } from '../data/types'

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    modelId: 'wheel',
    selections: [],
    results: [
      { id: 'happy', label: { ro: 'fericit', en: 'happy' }, color: '#fff' },
    ],
    crisisTier: 'none',
    ...overrides,
  }
}

describe('computeVocabulary', () => {
  it('returns zero counts for empty sessions', () => {
    const result = computeVocabulary([])
    expect(result.uniqueEmotionCount).toBe(0)
    expect(result.modelsUsed).toBe(0)
    expect(result.totalSessions).toBe(0)
    expect(result.milestone).toBeNull()
  })

  it('counts unique emotions across sessions', () => {
    const sessions = [
      makeSession({ results: [{ id: 'happy', label: { ro: 'fericit', en: 'happy' }, color: '#fff' }] }),
      makeSession({ results: [{ id: 'happy', label: { ro: 'fericit', en: 'happy' }, color: '#fff' }, { id: 'sad', label: { ro: 'trist', en: 'sad' }, color: '#aaa' }] }),
      makeSession({ modelId: 'somatic', results: [{ id: 'anger', label: { ro: 'furie', en: 'anger' }, color: '#f00' }] }),
    ]
    const result = computeVocabulary(sessions)
    expect(result.uniqueEmotionCount).toBe(3)
    expect(result.modelsUsed).toBe(2)
    expect(result.totalSessions).toBe(3)
    expect(result.perModel['wheel']).toBe(2)
    expect(result.perModel['somatic']).toBe(1)
  })

  it('returns milestone when threshold reached', () => {
    const results = Array.from({ length: 5 }, (_, i) => ({
      id: `emotion-${i}`,
      label: { ro: `em-${i}`, en: `em-${i}` },
      color: '#fff',
    }))
    const sessions = [makeSession({ results })]
    const result = computeVocabulary(sessions)
    expect(result.milestone).toEqual({ type: 'emotions', count: 5 })
  })
})
