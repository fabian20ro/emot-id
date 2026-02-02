import { memo, useState, useCallback, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { findNearest } from '../models/dimensional'
import type { VisualizationProps } from '../models/types'
import type { DimensionalEmotion } from '../models/dimensional/types'

const FIELD_SIZE = 500
const PADDING = 50
const INNER = FIELD_SIZE - PADDING * 2

function toPixel(value: number): number {
  // Map -1..+1 to PADDING..FIELD_SIZE-PADDING
  return PADDING + ((value + 1) / 2) * INNER
}

function DimensionalFieldBase({ emotions, onSelect, onDeselect, selections = [] }: VisualizationProps) {
  const { language, section } = useLanguage()
  const dimensionalT = section('dimensional')
  const dimEmotions = useMemo(
    () => emotions as DimensionalEmotion[],
    [emotions]
  )
  const emotionMap = useMemo(() => {
    const map: Record<string, DimensionalEmotion> = {}
    for (const e of dimEmotions) map[e.id] = e
    return map
  }, [dimEmotions])

  const selectedIds = useMemo(
    () => new Set(selections.map((s) => s.id)),
    [selections]
  )

  const svgRef = useRef<SVGSVGElement>(null)
  const [crosshair, setCrosshair] = useState<{ x: number; y: number } | null>(null)
  const [suggestions, setSuggestions] = useState<DimensionalEmotion[]>([])

  const handleFieldClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current
      if (!svg) return

      const rect = svg.getBoundingClientRect()
      const scaleX = FIELD_SIZE / rect.width
      const scaleY = FIELD_SIZE / rect.height
      const px = (e.clientX - rect.left) * scaleX
      const py = (e.clientY - rect.top) * scaleY

      const valence = Math.max(-1, Math.min(1, ((px - PADDING) / INNER) * 2 - 1))
      const arousal = Math.max(-1, Math.min(1, -(((py - PADDING) / INNER) * 2 - 1)))

      setCrosshair({ x: px, y: py })
      setSuggestions(findNearest(valence, arousal, emotionMap, 3))
    },
    [emotionMap]
  )

  const handleSuggestionClick = useCallback(
    (emotion: DimensionalEmotion) => {
      if (selectedIds.has(emotion.id)) {
        onDeselect(emotion)
      } else {
        onSelect(emotion)
      }
      setCrosshair(null)
      setSuggestions([])
    },
    [onSelect, onDeselect, selectedIds]
  )

  const handleEmotionDotClick = useCallback(
    (emotion: DimensionalEmotion, e: React.MouseEvent) => {
      e.stopPropagation()
      if (selectedIds.has(emotion.id)) {
        onDeselect(emotion)
      } else {
        onSelect(emotion)
      }
    },
    [onSelect, onDeselect, selectedIds]
  )

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-2 sm:p-4">
      <p className="text-xs text-gray-400 text-center mb-2 px-2">
        {dimensionalT.instructions}
      </p>
      <div className="relative w-full max-w-2xl flex-1 min-h-[200px] flex flex-col items-center justify-center">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${FIELD_SIZE} ${FIELD_SIZE}`}
          className="w-full h-full"
          onClick={handleFieldClick}
          style={{ cursor: 'crosshair' }}
        >
          {/* Background grid */}
          <rect
            x={PADDING}
            y={PADDING}
            width={INNER}
            height={INNER}
            fill="rgba(55, 65, 81, 0.3)"
            rx={8}
          />

          {/* Quadrant dividers */}
          <line
            x1={FIELD_SIZE / 2} y1={PADDING}
            x2={FIELD_SIZE / 2} y2={FIELD_SIZE - PADDING}
            stroke="rgba(107, 114, 128, 0.3)" strokeWidth={1}
          />
          <line
            x1={PADDING} y1={FIELD_SIZE / 2}
            x2={FIELD_SIZE - PADDING} y2={FIELD_SIZE / 2}
            stroke="rgba(107, 114, 128, 0.3)" strokeWidth={1}
          />

          {/* Axis labels */}
          <text x={PADDING} y={FIELD_SIZE / 2 - 6} fill="#9CA3AF" fontSize={13} textAnchor="start">
            {language === 'ro' ? 'Neplacut' : 'Unpleasant'}
          </text>
          <text x={FIELD_SIZE - PADDING} y={FIELD_SIZE / 2 - 6} fill="#9CA3AF" fontSize={13} textAnchor="end">
            {language === 'ro' ? 'Placut' : 'Pleasant'}
          </text>
          <text x={FIELD_SIZE / 2} y={PADDING - 8} fill="#9CA3AF" fontSize={13} textAnchor="middle">
            {language === 'ro' ? 'Intens' : 'Intense'}
          </text>
          <text x={FIELD_SIZE / 2} y={FIELD_SIZE - PADDING + 18} fill="#9CA3AF" fontSize={13} textAnchor="middle">
            {language === 'ro' ? 'Calm' : 'Calm'}
          </text>

          {/* Reference emotion dots and labels */}
          {dimEmotions.map((emotion) => {
            const px = toPixel(emotion.valence)
            const py = toPixel(-emotion.arousal) // Invert: top = intense
            const isSelected = selectedIds.has(emotion.id)

            return (
              <g
                key={emotion.id}
                role="button"
                tabIndex={0}
                aria-label={emotion.label[language]}
                aria-pressed={isSelected}
                style={{ cursor: 'pointer', outline: 'none' }}
                onClick={(e) => handleEmotionDotClick(emotion, e)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); handleEmotionDotClick(emotion, e as unknown as React.MouseEvent) } }}
              >
                <motion.circle
                  cx={px}
                  cy={py}
                  r={isSelected ? 8 : 6}
                  fill={emotion.color}
                  fillOpacity={isSelected ? 0.9 : 0.4}
                  stroke={isSelected ? '#fff' : 'none'}
                  strokeWidth={isSelected ? 1.5 : 0}
                  animate={{
                    r: isSelected ? 8 : 6,
                    fillOpacity: isSelected ? 0.9 : 0.4,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />
                <text
                  x={px}
                  y={py - (isSelected ? 16 : 10)}
                  fill={isSelected ? '#fff' : 'rgba(156, 163, 175, 0.6)'}
                  fontSize={isSelected ? 11 : 9}
                  textAnchor="middle"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  stroke="rgba(17, 24, 39, 0.8)"
                  strokeWidth={isSelected ? 3 : 2}
                  paintOrder="stroke"
                >
                  {emotion.label[language]}
                </text>
              </g>
            )
          })}

          {/* Crosshair */}
          {crosshair && (
            <>
              <line
                x1={crosshair.x - 8} y1={crosshair.y}
                x2={crosshair.x + 8} y2={crosshair.y}
                stroke="#818CF8" strokeWidth={1.5} strokeOpacity={0.8}
              />
              <line
                x1={crosshair.x} y1={crosshair.y - 8}
                x2={crosshair.x} y2={crosshair.y + 8}
                stroke="#818CF8" strokeWidth={1.5} strokeOpacity={0.8}
              />
              <circle
                cx={crosshair.x} cy={crosshair.y}
                r={3} fill="#818CF8" fillOpacity={0.6}
              />
            </>
          )}
        </svg>

        {/* Suggestion panel */}
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex gap-2 flex-wrap justify-center"
          >
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSuggestionClick(s)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{
                  backgroundColor: selectedIds.has(s.id) ? s.color : `${s.color}30`,
                  color: selectedIds.has(s.id) ? '#000' : s.color,
                  border: `1px solid ${s.color}60`,
                }}
              >
                {selectedIds.has(s.id) ? '✓ ' : ''}{s.label[language]}
              </button>
            ))}
            <button
              onClick={() => { setCrosshair(null); setSuggestions([]) }}
              className="px-3 py-1.5 rounded-full text-xs text-gray-400 hover:text-gray-200 bg-gray-800 transition-colors"
            >
              ✕
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export const DimensionalField = memo(DimensionalFieldBase)
