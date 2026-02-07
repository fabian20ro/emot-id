import { memo, useRef, useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Bubble } from './Bubble'
import {
  MOBILE_BREAKPOINT,
  bubbleHeight,
  getSizePixels,
  calculateDeterministicPositions,
  calculateRandomPositions,
} from './bubble-layout'
import type { VisualizationProps } from '../models/types'

function BubbleFieldBase({
  emotions,
  onSelect,
  sizes,
}: VisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map())

  // Track container size with ResizeObserver (debounced via rAF)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let rafId = 0
    const observer = new ResizeObserver((entries) => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const entry = entries[0]
        if (entry) {
          setContainerSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height
          })
        }
      })
    })

    observer.observe(container)
    return () => {
      cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [])

  // Update positions when emotions change or container resizes
  useEffect(() => {
    if (containerSize.width === 0 || containerSize.height === 0) return

    // On mobile, recompute all positions deterministically on every change
    if (containerSize.width < MOBILE_BREAKPOINT) {
      setPositions(
        calculateDeterministicPositions(emotions, containerSize.width, containerSize.height, sizes)
      )
      return
    }

    // On desktop, use incremental random scatter
    setPositions(prevPositions => {
      const sizeMap = getSizePixels(containerSize.width)
      const currentIds = new Set(emotions.map(e => e.id))
      const newEmotions = emotions.filter(e => !prevPositions.has(e.id))

      // Clamp existing positions to current container bounds
      const clamped = new Map<string, { x: number; y: number }>()
      for (const [id, pos] of prevPositions) {
        if (!currentIds.has(id)) continue
        const size = sizes.get(id) || 'medium'
        const w = sizeMap[size]
        clamped.set(id, {
          x: Math.max(16, Math.min(pos.x, containerSize.width - w - 16)),
          y: Math.max(16, Math.min(pos.y, containerSize.height - bubbleHeight - 16)),
        })
      }

      // Build existing rects for collision detection
      const existingRects: { x: number; y: number; w: number; h: number }[] = []
      for (const emotion of emotions) {
        const pos = clamped.get(emotion.id)
        if (pos) {
          const size = sizes.get(emotion.id) || 'medium'
          existingRects.push({ x: pos.x, y: pos.y, w: sizeMap[size], h: bubbleHeight })
        }
      }

      // Calculate positions for new emotions
      const newPositions = calculateRandomPositions(
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
    <div className="h-full w-full min-h-0 flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4">
      <div
        ref={containerRef}
        className="relative w-full max-w-2xl h-full min-h-[200px] overflow-hidden"
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
