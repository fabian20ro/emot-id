import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const I18N_DIR = path.join(__dirname, '../i18n')
if (!fs.existsSync(I18N_DIR)) {
  throw new Error(`i18n directory not found: ${I18N_DIR}`)
}

function getKeyPaths(obj: Record<string, unknown>, prefix = '') {
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

describe('catalog i18n completeness', () => {
  // Use absolute path for stability in CI
  const catalogDir = path.join(__dirname, '../models/catalog')
  if (!fs.existsSync(catalogDir)) {
    throw new Error(`Catalog directory not found: ${catalogDir}`)
  }
  const files = fs.readdirSync(catalogDir).filter(f => f.endsWith('.json'))

  files.forEach(file => {
    const filePath = path.join(catalogDir, file)
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const allKeys = getKeyPaths(data)
    
    describe(`file: ${file}`, () => {
      it('has matching Romanian translations for all English entries', () => {
        const enKeys = allKeys.filter(k => k.endsWith('.en'))
        const roKeys = allKeys.filter(k => k.endsWith('.ro'))
        
        for (const enKey of enKeys) {
          const roKey = enKey.replace('.en', '.ro')
          expect(roKeys, `Missing RO translation for ${enKey} in ${file}`).toContain(roKey)
        }
      })

      it('has non-empty translation values', () => {
        for (const key of allKeys) {
          const parts = key.split('.')
          let value: unknown = data as Record<string, unknown>
          for (const p of parts) {
             if (value && typeof value === 'object' && p in value) {
               value = value[p]
             } else {
               value = undefined
               break
             }
          }

          if (typeof value === 'string') {
            expect(value, `Value for "${key}" in ${file} should not be empty`).not.toBe('')
          }
        }
      })

      it('has matching English translations for all Romanian entries', () => {
        const enKeys = allKeys.filter(k => k.endsWith('.en'))
        const roKeys = allKeys.filter(k => k.endsWith('.ro'))

        for (const roKey of roKeys) {
          const enKey = roKey.replace('.ro', '.en')
          expect(enKeys, `Missing EN translation for ${roKey} in ${file}`).toContain(enKey)
        }
      })
    })
  })

  describe('cross-section i18n completeness (components & UI)', () => {
    const enStrings = JSON.parse(fs.readFileSync(path.join(I18N_DIR, 'en.json'), 'utf8')) as Record<string, unknown>
    const roStrings = JSON.parse(fs.readFileSync(path.join(I18N_DIR, 'ro.json'), 'utf8')) as Record<string, unknown>

    it('en and ro share identical top-level section keys', () => {
      const enSections = Object.keys(enStrings).sort()
      const roSections = Object.keys(roStrings).sort()
      expect(roSections, `RO is missing or has extra sections vs EN`).toEqual(enSections)
    })

    it('every nested section key in en.json exists in ro.json', () => {
      function flatten(obj: Record<string, unknown>, prefix = ''): string[] {
        const keys: string[] = []
        for (const [k, v] of Object.entries(obj)) {
          const full = prefix ? `${prefix}.${k}` : k
          if (v !== null && typeof v === 'object' && !Array.isArray(v) && typeof v !== 'string') {
            keys.push(...flatten(v as Record<string, unknown>, full))
          } else {
            keys.push(full)
          }
        }
        return keys
      }

      const enFlat = flatten(enStrings).sort()
      const roFlat = flatten(roStrings).sort()
      for (const key of enFlat) {
        expect(roFlat, `Missing RO translation for "${key}"`).toContain(key)
      }
    })

    it('every nested section key in ro.json exists in en.json', () => {
      function flatten(obj: Record<string, unknown>, prefix = ''): string[] {
        const keys: string[] = []
        for (const [k, v] of Object.entries(obj)) {
          const full = prefix ? `${prefix}.${k}` : k
          if (v !== null && typeof v === 'object' && !Array.isArray(v) && typeof v !== 'string') {
            keys.push(...flatten(v as Record<string, unknown>, full))
          } else {
            keys.push(full)
          }
        }
        return keys
      }

      const enFlat = flatten(enStrings).sort()
      const roFlat = flatten(roStrings).sort()
      for (const key of roFlat) {
        expect(enFlat, `Missing EN translation for "${key}"`).toContain(key)
      }
    })
  })
})
