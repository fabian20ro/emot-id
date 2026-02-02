import { memo, useRef, useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Bubble } from './Bubble'
import type { BaseEmotion, VisualizationProps } from '../models/types'

const sizePixels = { small: 80, medium: 100, large: 120 }
const bubbleHeight = 40

function calculatePositionsForNewEmotions(
  newEmotions: BaseEmotion[],
  containerWidth: number,
  containerHeight: number,
  sizes: Map<string, 'small' | 'medium' | 'large'>,
  existingRects: { x: number; y: number; w: number; h: number }[]
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>()
  const placed = [...existingRects]

  const padding = 8
  const availableWidth = containerWidth - padding * 2
  const availableHeight = containerHeight - padding * 2

  for (const emotion of newEmotions) {
    const size = sizes.get(emotion.id) || 'medium'
    const w = sizePixels[size]
    const h = bubbleHeight

    let x = 0
    let y = 0
    let attempts = 0
    let foundPosition = false

    // Try random placement with collision detection (bias toward upper 70%)
    while (attempts < 100 && !foundPosition) {
      x = padding + Math.random() * Math.max(0, availableWidth - w)
      y = padding + Math.random() * Math.max(0, availableHeight * 0.7 - h)

      const hasCollision = placed.some(p =>
        x < p.x + p.w + 8 &&
        x + w + 8 > p.x &&
        y < p.y + p.h + 8 &&
        y + h + 8 > p.y
      )

      if (!hasCollision) {
        foundPosition = true
      }
      attempts++
    }

    // If no position found after 100 attempts, use grid fallback
    if (!foundPosition) {
      const cols = Math.floor(availableWidth / (w + 16)) || 1
      const index = placed.length
      const col = index % cols
      const row = Math.floor(index / cols)
      x = padding + col * (w + 16)
      y = padding + row * (h + 16)
    }

    positions.set(emotion.id, { x, y })
    placed.push({ x, y, w, h })
  }

  return positions
}

function BubbleFieldBase({
  emotions,
  onSelect,
  sizes,
}: VisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map())

  // Track container size with ResizeObserver
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        })
      }
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Update positions when emotions change or container resizes
  useEffect(() => {
    if (containerSize.width === 0 || containerSize.height === 0) return

    setPositions(prevPositions => {
      const currentIds = new Set(emotions.map(e => e.id))
      const newEmotions = emotions.filter(e => !prevPositions.has(e.id))

      // Clamp existing positions to current container bounds
      const clamped = new Map<string, { x: number; y: number }>()
      for (const [id, pos] of prevPositions) {
        if (!currentIds.has(id)) continue
        const size = sizes.get(id) || 'medium'
        const w = sizePixels[size]
        clamped.set(id, {
          x: Math.min(pos.x, Math.max(0, containerSize.width - w - 8)),
          y: Math.min(pos.y, Math.max(0, containerSize.height - bubbleHeight - 8)),
        })
      }

      // Build existing rects for collision detection
      const existingRects: { x: number; y: number; w: number; h: number }[] = []
      for (const emotion of emotions) {
        const pos = clamped.get(emotion.id)
        if (pos) {
          const size = sizes.get(emotion.id) || 'medium'
          existingRects.push({ x: pos.x, y: pos.y, w: sizePixels[size], h: bubbleHeight })
        }
      }

      // Calculate positions for new emotions
      const newPositions = calculatePositionsForNewEmotions(
        newEmotions, containerSize.width, containerSize.height, sizes, existingRects
      )

      // Merge clamped existing + new
      for (const [id, pos] of newPositions) {
        clamped.set(id, pos)
      }
      return clamped
    })
  }, [emotions, sizes, containerSize.width, containerSize.height])

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-4">
      <div
        ref={containerRef}
        className="relative w-full max-w-2xl flex-1 min-h-[120px] overflow-hidden"
      >
        <AnimatePresence mode="popLayout">
          {emotions.map((emotion, index) => (
            <Bubble
              key={emotion.id}
              emotion={emotion}
              onClick={onSelect}
              index={index}
              size={sizes.get(emotion.id) || 'medium'}
              position={positions.get(emotion.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export const BubbleField = memo(BubbleFieldBase)
