import { describe, it, expect } from 'vitest'
import { synthesize } from '../models/synthesis'
import type { AnalysisResult } from '../models/types'

function makeResult(id: string, valence: number, arousal: number): AnalysisResult {
  return {
    id,
    label: { ro: id, en: id },
    color: '#fff',
    description: { ro: `desc-${id}`, en: `desc-${id}` },
    needs: { ro: `needs-${id}`, en: `needs-${id}` },
    valence,
    arousal,
  }
}

describe('synthesis severity-aware tone', () => {
  it('uses "sounds painful" for 2+ distress results (en)', () => {
    const results = [
      makeResult('despair', -0.8, 0.3),
      makeResult('helpless', -0.7, -0.2),
    ]
    const text = synthesize(results, 'en')
    expect(text).toContain('sounds painful')
    expect(text).toContain('deserve')
  })

  it('uses "something meaningful" for non-distress unpleasant results (en)', () => {
    const results = [
      makeResult('sad', -0.5, -0.3),
      makeResult('tired', -0.2, -0.6),
    ]
    const text = synthesize(results, 'en')
    expect(text).toContain('meaningful')
    expect(text).not.toContain('sounds painful')
  })

  it('uses severe Romanian template for distress', () => {
    const results = [
      makeResult('despair', -0.8, 0.3),
      makeResult('grief', -0.9, -0.1),
    ]
    const text = synthesize(results, 'ro')
    expect(text).toContain('pare dureros')
    expect(text).toContain('meriti')
  })

  it('single distress result does not trigger severe tone', () => {
    const results = [makeResult('despair', -0.8, 0.3)]
    const text = synthesize(results, 'en')
    expect(text).not.toContain('sounds painful')
  })

  it('returns empty string for no input', () => {
    const text = synthesize([], 'en')
    expect(text).toBe('')
  })

  it('uses mixed-valence template when positive and negative coexist', () => {
    const results = [
      makeResult('joy', 0.8, -0.3),
      makeResult('sadness', -0.5, 0.1),
    ]
    const text = synthesize(results, 'en')
    expect(text).toContain('holding both')
    expect(text).toContain('complexity')
  })

  it('uses high-intensity template for a single strong arousal result (en)', () => {
    const results = [makeResult('anxiety', -0.4, 0.9)]
    const text = synthesize(results, 'en')
    expect(text).toContain('strong intensity')
    expect(text).not.toContain('sounds painful')
  })

  it('uses high-intensity template for a single strong arousal result (ro)', () => {
    const results = [makeResult('anxietate', -0.4, 0.9)]
    const text = synthesize(results, 'ro')
    expect(text).toContain('intensitate puternica')
    expect(text).not.toContain('dureros')
  })
})
