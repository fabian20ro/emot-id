import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import {
  GRANULARITY_SETS,
  getGranularityLabel,
  getValidGranularitySets,
  type GranularityDistinction,
} from '../data/granularity-triads'
import { ModalShell } from './ModalShell'

const DISTINCTION_FALLBACKS: Record<GranularityDistinction, string> = {
  intensity: 'These words can differ by emotional intensity, from mild to strong.',
  duration: 'These words can differ by duration and perceived weight over time.',
  focus: 'These words can differ by where attention turns: self, social image, or repair.',
  time: 'These words can differ by time orientation: present interest, active exploration, or future readiness.',
}

type StepAnswer = string | 'not-sure'

interface GranularityTrainingProps {
  isOpen: boolean
  onClose: () => void
}

function formatTemplate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((text, [key, value]) => {
    return text.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
  }, template)
}

export function GranularityTraining({ isOpen, onClose }: GranularityTrainingProps) {
  const { language, section } = useLanguage()
  const granularityT = section('granularity')

  const validSets = useMemo(() => getValidGranularitySets(GRANULARITY_SETS), [])
  const totalSteps = validSets.length

  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<StepAnswer[]>([])
  const [currentAnswer, setCurrentAnswer] = useState<StepAnswer | null>(null)
  const [completed, setCompleted] = useState(false)

  const resetSession = useCallback(() => {
    setStepIndex(0)
    setAnswers([])
    setCurrentAnswer(null)
    setCompleted(false)
  }, [])

  const handleClose = useCallback(() => {
    resetSession()
    onClose()
  }, [onClose, resetSession])

  const focusTrapRef = useFocusTrap(isOpen, handleClose)

  useEffect(() => {
    if (isOpen) resetSession()
  }, [isOpen, resetSession])

  const currentSet = validSets[stepIndex]

  const distinctionTemplate =
    (granularityT.distinctions as Partial<Record<GranularityDistinction, string>> | undefined)?.[currentSet?.distinction as GranularityDistinction]

  const feedbackLine2 = currentSet
    ? distinctionTemplate ?? DISTINCTION_FALLBACKS[currentSet.distinction]
    : ''

  const feedbackLine1 = currentAnswer && currentAnswer !== 'not-sure'
    ? formatTemplate(
      granularityT.feedbackSelected ?? 'You chose {emotion}. If that is closest to your experience, your choice is valid.',
      { emotion: getGranularityLabel(currentAnswer, language) },
    )
    : granularityT.feedbackNotSure ?? "It's okay not to be sure. Nuance develops with practice."

  const handleContinue = () => {
    if (!currentSet || currentAnswer === null) return

    const nextAnswers = [...answers, currentAnswer]
    setAnswers(nextAnswers)

    if (stepIndex >= totalSteps - 1) {
      setCompleted(true)
      return
    }

    setStepIndex((prev) => prev + 1)
    setCurrentAnswer(null)
  }

  const chosenCount = answers.filter((answer) => answer !== 'not-sure').length
  const notSureCount = answers.filter((answer) => answer === 'not-sure').length

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalShell
          onClose={handleClose}
          focusTrapRef={focusTrapRef}
          labelledBy="granularity-title"
          describedBy="granularity-body"
          backdropClassName="fixed inset-0 z-[var(--z-backdrop)] bg-black/50 backdrop-blur-sm"
          viewportClassName="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
          panelClassName="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-5 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 id="granularity-title" className="text-lg font-semibold text-white">
              {granularityT.title ?? 'Emotional granularity'}
            </h2>
            <button
              onClick={handleClose}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-100 hover:bg-gray-700/60 transition-colors"
              aria-label={granularityT.close ?? 'Close'}
            >
              ×
            </button>
          </div>

          {totalSteps === 0 && (
            <div className="space-y-4" id="granularity-body">
              <p className="text-sm text-gray-300">
                {granularityT.errorBody ?? 'Practice sets are unavailable right now. Please try again later.'}
              </p>
              <button
                onClick={handleClose}
                className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-gray-700 text-gray-100 font-medium hover:bg-gray-600 transition-colors"
              >
                {granularityT.close ?? 'Close'}
              </button>
            </div>
          )}

          {totalSteps > 0 && completed && (
            <div className="space-y-4" id="granularity-body">
              <p className="text-sm text-emerald-200 font-medium">
                {granularityT.completedTitle ?? 'Practice session completed'}
              </p>
              <p className="text-sm text-gray-300">
                {granularityT.completedBody ?? 'You practiced noticing subtle differences between similar emotions.'}
              </p>

              <div className="rounded-xl border border-gray-700 bg-gray-900/40 p-3 text-sm text-gray-200 space-y-1">
                <p>
                  {formatTemplate(granularityT.summaryChosen ?? '{count} clear choices', { count: String(chosenCount) })}
                </p>
                <p>
                  {formatTemplate(granularityT.summaryNotSure ?? '{count} unsure choices', { count: String(notSureCount) })}
                </p>
              </div>

              <p className="text-sm text-gray-300">
                {granularityT.completedEncouragement ?? 'Emotional nuance grows through repetition, not perfection.'}
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={resetSession}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-gray-600 text-gray-100 hover:bg-gray-700/40 transition-colors"
                >
                  {granularityT.restart ?? 'Restart'}
                </button>
                <button
                  onClick={handleClose}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors"
                >
                  {granularityT.close ?? 'Close'}
                </button>
              </div>
            </div>
          )}

          {totalSteps > 0 && !completed && currentSet && (
            <div id="granularity-body" className="space-y-3">
              <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                {formatTemplate(granularityT.progress ?? 'Step {current}/{total}', {
                  current: String(stepIndex + 1),
                  total: String(totalSteps),
                })}
              </p>

              <p className="text-sm text-gray-300">
                {granularityT.prompt ?? 'Which of these best describes what you feel?'}
              </p>

              <div className="space-y-2">
                {currentSet.options.map((option) => {
                  const active = currentAnswer === option.id
                  return (
                    <button
                      key={option.id}
                      onClick={() => setCurrentAnswer(option.id)}
                      aria-pressed={active}
                      className={`w-full min-h-[44px] px-4 py-2 rounded-xl text-left text-sm transition-colors border ${
                        active
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-100'
                          : 'bg-gray-700/40 border-gray-700 text-gray-200 hover:bg-gray-700/70'
                      }`}
                    >
                      {getGranularityLabel(option.id, language)}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setCurrentAnswer('not-sure')}
                aria-pressed={currentAnswer === 'not-sure'}
                className={`w-full min-h-[44px] px-4 py-2 rounded-xl text-sm transition-colors border ${
                  currentAnswer === 'not-sure'
                    ? 'bg-gray-600/40 border-gray-500 text-gray-100'
                    : 'bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                {granularityT.notSure ?? "I'm not sure — they all fit"}
              </button>

              {currentAnswer && (
                <div className="rounded-xl border border-indigo-500/40 bg-indigo-500/10 p-3 text-sm text-indigo-100 space-y-2" role="status" aria-live="polite">
                  <p>{feedbackLine1}</p>
                  <p className="text-indigo-200/90">{feedbackLine2}</p>
                </div>
              )}

              <button
                onClick={handleContinue}
                disabled={currentAnswer === null}
                className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {granularityT.continue ?? 'Continue'}
              </button>
            </div>
          )}
        </ModalShell>
      )}
    </AnimatePresence>
  )
}
