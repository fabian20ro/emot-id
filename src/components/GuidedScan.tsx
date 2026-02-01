import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { SENSATION_CONFIG } from './SensationPicker'
import type { SomaticRegion, SensationType } from '../models/somatic/types'

/** Scan order interleaving front/back by vertical level */
const SCAN_ORDER = [
  // Head group
  'head', 'forehead', 'eyes', 'jaw',
  // Neck/shoulder group (throat, shoulders, upper-back)
  'throat', 'shoulders', 'upper-back',
  // Torso group (chest, stomach, lower-back)
  'chest', 'stomach', 'lower-back',
  // Arms group
  'arms', 'hands',
  // Legs group
  'legs', 'feet',
]

const CENTERING_DURATION_MS = 10000

interface GuidedScanProps {
  regions: Map<string, SomaticRegion>
  onRegionSelect: (regionId: string, sensation: SensationType, intensity: 1 | 2 | 3) => void
  onComplete: () => void
  onHighlight: (regionId: string | null) => void
}

type ScanPhase = 'centering' | 'scanning' | 'complete'

export function GuidedScan({ regions, onRegionSelect, onComplete, onHighlight }: GuidedScanProps) {
  const { language, t } = useLanguage()
  const somaticT = (t as Record<string, Record<string, string>>).somatic ?? {}

  const [phase, setPhase] = useState<ScanPhase>('centering')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedSensation, setSelectedSensation] = useState<SensationType | null>(null)

  const currentRegionId = SCAN_ORDER[currentIndex]
  const currentRegion = currentRegionId ? regions.get(currentRegionId) : undefined

  // Highlight current region during scan
  useEffect(() => {
    if (phase === 'scanning' && currentRegionId) {
      onHighlight(currentRegionId)
    } else {
      onHighlight(null)
    }
    return () => onHighlight(null)
  }, [phase, currentRegionId, onHighlight])

  // Auto-advance from centering after 10 seconds
  useEffect(() => {
    if (phase !== 'centering') return
    const timer = setTimeout(() => setPhase('scanning'), CENTERING_DURATION_MS)
    return () => clearTimeout(timer)
  }, [phase])

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

  const progress = phase === 'scanning'
    ? ((currentIndex + 1) / SCAN_ORDER.length) * 100
    : phase === 'complete'
      ? 100
      : 0

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center pointer-events-none">
      <AnimatePresence mode="wait">
        {/* Centering phase — 10s breathing cycle */}
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
                scale: [1, 1.15, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                repeat: Infinity,
                duration: 5,
                ease: 'easeInOut',
              }}
              className="text-4xl mb-4"
            >
              🫁
            </motion.div>
            <p className="text-gray-200 text-lg mb-2">
              {somaticT.guidedStart ?? 'Take a breath. Notice your body.'}
            </p>
            <motion.div
              className="w-full h-1 bg-gray-700 rounded-full mt-4 overflow-hidden"
            >
              <motion.div
                className="h-full bg-indigo-500/50 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: CENTERING_DURATION_MS / 1000, ease: 'linear' }}
              />
            </motion.div>
            <button
              onClick={handleSkipCentering}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors mt-3"
            >
              →
            </button>
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
              <div className="mb-3">
                <div className="text-sm text-gray-400 mb-2">
                  {SENSATION_CONFIG[selectedSensation].icon}{' '}
                  {SENSATION_CONFIG[selectedSensation].label[language]}
                </div>
                <div className="flex gap-2">
                  {([1, 2, 3] as const).map((intensity) => (
                    <button
                      key={intensity}
                      onClick={() => handleIntensityPick(intensity)}
                      className="flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
                    >
                      <div className="flex gap-0.5">
                        {Array.from({ length: 3 }, (_, i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: i < intensity ? '#f59e0b' : '#374151',
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        {intensity === 1 ? (language === 'ro' ? 'Ușor' : 'Mild')
                          : intensity === 2 ? (language === 'ro' ? 'Moderat' : 'Moderate')
                          : (language === 'ro' ? 'Puternic' : 'Strong')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSkip}
              className="w-full text-sm text-gray-500 hover:text-gray-400 transition-colors py-2"
            >
              {somaticT.guidedSkip ?? 'Nothing here'} →
            </button>
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
