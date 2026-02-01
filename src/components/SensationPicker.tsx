import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import type { SensationType } from '../models/somatic/types'

interface SensationPickerProps {
  regionLabel: string
  availableSensations: SensationType[]
  onSelect: (sensation: SensationType, intensity: 1 | 2 | 3) => void
  onCancel: () => void
  position: { x: number; y: number }
}

const SENSATION_CONFIG: Record<SensationType, { icon: string; label: { ro: string; en: string } }> = {
  tension: { icon: '⫸', label: { ro: 'Tensiune', en: 'Tension' } },
  warmth: { icon: '◉', label: { ro: 'Căldură', en: 'Warmth' } },
  heaviness: { icon: '▼', label: { ro: 'Greutate', en: 'Heaviness' } },
  lightness: { icon: '△', label: { ro: 'Ușurință', en: 'Lightness' } },
  tingling: { icon: '✧', label: { ro: 'Furnicături', en: 'Tingling' } },
  numbness: { icon: '○', label: { ro: 'Amorțeală', en: 'Numbness' } },
  churning: { icon: '◎', label: { ro: 'Răscolire', en: 'Churning' } },
  pressure: { icon: '⊛', label: { ro: 'Presiune', en: 'Pressure' } },
}

const INTENSITY_LABELS: Record<1 | 2 | 3, { ro: string; en: string }> = {
  1: { ro: 'Ușoară', en: 'Mild' },
  2: { ro: 'Moderată', en: 'Moderate' },
  3: { ro: 'Puternică', en: 'Strong' },
}

type PickerStep = 'sensation' | 'intensity'

import { useState } from 'react'

export function SensationPicker({
  regionLabel,
  availableSensations,
  onSelect,
  onCancel,
  position,
}: SensationPickerProps) {
  const { language, t } = useLanguage()
  const [step, setStep] = useState<PickerStep>('sensation')
  const [selectedSensation, setSelectedSensation] = useState<SensationType | null>(null)

  const handleSensationPick = (sensation: SensationType) => {
    setSelectedSensation(sensation)
    setStep('intensity')
  }

  const handleIntensityPick = (intensity: 1 | 2 | 3) => {
    if (selectedSensation) {
      onSelect(selectedSensation, intensity)
    }
  }

  const handleBack = () => {
    setStep('sensation')
    setSelectedSensation(null)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="fixed z-50 bg-gray-900/95 backdrop-blur-md border border-gray-600 rounded-2xl shadow-2xl p-4 w-[280px]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -100%) translateY(-12px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {step === 'intensity' && (
              <button
                onClick={handleBack}
                className="text-gray-400 hover:text-white text-sm"
              >
                ←
              </button>
            )}
            <span className="text-sm font-medium text-gray-200">
              {regionLabel}
            </span>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-300 text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Prompt */}
        <p className="text-xs text-gray-400 mb-3">
          {step === 'sensation'
            ? (t as Record<string, Record<string, string>>).somatic?.pickSensation ?? 'What do you feel here?'
            : (t as Record<string, Record<string, string>>).somatic?.pickIntensity ?? 'How intense?'}
        </p>

        {/* Step 1: Sensation type */}
        {step === 'sensation' && (
          <div className="grid grid-cols-2 gap-2">
            {availableSensations.map((sensation) => {
              const config = SENSATION_CONFIG[sensation]
              return (
                <motion.button
                  key={sensation}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSensationPick(sensation)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 text-sm text-gray-200 transition-colors"
                >
                  <span className="text-base">{config.icon}</span>
                  <span>{config.label[language]}</span>
                </motion.button>
              )
            })}
          </div>
        )}

        {/* Step 2: Intensity */}
        {step === 'intensity' && selectedSensation && (
          <div className="flex flex-col gap-2">
            <div className="text-sm text-gray-300 mb-1">
              {SENSATION_CONFIG[selectedSensation].icon}{' '}
              {SENSATION_CONFIG[selectedSensation].label[language]}
            </div>
            {([1, 2, 3] as const).map((intensity) => (
              <motion.button
                key={intensity}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleIntensityPick(intensity)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 text-left transition-colors"
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
                <span className="text-sm text-gray-200">
                  {INTENSITY_LABELS[intensity][language]}
                </span>
              </motion.button>
            ))}
          </div>
        )}

        {/* Skip button */}
        <button
          onClick={onCancel}
          className="w-full mt-3 text-xs text-gray-500 hover:text-gray-400 transition-colors"
        >
          {(t as Record<string, Record<string, string>>).somatic?.nothingHere ?? 'Nothing here'}
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

export { SENSATION_CONFIG, INTENSITY_LABELS }
