import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('Wheel Overlay Integrity', () => {
  it('should have all children defined in overlays as valid emotions', () => {
    const overlaysDir = path.join(__dirname, '../models/wheel/overlays')
    const files = fs.readdirSync(overlaysDir).filter(f => f.endsWith('.json'))
    
    const allEmotionIds = new Set<string>()
    
    // First pass: collect all emotion IDs from all overlays
    for (const file of files) {
      const content = JSON.parse(fs.readFileSync(path.join(overlaysDir, file), 'utf-8'))
      for (const id of Object.keys(content)) {
        allEmotionIds.add(id)
      }
    }

    // Second pass: check children
    for (const file of files) {
      const content = JSON.parse(fs.readFileSync(path.join(overlaysDir, file), 'utf-8'))
      for (const [id, data] of Object.entries(content)) {
        if (data.children) {
          for (const childId of data.children) {
            expect(allEmotionIds.has(childId)).toBe(true)
          }
        }
      }
    }
  })
})
