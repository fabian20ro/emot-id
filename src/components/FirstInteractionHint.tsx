import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'

export function FirstInteractionHint({ modelId }: { modelId: string }) {
  const { section } = useLanguage()
  const hintsT = section('firstHint')

  const text = (hintsT as Record<string, string | undefined>)[modelId] ?? hintsT.wheel ?? 'Tap an emotion that resonates with you'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mx-auto w-fit px-4 py-2 bg-indigo-600/90 backdrop-blur-sm rounded-full text-sm text-white shadow-lg pointer-events-none"
    >
      {text}
    </motion.div>
  )
}
