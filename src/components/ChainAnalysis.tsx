import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { ScreenHeader } from './ScreenHeader'
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
  const [stepIndex, setStepIndex] = useState(0)
  const [fields, setFields] = useState<ChainFields>(EMPTY_FIELDS)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0)
      setFields(EMPTY_FIELDS)
      setSaved(false)
      setError(null)
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
    try {
      await onSave(entry)
      setSaved(true)
      setError(null)
    } catch (e) {
      setError((e as Error)?.message ?? 'Failed to save chain')
    }
  }

  const handlePrimary = async () => {
    if (!canAdvance) return
    if (isLastStep) {
      await saveEntry()
      return
    }
    setError(null)
    setStepIndex((prev) => prev + 1)
  }

  const stepTitle = chainT[currentStep] ?? currentStep
  const stepPlaceholder = chainT[`${currentStep}Placeholder` as keyof typeof chainT] as string | undefined

  if (!isOpen) return null

  return (
    <div className="screen guided-screen" data-testid="chain-screen">
      <ScreenHeader onBack={onClose} eyebrow={chainT.eyebrow} title={chainT.title ?? 'Unpack a moment'} lede={chainT.prompt} />

      {!saved ? (
        <section className="guided-step" aria-labelledby="chain-step-title">
          <div className="guided-progress">
            <span>{chainT.progress.replace('{current}', String(stepIndex + 1)).replace('{total}', String(STEPS.length))}</span>
            <progress value={stepIndex + 1} max={STEPS.length} />
          </div>
          <label id="chain-step-title" className="guided-field-label" htmlFor="chain-step-input">{stepTitle}</label>
          <textarea
            id="chain-step-input"
            value={fields[currentStep]}
            onChange={(event) => {
              const value = event.target.value
              setFields((prev) => ({ ...prev, [currentStep]: value }))
            }}
            placeholder={stepPlaceholder ?? ''}
            className="guided-textarea"
          />
          {error && <p className="guided-error" role="alert">{error}</p>}
          <div className="guided-actions">
            <button type="button" onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))} disabled={stepIndex === 0} className="secondary-button">
              {chainT.back ?? 'Previous step'}
            </button>
            <button type="button" onClick={() => { void handlePrimary() }} disabled={!canAdvance} className="primary-button">
              {isLastStep ? (chainT.save ?? 'Save chain') : (chainT.next ?? 'Next')}
            </button>
          </div>
        </section>
      ) : (
        <section className="guided-success" aria-live="polite">
          <h2>{chainT.savedTitle}</h2>
          <p>{chainT.saved ?? 'Chain saved. You can review patterns over time.'}</p>
          <button type="button" onClick={onClose} className="primary-button">{chainT.done ?? 'Done'}</button>
        </section>
      )}

      {!loading && recentEntries.length > 0 && (
        <section className="guided-recent" aria-labelledby="recent-chains-title">
          <div className="guided-recent-heading">
            <h2 id="recent-chains-title">{chainT.recent ?? 'Recent chains'}</h2>
            <button type="button" onClick={() => { void onClearAll() }} className="text-button danger-text">{historyT.clearAll ?? 'Clear all data'}</button>
          </div>
          <div className="guided-recent-list">
            {recentEntries.map((entry) => (
              <div key={entry.id}>
                <small>{new Date(entry.timestamp).toLocaleString(language === 'ro' ? 'ro-RO' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</small>
                <strong>{entry.emotion}</strong>
                <span>{entry.consequence}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
