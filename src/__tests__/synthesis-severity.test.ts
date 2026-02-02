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
})
