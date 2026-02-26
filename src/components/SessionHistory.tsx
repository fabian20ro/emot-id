import { useCallback, useMemo, useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { computeVocabulary } from '../data/vocabulary'
import { computeSomaticPatterns } from '../data/somatic-patterns'
import { computeValenceRatio } from '../data/valence-ratio'
import { exportSessionsText, copyToClipboard, downloadAsText } from '../data/export'
import { ModalShell } from './ModalShell'
import { getAvailableModels } from '../models/registry'
import { MODEL_IDS } from '../models/constants'
import { somaticRegions } from '../models/somatic'
import { SessionRow } from './session-history-utils'
import { VocabSummary, ProgressionNudge, ValenceRatioPanel, SomaticPatternsPanel } from './SessionHistoryPanels'
import type { Session } from '../data/types'

const MODEL_LABELS = getAvailableModels().reduce<Record<string, { ro: string; en: string }>>((acc, model) => {
  acc[model.id] = model.name
  return acc
}, {})
MODEL_LABELS['quick-check-in'] = { ro: 'Check-in rapid', en: 'Quick check-in' }

const SOMATIC_REGION_LABELS = Object.entries(
  somaticRegions as Record<string, { label?: { ro: string; en: string } }>
).reduce<Record<string, { ro: string; en: string }>>((acc, [id, region]) => {
  if (region.label) {
    acc[id] = region.label
  }
  return acc
}, {})

interface SessionHistoryProps {
  isOpen: boolean
  onClose: () => void
  sessions: Session[]
  loading: boolean
  onClearAll: () => void
  onExportJSON: () => Promise<string>
}

export function SessionHistory({
  isOpen,
  onClose,
  sessions,
  loading,
  onClearAll,
  onExportJSON,
}: SessionHistoryProps) {
  const { language, section } = useLanguage()
  const historyT = section('history')
  const focusTrapRef = useFocusTrap(isOpen, onClose)
  const [nudgeDismissed, setNudgeDismissed] = useState(false)

  const vocab = useMemo(() => computeVocabulary(sessions), [sessions])
  const somaticPatterns = useMemo(() => computeSomaticPatterns(sessions), [sessions])
  const valenceRatio = useMemo(() => computeValenceRatio(sessions), [sessions])
  const progressionSuggestion = useMemo(() => {
    if (sessions.length < 3) return null
    const counts = sessions.reduce<Record<string, number>>((acc, session) => {
      acc[session.modelId] = (acc[session.modelId] ?? 0) + 1
      return acc
    }, {})
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    if (!top || top[1] < 3) return null

    const [modelId] = top
    switch (modelId) {
      case MODEL_IDS.SOMATIC:
        return historyT.progressionSomatic
      case MODEL_IDS.WHEEL:
        return historyT.progressionWheel
      case MODEL_IDS.PLUTCHIK:
        return historyT.progressionPlutchik
      case MODEL_IDS.DIMENSIONAL:
        return historyT.progressionDimensional
      default:
        return null
    }
  }, [sessions, historyT])

  useEffect(() => {
    if (!isOpen) {
      setNudgeDismissed(false)
    }
  }, [isOpen])

  const handleExportJSON = useCallback(async () => {
    const json = await onExportJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `emot-id-sessions-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [onExportJSON])

  const handleExportText = useCallback(() => {
    const text = exportSessionsText(sessions, language)
    copyToClipboard(text)
    downloadAsText(text, `emot-id-summary-${Date.now()}.txt`)
  }, [sessions, language])

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalShell
          onClose={onClose}
          focusTrapRef={focusTrapRef}
          labelledBy="session-history-title"
          backdropClassName="fixed inset-0 z-[var(--z-backdrop)] bg-black/50"
          viewportClassName="fixed inset-0 z-[var(--z-modal)]"
          panelClassName="fixed inset-x-4 top-[max(4rem,env(safe-area-inset-top))] bottom-[max(4rem,env(safe-area-inset-bottom))] max-w-md mx-auto bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl flex flex-col overflow-hidden"
          panelProps={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: 20 },
          }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <h2 id="session-history-title" className="text-sm font-semibold text-gray-200">
                {historyT.title ?? 'Past Sessions'}
              </h2>
              <button
                onClick={onClose}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
                aria-label={historyT.close ?? 'Close history'}
              >
                ×
              </button>
            </div>

            {/* Session list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {/* Vocabulary summary */}
              {!loading && sessions.length > 0 && (
                <VocabSummary vocab={vocab} language={language} historyT={historyT} />
              )}

              {/* Progression nudge */}
              {!loading && progressionSuggestion && !nudgeDismissed && (
                <ProgressionNudge
                  suggestion={progressionSuggestion}
                  onDismiss={() => setNudgeDismissed(true)}
                  historyT={historyT}
                />
              )}

              {/* Valence ratio (last 7 days) */}
              {!loading && valenceRatio.total > 0 && (
                <ValenceRatioPanel valenceRatio={valenceRatio} historyT={historyT} />
              )}

              {/* Somatic heat map */}
              {!loading && somaticPatterns.totalSomaticSessions > 0 && somaticPatterns.regionFrequencies.length > 0 && (
                <SomaticPatternsPanel
                  somaticPatterns={somaticPatterns}
                  language={language}
                  regionLabels={SOMATIC_REGION_LABELS}
                  historyT={historyT}
                />
              )}

              {loading && (
                <p className="text-sm text-gray-500 text-center py-4">...</p>
              )}
              {!loading && sessions.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  {historyT.empty ?? 'No sessions yet'}
                </p>
              )}
              {sessions.map((session) => (
                <SessionRow key={session.id} session={session} modelLabels={MODEL_LABELS} />
              ))}
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-gray-700">
              <button
                onClick={onClearAll}
                className="min-h-[44px] px-2 text-xs text-red-400 hover:text-red-300 transition-colors disabled:text-gray-600"
                disabled={sessions.length === 0}
              >
                {historyT.clearAll ?? 'Clear all data'}
              </button>
              <div className="flex gap-1.5">
                <button
                  onClick={handleExportText}
                  className="min-h-[44px] px-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors disabled:text-gray-600"
                  disabled={sessions.length === 0}
                >
                  {historyT.exportText ?? 'Share with therapist'}
                </button>
                <button
                  onClick={handleExportJSON}
                  className="min-h-[44px] px-2 text-xs text-gray-400 hover:text-gray-200 transition-colors disabled:text-gray-600"
                  disabled={sessions.length === 0}
                >
                  {historyT.export ?? 'Export JSON'}
                </button>
              </div>
            </div>
        </ModalShell>
      )}
    </AnimatePresence>
  )
}
