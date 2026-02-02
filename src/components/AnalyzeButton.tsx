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

  const disabledText = modelId === MODEL_IDS.SOMATIC
    ? t.analyze.buttonDisabledSomatic
    : t.analyze.buttonDisabledDefault

  const label = selectionCount > 0
    ? `${t.analyze.button} (${selectionCount})`
    : t.analyze.button

  const buttonClasses = disabled
    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 cursor-pointer'

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 px-6 rounded-xl font-semibold text-lg shadow-lg transition-all ${buttonClasses}`}
    >
      {disabled ? disabledText : label}
    </motion.button>
  )
}
