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
import { ModalShell } from './ModalShell'
import type { BaseEmotion, AnalysisResult } from '../models/types'

type ReflectionState = 'results' | 'reflection' | 'warmClose' | 'followUp' | 'intervention'
type ReflectionAnswer = 'yes' | 'partly' | 'no' | null
type InterventionResponse = 'better' | 'same' | 'worse' | null

function getInterventionOfferText(
  type: 'breathing' | 'savoring' | 'curiosity',
  t: Record<string, string>
): string {
  switch (type) {
    case 'breathing':
      return t.offerBreathing ?? 'Would you like to try something calming?'
    case 'savoring':
      return t.offerSavoring ?? 'Take a moment to savor this?'
    case 'curiosity':
      return t.offerCuriosity ?? 'What might these feelings be telling you?'
  }
}

interface ResultModalProps {
  isOpen: boolean
  onClose: () => void
  onExploreMore?: () => void
  onSwitchModel?: (modelId: string) => void
  onSessionComplete?: (data: { reflectionAnswer: ReflectionAnswer; interventionResponse: InterventionResponse }) => void
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
  const { language, section, simpleLanguage } = useLanguage()
  const [reflectionState, setReflectionState] = useState<ReflectionState>('results')
  const [reflectionAnswer, setReflectionAnswer] = useState<ReflectionAnswer>(null)
  const [interventionResponse, setInterventionResponse] = useState<InterventionResponse>(null)
  const [tier4Acknowledged, setTier4Acknowledged] = useState(false)

  const handleClose = useCallback(() => {
    onSessionComplete?.({ reflectionAnswer, interventionResponse })
    setReflectionState('results')
    setReflectionAnswer(null)
    setInterventionResponse(null)
    setTier4Acknowledged(false)
    onClose()
  }, [onClose, onSessionComplete, reflectionAnswer, interventionResponse])

  const focusTrapRef = useFocusTrap(isOpen, handleClose)

  const reflectionT = section('reflection')
  const crisisT = section('crisis')
  const modalT = section('modal')
  const analyzeT = section('analyze')
  const resultsT = section('results')
  const bridgesT = section('bridges')
  const interventionT = section('intervention')
  const simpleT = section('simpleLanguage')
  const reflectionPrompt = (simpleLanguage ? simpleT.reflectionPrompt : undefined) ?? reflectionT.prompt ?? 'Does this resonate with your experience?'
  const reflectionFollowUp = (simpleLanguage ? simpleT.reflectionFollowUp : undefined) ?? reflectionT.followUp ?? 'Would you like to explore further?'
  const reflectionWarmClose = (simpleLanguage ? simpleT.reflectionWarmClose : undefined) ?? reflectionT.warmClose ?? 'Take a moment with this. Your feelings are valid.'

  const crisisTier = useMemo(() => {
    const baseTier = getCrisisTier(results.map((r) => r.id))
    if (!escalateCrisis) return baseTier
    const escalation: Record<CrisisTier, CrisisTier> = {
      none: 'tier1',
      tier1: 'tier2',
      tier2: 'tier3',
      tier3: 'tier3',
      tier4: 'tier4',
    }
    return escalation[baseTier]
  }, [results, escalateCrisis])
  const hasCrisis = crisisTier !== 'none'
  const requiresTier4Acknowledge = crisisTier === 'tier4' && !tier4Acknowledged

  useEffect(() => {
    if (isOpen) {
      setTier4Acknowledged(false)
      setInterventionResponse(null)
    }
  }, [isOpen, results])

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
    setInterventionResponse(null)
    onExploreMore?.()
    onClose()
  }

  const handleSwitchModel = (targetModelId: string) => {
    setReflectionState('results')
    setReflectionAnswer(null)
    setInterventionResponse(null)
    onSwitchModel?.(targetModelId)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalShell
          onClose={handleClose}
          focusTrapRef={focusTrapRef}
          labelledBy="result-modal-title"
          backdropClassName="fixed inset-0 z-[var(--z-backdrop)] bg-black/50 backdrop-blur-sm"
          viewportClassName="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
          panelClassName="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[80vh] sm:max-h-[80vh] max-sm:max-h-[90vh] flex flex-col"
        >
          
            <div className="flex justify-between items-start mb-4">
              <h2 id="result-modal-title" className="text-xl font-bold text-white">
                {modalT.title ?? 'Analysis result'}
              </h2>
              <button
                onClick={handleClose}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-100 hover:bg-gray-700/60 transition-colors text-2xl leading-none"
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
                  {/* Selection chips */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selections.map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${s.color}25`,
                          color: s.color,
                          border: `1px solid ${s.color}40`,
                        }}
                      >
                        {s.label[language]}
                      </span>
                    ))}
                  </div>

                  {/* Scrollable results section */}
                  <div className="flex-1 overflow-y-auto mb-3">
                    {/* Crisis resources — above results so distressed users see them first */}
                    {hasCrisis && (
                      <CrisisBanner
                        tier={crisisTier}
                        crisisT={crisisT}
                        showTemporalNote={Boolean(escalateCrisis)}
                      />
                    )}

                    {requiresTier4Acknowledge ? (
                      <div className="mb-3 p-3 rounded-xl bg-red-900/25 border border-red-700/45">
                        <button
                          onClick={() => setTier4Acknowledged(true)}
                          className="w-full min-h-[44px] px-4 py-2 rounded-lg bg-red-700/60 text-red-50 font-semibold hover:bg-red-700/80 transition-colors"
                        >
                          {crisisT.tier4Acknowledge ?? 'I understand — show my results'}
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Synthesis narrative */}
                        {synthesisText && (
                          <div className="mb-3 p-3 rounded-xl bg-gray-700/50">
                            <p className="text-sm text-gray-200 leading-relaxed">
                              {synthesisText}
                            </p>
                          </div>
                        )}

                        {results.length > 0 ? (
                          <div className="space-y-2">
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
                      </>
                    )}
                  </div>

                  {!requiresTier4Acknowledge && (
                    <div className="space-y-2">
                      {!hasCrisis && (
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

                      {/* Suggestions group: bridge + opposite action */}
                      {(oppositeAction || (bridge && onSwitchModel)) && (
                        <div className="space-y-2 pt-1">
                          {bridge && onSwitchModel && (
                            <div className="p-3 rounded-xl bg-indigo-900/20 border border-indigo-700/30">
                              <p className="text-sm text-indigo-300 mb-1.5">{bridge.message}</p>
                              <button
                                onClick={() => handleSwitchModel(bridge.targetModelId)}
                                className="min-h-[44px] px-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                              >
                                {bridge.buttonLabel} &rarr;
                              </button>
                            </div>
                          )}
                          {oppositeAction && (
                            <div className="p-3 rounded-xl bg-amber-900/10 border border-amber-700/20">
                              <p className="text-xs text-amber-300/80 leading-relaxed">
                                {oppositeAction}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer: reflection + micro-intervention + disclaimer */}
                  {!requiresTier4Acknowledge && (
                    <div className="pt-2 space-y-1.5">
                      {/* Micro-intervention offer */}
                      {interventionType && (
                        <button
                          onClick={() => setReflectionState('intervention')}
                          className="min-h-[44px] text-sm text-indigo-400 hover:text-indigo-300 transition-colors text-center w-full"
                        >
                          {getInterventionOfferText(interventionType, interventionT)}
                        </button>
                      )}

                      {/* Reflection trigger */}
                      {results.length > 0 && (
                        <button
                          onClick={() => setReflectionState('reflection')}
                          className="min-h-[44px] text-sm text-gray-400 hover:text-gray-300 transition-colors text-center w-full"
                        >
                          {reflectionPrompt}
                        </button>
                      )}

                      <p className="text-xs text-gray-600 text-center">
                        {resultsT.microDisclaimer ?? 'For self-exploration, not diagnosis'}
                      </p>
                    </div>
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
                    {reflectionPrompt}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => handleReflection('yes')}
                      className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-xl bg-gray-600/20 border border-gray-600/50 text-gray-300 hover:bg-gray-600/30 transition-colors text-sm"
                    >
                      {reflectionT.yes ?? 'Yes'}
                    </button>
                    <button
                      onClick={() => handleReflection('partly')}
                      className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-xl bg-gray-600/20 border border-gray-600/50 text-gray-300 hover:bg-gray-600/30 transition-colors text-sm"
                    >
                      {reflectionT.partly ?? 'Somewhat'}
                    </button>
                    <button
                      onClick={() => handleReflection('no')}
                      className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-xl bg-gray-600/20 border border-gray-600/50 text-gray-300 hover:bg-gray-600/30 transition-colors text-sm"
                    >
                      {reflectionT.no ?? 'Not really'}
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
                    {reflectionWarmClose}
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-6 min-h-[44px] px-4 text-sm text-gray-500 hover:text-gray-400 transition-colors"
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
                    onResponse={setInterventionResponse}
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
                        {reflectionFollowUp}
                      </p>
                    </>
                  ) : (
                    <p className="text-lg text-gray-200 mb-6 text-center">
                      {reflectionFollowUp}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={handleExploreMore}
                      className="min-h-[44px] px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors text-sm font-medium"
                    >
                      {reflectionT.backToModel ?? 'Go back and explore'}
                    </button>
                    {reflectionAnswer === 'no' && onSwitchModel && bridge && (
                      <button
                        onClick={() => handleSwitchModel(bridge.targetModelId)}
                        className="min-h-[44px] px-5 py-2 rounded-xl bg-purple-600/20 border border-purple-600/50 text-purple-300 hover:bg-purple-600/30 transition-colors text-sm"
                      >
                        {reflectionT.tryDifferentModel ?? 'Try a different model'}
                      </button>
                    )}
                    <button
                      onClick={handleClose}
                      className="min-h-[44px] px-5 py-2 rounded-xl bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors text-sm"
                    >
                      {reflectionT.stayHere ?? "That's okay for now"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
        </ModalShell>
      )}
    </AnimatePresence>
  )
}
