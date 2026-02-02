import { memo, useState, useCallback, useMemo } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { BodyRegion } from './BodyRegion'
import { SensationPicker } from './SensationPicker'
import { GuidedScan } from './GuidedScan'
import { bodyRegionPaths, VIEWBOX } from './body-paths'
import type { VisualizationProps } from '../models/types'
import type { SomaticRegion, SomaticSelection, SensationType } from '../models/somatic/types'

/** Extended VisualizationProps with selections for body map */
interface BodyMapProps extends VisualizationProps {
  selections?: SomaticSelection[]
}

function BodyMapBase({ emotions, onSelect, onDeselect, selections = [] }: BodyMapProps) {
  const { language, section } = useLanguage()
  const somaticT = section('somatic')

  const [activeRegionId, setActiveRegionId] = useState<string | null>(null)
  const [highlightedRegionId, setHighlightedRegionId] = useState<string | null>(null)
  const [isGuidedMode, setIsGuidedMode] = useState(false)
  const [guidedActive, setGuidedActive] = useState(false)

  const selectionMap = useMemo(() => {
    const map = new Map<string, SomaticSelection>()
    for (const sel of selections) {
      if ('selectedSensation' in sel) {
        map.set(sel.id, sel as SomaticSelection)
      }
    }
    return map
  }, [selections])

  const regionMap = useMemo(() => {
    const map = new Map<string, SomaticRegion>()
    for (const e of emotions) {
      map.set(e.id, e as SomaticRegion)
    }
    return map
  }, [emotions])

  const handleRegionClick = useCallback(
    (regionId: string) => {
      if (guidedActive) return

      if (selectionMap.has(regionId)) {
        const existingSelection = selectionMap.get(regionId)
        if (existingSelection) onDeselect(existingSelection)
        return
      }

      setActiveRegionId(regionId)
    },
    [guidedActive, onDeselect, selectionMap]
  )

  const handleSensationSelect = useCallback(
    (sensation: SensationType, intensity: 1 | 2 | 3) => {
      if (!activeRegionId) return
      const region = regionMap.get(activeRegionId)
      if (!region) return

      const enriched: SomaticSelection = {
        ...region,
        selectedSensation: sensation,
        selectedIntensity: intensity,
      }
      onSelect(enriched)
      setActiveRegionId(null)
    },
    [activeRegionId, regionMap, onSelect]
  )

  const handlePickerCancel = useCallback(() => {
    setActiveRegionId(null)
  }, [])

  const handleGuidedRegionSelect = useCallback(
    (regionId: string, sensation: SensationType, intensity: 1 | 2 | 3) => {
      const region = regionMap.get(regionId)
      if (!region) return

      const enriched: SomaticSelection = {
        ...region,
        selectedSensation: sensation,
        selectedIntensity: intensity,
      }
      onSelect(enriched)
    },
    [regionMap, onSelect]
  )

  const handleGuidedComplete = useCallback(() => {
    setGuidedActive(false)
  }, [])

  const handleHighlight = useCallback((regionId: string | null) => {
    setHighlightedRegionId(regionId)
  }, [])

  const startGuidedScan = useCallback(() => {
    setGuidedActive(true)
  }, [])

  const activeRegion = activeRegionId ? regionMap.get(activeRegionId) : null

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => { setIsGuidedMode(false); setGuidedActive(false) }}
          className={`text-xs px-3 py-1 rounded-full transition-colors ${
            !isGuidedMode
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-gray-200'
          }`}
        >
          {somaticT.freeMode ?? 'Free selection'}
        </button>
        <button
          onClick={() => { setIsGuidedMode(true); startGuidedScan() }}
          className={`text-xs px-3 py-1 rounded-full transition-colors ${
            isGuidedMode
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-gray-200'
          }`}
        >
          {somaticT.guidedMode ?? 'Guided scan'}
        </button>
      </div>

      <div className="relative w-full max-w-sm flex-1 min-h-[200px] flex items-center justify-center">
        <svg
          viewBox={VIEWBOX}
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 0 20px rgba(99, 102, 241, 0.1))' }}
        >
          <defs>
            <marker
              id="arrow-end"
              viewBox="0 0 6 6"
              refX={6}
              refY={3}
              markerWidth={4}
              markerHeight={4}
              orient="auto-start-reverse"
            >
              <path d="M0 0 L6 3 L0 6 Z" fill="rgba(156,163,175,0.5)" />
            </marker>
          </defs>

          {/* Back-facing regions first */}
          {bodyRegionPaths
            .filter((p) => p.id === 'upper-back' || p.id === 'lower-back')
            .map((path) => {
              const sel = selectionMap.get(path.id)
              return (
                <BodyRegion
                  key={path.id}
                  id={path.id}
                  d={path.d}
                  hitD={path.hitD}
                  label={regionMap.get(path.id)?.label[language]}
                  isSelected={!!sel}
                  isHighlighted={highlightedRegionId === path.id || activeRegionId === path.id}
                  sensation={sel?.selectedSensation}
                  intensity={sel?.selectedIntensity}
                  onClick={handleRegionClick}
                />
              )
            })}

          {/* Front-facing regions */}
          {bodyRegionPaths
            .filter((p) => p.id !== 'upper-back' && p.id !== 'lower-back')
            .map((path) => {
              const sel = selectionMap.get(path.id)
              return (
                <BodyRegion
                  key={path.id}
                  id={path.id}
                  d={path.d}
                  hitD={path.hitD}
                  label={regionMap.get(path.id)?.label[language]}
                  isSelected={!!sel}
                  isHighlighted={highlightedRegionId === path.id || activeRegionId === path.id}
                  sensation={sel?.selectedSensation}
                  intensity={sel?.selectedIntensity}
                  onClick={handleRegionClick}
                />
              )
            })}

          {/* Label bubbles with arrows */}
          {bodyRegionPaths.map((path) => {
            const region = regionMap.get(path.id)
            if (!region) return null
            const label = region.label[language]
            const sel = selectionMap.get(path.id)
            const isSelected = !!sel
            const { labelAnchor, labelSide, anchor } = path

            // Arrow endpoints: from label edge toward body anchor
            const arrowStartX = labelSide === 'left' ? labelAnchor.x + 20 : labelAnchor.x - 20
            const arrowEndX = labelSide === 'left'
              ? Math.min(anchor.x, arrowStartX + 80)
              : Math.max(anchor.x, arrowStartX - 80)

            return (
              <g
                key={`label-${path.id}`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleRegionClick(path.id)}
              >
                {/* Connector line */}
                <line
                  x1={arrowStartX}
                  y1={labelAnchor.y}
                  x2={arrowEndX}
                  y2={anchor.y}
                  stroke={isSelected ? 'rgba(129,140,248,0.6)' : 'rgba(156,163,175,0.3)'}
                  strokeWidth={1}
                  markerEnd="url(#arrow-end)"
                />
                {/* Label background */}
                <rect
                  x={labelSide === 'left' ? labelAnchor.x - 40 : labelAnchor.x - 20}
                  y={labelAnchor.y - 9}
                  width={60}
                  height={18}
                  rx={9}
                  fill={isSelected ? 'rgba(129,140,248,0.25)' : 'rgba(55,65,81,0.6)'}
                  stroke={isSelected ? 'rgba(129,140,248,0.5)' : 'rgba(107,114,128,0.3)'}
                  strokeWidth={0.5}
                />
                {/* Label text */}
                <text
                  x={labelSide === 'left' ? labelAnchor.x - 10 : labelAnchor.x + 10}
                  y={labelAnchor.y + 3.5}
                  fill={isSelected ? '#c7d2fe' : '#9ca3af'}
                  fontSize={8}
                  fontWeight={isSelected ? 600 : 400}
                  textAnchor="middle"
                >
                  {label}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Guided scan overlay */}
        {guidedActive && (
          <GuidedScan
            regions={regionMap}
            onRegionSelect={handleGuidedRegionSelect}
            onComplete={handleGuidedComplete}
            onHighlight={handleHighlight}
          />
        )}

        {/* Sensation picker bottom sheet */}
        {activeRegion && !guidedActive && (
          <SensationPicker
            regionLabel={activeRegion.label[language]}
            availableSensations={activeRegion.commonSensations}
            onSelect={handleSensationSelect}
            onCancel={handlePickerCancel}
          />
        )}
      </div>
    </div>
  )
}

export const BodyMap = memo(BodyMapBase)
