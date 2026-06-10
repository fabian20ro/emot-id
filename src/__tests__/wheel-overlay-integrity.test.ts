import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

describe('Wheel Overlay Integrity', () => {
  it('should have all children defined in overlays as valid emotions', () => {
    const overlaysDir = path.join(process.cwd(), 'src/models/wheel/overlays')
    const files = fs.readdirSync(overlaysDir).filter((f: string) => f.endsWith('.json'))
    
    const allEmotionIds = new Set<string>()
    
    // First pass: collect all emotion IDs from all overlays
    for (const file of files) {
      const content = JSON.parse(fs.readFileSync(path.join(overlaysDir, file), 'utf-8')) as Record<string, any>
      for (const id of Object.keys(content)) {
        allEmotionIds.add(id)
      }
    }

    // Second pass: check children
    for (const file of files) {
      const content = JSON.parse(fs.readFileSync(path.join(overlaysDir, file), 'utf-8')) as Record<string, any>
      for (const [, data] of Object.entries(content)) {
        if (data && data.children) {
          for (const childId of data.children) {
            expect(allEmotionIds.has(childId)).toBe(true)
          }
        }
      }
    }
  })
})

