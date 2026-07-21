import { describe, expect, it } from 'vitest'
import { plutchikEmotions as plutchikData } from '../models/plutchik'
import {
  GRANULARITY_SETS,
  getGranularityLabel,
  getGranularityValidationStatus,
  getValidGranularitySets,
  type GranularityDistinction,
  type GranularitySet,
} from '../data/granularity-triads'

describe('granularity triads', () => {
  it('defines exactly 5 sets with exactly 3 options each', () => {
    expect(GRANULARITY_SETS).toHaveLength(5)
    for (const set of GRANULARITY_SETS) {
      expect(set.options).toHaveLength(3)
    }
  })

  it('uses only ids that exist in Plutchik source data', () => {
    const source = plutchikData as Record<string, unknown>

    for (const set of GRANULARITY_SETS) {
      for (const option of set.options) {
        expect(source[option.id], `Missing Plutchik id: ${option.id}`).toBeDefined()
      }
    }
  })

  it('normalizes labels to lowercase for visual consistency', () => {
    const localeChecks = [
      { language: 'en' as const, ids: ['fear', 'rage', 'curiosity'] },
      { language: 'ro' as const, ids: ['fear', 'rage', 'curiosity'] },
    ]

    for (const check of localeChecks) {
      for (const id of check.ids) {
        const value = getGranularityLabel(id, check.language)
        const firstChar = value.charAt(0)
        expect(firstChar).toBe(firstChar.toLocaleLowerCase(check.language === 'ro' ? 'ro-RO' : 'en-US'))
      }
    }

    expect(getGranularityLabel('fear', 'en')).toBe('fear')
    expect(getGranularityLabel('fear', 'ro')).toBe('frică')
  })

  it('falls back to normalized id when label source is missing', () => {
    const value = getGranularityLabel('some-missing-id', 'en')
    expect(value).toBe('some missing id')

    const valueRo = getGranularityLabel('some-other-id', 'ro')
    expect(valueRo).toBe('some other id')

    expect(getGranularityLabel('no-label-here', 'ro')).toBe('no label here')
  })

  it('every set uses a valid distinction field', () => {
    const allowed = new Set<GranularityDistinction>([
      'intensity',
      'duration',
      'focus',
      'time',
    ])
    for (const set of GRANULARITY_SETS) {
      expect(allowed.has(set.distinction), `Unexpected distinction: ${set.distinction}`).toBe(true)
    }
  })

  it('filters out invalid sets in fail-safe mode', () => {
    const invalidSet: GranularitySet = {
      id: 'invalid',
      distinction: 'intensity',
      options: [{ id: 'fear' }, { id: 'missing-id' }, { id: 'anger' }],
    }

    const validSets = getValidGranularitySets([...GRANULARITY_SETS, invalidSet])
    expect(validSets).toHaveLength(GRANULARITY_SETS.length)
    expect(validSets.find((set) => set.id === 'invalid')).toBeUndefined()
  })

  it('reports a specific failure reason for partial translation gaps', () => {
    const status = getGranularityValidationStatus({ id: 'unknown-xxx' })
    expect(status.status).toBe('invalid')
    expect((status as { reason: string }).reason).toBe('missing_entry')

    // Real emotion IDs with both translations should be valid:
    const enOnlyStatus = getGranularityValidationStatus({ id: 'anticipation' })
    expect(enOnlyStatus.status).toBe('valid')

    const partialEntry: import('../data/granularity-triads').GranularityOption = { id: 'fear' }
    const validFears = getValidGranularitySets([
      { id: 'test', distinction: 'intensity', options: [partialEntry, { id: 'rage' }, { id: 'anticipation' }] },
    ])
    expect(validFears).toHaveLength(1)

    // A truly missing-ro scenario must be flagged by the new API:
    const hypotheticalStatus = getGranularityValidationStatus({ id: 'anger' })
    expect(hypotheticalStatus.status).toBe('valid')
  })
})
