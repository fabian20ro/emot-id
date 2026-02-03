import { memo, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { computeVocabulary } from '../data/vocabulary'
import { computeSomaticPatterns } from '../data/somatic-patterns'
import { computeValenceRatio } from '../data/valence-ratio'
import { exportSessionsText, copyToClipboard, downloadAsText } from '../data/export'
import type { Session } from '../data/types'

function formatTemplate(template: string, count: number): string {
  return template.replace('{count}', String(count))
}

function getReflectionIcon(answer: 'yes' | 'partly' | 'no'): string {
  switch (answer) {
    case 'yes':
      return '✓'
    case 'partly':
      return '~'
    case 'no':
      return '✗'
  }
}

function getReflectionColorClass(answer: 'yes' | 'partly' | 'no'): string {
  const baseClass = 'text-xs mt-0.5 inline-block'
  switch (answer) {
    case 'yes':
      return `${baseClass} text-green-400`
    case 'partly':
      return `${baseClass} text-yellow-400`
    case 'no':
      return `${baseClass} text-gray-500`
  }
}

interface SessionHistoryProps {
  isOpen: boolean
  onClose: () => void
  sessions: Session[]
  loading: boolean
  onClearAll: () => void
  onExportJSON: () => Promise<string>
}

const SessionRow = memo(function SessionRow({ session }: { session: Session }) {
  const { language } = useLanguage()
  const date = new Date(session.timestamp)
  const timeStr = date.toLocaleString(language === 'ro' ? 'ro-RO' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const emotionNames = session.results.map((r) => r.label[language]).join(', ')

  return (
    <div className="px-3 py-2 bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">{timeStr}</span>
        <span className="text-xs text-gray-500">{session.modelId}</span>
      </div>
      <p className="text-sm text-gray-200 truncate">{emotionNames || '—'}</p>
      {session.reflectionAnswer && (
        <span className={getReflectionColorClass(session.reflectionAnswer)}>
          {getReflectionIcon(session.reflectionAnswer)}
        </span>
      )}
    </div>
  )
})

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

  const vocab = useMemo(() => computeVocabulary(sessions), [sessions])
  const somaticPatterns = useMemo(() => computeSomaticPatterns(sessions), [sessions])
  const valenceRatio = useMemo(() => computeValenceRatio(sessions), [sessions])

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
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[var(--z-backdrop)] bg-black/50"
            onClick={onClose}
          />
          <motion.div
            ref={focusTrapRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            role="dialog"
            aria-modal="true"
            className="fixed inset-x-4 top-16 bottom-16 z-[var(--z-modal)] max-w-md mx-auto bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <h2 className="text-sm font-semibold text-gray-200">
                {historyT.title ?? 'Past Sessions'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-300 text-lg leading-none"
              >
                ×
              </button>
            </div>

            {/* Session list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {/* Vocabulary summary */}
              {!loading && sessions.length > 0 && (
                <div className="bg-gray-800/50 rounded-xl p-3 mb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    {historyT.vocabTitle ?? 'Your emotional vocabulary'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span>{formatTemplate(historyT.vocabEmotions ?? '{count} emotions identified', vocab.uniqueEmotionCount)}</span>
                    <span className="text-gray-600">·</span>
                    <span className="text-gray-400 text-xs">{formatTemplate(historyT.vocabModels ?? 'across {count} models', vocab.modelsUsed)}</span>
                  </div>
                  {vocab.milestone && (
                    <p className="text-xs text-indigo-300 mt-1.5">
                      {vocab.milestone.type === 'emotions'
                        ? formatTemplate(historyT.milestoneEmotions ?? "You've identified {count} different emotions!", vocab.milestone.count)
                        : formatTemplate(historyT.milestoneModels ?? "You've explored {count} different models!", vocab.milestone.count)}
                    </p>
                  )}
                </div>
              )}

              {/* Valence ratio (last 7 days) */}
              {!loading && valenceRatio.total > 0 && (
                <div className="bg-gray-800/50 rounded-xl p-3 mb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    {historyT.valenceTitle ?? "This week's emotions"}
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-green-400">{formatTemplate(historyT.valencePleasant ?? '{count} pleasant', valenceRatio.pleasant)}</span>
                    <span className="text-gray-600">·</span>
                    <span className="text-red-400">{formatTemplate(historyT.valenceUnpleasant ?? '{count} unpleasant', valenceRatio.unpleasant)}</span>
                  </div>
                  {/* Simple bar */}
                  {valenceRatio.total > 0 && (
                    <div className="flex h-1.5 rounded-full overflow-hidden mt-2 bg-gray-700">
                      <div className="bg-green-500/60" style={{ width: `${(valenceRatio.pleasant / valenceRatio.total) * 100}%` }} />
                      <div className="bg-gray-500/40" style={{ width: `${(valenceRatio.neutral / valenceRatio.total) * 100}%` }} />
                      <div className="bg-red-500/60" style={{ width: `${(valenceRatio.unpleasant / valenceRatio.total) * 100}%` }} />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{historyT.valenceNote ?? 'Neither is right or wrong.'}</p>
                </div>
              )}

              {/* Somatic heat map */}
              {!loading && somaticPatterns.totalSomaticSessions > 0 && somaticPatterns.regionFrequencies.length > 0 && (
                <div className="bg-gray-800/50 rounded-xl p-3 mb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    {historyT.somaticTitle ?? 'Your body patterns'}
                  </p>
                  <div className="space-y-1">
                    {somaticPatterns.regionFrequencies.slice(0, 5).map((rf) => (
                      <div key={rf.regionId} className="flex items-center gap-2">
                        <div
                          className="h-1.5 rounded-full bg-indigo-500/60"
                          style={{ width: `${Math.min(100, (rf.count / somaticPatterns.totalSomaticSessions) * 100)}%`, minWidth: '8px' }}
                        />
                        <span className="text-xs text-gray-400 whitespace-nowrap">{rf.regionId} ({rf.count})</span>
                      </div>
                    ))}
                  </div>
                </div>
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
                <SessionRow key={session.id} session={session} />
              ))}
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
              <button
                onClick={onClearAll}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                disabled={sessions.length === 0}
              >
                {historyT.clearAll ?? 'Clear all data'}
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleExportText}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  disabled={sessions.length === 0}
                >
                  {historyT.exportText ?? 'Share with therapist'}
                </button>
                <button
                  onClick={handleExportJSON}
                  className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
                  disabled={sessions.length === 0}
                >
                  {historyT.export ?? 'Export JSON'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
