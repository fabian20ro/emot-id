import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { synthesize } from '../models/synthesis'
import { getCrisisTier, type CrisisTier } from '../models/distress'
import { getOppositeAction } from '../data/opposite-action'
import { getModelBridge } from './model-bridges'
import { MicroIntervention, getInterventionType } from './MicroIntervention'
import { ModalShell } from './ModalShell'
import { ReflectionView, WarmCloseView, FollowUpView } from './ResultModalViews'
import { ResultsView } from './ResultsView'
import type { ResultModalProps } from './result-modal-types'
import type { ReflectionState, ReflectionAnswer, InterventionResponse } from './result-modal-types'

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

  // Opposite action suggestion (DBT) — only gate behind tier4 acknowledgement
  const oppositeAction = useMemo(() => {
    if (requiresTier4Acknowledge) return null
    return getOppositeAction(results.map((r) => r.id), language)
  }, [results, language, requiresTier4Acknowledge])

  // Determine if a micro-intervention should be offered — only gate behind tier4 acknowledgement
  const interventionType = useMemo(() => {
    if (requiresTier4Acknowledge) return null
    const arousals = results.map((r) => r.arousal).filter((a): a is number => a !== undefined)
    const avgArousal = arousals.length > 0 ? arousals.reduce((s, a) => s + a, 0) / arousals.length : undefined
    const valences = results.map((r) => r.valence).filter((v): v is number => v !== undefined)
    const hasPositive = valences.some((v) => v > 0.1)
    const hasNegative = valences.some((v) => v < -0.1)
    const isMixed = hasPositive && hasNegative
    return getInterventionType(avgArousal, hasPositive, hasNegative, isMixed)
  }, [results, requiresTier4Acknowledge])

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

  const selectedEmotionTitle = selections.map((s) => s.label[language]).join(', ')
  const modalA11yTitle = selectedEmotionTitle || modalT.a11yTitle || 'Analysis results dialog'
  const hasSecondaryInfo = Boolean(
    (!requiresTier4Acknowledge && analyzeT.aiWarning)
    || synthesisText
    || oppositeAction
    || interventionType
  )

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
            <h2 id="result-modal-title" className="sr-only">
              {modalA11yTitle}
            </h2>

            <div className="flex justify-between items-start gap-3 mb-4">
              <div className="flex flex-wrap items-center gap-1.5 max-h-[4.5rem] overflow-y-auto pr-1">
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
                <ResultsView
                  key="results"
                  results={results}
                  language={language}
                  hasCrisis={hasCrisis}
                  crisisTier={crisisTier}
                  showTemporalNote={Boolean(escalateCrisis)}
                  requiresTier4Acknowledge={requiresTier4Acknowledge}
                  onAcknowledgeTier4={() => setTier4Acknowledged(true)}
                  aiLink={getAILink()}
                  synthesisText={synthesisText}
                  oppositeAction={oppositeAction}
                  interventionType={interventionType}
                  hasSecondaryInfo={hasSecondaryInfo}
                  reflectionPrompt={reflectionPrompt}
                  onStartReflection={() => setReflectionState('reflection')}
                  onStartIntervention={() => setReflectionState('intervention')}
                  crisisT={crisisT}
                  interventionT={interventionT}
                  combinationsFoundLabel={modalT.combinationsFound ?? 'Found combinations'}
                  noCombinationsLabel={modalT.noCombinations ?? 'No combinations found from your selections'}
                  tier4AcknowledgeLabel={crisisT.tier4Acknowledge ?? 'I understand — show my results'}
                  exploreAILabel={analyzeT.exploreAI ?? 'Explore with AI'}
                  showDescriptionLabel={modalT.showDescription}
                  readMoreLabel={modalT.readMore}
                  needsLabel={modalT.needsLabel}
                  moreInfoTitle={modalT.moreInfoTitle ?? 'More context'}
                  moreInfoAria={modalT.moreInfoAria ?? 'Show more context'}
                  aiWarning={analyzeT.aiWarning}
                  noExtraInfoLabel={modalT.noExtraInfo ?? 'No extra context available for this result.'}
                  microDisclaimerLabel={resultsT.microDisclaimer ?? 'For self-exploration, not diagnosis'}
                />
              )}

              {/* Reflection view */}
              {reflectionState === 'reflection' && (
                <ReflectionView
                  key="reflection"
                  prompt={reflectionPrompt}
                  yesLabel={reflectionT.yes ?? 'Yes'}
                  partlyLabel={reflectionT.partly ?? 'Somewhat'}
                  noLabel={reflectionT.no ?? 'Not really'}
                  onReflect={handleReflection}
                />
              )}

              {/* Warm close — brief acknowledgment after "Yes" */}
              {reflectionState === 'warmClose' && (
                <WarmCloseView
                  key="warmClose"
                  message={reflectionWarmClose}
                  closeLabel={modalT.close ?? 'Close'}
                  onClose={handleClose}
                />
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
                <FollowUpView
                  key="followUp"
                  reflectionAnswer={reflectionAnswer}
                  followUpText={reflectionFollowUp}
                  notQuiteValidation={reflectionT.notQuiteValidation ?? "Your felt experience is the best guide."}
                  backToModelLabel={reflectionT.backToModel ?? 'Go back and explore'}
                  stayHereLabel={reflectionT.stayHere ?? "That's okay for now"}
                  bridge={bridge}
                  showSwitchModel={Boolean(onSwitchModel)}
                  onExploreMore={handleExploreMore}
                  onSwitchModel={handleSwitchModel}
                  onClose={handleClose}
                />
              )}
            </AnimatePresence>
        </ModalShell>
      )}
    </AnimatePresence>
  )
}
