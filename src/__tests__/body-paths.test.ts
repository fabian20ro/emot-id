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

  it('maintains vertical continuity between head, throat, and shoulders', () => {
    const head = bodyRegionPaths.find((r) => r.id === 'head')
    const throat = bodyRegionPaths.find((r) => r.id === 'throat')
    const shoulders = bodyRegionPaths.find((r) => r.id === 'shoulders')
    expect(head).toBeDefined()
    expect(throat).toBeDefined()
    expect(shoulders).toBeDefined()

    const headBox = getBoundingBox(head!.d)
    const throatBox = getBoundingBox(throat!.d)
    const shouldersBox = getBoundingBox(shoulders!.d)

    const headToThroatGap = throatBox.minY - headBox.maxY
    const throatToShouldersGap = shouldersBox.minY - throatBox.maxY

    // No positive gaps: silhouette should appear connected.
    expect(headToThroatGap).toBeLessThanOrEqual(0)
    expect(throatToShouldersGap).toBeLessThanOrEqual(0)
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

  it('head and throat hit areas keep a clear margin beyond visible paths', () => {
    const ids = ['head', 'throat']
    for (const id of ids) {
      const region = bodyRegionPaths.find((r) => r.id === id)
      expect(region).toBeDefined()
      expect(region!.hitD).toBeDefined()

      const dBox = getBoundingBox(region!.d)
      const hitBox = getBoundingBox(region!.hitD!)
      expect(dBox.minX - hitBox.minX, `${id} hitD left expansion`).toBeGreaterThanOrEqual(4)
      expect(hitBox.maxX - dBox.maxX, `${id} hitD right expansion`).toBeGreaterThanOrEqual(4)
      expect(dBox.minY - hitBox.minY, `${id} hitD top expansion`).toBeGreaterThanOrEqual(4)
      expect(hitBox.maxY - dBox.maxY, `${id} hitD bottom expansion`).toBeGreaterThanOrEqual(4)
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

  it('label positions stay outside the visible silhouette for each region', () => {
    for (const region of bodyRegionPaths) {
      const dBox = getBoundingBox(region.d)
      const lx = region.labelAnchor.x
      const ly = region.labelAnchor.y

      if (region.labelSide === 'left') {
        // Label must be to the left of the body geometry edge
        expect(lx, `${region.id} label x`).toBeLessThanOrEqual(dBox.minX)
      } else {
        // Label must be to the right of the body geometry edge
        expect(lx, `${region.id} label x`).toBeGreaterThanOrEqual(dBox.maxX)
      }

      // Labels should sit vertically within the viewBox range ± generous margin
      const [,, , vbHeight] = VIEWBOX.split(' ').map(Number)
      const minY = Math.min(dBox.minY, 0)
      const maxY = Math.max(dBox.maxY, vbHeight)
      expect(ly, `${region.id} label y`).toBeGreaterThanOrEqual(minY - 25)
      expect(ly, `${region.id} label y`).toBeLessThanOrEqual(maxY + 25)
    }
  })

  it('labelSide is consistent with anchor direction', () => {
    for (const region of bodyRegionPaths) {
      const dBox = getBoundingBox(region.d)
      const anchorX = region.anchor.x
      const labelX = region.labelAnchor.x

      // If label is to the left of the geometry, side must be 'left'
      if (labelX < dBox.minX) {
        expect(region.labelSide, `${region.id} labelSide`).toBe('left')
      } else {
        // Label is to the right
        expect(region.labelSide, `${region.id} labelSide`).toBe('right')
      }

      // Anchor should sit on or inside the geometry edge
      if (region.labelSide === 'left') {
        expect(anchorX, `${region.id} anchor x`).toBeLessThanOrEqual(dBox.maxX)
      } else {
        expect(anchorX, `${region.id} anchor x`).toBeGreaterThanOrEqual(dBox.minX)
      }
    }
  })
})
