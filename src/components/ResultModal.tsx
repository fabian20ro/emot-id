import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { synthesize } from '../models/synthesis'
import type { BaseEmotion, AnalysisResult } from '../models/types'

/** Emotion IDs considered high-distress across all models */
const HIGH_DISTRESS_IDS = new Set([
  'despair', 'rage', 'terror', 'grief', 'shame', 'loathing',
  // Somatic scoring may produce these IDs:
  'panic', 'hopelessness',
])

function isHighDistress(results: AnalysisResult[]): boolean {
  const distressCount = results.filter((r) => HIGH_DISTRESS_IDS.has(r.id)).length
  return distressCount >= 2
}

type ReflectionState = 'results' | 'reflection' | 'followUp'

interface ResultModalProps {
  isOpen: boolean
  onClose: () => void
  onExploreMore?: () => void
  selections: BaseEmotion[]
  results: AnalysisResult[]
}

export function ResultModal({ isOpen, onClose, onExploreMore, selections, results }: ResultModalProps) {
  const { language, t } = useLanguage()
  const [reflectionState, setReflectionState] = useState<ReflectionState>('results')

  const reflectionT = (t as Record<string, Record<string, string>>).reflection ?? {}
  const crisisT = (t as Record<string, Record<string, string>>).crisis ?? {}
  const modalT = (t as Record<string, Record<string, string>>).modal ?? {}
  const analyzeT = (t as Record<string, Record<string, string>>).analyze ?? {}

  const showCrisis = isHighDistress(results)
  const synthesisText = useMemo(
    () => synthesize(results, language),
    [results, language]
  )

  const getAILink = () => {
    if (results.length === 0) return '#'
    const names = results.map((r) => r.label[language])
    const conjunction = language === 'ro' ? ' si ' : ' and '
    const emotionStr =
      names.length <= 1
        ? names[0]
        : names.slice(0, -1).join(', ') + conjunction + names[names.length - 1]

    const template =
      results.length >= 2 ? analyzeT.aiPromptMultiple : analyzeT.aiPrompt
    const query = encodeURIComponent(template.replace('{emotions}', emotionStr))
    return `https://www.google.com/search?udm=50&q=${query}`
  }

  const handleClose = () => {
    setReflectionState('results')
    onClose()
  }

  const handleReflection = (answer: 'yes' | 'partly' | 'no') => {
    if (answer === 'yes') {
      handleClose()
    } else {
      setReflectionState('followUp')
    }
  }

  const handleExploreMore = () => {
    setReflectionState('results')
    onExploreMore?.()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
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
                {modalT.title ?? 'Analysis result'}
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-200 text-2xl leading-none"
                aria-label={modalT.close ?? 'Close'}
              >
                &times;
              </button>
            </div>

            <AnimatePresence mode="wait">
              {/* Results view */}
              {reflectionState === 'results' && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <p className="text-gray-300 mb-4">
                    {analyzeT.resultPrefix ?? 'Your selections'}{' '}
                    <span className="font-medium">
                      ({selections.map((s) => s.label[language]).join(' + ')})
                    </span>
                  </p>

                  <div className="flex-1 overflow-y-auto mb-4">
                    {/* Synthesis narrative */}
                    {synthesisText && (
                      <div className="mb-4 p-4 rounded-xl bg-gray-700/50">
                        <p className="text-sm text-gray-200 leading-relaxed">
                          {synthesisText}
                        </p>
                      </div>
                    )}

                    {results.length > 0 ? (
                      <div className="space-y-3">
                        {results.some((r) => r.componentLabels) && (
                          <p className="text-sm text-gray-400 font-medium">
                            {modalT.combinationsFound ?? 'Found combinations'}:
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
                            {result.hierarchyPath && (
                              <span className="text-xs text-gray-400 block mb-1">
                                {result.hierarchyPath.map((p) => p[language]).join(' > ')}
                              </span>
                            )}
                            <div className="flex items-center gap-2">
                              <span
                                className="text-xl font-bold"
                                style={{ color: result.color }}
                              >
                                {result.label[language]}
                              </span>
                              {result.matchStrength && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                                  {result.matchStrength[language]}
                                </span>
                              )}
                            </div>
                            {result.componentLabels && (
                              <span className="text-sm text-gray-300 mt-1 block">
                                = {result.componentLabels
                                  .map((label) => label[language])
                                  .join(' + ')}
                              </span>
                            )}
                            {result.description && (
                              results.length <= 2 ? (
                                <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                                  {result.description[language]}
                                </p>
                              ) : (
                                <details className="mt-2 group">
                                  <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300 transition-colors select-none">
                                    {modalT.showDescription ?? 'Show description'}
                                  </summary>
                                  <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                                    {result.description[language]}
                                  </p>
                                </details>
                              )
                            )}
                            {result.needs && (
                              <p className="text-xs text-gray-400 mt-2 italic">
                                {modalT.needsLabel ?? 'This emotion often needs'}:{' '}
                                <span className="text-gray-300">{result.needs[language]}</span>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 px-4 rounded-xl bg-gray-700">
                        <span className="text-gray-400">
                          {modalT.noCombinations ?? 'No combinations found from your selections'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Crisis resources */}
                  {showCrisis && (
                    <div className="mb-4 p-3 rounded-xl bg-amber-900/30 border border-amber-700/50">
                      <p className="text-sm text-amber-200 mb-2">
                        {crisisT.message ?? 'It sounds like you may be going through a difficult time.'}
                      </p>
                      <p className="text-xs text-amber-300/80">
                        {crisisT.roLine ?? 'Romania: 116 123 (free, 24/7)'}
                      </p>
                      <a
                        href="https://findahelpline.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-amber-300 hover:text-amber-200 underline"
                      >
                        {crisisT.intLine ?? 'International: findahelpline.com'}
                      </a>
                      <p className="text-xs text-amber-400/60 mt-1">
                        {crisisT.disclaimer ?? 'If you are in immediate danger, please call emergency services.'}
                      </p>
                    </div>
                  )}

                  {/* AI link with warning interstitial */}
                  <div className="space-y-2">
                    <a
                      href={getAILink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 px-6 rounded-xl font-semibold text-center bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all"
                    >
                      {analyzeT.exploreAI ?? 'Learn more about these emotions'} &rarr;
                    </a>
                    <p className="text-xs text-gray-500 text-center">
                      {analyzeT.aiWarning ?? 'Results are not a substitute for professional support.'}
                    </p>
                  </div>

                  {/* Reflection trigger */}
                  {results.length > 0 && (
                    <button
                      onClick={() => setReflectionState('reflection')}
                      className="mt-3 text-sm text-gray-400 hover:text-gray-300 transition-colors text-center"
                    >
                      {reflectionT.prompt ?? 'Does this feel right?'}
                    </button>
                  )}
                </motion.div>
              )}

              {/* Reflection view */}
              {reflectionState === 'reflection' && (
                <motion.div
                  key="reflection"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col items-center justify-center py-8"
                >
                  <p className="text-lg text-gray-200 mb-6 text-center">
                    {reflectionT.prompt ?? 'Does this feel right?'}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReflection('yes')}
                      className="px-4 py-2 rounded-xl bg-green-600/20 border border-green-600/50 text-green-300 hover:bg-green-600/30 transition-colors text-sm"
                    >
                      {reflectionT.yes ?? 'Yes, this resonates'}
                    </button>
                    <button
                      onClick={() => handleReflection('partly')}
                      className="px-4 py-2 rounded-xl bg-amber-600/20 border border-amber-600/50 text-amber-300 hover:bg-amber-600/30 transition-colors text-sm"
                    >
                      {reflectionT.partly ?? 'Partly'}
                    </button>
                    <button
                      onClick={() => handleReflection('no')}
                      className="px-4 py-2 rounded-xl bg-gray-600/20 border border-gray-600/50 text-gray-300 hover:bg-gray-600/30 transition-colors text-sm"
                    >
                      {reflectionT.no ?? 'Not quite'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Follow-up view */}
              {reflectionState === 'followUp' && (
                <motion.div
                  key="followUp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col items-center justify-center py-8"
                >
                  <p className="text-lg text-gray-200 mb-6 text-center">
                    {reflectionT.followUp ?? 'Would you like to explore further?'}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleExploreMore}
                      className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors text-sm font-medium"
                    >
                      {reflectionT.backToModel ?? 'Go back and explore'}
                    </button>
                    <button
                      onClick={handleClose}
                      className="px-5 py-2 rounded-xl bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors text-sm"
                    >
                      {reflectionT.stayHere ?? "That's okay for now"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
