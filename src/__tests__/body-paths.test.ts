import { describe, it, expect } from 'vitest'
import { bodyRegionPaths, VIEWBOX } from '../components/body-paths'

/** Extract numeric coordinates from an SVG path string */
function extractCoords(pathD: string): number[] {
  return [...pathD.matchAll(/-?\d+\.?\d*/g)].map(Number)
}

/** Get bounding box from an SVG path's coordinates */
function getBoundingBox(pathD: string) {
  const coords = extractCoords(pathD)
  const xs: number[] = []
  const ys: number[] = []
  for (let i = 0; i < coords.length; i += 2) {
    xs.push(coords[i])
    ys.push(coords[i + 1])
  }
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  }
}

describe('bodyRegionPaths', () => {
  const EXPECTED_REGIONS = [
    'head', 'jaw', 'throat',
    'shoulders', 'chest', 'upper-back',
    'stomach', 'lower-back',
    'arms', 'hands',
    'legs', 'feet',
  ]

  it('has exactly 12 regions', () => {
    expect(bodyRegionPaths).toHaveLength(12)
  })

  it('contains all expected region IDs', () => {
    const ids = bodyRegionPaths.map((r) => r.id)
    for (const expected of EXPECTED_REGIONS) {
      expect(ids).toContain(expected)
    }
  })

  it('does not contain forehead or eyes regions (migration check)', () => {
    const ids = bodyRegionPaths.map((r) => r.id)
    expect(ids).not.toContain('forehead')
    expect(ids).not.toContain('eyes')
  })

  it('head group regions (head, jaw, throat) all have hitD', () => {
    const headGroupIds = ['head', 'jaw', 'throat']
    for (const id of headGroupIds) {
      const region = bodyRegionPaths.find((r) => r.id === id)
      expect(region, `region ${id} should exist`).toBeDefined()
      expect(region!.hitD, `region ${id} should have hitD`).toBeDefined()
      expect(region!.hitD!.length).toBeGreaterThan(0)
    }
  })

  it('hitD bounding box is strictly larger than d bounding box for regions with hitD', () => {
    for (const region of bodyRegionPaths) {
      if (!region.hitD) continue

      const dBox = getBoundingBox(region.d)
      const hitBox = getBoundingBox(region.hitD)

      expect(hitBox.minX, `${region.id} hitD minX should be <= d minX`).toBeLessThanOrEqual(dBox.minX)
      expect(hitBox.maxX, `${region.id} hitD maxX should be >= d maxX`).toBeGreaterThanOrEqual(dBox.maxX)
      expect(hitBox.minY, `${region.id} hitD minY should be <= d minY`).toBeLessThanOrEqual(dBox.minY)
      expect(hitBox.maxY, `${region.id} hitD maxY should be >= d maxY`).toBeGreaterThanOrEqual(dBox.maxY)
    }
  })

  it('viewBox accommodates body and labels', () => {
    expect(VIEWBOX).toBe('-50 -10 300 450')
  })

  it('all regions have valid anchor points within viewBox', () => {
    for (const region of bodyRegionPaths) {
      expect(region.anchor.x, `${region.id} anchor x`).toBeGreaterThanOrEqual(0)
      expect(region.anchor.x, `${region.id} anchor x`).toBeLessThanOrEqual(200)
      expect(region.anchor.y, `${region.id} anchor y`).toBeGreaterThanOrEqual(0)
      expect(region.anchor.y, `${region.id} anchor y`).toBeLessThanOrEqual(430)
    }
  })
})
