import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

type OverlayContent = Record<string, Record<string, unknown>>

interface LoadedOverlay {
  file: string
  content: OverlayContent
}

describe('Wheel Overlay Integrity', () => {
  const overlaysDir = path.join(process.cwd(), 'src/models/wheel/overlays')

  function loadOverlays(): LoadedOverlay[] {
    const files = fs.readdirSync(overlaysDir).filter((f: string) => f.endsWith('.json'))
    return files.map<LoadedOverlay>((file) => ({
      file,
      content: JSON.parse(fs.readFileSync(path.join(overlaysDir, file), 'utf-8')) as OverlayContent,
    }))
  }

  function getChildren(data: unknown): string[] | null {
    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>
      if ('children' in obj && Array.isArray(obj.children)) {
        return obj.children as string[]
      }
    }
    return null
  }

  it('should have all children defined in overlays as valid emotions', () => {
    const loaded = loadOverlays()
    const allEmotionIds = new Set<string>()

    for (const item of loaded) {
      for (const id of Object.keys(item.content)) {
        allEmotionIds.add(id)
      }
    }

    for (const item of loaded) {
      for (const [parentName, data] of Object.entries(item.content)) {
        const children = getChildren(data)
        if (children) {
          for (const childId of children) {
            expect(allEmotionIds.has(childId), `${childId} referenced by ${parentName} in ${item.file} is not a known emotion id`).toBe(true)
          }
        }
      }
    }
  })

  it('should have non-empty children arrays for overlays that declare them', () => {
    const loaded = loadOverlays()
    for (const item of loaded) {
      for (const value of Object.values(item.content)) {
        const children = getChildren(value)
        if (children !== null) {
          expect(children.length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('should not contain duplicate child references within a single overlay entry', () => {
    const loaded = loadOverlays()
    for (const item of loaded) {
      for (const [parentName, data] of Object.entries(item.content)) {
        const children = getChildren(data)
        if (children !== null) {
          const seen = new Set<string>()
          for (const childId of children) {
            expect(seen.has(childId), `Duplicate child "${childId}" in ${parentName} from ${item.file}`).toBe(false)
            seen.add(childId)
          }
        }
      }
    }
  })

  it('should reference emotion ids that appear somewhere across overlays', () => {
    const loaded = loadOverlays()
    const allEmotionIds = new Set<string>()
    for (const item of loaded) {
      for (const id of Object.keys(item.content)) {
        allEmotionIds.add(id)
      }
    }

    for (const item of loaded) {
      for (const [parentName, data] of Object.entries(item.content)) {
        const children = getChildren(data)
        if (children !== null) {
          for (const childId of children) {
            expect(allEmotionIds.has(childId), `Child "${childId}" from ${parentName} (${item.file}) has no overlay entry`).toBe(true)
          }
        }
      }
    }
  })

  it('should load all seven expected overlay files', () => {
    const files = fs.readdirSync(overlaysDir).filter((f: string) => f.endsWith('.json'))
    expect(files.length).toBeGreaterThanOrEqual(7)
  })

  it('should not have any overlay file with an empty object body', () => {
    const loaded = loadOverlays()
    for (const item of loaded) {
      expect(Object.keys(item.content).length, `${item.file} should contain at least one overlay entry`).toBeGreaterThan(0)
    }
  })

  it('should parse without throwing', () => {
    const loaded = loadOverlays()
    for (const item of loaded) {
      const raw = fs.readFileSync(path.join(overlaysDir, item.file), 'utf-8')
      expect(() => raw).not.toThrow()
      expect(JSON.parse(raw)).toBeInstanceOf(Object)
    }
  })
})
