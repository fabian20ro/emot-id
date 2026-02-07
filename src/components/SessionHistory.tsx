import { memo, useCallback, useMemo, useState, useEffect } from 'react'
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
import somaticRegionsData from '../models/somatic/data.json'
import type { Session } from '../data/types'

const MODEL_LABELS = getAvailableModels().reduce<Record<string, { ro: string; en: string }>>((acc, model) => {
  acc[model.id] = model.name
  return acc
}, {})
MODEL_LABELS['quick-check-in'] = { ro: 'Check-in rapid', en: 'Quick check-in' }

const SOMATIC_REGION_LABELS = Object.entries(
  somaticRegionsData as Record<string, { label?: { ro: string; en: string } }>
).reduce<Record<string, { ro: string; en: string }>>((acc, [id, region]) => {
  if (region.label) {
    acc[id] = region.label
  }
  return acc
}, {})

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

const REFLECTION_COLORS: Record<'yes' | 'partly' | 'no', string> = {
  yes: 'text-green-400',
  partly: 'text-yellow-400',
  no: 'text-gray-500',
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
  const modelLabel = MODEL_LABELS[session.modelId]?.[language] ?? session.modelId

  const emotionNames = session.results.map((r) => r.label[language]).join(', ')

  return (
    <div className="px-3 py-2 bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">{timeStr}</span>
        <span className="text-xs text-gray-500">{modelLabel}</span>
      </div>
      <p className="text-sm text-gray-200 truncate">{emotionNames || '—'}</p>
      {session.reflectionAnswer && (
        <span className={`text-xs mt-0.5 inline-block ${REFLECTION_COLORS[session.reflectionAnswer]}`}>
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
                <div className="bg-gray-800/50 rounded-xl p-3 mb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    {historyT.vocabTitle ?? 'Your emotional vocabulary'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span>{formatTemplate(historyT.vocabEmotions ?? '{count} emotions identified', vocab.uniqueEmotionCount)}</span>
                    <span className="text-gray-600">·</span>
                    <span className="text-gray-400 text-xs">{formatTemplate(historyT.vocabModels ?? 'across {count} models', vocab.modelsUsed)}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-xs">
                    <span className="text-green-300">
                      {formatTemplate(historyT.vocabActive ?? '{count} actively identified', vocab.activeUniqueEmotionCount)}
                    </span>
                    <span className="text-gray-600">·</span>
                    <span className="text-amber-300">
                      {formatTemplate(historyT.vocabPassive ?? '{count} selected but not surfaced', vocab.passiveUniqueEmotionCount)}
                    </span>
                  </div>
                  {vocab.milestone && (
                    <p className="text-xs text-indigo-300 mt-1.5">
                      {vocab.milestone.type === 'emotions'
                        ? formatTemplate(historyT.milestoneEmotions ?? "You've identified {count} different emotions!", vocab.milestone.count)
                        : formatTemplate(historyT.milestoneModels ?? "You've explored {count} different models!", vocab.milestone.count)}
                    </p>
                  )}
                  {vocab.topActiveEmotions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        {historyT.topIdentified ?? 'Your 15 most-identified emotions'}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {vocab.topActiveEmotions.map((emotion) => (
                          <span
                            key={emotion.id}
                            className="inline-flex items-center gap-1 rounded-full bg-indigo-900/35 border border-indigo-700/35 px-2 py-1 text-[11px] text-indigo-200"
                          >
                            <span>{emotion.label[language]}</span>
                            <span className="text-indigo-300/80">{emotion.count}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Valence ratio (last 7 days) */}
              {!loading && progressionSuggestion && !nudgeDismissed && (
                <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl p-3 mb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-indigo-200 font-medium">
                        {historyT.progressionNudge ?? 'Ready to try something new?'}
                      </p>
                      <p className="text-xs text-indigo-300/90 mt-1 leading-relaxed">
                        {progressionSuggestion}
                      </p>
                    </div>
                    <button
                      onClick={() => setNudgeDismissed(true)}
                      className="min-h-[44px] min-w-[44px] shrink-0 inline-flex items-center justify-center rounded-lg text-indigo-300 hover:text-indigo-100 hover:bg-indigo-800/40 transition-colors"
                      aria-label={historyT.dismissNudge ?? 'Dismiss suggestion'}
                    >
                      ×
                    </button>
                  </div>
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
                  {valenceRatio.weeks.some((week) => week.total > 0) && (
                    <div className="mt-3">
                      <div className="flex items-end gap-1 h-12">
                        {valenceRatio.weeks.map((week, idx) => (
                          <div key={idx} className="flex-1 h-full rounded-sm overflow-hidden bg-gray-700/50 flex flex-col justify-end">
                            {week.total > 0 ? (
                              <>
                                <div className="bg-green-500/55" style={{ height: `${(week.pleasant / week.total) * 100}%` }} />
                                <div className="bg-gray-500/35" style={{ height: `${(week.neutral / week.total) * 100}%` }} />
                                <div className="bg-red-500/55" style={{ height: `${(week.unpleasant / week.total) * 100}%` }} />
                              </>
                            ) : (
                              <div className="h-1 bg-gray-600/40" />
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {historyT.valenceTrend ?? '4-week trend (oldest → newest)'}
                      </p>
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
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {(SOMATIC_REGION_LABELS[rf.regionId]?.[language] ?? rf.regionId)} ({rf.count})
                        </span>
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
