import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { MODEL_IDS } from '../models/constants'

export function DontKnowModal({ onSelectModel, onClose }: { onSelectModel: (id: string) => void; onClose: () => void }) {
  const { section } = useLanguage()
  const dontKnowT = section('dontKnow')
  const focusTrapRef = useFocusTrap(true, onClose)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        ref={focusTrapRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-2">
          {dontKnowT.title ?? "That's okay — here are two ways to start"}
        </h3>
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
          {dontKnowT.normalization ?? 'Many people find it hard to name what they feel — this is normal and a skill that develops with practice.'}
        </p>
        <div className="space-y-3">
          <button
            onClick={() => { onSelectModel(MODEL_IDS.SOMATIC); onClose() }}
            className="w-full text-left p-3 rounded-xl bg-gray-700/50 hover:bg-gray-700 transition-colors"
          >
            <span className="text-white font-medium block">
              {dontKnowT.bodyOption ?? 'Start with your body'}
            </span>
            <span className="text-xs text-gray-400">
              {dontKnowT.bodyDesc ?? 'Notice physical sensations first'}
            </span>
          </button>
          <button
            onClick={() => { onSelectModel(MODEL_IDS.DIMENSIONAL); onClose() }}
            className="w-full text-left p-3 rounded-xl bg-gray-700/50 hover:bg-gray-700 transition-colors"
          >
            <span className="text-white font-medium block">
              {dontKnowT.dimensionalOption ?? 'Start with pleasant/unpleasant'}
            </span>
            <span className="text-xs text-gray-400">
              {dontKnowT.dimensionalDesc ?? 'Locate your state on a simple scale'}
            </span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
