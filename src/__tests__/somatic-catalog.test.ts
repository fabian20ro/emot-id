import { describe, it, expect } from 'vitest'
import { emotionCatalog } from '../../src/models/catalog'
import fs from 'fs'
import path from 'path'

describe('Somatic data catalog integrity', () => {
  const somaticDataDir = path.join(__dirname, '../models/somatic/data')

  it('all emotionIds in somatic data exist in the catalog', () => {
    const files = fs.readdirSync(somaticDataDir).filter(f => f.endsWith('.json'))
    
    for (const file of files) {
      const filePath = path.join(somaticDataDir, file)
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      
      // Somatic data files are dictionaries where keys are regions (e.g., "chest")
      // and values contain the emotionSignals
      for (const regionKey in data) {
        const region = data[regionKey]
        if (region.emotionSignals) {
          for (const signal of region.emotionSignals) {
            const emotionId = signal.emotionId
            expect(emotionCatalog[emotionId], `Region "${regionKey}" in ${file} references unknown emotion: "${emotionId}"`).toBeDefined()
          }
        }
      }
    }
  })

  it('all somatic-only emotions are referenced in body map data', () => {
    const catalogDir = path.join(__dirname, '../models/catalog')
    const somaticOnlyPath = path.join(catalogDir, 'somatic-only.json')
    const somaticData = JSON.parse(fs.readFileSync(somaticOnlyPath, 'utf8'))

    // Collect all emotionIds actually present in body map files
    const referencedEmotionIds = new Set<string>()
    for (const file of fs.readdirSync(somaticDataDir).filter(f => f.endsWith('.json'))) {
      const filePath = path.join(somaticDataDir, file)
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      for (const regionKey in data) {
        const region = data[regionKey]
        if (region.emotionSignals) {
          for (const signal of region.emotionSignals) {
            referencedEmotionIds.add(signal.emotionId)
          }
        }
      }
    }

    // Every emotion in somatic-only.json must appear in at least one body map file
    for (const emotionId of Object.keys(somaticData)) {
      expect(
        referencedEmotionIds.has(emotionId),
        `somatic-only emotion "${emotionId}" is not referenced by any body map data file`
      ).toBe(true)
    }
  })

  it('all regions in somatic data have required fields', () => {
    const files = fs.readdirSync(somaticDataDir).filter(f => f.endsWith('.json'))

    for (const file of files) {
      const filePath = path.join(somaticDataDir, file)
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))

      for (const regionKey in data) {
        const region = data[regionKey]
        expect(region.label).toBeDefined()
        expect(typeof region.label.ro).toBe('string')
        expect(region.label.ro.length).toBeGreaterThan(0)
        expect(typeof region.label.en).toBe('string')
        expect(region.label.en.length).toBeGreaterThan(0)
        expect(region.color).toBeDefined()
        expect(/^#[0-9a-fA-F]{6}$/.test(region.color), `Region "${regionKey}" in ${file} has invalid color: "${region.color}"`).toBeTruthy()
      }
    }
  })
})
