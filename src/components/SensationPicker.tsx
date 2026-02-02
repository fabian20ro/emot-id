import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { IntensityPicker } from './IntensityPicker'
import type { SensationType } from '../models/somatic/types'

interface SensationPickerProps {
  regionLabel: string
  availableSensations: SensationType[]
  onSelect: (sensation: SensationType, intensity: 1 | 2 | 3) => void
  onCancel: () => void
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
  constriction: { icon: '⊘', label: { ro: 'Constrictie', en: 'Constriction' } },
}

type PickerStep = 'sensation' | 'intensity'

export function SensationPicker({
  regionLabel,
  availableSensations,
  onSelect,
  onCancel,
}: SensationPickerProps) {
  const { language, section } = useLanguage()
  const [step, setStep] = useState<PickerStep>('sensation')
  const [selectedSensation, setSelectedSensation] = useState<SensationType | null>(null)
  const focusTrapRef = useFocusTrap(true, onCancel)

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

  const somaticT = section('somatic')

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onCancel}
      />

      {/* Bottom sheet with swipe-to-dismiss */}
      <motion.div
        key="sheet"
        ref={focusTrapRef}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={(_e, info) => {
          if (info.offset.y > 100 || info.velocity.y > 500) {
            onCancel()
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-label={regionLabel}
        className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-t border-gray-600 rounded-t-2xl shadow-2xl p-4 pb-8 max-w-md mx-auto"
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-3">
          <div className="w-10 h-1 rounded-full bg-gray-600" />
        </div>

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
            ? somaticT.pickSensation ?? 'What do you feel here?'
            : somaticT.pickIntensity ?? 'How intense?'}
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
                  className="flex items-center gap-2 px-3 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 text-sm text-gray-200 transition-colors"
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
          <IntensityPicker
            sensationIcon={SENSATION_CONFIG[selectedSensation].icon}
            sensationLabel={SENSATION_CONFIG[selectedSensation].label}
            onPick={handleIntensityPick}
            variant="detailed"
          />
        )}

        {/* Skip button */}
        <button
          onClick={onCancel}
          className="w-full mt-3 text-xs text-gray-500 hover:text-gray-400 transition-colors"
        >
          {somaticT.nothingHere ?? 'Nothing here'}
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

export { SENSATION_CONFIG }
