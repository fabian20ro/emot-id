import { describe, it, expect } from 'vitest'
import { calculateDeterministicPositions } from '../components/bubble-layout'
import type { BaseEmotion } from '../models/types'

function makeEmotions(count: number): BaseEmotion[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `e${i}`,
    label: { ro: `e${i}`, en: `e${i}` },
    color: '#FF0000',
  }))
}

function makeSizes(emotions: BaseEmotion[], pattern: ('small' | 'medium' | 'large')[] = []): Map<string, 'small' | 'medium' | 'large'> {
  const sizes = new Map<string, 'small' | 'medium' | 'large'>()
  for (let i = 0; i < emotions.length; i++) {
    sizes.set(emotions[i].id, pattern[i % pattern.length] || 'medium')
  }
  return sizes
}

const bubbleHeight = 48

function hasOverlap(positions: Map<string, { x: number; y: number }>, sizes: Map<string, 'small' | 'medium' | 'large'>, containerWidth: number): boolean {
  const mobileSizePixels = { small: 78, medium: 96, large: 110 }
  const sizeMap = containerWidth < 480 ? mobileSizePixels : { small: 80, medium: 100, large: 120 }

  const rects = Array.from(positions.entries()).map(([id, pos]) => ({
    id,
    x: pos.x,
    y: pos.y,
    w: sizeMap[sizes.get(id) || 'medium'],
    h: bubbleHeight,
  }))

  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i]
      const b = rects[j]
      if (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
      ) {
        return true
      }
    }
  }
  return false
}

describe('BubbleField deterministic layout', () => {
  const widths = [320, 375, 390, 768]
  const emotionCounts = [4, 8, 12, 16]

  for (const width of widths) {
    for (const count of emotionCounts) {
      it(`no overlaps for ${count} emotions at ${width}px`, () => {
        const emotions = makeEmotions(count)
        const sizes = makeSizes(emotions, ['small', 'medium', 'large'])
        const positions = calculateDeterministicPositions(emotions, width, 600, sizes)

        expect(positions.size).toBe(count)
        expect(hasOverlap(positions, sizes, width)).toBe(false)
      })
    }
  }

  it('produces consistent positions for same input', () => {
    const emotions = makeEmotions(8)
    const sizes = makeSizes(emotions)
    const pos1 = calculateDeterministicPositions(emotions, 390, 600, sizes)
    const pos2 = calculateDeterministicPositions(emotions, 390, 600, sizes)

    for (const [id, p1] of pos1) {
      const p2 = pos2.get(id)
      expect(p2).toBeDefined()
      expect(p1.x).toBe(p2!.x)
      expect(p1.y).toBe(p2!.y)
    }
  })

  it('all positions within container bounds', () => {
    const width = 375
    const height = 500
    const emotions = makeEmotions(12)
    const sizes = makeSizes(emotions, ['small', 'medium', 'large'])
    const positions = calculateDeterministicPositions(emotions, width, height, sizes)
    const mobileSizePixels = { small: 78, medium: 96, large: 110 }

    for (const [id, pos] of positions) {
      const w = mobileSizePixels[sizes.get(id) || 'medium']
      expect(pos.x).toBeGreaterThanOrEqual(0)
      expect(pos.y).toBeGreaterThanOrEqual(0)
      expect(pos.x + w).toBeLessThanOrEqual(width)
    }
  })
})
