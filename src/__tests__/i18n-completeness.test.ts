import { describe, it, expect } from 'vitest'
import ro from '../i18n/ro.json'
import en from '../i18n/en.json'

/** Recursively extract all leaf key paths from a nested object */
function getKeyPaths(obj: Record<string, unknown>, prefix = ''): string[] {
  const paths: string[] = []
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const value = obj[key]
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      paths.push(...getKeyPaths(value as Record<string, unknown>, fullKey))
    } else {
      paths.push(fullKey)
    }
  }
  return paths
}

describe('i18n completeness', () => {
  const roKeys = getKeyPaths(ro).sort()
  const enKeys = getKeyPaths(en).sort()

  it('Romanian and English have identical key sets', () => {
    const missingInEn = roKeys.filter((k) => !enKeys.includes(k))
    const missingInRo = enKeys.filter((k) => !roKeys.includes(k))

    expect(missingInEn, 'Keys in RO but missing in EN').toEqual([])
    expect(missingInRo, 'Keys in EN but missing in RO').toEqual([])
  })

  it('both have menu.language key', () => {
    expect(roKeys).toContain('menu.language')
    expect(enKeys).toContain('menu.language')
  })

  it('both have dimensional.instructions key', () => {
    expect(roKeys).toContain('dimensional.instructions')
    expect(enKeys).toContain('dimensional.instructions')
  })

  it('no empty string values in either language', () => {
    for (const key of roKeys) {
      const parts = key.split('.')
      let value: unknown = ro
      for (const p of parts) value = (value as Record<string, unknown>)[p]
      expect(value, `RO key "${key}" should not be empty`).not.toBe('')
    }
    for (const key of enKeys) {
      const parts = key.split('.')
      let value: unknown = en
      for (const p of parts) value = (value as Record<string, unknown>)[p]
      expect(value, `EN key "${key}" should not be empty`).not.toBe('')
    }
  })
})
