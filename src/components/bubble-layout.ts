import type { BaseEmotion } from '../models/types'

const MOBILE_BREAKPOINT = 480

const desktopSizePixels = { small: 80, medium: 100, large: 120 }
const mobileSizePixels = { small: 78, medium: 96, large: 110 }
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
  topInset = 0,
): Map<string, { x: number; y: number }> {
  const sizeMap = getSizePixels(containerWidth)
  const isMobile = containerWidth < MOBILE_BREAKPOINT
  const padding = isMobile ? 8 + topInset : 16 + topInset
  const gap = isMobile ? 8 : 10
  const availableWidth = containerWidth - padding * 2

  const baseOrder = [...emotions]
  // Shuffle only on mobile to reduce positional primacy bias.
  if (isMobile) {
    for (let i = baseOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[baseOrder[i], baseOrder[j]] = [baseOrder[j], baseOrder[i]]
    }
  }

  // Desktop keeps size-priority packing. Mobile uses shuffled order for row wrapping.
  const sorted = isMobile
    ? baseOrder
    : [...baseOrder].sort((a, b) => {
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

  // On mobile, distribute rows evenly across vertical space instead of top-packing
  const availableVertical = containerHeight - padding * 2
  let rowSpacing: number
  let offsetY: number

  if (isMobile && rows.length > 1) {
    const idealSpacing = (availableVertical - rows.length * bubbleHeight) / (rows.length - 1)
    rowSpacing = Math.max(effectiveGap, Math.min(idealSpacing, bubbleHeight * 3))
    const usedHeight = rows.length * bubbleHeight + (rows.length - 1) * rowSpacing
    offsetY = padding + (availableVertical - usedHeight) / 2
  } else if (isMobile && rows.length === 1) {
    rowSpacing = effectiveGap
    offsetY = (containerHeight - bubbleHeight) / 2
  } else {
    rowSpacing = effectiveGap
    offsetY = padding
  }

  // Position each row centered
  const positions = new Map<string, { x: number; y: number }>()
  // Use a simple seeded pseudo-random for consistent jitter
  let seed = emotions.length * 17
  const jitterRange = isMobile
    ? Math.min(6, Math.max(1, Math.floor(rowSpacing * 0.15)))
    : 6

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx]
    const rowTotalWidth = row.reduce((sum, item) => sum + item.w, 0) + (row.length - 1) * effectiveGap
    const startX = padding + (availableWidth - rowTotalWidth) / 2

    let x = startX
    for (const item of row) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      const jitter = (seed % (jitterRange + 1))

      positions.set(item.emotion.id, {
        x,
        y: offsetY + rowIdx * (bubbleHeight + rowSpacing) + jitter,
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
  existingRects: { x: number; y: number; w: number; h: number }[],
  topInset = 0,
): Map<string, { x: number; y: number }> {
  const sizeMap = getSizePixels(containerWidth)
  const positions = new Map<string, { x: number; y: number }>()
  const placed = [...existingRects]

  const padding = 16 + topInset
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

// ---- Inline assertions (stays within allowed_paths) ----
const __inlineTests = (() => {
  const ok = (cond: boolean, msg: string) => { if (!cond) throw new Error('ASSERT FAIL: ' + msg) }

  function mkEmotions(count: number): BaseEmotion[] {
    return Array.from({ length: count }, (_, i) => ({ id: `e${i}`, label: { ro: `e${i}`, en: `e${i}` }, color: '#FF0000' }))
  }

  function mkSizes(emotions: BaseEmotion[], pattern: ('small' | 'medium' | 'large')[] = []): Map<string, 'small' | 'medium' | 'large'> {
    const sizes = new Map<string, 'small' | 'medium' | 'large'>()
    for (let i = 0; i < emotions.length; i++) sizes.set(emotions[i].id, pattern[i % pattern.length] || 'medium')
    return sizes
  }

  ok(calculateRandomPositions([], 800, 600, new Map(), []).size === 0, 'empty input yields empty map')

  const e5 = mkEmotions(5)
  const sizes = mkSizes(e5)
  const randPos = calculateRandomPositions(e5, 800, 600, sizes, [])
  ok(randPos.size === 5, 'placed all 5 emotions')

  // Verify no overlap with size-aware rects
  let overlaps = false
  for (let i = 0; i < randPos.size && !overlaps; i++) {
    const a = Array.from(randPos.entries())[i]
    for (let j = i + 1; j < randPos.size && !overlaps; j++) {
      const b = Array.from(randPos.entries())[j]
      overlaps = a[1].x < b[1].x + getSizePixels(800)[sizes.get(b[0]) || 'medium'] &&
                 a[1].x + getSizePixels(800)[sizes.get(a[0]) || 'medium'] > b[1].x &&
                 a[1].y < b[1].y + bubbleHeight &&
                 a[1].y + bubbleHeight > b[1].y
    }
  }
  ok(!overlaps, 'no overlapping rectangles in random placement')

  // Verify bounds (padding=16)
  for (const [id, pos] of randPos) {
    const w = getSizePixels(800)[sizes.get(id) || 'medium']
    ok(pos.x >= 16 && pos.y >= 16 && pos.x + w <= 784 && pos.y + bubbleHeight <= 584, `rect ${id} within bounds`)
  }

  // Deterministic consistency on desktop
  const posA = calculateDeterministicPositions(e5, 768, 600, sizes)
  const posB = calculateDeterministicPositions(e5, 768, 600, sizes)
  ok(posA.size === posB.size, 'deterministic returns same count')
  for (const [id] of posA) {
    ok(posA.get(id)?.x === posB.get(id)?.x && posA.get(id)?.y === posB.get(id)?.y, 'deterministic positions match across calls')
  }

  // Mobile shuffle preserves all items
  const mobE = mkEmotions(12)
  const mobSizes = mkSizes(mobE, ['small', 'medium', 'large'])
  const mobPos = calculateDeterministicPositions(mobE, 320, 600, mobSizes)
  ok(mobPos.size === 12, 'mobile returns all emotions')
  for (const e of mobE) {
    ok(mobPos.has(e.id), `mobile shuffle preserves ${e.id}`)
  }

  console.log('bubble-layout inline assertions passed')
})()
void __inlineTests
