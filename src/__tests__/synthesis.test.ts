import { describe, it, expect } from 'vitest'
import { synthesize } from '../models/synthesis'
import type { AnalysisResult } from '../models/types'

function makeResult(overrides: Partial<AnalysisResult> & { id: string }): AnalysisResult {
  return {
    label: { ro: overrides.id, en: overrides.id },
    color: '#000',
    ...overrides,
  }
}

describe('synthesize', () => {
  it('returns empty string for no results', () => {
    expect(synthesize([], 'en')).toBe('')
  })

  it('produces a narrative for a single emotion', () => {
    const result = synthesize(
      [
        makeResult({
          id: 'joy',
          label: { ro: 'bucurie', en: 'joy' },
          description: { ro: 'desc ro', en: 'Joy signals fulfillment.' },
          needs: { ro: 'partajare', en: 'sharing and expression' },
        }),
      ],
      'en'
    )

    expect(result.length).toBeGreaterThan(20)
    // Should mention the emotion name
    expect(result.toLowerCase()).toContain('joy')
    // Single-emotion framing: clear signal
    expect(result.toLowerCase()).toMatch(/clear|focused|single/)
  })

  it('detects concordant pleasant emotions', () => {
    const result = synthesize(
      [
        makeResult({
          id: 'joy',
          label: { ro: 'bucurie', en: 'joy' },
          description: { ro: '', en: 'Joy signals fulfillment.' },
          valence: 0.8,
        }),
        makeResult({
          id: 'serenity',
          label: { ro: 'seninătate', en: 'serenity' },
          description: { ro: '', en: 'Serenity is calm acceptance.' },
          valence: 0.6,
        }),
      ],
      'en'
    )

    // Should not mention "mixed" or "conflicting"
    expect(result.toLowerCase()).not.toMatch(/mixed|conflicting|tension between/)
  })

  it('detects mixed valence and normalizes it', () => {
    const result = synthesize(
      [
        makeResult({
          id: 'joy',
          label: { ro: 'bucurie', en: 'joy' },
          description: { ro: '', en: 'Joy signals fulfillment.' },
          valence: 0.8,
        }),
        makeResult({
          id: 'sadness',
          label: { ro: 'tristete', en: 'sadness' },
          description: { ro: '', en: 'Sadness processes loss.' },
          valence: -0.6,
        }),
      ],
      'en'
    )

    // Should acknowledge the mix and normalize it
    expect(result.toLowerCase()).toMatch(/both|mix|complex|together/)
  })

  it('identifies high intensity pattern', () => {
    const result = synthesize(
      [
        makeResult({
          id: 'anger',
          label: { ro: 'furie', en: 'anger' },
          description: { ro: '', en: 'Anger protects boundaries.' },
          valence: -0.7,
          arousal: 0.8,
        }),
      ],
      'en'
    )

    expect(result.toLowerCase()).toMatch(/intense|strong|important|powerful/)
  })

  it('identifies low intensity pattern', () => {
    const result = synthesize(
      [
        makeResult({
          id: 'serenity',
          label: { ro: 'seninătate', en: 'serenity' },
          description: { ro: '', en: 'Calm acceptance.' },
          valence: 0.4,
          arousal: 0.2,
        }),
      ],
      'en'
    )

    expect(result.toLowerCase()).toMatch(/subtle|gentle|quiet|soft/)
  })

  it('frames 3+ emotions as complexity', () => {
    const result = synthesize(
      [
        makeResult({ id: 'joy', label: { ro: '', en: 'joy' }, description: { ro: '', en: 'Joy signals fulfillment.' } }),
        makeResult({ id: 'fear', label: { ro: '', en: 'fear' }, description: { ro: '', en: 'Fear keeps safe.' } }),
        makeResult({ id: 'sadness', label: { ro: '', en: 'sadness' }, description: { ro: '', en: 'Sadness processes loss.' } }),
      ],
      'en'
    )

    expect(result.toLowerCase()).toMatch(/multiple|several|complex|threads|layers/)
  })

  it('weaves adaptive functions from descriptions', () => {
    const result = synthesize(
      [
        makeResult({
          id: 'anger',
          label: { ro: 'furie', en: 'anger' },
          description: { ro: '', en: 'Anger protects your boundaries and signals that something important is being threatened.' },
        }),
      ],
      'en'
    )

    // Should reference the adaptive function
    expect(result.length).toBeGreaterThan(30)
  })

  it('integrates needs into closing sentence', () => {
    const result = synthesize(
      [
        makeResult({
          id: 'joy',
          label: { ro: 'bucurie', en: 'joy' },
          description: { ro: '', en: 'Joy signals fulfillment.' },
          needs: { ro: 'partajare', en: 'sharing and expression' },
        }),
        makeResult({
          id: 'fear',
          label: { ro: 'frica', en: 'fear' },
          description: { ro: '', en: 'Fear keeps you safe.' },
          needs: { ro: 'siguranta', en: 'safety and reassurance' },
        }),
      ],
      'en'
    )

    // Should mention at least one need
    expect(result.toLowerCase()).toMatch(/sharing|safety|need/)
  })

  it('produces Romanian output', () => {
    const result = synthesize(
      [
        makeResult({
          id: 'joy',
          label: { ro: 'bucurie', en: 'joy' },
          description: { ro: 'Bucuria semnaleaza implinire.', en: 'Joy signals fulfillment.' },
          needs: { ro: 'partajare si exprimare', en: 'sharing and expression' },
        }),
      ],
      'ro'
    )

    expect(result).toContain('bucurie')
  })

  it('avoids diagnostic language', () => {
    const result = synthesize(
      [
        makeResult({
          id: 'sadness',
          label: { ro: '', en: 'sadness' },
          description: { ro: '', en: 'Sadness processes loss.' },
          valence: -0.8,
          arousal: 0.7,
        }),
        makeResult({
          id: 'anger',
          label: { ro: '', en: 'anger' },
          description: { ro: '', en: 'Anger protects boundaries.' },
          valence: -0.7,
          arousal: 0.8,
        }),
      ],
      'en'
    )

    const lower = result.toLowerCase()
    // Should not use diagnostic/pathologizing language
    expect(lower).not.toMatch(/disorder|symptom|diagnos|abnormal|problem|wrong with/)
    // Should not attribute causes
    expect(lower).not.toMatch(/because you|the reason you/)
  })
})
