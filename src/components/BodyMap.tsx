import { useState, useCallback, useMemo } from 'react'
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

export function BodyMap({ emotions, onSelect, onDeselect, selections = [] }: BodyMapProps) {
  const { language, t } = useLanguage()
  const somaticT = (t as Record<string, Record<string, string>>).somatic ?? {}

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
  }, [setActiveRegionId])

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
  }, [setGuidedActive])

  const handleHighlight = useCallback((regionId: string | null) => {
    setHighlightedRegionId(regionId)
  }, [setHighlightedRegionId])

  const startGuidedScan = useCallback(() => {
    setGuidedActive(true)
  }, [setGuidedActive])

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
