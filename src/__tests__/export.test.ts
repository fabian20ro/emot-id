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

  it('omits emotion lines when session has no results', () => {
    const sessions = [makeSession({ results: [] })]
    const text = exportSessionsText(sessions, 'en')
    expect(text).not.toContain('happy')
    // Should still include header and model id.
    expect(text).toContain('wheel')
  })

  it('includes match strength in localized output', () => {
    const sessions = [makeSession({
      results: [{ id: 'sad', label: { ro: 'trist', en: 'sad' }, matchStrength: { ro: 'slab', en: 'weak' } }],
    })]
    const textEn = exportSessionsText(sessions, 'en')
    expect(textEn).toContain('sad (weak)')
    const textRo = exportSessionsText(sessions, 'ro')
    expect(textRo).toContain('trist (slab)')
  })

  it('exports multiple sessions with distinct headers', () => {
    const sessions = [
      makeSession({ modelId: 'model-a' }),
      makeSession({ modelId: 'model-b', results: [{ id: 'calm', label: { en: 'calm' }, color: '#000' }] }),
    ]
    const text = exportSessionsText(sessions, 'en')
    expect(text).toContain('--- ')
    // Two sessions means two separator lines with model ids.
    const matches = [...text.matchAll(/--- .+ \(model-[ab]\) ---/g)]
    expect(matches.length).toBe(2)
    expect(text.split('\n').filter(l => l.includes('happy') || l.includes('calm')).length).toBe(2)
  })

  it('skips crisis tier line when tier is none', () => {
    const sessions = [makeSession({ crisisTier: 'none' })]
    const text = exportSessionsText(sessions, 'en')
    expect(text).not.toContain('Crisis level:')
  })

  it('skips reflection line when no answer', () => {
    const sessions = [makeSession({ reflectionAnswer: undefined })]
    const text = exportSessionsText(sessions, 'en')
    expect(text).not.toContain('Reflection:')
  })

  it('returns true from copyToClipboard on success', async () => {
    const { copyToClipboard } = await import('../data/export')
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn().mockResolvedValue(undefined) }, configurable: true })
    const result = await copyToClipboard('test')
    expect(result).toBe(true)
  })

  it('returns false from copyToClipboard on failure', async () => {
    const { copyToClipboard } = await import('../data/export')
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) }, configurable: true })
    const result = await copyToClipboard('test')
    expect(result).toBe(false)
  })

  it('generates download file via anchor element', async () => {
    const { downloadAsText } = await import('../data/export')
    const spy = vi.spyOn(document, 'createElement').mockReturnValueOnce({ href: '', download: '', click: vi.fn() } as unknown as HTMLAnchorElement)
    downloadAsText('hello', 'test.txt')
    expect(spy).toHaveBeenCalledWith('a')
  })
})
