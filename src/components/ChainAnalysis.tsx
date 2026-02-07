import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { ModalShell } from './ModalShell'
import type { ChainAnalysisEntry } from '../data/types'

type ChainFieldId =
  | 'triggeringEvent'
  | 'vulnerabilityFactors'
  | 'promptingEvent'
  | 'emotion'
  | 'urge'
  | 'action'
  | 'consequence'

type ChainFields = Record<ChainFieldId, string>

const EMPTY_FIELDS: ChainFields = {
  triggeringEvent: '',
  vulnerabilityFactors: '',
  promptingEvent: '',
  emotion: '',
  urge: '',
  action: '',
  consequence: '',
}

const STEPS: ChainFieldId[] = [
  'triggeringEvent',
  'vulnerabilityFactors',
  'promptingEvent',
  'emotion',
  'urge',
  'action',
  'consequence',
]

interface ChainAnalysisProps {
  isOpen: boolean
  onClose: () => void
  entries: ChainAnalysisEntry[]
  loading: boolean
  onSave: (entry: ChainAnalysisEntry) => Promise<void>
  onClearAll: () => Promise<void>
}

export function ChainAnalysis({
  isOpen,
  onClose,
  entries,
  loading,
  onSave,
  onClearAll,
}: ChainAnalysisProps) {
  const { section, language } = useLanguage()
  const chainT = section('chainAnalysis')
  const historyT = section('history')
  const focusTrapRef = useFocusTrap(isOpen, onClose)
  const [stepIndex, setStepIndex] = useState(0)
  const [fields, setFields] = useState<ChainFields>(EMPTY_FIELDS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0)
      setFields(EMPTY_FIELDS)
      setSaved(false)
    }
  }, [isOpen])

  const currentStep = STEPS[stepIndex]
  const isLastStep = stepIndex === STEPS.length - 1
  const canAdvance = fields[currentStep].trim().length > 0

  const recentEntries = useMemo(() => entries.slice(0, 3), [entries])

  const saveEntry = async () => {
    const entry: ChainAnalysisEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      ...fields,
    }
    await onSave(entry)
    setSaved(true)
  }

  const handlePrimary = async () => {
    if (!canAdvance) return
    if (isLastStep) {
      await saveEntry()
      return
    }
    setStepIndex((prev) => prev + 1)
  }

  const stepTitle = chainT[currentStep] ?? currentStep
  const stepPlaceholder = chainT[`${currentStep}Placeholder` as keyof typeof chainT] as string | undefined

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalShell
          onClose={onClose}
          focusTrapRef={focusTrapRef}
          labelledBy="chain-analysis-title"
          backdropClassName="fixed inset-0 z-[var(--z-backdrop)] bg-black/50 backdrop-blur-sm"
          viewportClassName="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
          panelClassName="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-5 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 id="chain-analysis-title" className="text-lg font-semibold text-white">
              {chainT.title ?? 'Chain analysis'}
            </h2>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-100 hover:bg-gray-700/60 transition-colors"
              aria-label={chainT.close ?? 'Close'}
            >
              ×
            </button>
          </div>

          {!saved ? (
            <>
              <p className="text-sm text-gray-300 mb-3">
                {chainT.prompt ?? 'Walk through the sequence to understand what happened and what to try next.'}
              </p>
              <p className="text-xs text-gray-500 mb-3">
                {stepIndex + 1}/{STEPS.length}
              </p>

              <label className="text-sm text-gray-200 mb-1 block">
                {stepTitle}
              </label>
              <textarea
                value={fields[currentStep]}
                onChange={(event) => {
                  const value = event.target.value
                  setFields((prev) => ({ ...prev, [currentStep]: value }))
                }}
                placeholder={stepPlaceholder ?? ''}
                className="w-full min-h-[120px] rounded-xl border border-gray-700 bg-gray-900/60 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500"
              />

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
                  disabled={stepIndex === 0}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-gray-700 text-sm text-gray-300 disabled:text-gray-600 disabled:border-gray-800"
                >
                  {chainT.back ?? 'Back'}
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => { void handlePrimary() }}
                  disabled={!canAdvance}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium disabled:bg-gray-700 disabled:text-gray-400"
                >
                  {isLastStep ? (chainT.save ?? 'Save chain') : (chainT.next ?? 'Next')}
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-green-700/40 bg-green-900/20 p-3 mb-3">
              <p className="text-sm text-green-200">
                {chainT.saved ?? 'Chain saved. You can review patterns over time.'}
              </p>
              <button
                onClick={onClose}
                className="mt-3 min-h-[44px] px-4 py-2 rounded-xl bg-green-700/60 text-green-50 text-sm font-medium"
              >
                {chainT.done ?? 'Done'}
              </button>
            </div>
          )}

          {!loading && recentEntries.length > 0 && (
            <div className="mt-4 border-t border-gray-700 pt-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {chainT.recent ?? 'Recent chains'}
                </p>
                <button
                  onClick={() => { void onClearAll() }}
                  className="min-h-[44px] px-2 text-xs text-red-300 hover:text-red-200"
                >
                  {historyT.clearAll ?? 'Clear all data'}
                </button>
              </div>
              <div className="space-y-2">
                {recentEntries.map((entry) => (
                  <div key={entry.id} className="rounded-lg bg-gray-900/60 border border-gray-700 px-3 py-2">
                    <p className="text-[11px] text-gray-500">
                      {new Date(entry.timestamp).toLocaleString(language === 'ro' ? 'ro-RO' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                      {entry.emotion}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                      {entry.consequence}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ModalShell>
      )}
    </AnimatePresence>
  )
}
