import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'

interface AnalyzeButtonProps {
  disabled: boolean
  onClick: () => void
  modelId: string
}

export function AnalyzeButton({ disabled, onClick, modelId }: AnalyzeButtonProps) {
  const { t } = useLanguage()

  const disabledText = modelId === 'somatic'
    ? t.analyze.buttonDisabledSomatic
    : t.analyze.buttonDisabledDefault

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 px-6 rounded-xl font-semibold text-lg shadow-lg transition-all ${
        disabled
          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 cursor-pointer'
      }`}
    >
      {disabled ? disabledText : t.analyze.button}
    </motion.button>
  )
}
