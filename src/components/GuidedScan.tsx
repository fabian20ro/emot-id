import { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { SENSATION_CONFIG } from './SensationPicker'
import { IntensityPicker } from './IntensityPicker'
import type { SomaticRegion, SensationType } from '../models/somatic/types'

/** Body groups with their region IDs, ordered head-to-feet */
const BODY_GROUPS = [
  { id: 'head', regions: ['head', 'forehead', 'eyes', 'jaw'] },
  { id: 'neck', regions: ['throat', 'shoulders', 'upper-back'] },
  { id: 'torso', regions: ['chest', 'stomach', 'lower-back'] },
  { id: 'arms', regions: ['arms', 'hands'] },
  { id: 'legs', regions: ['legs', 'feet'] },
] as const

/** Flat scan order derived from groups */
const SCAN_ORDER = BODY_GROUPS.flatMap((g) => g.regions)

const CENTERING_DURATION_MS = 10000
const EXTENDED_CENTERING_MS = 30000
const BREATH_CYCLE_MS = 5000

interface GuidedScanProps {
  regions: Map<string, SomaticRegion>
  onRegionSelect: (regionId: string, sensation: SensationType, intensity: 1 | 2 | 3) => void
  onComplete: () => void
  onHighlight: (regionId: string | null) => void
}

type ScanPhase = 'centering' | 'scanning' | 'complete'

/** Find which group a region index belongs to */
function getGroupForIndex(index: number): string | undefined {
  let offset = 0
  for (const group of BODY_GROUPS) {
    if (index < offset + group.regions.length) return group.id
    offset += group.regions.length
  }
  return undefined
}

/** Get the next index after skipping the current group */
function getNextGroupStartIndex(currentIndex: number): number {
  let offset = 0
  for (const group of BODY_GROUPS) {
    const groupEnd = offset + group.regions.length
    if (currentIndex < groupEnd) return groupEnd
    offset = groupEnd
  }
  return SCAN_ORDER.length
}

export function GuidedScan({ regions, onRegionSelect, onComplete, onHighlight }: GuidedScanProps) {
  const { language, t } = useLanguage()
  const somaticT = (t as Record<string, Record<string, string>>).somatic ?? {}

  const [phase, setPhase] = useState<ScanPhase>('centering')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedSensation, setSelectedSensation] = useState<SensationType | null>(null)
  const [centeringDuration, setCenteringDuration] = useState(CENTERING_DURATION_MS)
  const [breathPhase, setBreathPhase] = useState<'in' | 'out'>('in')

  const currentRegionId = SCAN_ORDER[currentIndex]
  const currentRegion = currentRegionId ? regions.get(currentRegionId) : undefined
  const currentGroupId = getGroupForIndex(currentIndex)

  // Breathing cycle: alternate in/out every half-cycle
  useEffect(() => {
    if (phase !== 'centering') return
    const halfCycle = BREATH_CYCLE_MS / 2
    const interval = setInterval(() => {
      setBreathPhase((prev) => (prev === 'in' ? 'out' : 'in'))
    }, halfCycle)
    return () => clearInterval(interval)
  }, [phase])

  // Check if current region is first in its group (to show group skip)
  const isFirstInGroup = useMemo(() => {
    let offset = 0
    for (const group of BODY_GROUPS) {
      if (currentIndex === offset) return true
      offset += group.regions.length
    }
    return false
  }, [currentIndex])

  // Group label for skip button
  const groupLabel = useMemo(() => {
    if (!currentGroupId) return ''
    const groupRegions = BODY_GROUPS.find((g) => g.id === currentGroupId)?.regions ?? []
    const firstId = groupRegions[0]
    const lastId = groupRegions[groupRegions.length - 1]
    const firstRegion = firstId ? regions.get(firstId) : undefined
    const lastRegion = lastId ? regions.get(lastId) : undefined
    if (firstRegion && lastRegion && firstRegion.id !== lastRegion.id) {
      return `${firstRegion.label[language]} - ${lastRegion.label[language]}`
    }
    return firstRegion?.label[language] ?? ''
  }, [currentGroupId, regions, language])

  // Highlight current region during scan
  useEffect(() => {
    if (phase === 'scanning' && currentRegionId) {
      onHighlight(currentRegionId)
    } else {
      onHighlight(null)
    }
    return () => onHighlight(null)
  }, [phase, currentRegionId, onHighlight])

  // Auto-advance from centering
  useEffect(() => {
    if (phase !== 'centering') return
    const timer = setTimeout(() => setPhase('scanning'), centeringDuration)
    return () => clearTimeout(timer)
  }, [phase, centeringDuration])

  const advanceOrComplete = useCallback(() => {
    setSelectedSensation(null)
    const nextIndex = currentIndex + 1
    if (nextIndex >= SCAN_ORDER.length) {
      setPhase('complete')
      onHighlight(null)
    } else {
      setCurrentIndex(nextIndex)
    }
  }, [currentIndex, onHighlight])

  const handleSkip = useCallback(() => {
    advanceOrComplete()
  }, [advanceOrComplete])

  const handleSkipGroup = useCallback(() => {
    setSelectedSensation(null)
    const nextIndex = getNextGroupStartIndex(currentIndex)
    if (nextIndex >= SCAN_ORDER.length) {
      setPhase('complete')
      onHighlight(null)
    } else {
      setCurrentIndex(nextIndex)
    }
  }, [currentIndex, onHighlight])

  const handleSensationPick = useCallback(
    (sensation: SensationType) => {
      setSelectedSensation(sensation)
    },
    []
  )

  const handleIntensityPick = useCallback(
    (intensity: 1 | 2 | 3) => {
      if (currentRegionId && selectedSensation) {
        onRegionSelect(currentRegionId, selectedSensation, intensity)
      }
      advanceOrComplete()
    },
    [currentRegionId, selectedSensation, onRegionSelect, advanceOrComplete]
  )

  const handleSkipCentering = useCallback(() => {
    setPhase('scanning')
  }, [])

  const handleExtendCentering = useCallback(() => {
    setCenteringDuration(EXTENDED_CENTERING_MS)
  }, [])

  const progress = phase === 'scanning'
    ? ((currentIndex + 1) / SCAN_ORDER.length) * 100
    : phase === 'complete'
      ? 100
      : 0

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center pointer-events-none">
      <AnimatePresence mode="wait">
        {/* Centering phase — breathing cycle */}
        {phase === 'centering' && (
          <motion.div
            key="centering"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-6 mb-4 mx-4 max-w-sm text-center pointer-events-auto"
          >
            <motion.div
              animate={{
                scale: breathPhase === 'in' ? [1, 1.15] : [1.15, 1],
                opacity: breathPhase === 'in' ? [0.7, 1] : [1, 0.7],
              }}
              transition={{
                duration: BREATH_CYCLE_MS / 2000,
                ease: 'easeInOut',
              }}
              className="text-4xl mb-3"
            >
              🫁
            </motion.div>
            <p className="text-gray-200 text-lg mb-1">
              {somaticT.guidedStart ?? 'Take a breath. Notice your body.'}
            </p>
            <motion.p
              key={breathPhase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-indigo-300 text-sm mb-3"
            >
              {breathPhase === 'in'
                ? (somaticT.guidedBreathIn ?? 'Breathe in...')
                : (somaticT.guidedBreathOut ?? 'Breathe out...')}
            </motion.p>
            <motion.div
              className="w-full h-1 bg-gray-700 rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-indigo-500/50 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: centeringDuration / 1000, ease: 'linear' }}
              />
            </motion.div>
            <div className="flex items-center justify-center gap-4 mt-3">
              {centeringDuration === CENTERING_DURATION_MS && (
                <button
                  onClick={handleExtendCentering}
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {somaticT.guidedTakeMoreTime ?? 'Take more time'}
                </button>
              )}
              <button
                onClick={handleSkipCentering}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                →
              </button>
            </div>
          </motion.div>
        )}

        {/* Scanning phase */}
        {phase === 'scanning' && currentRegion && (
          <motion.div
            key={`scan-${currentRegionId}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-5 mb-4 mx-4 max-w-sm w-full pointer-events-auto"
          >
            {/* Progress bar */}
            <div className="w-full h-1 bg-gray-700 rounded-full mb-4 overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 30 }}
              />
            </div>

            <p className="text-sm text-gray-400 mb-2">
              {(somaticT.guidedPrompt ?? 'What do you notice in your {region}?')
                .replace('{region}', currentRegion.label[language].toLowerCase())}
            </p>

            <p className="text-lg text-gray-200 font-medium mb-4">
              {currentRegion.label[language]}
            </p>

            {/* Sensation buttons with translated labels */}
            {!selectedSensation && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {currentRegion.commonSensations.map((sensation) => {
                  const config = SENSATION_CONFIG[sensation]
                  return (
                    <button
                      key={sensation}
                      onClick={() => handleSensationPick(sensation)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm text-gray-200 transition-colors"
                    >
                      <span className="text-base">{config.icon}</span>
                      <span>{config.label[language]}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Intensity picker after selecting a sensation */}
            {selectedSensation && (
              <IntensityPicker
                sensationIcon={SENSATION_CONFIG[selectedSensation].icon}
                sensationLabel={SENSATION_CONFIG[selectedSensation].label}
                onPick={handleIntensityPick}
                variant="compact"
              />
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-400 transition-colors py-2"
              >
                {somaticT.guidedSkip ?? 'Nothing here'} →
              </button>

              {/* Group skip — shown when at first region of a group */}
              {isFirstInGroup && (
                <button
                  onClick={handleSkipGroup}
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors py-2"
                  title={groupLabel}
                >
                  {somaticT.guidedSkipGroup ?? 'Skip this area'} →
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Complete phase */}
        {phase === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-6 mb-4 mx-4 max-w-sm text-center pointer-events-auto"
          >
            <p className="text-gray-200 text-lg mb-4">
              {somaticT.guidedDone ?? 'Body scan complete'}
            </p>
            <button
              onClick={onComplete}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm transition-colors"
            >
              ✓
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
