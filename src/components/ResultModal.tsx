import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import type { Emotion } from './Bubble'

interface ResultModalProps {
  isOpen: boolean
  onClose: () => void
  selections: Emotion[]
  results: Emotion[]
}

export function ResultModal({ isOpen, onClose, selections, results }: ResultModalProps) {
  const { language, t } = useLanguage()

  const getAILink = () => {
    if (selections.length === 0) return '#'
    const emotionNames = selections.map((s) => s.label[language]).join(' + ')

    // Different prompt for 2+ emotions
    const prompt =
      selections.length >= 2 ? t.analyze.aiPromptMultiple : t.analyze.aiPrompt

    const query = encodeURIComponent(`${prompt}: ${emotionNames}`)
    return `https://www.google.com/search?udm=50&q=${query}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[80vh] flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">
                {t.modal.title}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-gray-300 mb-4">
              {t.analyze.resultPrefix}{' '}
              <span className="font-medium">
                ({selections.map((s) => s.label[language]).join(' + ')})
              </span>
            </p>

            <div className="flex-1 overflow-y-auto mb-6">
              {results.length > 0 ? (
                <div className="space-y-3">
                  {/* Only show "combinations found" label for dyad results */}
                  {results.some((r) => r.components) && (
                    <p className="text-sm text-gray-400 font-medium">
                      {t.modal.combinationsFound}:
                    </p>
                  )}
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="py-4 px-4 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, ${result.color}20 0%, ${result.color}40 100%)`,
                        border: `2px solid ${result.color}`,
                      }}
                    >
                      <span
                        className="text-xl font-bold block"
                        style={{ color: result.color }}
                      >
                        {result.label[language]}
                      </span>
                      {result.components && (
                        <span className="text-sm text-gray-300 mt-1 block">
                          = {result.components
                            .map((cId) => {
                              const comp = selections.find((s) => s.id === cId)
                              return comp ? comp.label[language] : cId
                            })
                            .join(' + ')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 px-4 rounded-xl bg-gray-700">
                  <span className="text-gray-400">
                    {t.modal.noCombinations}
                  </span>
                </div>
              )}
            </div>

            <a
              href={getAILink()}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 px-6 rounded-xl font-semibold text-center bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all"
            >
              {t.analyze.exploreAI} &rarr;
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
