import { memo } from 'react'
import type { SensationType } from '../models/somatic/types'

interface BodyRegionProps {
  id: string
  d: string
  /** Enlarged invisible hit area path for small regions */
  hitD?: string
  /** Accessible label for screen readers */
  label?: string
  isSelected: boolean
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
  constriction: '#a855f7',
}

function BodyRegionBase({
  id,
  d,
  hitD,
  label,
  isSelected,
  sensation,
  intensity,
  onClick,
}: BodyRegionProps) {
  function getFillColor(): string {
    if (isSelected && sensation) return SENSATION_COLORS[sensation]
    return 'var(--body-region-fill)'
  }

  function getFillOpacity(): number {
    if (isSelected && intensity) return 0.5 + intensity * 0.15
    return 1
  }

  const fillColor = getFillColor()
  const fillOpacity = getFillOpacity()

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={label ?? id}
      aria-pressed={isSelected}
      className={`body-region${isSelected ? ' is-selected' : ''}`}
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
      <path
        d={d}
        data-region={id}
        fill={fillColor}
        fillOpacity={fillOpacity}
        stroke={isSelected ? 'var(--body-region-selected-stroke)' : 'var(--body-region-stroke)'}
        strokeWidth={isSelected ? 2 : 1}
        strokeOpacity={1}
        className="body-region-shape"
        style={{ pointerEvents: hitD ? 'none' : 'auto' }}
      />
    </g>
  )
}

export const BodyRegion = memo(BodyRegionBase)
