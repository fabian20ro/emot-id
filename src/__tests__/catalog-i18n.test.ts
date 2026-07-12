import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

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
})
