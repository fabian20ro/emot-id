import { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { SENSATION_CONFIG } from './SensationPicker'
import { IntensityPicker } from './IntensityPicker'
import { CenteringPhase, PausePhase, CompletionPhase } from './GuidedScanPhases'
import {
  BODY_GROUPS,
  SCAN_ORDER,
  CENTERING_DURATION_MS,
  EXTENDED_CENTERING_MS,
  BREATH_CYCLE_MS,
  getGroupForIndex,
  getNextGroupStartIndex,
} from './guided-scan-constants'
import type { SomaticRegion, SensationType } from '../models/somatic/types'

interface GuidedScanProps {
  regions: Map<string, SomaticRegion>
  onRegionSelect: (regionId: string, sensation: SensationType, intensity: 1 | 2 | 3) => void
  onComplete: () => void
  onHighlight: (regionId: string | null) => void
}

type ScanPhase = 'centering' | 'scanning' | 'pause' | 'complete'

export function GuidedScan({ regions, onRegionSelect, onComplete, onHighlight }: GuidedScanProps) {
  const { language, section } = useLanguage()
  const somaticT = section('somatic')
  const crisisT = section('crisis')

  const [phase, setPhase] = useState<ScanPhase>('centering')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedSensation, setSelectedSensation] = useState<SensationType | null>(null)
  const [centeringDuration, setCenteringDuration] = useState(CENTERING_DURATION_MS)
  const [breathPhase, setBreathPhase] = useState<'in' | 'out'>('in')
  const [skipCount, setSkipCount] = useState(0)
  const [pauseContext, setPauseContext] = useState<{ sensation: string; region: string } | null>(null)
  const [numbnessGroups, setNumbnessGroups] = useState<Set<string>>(new Set())
  const [showNumbnessWarning, setShowNumbnessWarning] = useState(false)

  const currentRegionId = SCAN_ORDER[currentIndex]
  const currentRegion = currentRegionId ? regions.get(currentRegionId) : undefined
  const currentGroupId = getGroupForIndex(currentIndex)
  const randomizedCurrentSensations = useMemo(() => {
    if (!currentRegion) return []
    const shuffled = [...currentRegion.commonSensations]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }, [currentRegionId, currentRegion])

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
    setSkipCount((c) => c + 1)
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

      // Track numbness across body groups for flooding detection
      if (selectedSensation === 'numbness' && currentGroupId) {
        const updated = new Set(numbnessGroups)
        updated.add(currentGroupId)
        setNumbnessGroups(updated)
        if (updated.size >= 3 && !showNumbnessWarning) {
          setShowNumbnessWarning(true)
          setPhase('pause')
          return
        }
      }

      // Offer a breathing pause after high-intensity selections
      if (intensity === 3 && selectedSensation && currentRegion) {
        const sensationLabel = SENSATION_CONFIG[selectedSensation].label[language].toLowerCase()
        const regionLabel = currentRegion.label[language].toLowerCase()
        setPauseContext({ sensation: sensationLabel, region: regionLabel })
        setPhase('pause')
      } else {
        advanceOrComplete()
      }
    },
    [currentRegionId, selectedSensation, currentRegion, currentGroupId, language, numbnessGroups, showNumbnessWarning, onRegionSelect, advanceOrComplete]
  )

  const handleResumeScan = useCallback(() => {
    setPauseContext(null)
    setPhase('scanning')
    advanceOrComplete()
  }, [advanceOrComplete])

  const handleSkipCentering = useCallback(() => {
    setPhase('scanning')
  }, [])

  const handleExtendCentering = useCallback(() => {
    setCenteringDuration(EXTENDED_CENTERING_MS)
  }, [])

  const handleDismissNumbness = useCallback(() => {
    setShowNumbnessWarning(false)
    setPauseContext(null)
    setPhase('scanning')
    advanceOrComplete()
  }, [advanceOrComplete])

  const progress = useMemo(() => {
    if (phase === 'complete') return 100
    if (phase === 'scanning') return ((currentIndex + 1) / SCAN_ORDER.length) * 100
    return 0
  }, [phase, currentIndex])

  return (
    <div className="absolute inset-0 z-[var(--z-dropdown)] flex items-end justify-center pointer-events-none">
      <AnimatePresence mode="wait">
        {/* Centering phase — breathing cycle */}
        {phase === 'centering' && (
          <CenteringPhase
            somaticT={somaticT}
            breathPhase={breathPhase}
            centeringDuration={centeringDuration}
            onSkip={handleSkipCentering}
            onExtend={handleExtendCentering}
          />
        )}

        {/* Scanning phase */}
        {phase === 'scanning' && currentRegion && (
          <motion.div
            key={`scan-${currentRegionId}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-5 mb-4 mx-4 max-w-sm w-full max-h-[80vh] overflow-y-auto pointer-events-auto"
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
                {randomizedCurrentSensations.map((sensation) => {
                  const config = SENSATION_CONFIG[sensation]
                  return (
                    <button
                      key={sensation}
                      onClick={() => handleSensationPick(sensation)}
                      className="min-h-[44px] flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm text-gray-200 transition-colors"
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
                className="min-h-[44px] px-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                {somaticT.guidedSkip ?? 'Nothing here'} →
              </button>

              {/* Group skip — shown when at first region of a group */}
              {isFirstInGroup && (
                <button
                  onClick={handleSkipGroup}
                  className="min-h-[44px] px-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  title={groupLabel}
                >
                  {somaticT.guidedSkipGroup ?? 'Skip this area'} →
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Pause phase — after high-intensity selection or numbness flooding */}
        {phase === 'pause' && (
          <PausePhase
            somaticT={somaticT}
            crisisT={crisisT}
            showNumbnessWarning={showNumbnessWarning}
            pauseContext={pauseContext}
            onDismissNumbness={handleDismissNumbness}
            onResume={handleResumeScan}
          />
        )}

        {/* Complete phase */}
        {phase === 'complete' && (
          <CompletionPhase
            somaticT={somaticT}
            skipCount={skipCount}
            onComplete={onComplete}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
