import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { MODEL_IDS } from '../models/constants'

interface AnalyzeButtonProps {
  disabled: boolean
  onClick: () => void
  modelId: string
  selectionCount?: number
}

export function AnalyzeButton({ disabled, onClick, modelId, selectionCount = 0 }: AnalyzeButtonProps) {
  const { t } = useLanguage()

  let disabledText: string | null = null
  if (modelId === MODEL_IDS.SOMATIC) {
    disabledText = t.analyze.buttonDisabledSomatic
  } else if (modelId === MODEL_IDS.DIMENSIONAL) {
    disabledText = t.analyze.buttonDisabledDimensional ?? t.analyze.buttonDisabledDefault
  } else {
    disabledText = t.analyze.buttonDisabledDefault
  }

  const label = selectionCount > 0
    ? `${t.analyze.button} (${selectionCount})`
    : t.analyze.button

  // Show selection count alongside the hint so users know what they've picked while waiting
  let displayText: string | null = disabled ? disabledText ?? null : null
  if (displayText && selectionCount > 0) {
    displayText = `${displayText}\n(${selectionCount} selected)`
  }

  const ariaLabel = !disabled && selectionCount > 0
    ? `${t.analyze.button} (${selectionCount})`
    : undefined

  const buttonClasses = disabled
    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 cursor-pointer'

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`w-full py-2.5 px-6 rounded-xl font-semibold text-base shadow-lg transition-all ${buttonClasses}`}>
      {disabled ? displayText : label}
    </motion.button>
  )
}
