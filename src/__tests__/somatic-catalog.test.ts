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
})
