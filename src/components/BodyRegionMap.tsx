import { memo, useMemo } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { BodyRegion } from './BodyRegion'
import { bodyRegionPaths, VIEWBOX } from './body-paths'
import type { SomaticRegion, SomaticSelection } from '../models/somatic/types'

export type BodySide = 'front' | 'back'

interface BodyRegionMapProps {
  regions: SomaticRegion[]
  selections?: SomaticSelection[]
  side: BodySide
  onRegionActivate: (region: SomaticRegion) => void
}

const FRONT_ONLY_IDS = new Set(['jaw', 'throat', 'chest', 'stomach'])
const BACK_ONLY_IDS = new Set(['upper-back', 'lower-back'])

function isValidSelection(selection: SomaticSelection) {
  return Boolean(selection.selectedSensation)
    && [1, 2, 3].includes(selection.selectedIntensity)
}

function BodyRegionMapBase({
  regions,
  selections = [],
  side,
  onRegionActivate,
}: BodyRegionMapProps) {
  const { language, section } = useLanguage()
  const somaticT = section('somatic')
  const regionMap = useMemo(
    () => new Map(regions.map((region) => [region.id, region])),
    [regions],
  )
  const selectionMap = useMemo(
    () => new Map(
      selections
        .filter(isValidSelection)
        .map((selection) => [selection.id, selection]),
    ),
    [selections],
  )
  const visiblePaths = useMemo(
    () => bodyRegionPaths
      .filter((path) => side === 'front'
        ? !BACK_ONLY_IDS.has(path.id)
        : !FRONT_ONLY_IDS.has(path.id))
      .sort((a, b) => Number(BACK_ONLY_IDS.has(b.id)) - Number(BACK_ONLY_IDS.has(a.id))),
    [side],
  )

  const activate = (regionId: string) => {
    const region = regionMap.get(regionId)
    if (region) onRegionActivate(region)
  }

  return (
    <div data-testid="bodymap-root" className="body-region-map">
      <div data-testid="bodymap-canvas" className="body-region-map-canvas">
        <svg
          viewBox={VIEWBOX}
          className="body-region-map-svg"
          role="group"
          aria-label={side === 'front'
            ? somaticT.frontMapLabel
            : somaticT.backMapLabel}
        >
          <defs>
            <marker
              id="body-map-arrow"
              viewBox="0 0 6 6"
              refX={6}
              refY={3}
              markerWidth={4}
              markerHeight={4}
              orient="auto-start-reverse"
            >
              <path d="M0 0 L6 3 L0 6 Z" fill="var(--body-connector)" />
            </marker>
          </defs>

          <g>
            {visiblePaths.map((path) => {
              const selection = selectionMap.get(path.id)
              return (
                <BodyRegion
                  key={path.id}
                  id={path.id}
                  d={path.d}
                  hitD={path.hitD}
                  label={regionMap.get(path.id)?.label[language]}
                  isSelected={Boolean(selection)}
                  sensation={selection?.selectedSensation}
                  intensity={selection?.selectedIntensity}
                  onClick={activate}
                />
              )
            })}

            {visiblePaths.map((path) => {
              const region = regionMap.get(path.id)
              if (!region) return null

              const label = region.label[language]
              const isSelected = selectionMap.has(path.id)
              const { labelAnchor, labelSide, anchor } = path
              const labelWidth = label.length > 16 ? 104 : label.length > 12 ? 92 : 80
              const labelHeight = 32
              const labelCenterX = labelAnchor.x + (labelSide === 'right' ? 24 : 4)
              const arrowStartX = labelCenterX
                + (labelSide === 'left' ? labelWidth / 2 - 10 : -(labelWidth / 2 - 10))
              const arrowEndX = labelSide === 'left'
                ? Math.min(anchor.x, arrowStartX + 86)
                : Math.max(anchor.x, arrowStartX - 86)
              const shouldCompress = label.length > 15

              return (
                <g
                  key={`label-${path.id}`}
                  className={`body-region-label${isSelected ? ' is-selected' : ''}`}
                  data-region-label={path.id}
                  onClick={() => activate(path.id)}
                >
                  <rect
                    x={labelCenterX - labelWidth / 2 - 4}
                    y={labelAnchor.y - 24}
                    width={labelWidth + 8}
                    height={48}
                    fill="transparent"
                  />
                  <line
                    x1={arrowStartX}
                    y1={labelAnchor.y}
                    x2={arrowEndX}
                    y2={anchor.y}
                    markerEnd="url(#body-map-arrow)"
                  />
                  <rect
                    x={labelCenterX - labelWidth / 2}
                    y={labelAnchor.y - labelHeight / 2}
                    width={labelWidth}
                    height={labelHeight}
                    rx={7}
                  />
                  <text
                    x={labelCenterX}
                    y={labelAnchor.y + 4.5}
                    textAnchor="middle"
                    textLength={shouldCompress ? labelWidth - 14 : undefined}
                    lengthAdjust={shouldCompress ? 'spacingAndGlyphs' : undefined}
                  >
                    {label}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
      </div>
    </div>
  )
}

export const BodyRegionMap = memo(BodyRegionMapBase)
