import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { synthesize } from '../models/synthesis'
import { getCrisisTier, type CrisisTier } from '../models/distress'
import { getOppositeAction } from '../data/opposite-action'
import { ResultCard } from './ResultCard'
import { getModelBridge } from './model-bridges'
import { CrisisBanner } from './CrisisBanner'
import { MicroIntervention, getInterventionType } from './MicroIntervention'
import type { BaseEmotion, AnalysisResult } from '../models/types'

type ReflectionState = 'results' | 'reflection' | 'warmClose' | 'followUp' | 'intervention'
type ReflectionAnswer = 'yes' | 'partly' | 'no' | null

interface ResultModalProps {
  isOpen: boolean
  onClose: () => void
  onExploreMore?: () => void
  onSwitchModel?: (modelId: string) => void
  onSessionComplete?: (reflectionAnswer: ReflectionAnswer) => void
  /** When true, escalates crisis tier by one level (temporal pattern detected) */
  escalateCrisis?: boolean
  currentModelId?: string
  selections: BaseEmotion[]
  results: AnalysisResult[]
}

export function ResultModal({
  isOpen,
  onClose,
  onExploreMore,
  onSwitchModel,
  onSessionComplete,
  escalateCrisis,
  currentModelId,
  selections,
  results,
}: ResultModalProps) {
  const { language, section } = useLanguage()
  const [reflectionState, setReflectionState] = useState<ReflectionState>('results')
  const [reflectionAnswer, setReflectionAnswer] = useState<ReflectionAnswer>(null)

  const handleClose = useCallback(() => {
    onSessionComplete?.(reflectionAnswer)
    setReflectionState('results')
    setReflectionAnswer(null)
    onClose()
  }, [onClose, onSessionComplete, reflectionAnswer])

  const focusTrapRef = useFocusTrap(isOpen, handleClose)

  const reflectionT = section('reflection')
  const crisisT = section('crisis')
  const modalT = section('modal')
  const analyzeT = section('analyze')
  const resultsT = section('results')
  const bridgesT = section('bridges')
  const interventionT = section('intervention')

  const crisisTier = useMemo(() => {
    const baseTier = getCrisisTier(results.map((r) => r.id))
    if (!escalateCrisis) return baseTier
    const escalation: Record<CrisisTier, CrisisTier> = {
      none: 'tier1',
      tier1: 'tier2',
      tier2: 'tier3',
      tier3: 'tier3',
    }
    return escalation[baseTier]
  }, [results, escalateCrisis])
  const hasCrisis = crisisTier !== 'none'

  const synthesisText = useMemo(
    () => synthesize(results, language),
    [results, language],
  )

  const bridge = useMemo(
    () => currentModelId
      ? getModelBridge(currentModelId, results.map((r) => r.id), bridgesT)
      : null,
    [currentModelId, results, bridgesT],
  )

  // Opposite action suggestion (DBT) — skip during crisis
  const oppositeAction = useMemo(() => {
    if (crisisTier !== 'none') return null
    return getOppositeAction(results.map((r) => r.id), language)
  }, [results, language, crisisTier])

  // Determine if a micro-intervention should be offered (skip during crisis)
  const interventionType = useMemo(() => {
    if (crisisTier !== 'none') return null
    const arousals = results.map((r) => r.arousal).filter((a): a is number => a !== undefined)
    const avgArousal = arousals.length > 0 ? arousals.reduce((s, a) => s + a, 0) / arousals.length : undefined
    const valences = results.map((r) => r.valence).filter((v): v is number => v !== undefined)
    const hasPositive = valences.some((v) => v > 0.1)
    const hasNegative = valences.some((v) => v < -0.1)
    const isMixed = hasPositive && hasNegative
    return getInterventionType(avgArousal, hasPositive, hasNegative, isMixed)
  }, [results, crisisTier])

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

  const handleReflection = (answer: 'yes' | 'partly' | 'no') => {
    setReflectionAnswer(answer)
    if (answer === 'yes') {
      setReflectionState('warmClose')
    } else {
      setReflectionState('followUp')
    }
  }

  const handleExploreMore = () => {
    setReflectionState('results')
    setReflectionAnswer(null)
    onExploreMore?.()
    onClose()
  }

  // Auto-dismiss warm close after 3 seconds
  useEffect(() => {
    if (reflectionState !== 'warmClose') return
    const timer = setTimeout(handleClose, 3000)
    return () => clearTimeout(timer)
  }, [reflectionState, handleClose])

  const handleSwitchModel = (targetModelId: string) => {
    setReflectionState('results')
    setReflectionAnswer(null)
    onSwitchModel?.(targetModelId)
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
            ref={focusTrapRef}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            role="dialog"
            aria-modal="true"
            aria-label={modalT.title ?? 'Analysis result'}
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
                          <ResultCard
                            key={result.id}
                            result={result}
                            language={language}
                            expanded={results.length <= 2}
                            showDescriptionLabel={modalT.showDescription}
                            readMoreLabel={modalT.readMore}
                            needsLabel={modalT.needsLabel}
                          />
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

                  {/* Crisis resources — tiered */}
                  {hasCrisis && <CrisisBanner tier={crisisTier} crisisT={crisisT} />}

                  {/* AI link — demoted during crisis */}
                  <div className="space-y-2">
                    {hasCrisis ? (
                      <p className="text-xs text-gray-500 text-center">
                        <a
                          href={getAILink()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-gray-400 transition-colors underline"
                        >
                          {analyzeT.exploreAI ?? 'Learn more about these emotions'}
                        </a>
                      </p>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>

                  {/* Opposite action nudge (DBT) */}
                  {oppositeAction && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-900/10 border border-amber-700/20">
                      <p className="text-xs text-amber-300/80 leading-relaxed">
                        {oppositeAction}
                      </p>
                    </div>
                  )}

                  {/* Cross-model bridge suggestion */}
                  {bridge && onSwitchModel && (
                    <div className="mt-3 p-3 rounded-xl bg-indigo-900/20 border border-indigo-700/30">
                      <p className="text-sm text-indigo-300 mb-2">{bridge.message}</p>
                      <button
                        onClick={() => handleSwitchModel(bridge.targetModelId)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        {bridge.buttonLabel} &rarr;
                      </button>
                    </div>
                  )}

                  {/* Micro-intervention offer */}
                  {interventionType && (
                    <button
                      onClick={() => setReflectionState('intervention')}
                      className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 transition-colors text-center"
                    >
                      {interventionType === 'breathing'
                        ? (interventionT.offerBreathing ?? 'Would you like to try something calming?')
                        : interventionType === 'savoring'
                          ? (interventionT.offerSavoring ?? 'Take a moment to savor this?')
                          : (interventionT.offerCuriosity ?? 'What might these feelings be telling you?')}
                    </button>
                  )}

                  {/* Reflection trigger */}
                  {results.length > 0 && (
                    <button
                      onClick={() => setReflectionState('reflection')}
                      className="mt-3 text-sm text-gray-400 hover:text-gray-300 transition-colors text-center"
                    >
                      {reflectionT.prompt ?? 'Does this feel right?'}
                    </button>
                  )}

                  {/* Persistent micro-disclaimer */}
                  <p className="mt-3 text-xs text-gray-600 text-center">
                    {resultsT.microDisclaimer ?? 'For self-exploration, not diagnosis'}
                  </p>
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

              {/* Warm close — brief acknowledgment after "Yes" */}
              {reflectionState === 'warmClose' && (
                <motion.div
                  key="warmClose"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center py-12"
                >
                  <p className="text-lg text-gray-200 text-center leading-relaxed px-4">
                    {reflectionT.warmClose ?? 'Take a moment with this. Your feelings are valid.'}
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-6 text-sm text-gray-500 hover:text-gray-400 transition-colors"
                  >
                    {modalT.close ?? 'Close'}
                  </button>
                </motion.div>
              )}

              {/* Micro-intervention view */}
              {reflectionState === 'intervention' && interventionType && (
                <motion.div
                  key="intervention"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col"
                >
                  <MicroIntervention
                    type={interventionType}
                    t={interventionT}
                    onDismiss={() => setReflectionState('results')}
                  />
                </motion.div>
              )}

              {/* Follow-up view — differentiated by answer */}
              {reflectionState === 'followUp' && (
                <motion.div
                  key="followUp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col items-center justify-center py-8"
                >
                  {reflectionAnswer === 'no' ? (
                    <>
                      <p className="text-sm text-gray-300 mb-4 text-center px-4">
                        {reflectionT.notQuiteValidation ?? "Your felt experience is the best guide."}
                      </p>
                      <p className="text-lg text-gray-200 mb-6 text-center">
                        {reflectionT.followUp ?? 'Would you like to explore further?'}
                      </p>
                    </>
                  ) : (
                    <p className="text-lg text-gray-200 mb-6 text-center">
                      {reflectionT.followUp ?? 'Would you like to explore further?'}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={handleExploreMore}
                      className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors text-sm font-medium"
                    >
                      {reflectionT.backToModel ?? 'Go back and explore'}
                    </button>
                    {reflectionAnswer === 'no' && onSwitchModel && bridge && (
                      <button
                        onClick={() => handleSwitchModel(bridge.targetModelId)}
                        className="px-5 py-2 rounded-xl bg-purple-600/20 border border-purple-600/50 text-purple-300 hover:bg-purple-600/30 transition-colors text-sm"
                      >
                        {reflectionT.tryDifferentModel ?? 'Try a different model'}
                      </button>
                    )}
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
