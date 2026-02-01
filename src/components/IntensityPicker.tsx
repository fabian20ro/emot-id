import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import type { SensationType } from '../models/somatic/types'

interface IntensityPickerProps {
  selectedSensation: SensationType
  sensationIcon: string
  sensationLabel: { ro: string; en: string }
  onPick: (intensity: 1 | 2 | 3) => void
  variant: 'detailed' | 'compact'
}

const INTENSITY_LABELS: Record<1 | 2 | 3, { ro: string; en: string; anchor: { ro: string; en: string } }> = {
  1: { ro: 'Ușoară', en: 'Mild', anchor: { ro: 'abia perceptibilă', en: 'barely noticeable' } },
  2: { ro: 'Moderată', en: 'Moderate', anchor: { ro: 'clar prezentă', en: 'clearly present' } },
  3: { ro: 'Puternică', en: 'Strong', anchor: { ro: 'greu de ignorat', en: 'hard to ignore' } },
}

function IntensityDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: i < level ? '#f59e0b' : '#374151' }}
        />
      ))}
    </div>
  )
}

export function IntensityPicker({
  sensationIcon,
  sensationLabel,
  onPick,
  variant,
}: IntensityPickerProps) {
  const { language } = useLanguage()

  if (variant === 'detailed') {
    return (
      <div className="flex flex-col gap-2">
        <div className="text-sm text-gray-300 mb-1">
          {sensationIcon} {sensationLabel[language]}
        </div>
        {([1, 2, 3] as const).map((intensity) => (
          <motion.button
            key={intensity}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPick(intensity)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 text-left transition-colors"
          >
            <IntensityDots level={intensity} />
            <div className="flex flex-col">
              <span className="text-sm text-gray-200">
                {INTENSITY_LABELS[intensity][language]}
              </span>
              <span className="text-xs text-gray-500">
                {INTENSITY_LABELS[intensity].anchor[language]}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    )
  }

  return (
    <div className="mb-3">
      <div className="text-sm text-gray-400 mb-2">
        {sensationIcon} {sensationLabel[language]}
      </div>
      <div className="flex gap-2">
        {([1, 2, 3] as const).map((intensity) => (
          <button
            key={intensity}
            onClick={() => onPick(intensity)}
            className="flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
          >
            <IntensityDots level={intensity} />
            <span className="text-xs text-gray-400">
              {INTENSITY_LABELS[intensity][language]}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export { INTENSITY_LABELS }
