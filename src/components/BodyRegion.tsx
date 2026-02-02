import { memo } from 'react'
import { motion } from 'framer-motion'
import type { SensationType } from '../models/somatic/types'

interface BodyRegionProps {
  id: string
  d: string
  /** Enlarged invisible hit area path for small regions */
  hitD?: string
  /** Accessible label for screen readers */
  label?: string
  isSelected: boolean
  isHighlighted: boolean
  sensation?: SensationType
  intensity?: 1 | 2 | 3
  onClick: (regionId: string) => void
}

const SENSATION_COLORS: Record<SensationType, string> = {
  tension: '#ef4444',
  warmth: '#f97316',
  heaviness: '#6366f1',
  lightness: '#fbbf24',
  tingling: '#06b6d4',
  numbness: '#9ca3af',
  churning: '#84cc16',
  pressure: '#ec4899',
}

const BASE_COLOR = '#4b5563'
const HIGHLIGHT_COLOR = '#6b7280'

function BodyRegionBase({
  id,
  d,
  hitD,
  label,
  isSelected,
  isHighlighted,
  sensation,
  intensity,
  onClick,
}: BodyRegionProps) {
  const fillColor = isSelected && sensation
    ? SENSATION_COLORS[sensation]
    : isHighlighted
      ? HIGHLIGHT_COLOR
      : BASE_COLOR

  const fillOpacity = isSelected && intensity
    ? 0.3 + intensity * 0.2
    : isHighlighted
      ? 0.5
      : 0.3

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={label ?? id}
      aria-pressed={isSelected}
      style={{ cursor: 'pointer', outline: 'none' }}
      onClick={() => onClick(id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(id) } }}
    >
      {/* Invisible expanded hit area for small regions */}
      {hitD && (
        <path
          d={hitD}
          fill="transparent"
          stroke="none"
          data-region={`${id}-hit`}
        />
      )}
      <motion.path
        d={d}
        data-region={id}
        fill={fillColor}
        fillOpacity={fillOpacity}
        stroke={isSelected ? fillColor : '#6b7280'}
        strokeWidth={isSelected ? 1.5 : 0.5}
        strokeOpacity={isSelected ? 0.8 : 0.3}
        style={{ pointerEvents: hitD ? 'none' : 'auto' }}
        whileHover={{
          fillOpacity: Math.min(fillOpacity + 0.15, 0.95),
          strokeOpacity: 0.6,
        }}
        whileTap={{ scale: 0.97 }}
        animate={{
          fillOpacity,
          fill: fillColor,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
    </g>
  )
}

export const BodyRegion = memo(BodyRegionBase)
