import type { BaseEmotion } from '../models/types'

const MOBILE_BREAKPOINT = 500

const desktopSizePixels = { small: 80, medium: 100, large: 120 }
const mobileSizePixels = { small: 70, medium: 88, large: 100 }
export const bubbleHeight = 48

export function getSizePixels(containerWidth: number) {
  return containerWidth < MOBILE_BREAKPOINT ? mobileSizePixels : desktopSizePixels
}

export { MOBILE_BREAKPOINT }

/**
 * Deterministic wrapped-row layout for mobile.
 * Sorts emotions by size (large first), greedily fills rows,
 * centers each row, and adds small y-jitter for organic feel.
 */
export function calculateDeterministicPositions(
  emotions: BaseEmotion[],
  containerWidth: number,
  containerHeight: number,
  sizes: Map<string, 'small' | 'medium' | 'large'>,
): Map<string, { x: number; y: number }> {
  const sizeMap = getSizePixels(containerWidth)
  const padding = 16
  const gap = 10
  const availableWidth = containerWidth - padding * 2

  // Sort by size descending for better packing
  const sorted = [...emotions].sort((a, b) => {
    const sA = sizeMap[sizes.get(a.id) || 'medium']
    const sB = sizeMap[sizes.get(b.id) || 'medium']
    return sB - sA
  })

  // Build rows greedily
  const rows: { emotion: BaseEmotion; w: number }[][] = []
  let currentRow: { emotion: BaseEmotion; w: number }[] = []
  let rowWidth = 0

  for (const emotion of sorted) {
    const w = sizeMap[sizes.get(emotion.id) || 'medium']
    const neededWidth = currentRow.length === 0 ? w : w + gap

    if (rowWidth + neededWidth > availableWidth && currentRow.length > 0) {
      rows.push(currentRow)
      currentRow = [{ emotion, w }]
      rowWidth = w
    } else {
      currentRow.push({ emotion, w })
      rowWidth += neededWidth
    }
  }
  if (currentRow.length > 0) rows.push(currentRow)

  // If total height exceeds container, reduce gap and rebuild
  const totalHeight = rows.length * (bubbleHeight + gap) - gap + padding * 2
  const effectiveGap = totalHeight > containerHeight
    ? Math.max(2, gap - Math.ceil((totalHeight - containerHeight) / Math.max(1, rows.length - 1)))
    : gap

  // Position each row centered
  const positions = new Map<string, { x: number; y: number }>()
  // Use a simple seeded pseudo-random for consistent jitter
  let seed = emotions.length * 17

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx]
    const rowTotalWidth = row.reduce((sum, item) => sum + item.w, 0) + (row.length - 1) * effectiveGap
    const startX = padding + (availableWidth - rowTotalWidth) / 2

    let x = startX
    for (const item of row) {
      // Deterministic jitter: small y offset 0-6px
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      const jitter = (seed % 7)

      positions.set(item.emotion.id, {
        x,
        y: padding + rowIdx * (bubbleHeight + effectiveGap) + jitter,
      })
      x += item.w + effectiveGap
    }
  }

  return positions
}

export function calculateRandomPositions(
  newEmotions: BaseEmotion[],
  containerWidth: number,
  containerHeight: number,
  sizes: Map<string, 'small' | 'medium' | 'large'>,
  existingRects: { x: number; y: number; w: number; h: number }[]
): Map<string, { x: number; y: number }> {
  const sizeMap = getSizePixels(containerWidth)
  const positions = new Map<string, { x: number; y: number }>()
  const placed = [...existingRects]

  const padding = 16
  const availableWidth = containerWidth - padding * 2
  const availableHeight = containerHeight - padding * 2

  for (const emotion of newEmotions) {
    const size = sizes.get(emotion.id) || 'medium'
    const w = sizeMap[size]
    const h = bubbleHeight

    let x = 0
    let y = 0
    let attempts = 0
    let foundPosition = false

    const gap = 8
    while (attempts < 100 && !foundPosition) {
      x = padding + Math.random() * Math.max(0, availableWidth - w)
      y = padding + Math.random() * Math.max(0, availableHeight - h)

      const hasCollision = placed.some(p =>
        x < p.x + p.w + gap &&
        x + w + gap > p.x &&
        y < p.y + p.h + gap &&
        y + h + gap > p.y
      )

      if (!hasCollision) {
        foundPosition = true
      }
      attempts++
    }

    // Grid fallback
    if (!foundPosition) {
      const cols = Math.floor(availableWidth / (w + 16)) || 1
      const index = placed.length
      const col = index % cols
      const row = Math.floor(index / cols)
      x = Math.min(padding + col * (w + 16), containerWidth - w - padding)
      y = Math.min(padding + row * (h + 16), containerHeight - h - padding)
    }

    positions.set(emotion.id, { x, y })
    placed.push({ x, y, w, h })
  }

  return positions
}
