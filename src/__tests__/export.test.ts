import { describe, it, expect } from 'vitest'
import { exportSessionsText } from '../data/export'
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

describe('exportSessionsText', () => {
  it('generates English summary', () => {
    const sessions = [makeSession()]
    const text = exportSessionsText(sessions, 'en')
    expect(text).toContain('Session Summary')
    expect(text).toContain('happy')
    expect(text).toContain('wheel')
    expect(text).toContain('Total sessions: 1')
  })

  it('generates Romanian summary', () => {
    const sessions = [makeSession()]
    const text = exportSessionsText(sessions, 'ro')
    expect(text).toContain('Rezumatul sesiunilor')
    expect(text).toContain('fericit')
    expect(text).toContain('Total sesiuni: 1')
  })

  it('includes reflection and crisis tier', () => {
    const sessions = [makeSession({ reflectionAnswer: 'yes', crisisTier: 'tier2' })]
    const text = exportSessionsText(sessions, 'en')
    expect(text).toContain('Reflection: yes')
    expect(text).toContain('Crisis level: tier2')
  })

  it('handles empty sessions array', () => {
    const text = exportSessionsText([], 'en')
    expect(text).toContain('Total sessions: 0')
  })
})
