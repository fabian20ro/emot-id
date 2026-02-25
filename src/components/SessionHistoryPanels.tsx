import type { VocabularyStats } from '../data/vocabulary'
import type { ValenceRatio } from '../data/valence-ratio'
import type { SomaticPatterns } from '../data/somatic-patterns'
import { formatTemplate } from './session-history-utils'

// -- i18n section subset types ------------------------------------------------

interface VocabSection {
  vocabTitle?: string
  vocabEmotions?: string
  vocabModels?: string
  vocabActive?: string
  vocabPassive?: string
  milestoneEmotions?: string
  milestoneModels?: string
  topIdentified?: string
}

interface ValenceSection {
  valenceTitle?: string
  valencePleasant?: string
  valenceUnpleasant?: string
  valenceTrend?: string
  valenceNote?: string
}

interface SomaticSection {
  somaticTitle?: string
}

interface NudgeSection {
  progressionNudge?: string
  dismissNudge?: string
}

// -- Props types --------------------------------------------------------------

interface VocabSummaryProps {
  vocab: VocabularyStats
  language: 'ro' | 'en'
  historyT: VocabSection
}

interface ValenceRatioPanelProps {
  valenceRatio: ValenceRatio
  historyT: ValenceSection
}

interface SomaticPatternsPanelProps {
  somaticPatterns: SomaticPatterns
  language: 'ro' | 'en'
  regionLabels: Record<string, { ro: string; en: string }>
  historyT: SomaticSection
}

interface ProgressionNudgeProps {
  suggestion: string
  onDismiss: () => void
  historyT: NudgeSection
}

// -- Components ---------------------------------------------------------------

export function VocabSummary({ vocab, language, historyT }: VocabSummaryProps) {
  return (
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
  )
}

export function ProgressionNudge({ suggestion, onDismiss, historyT }: ProgressionNudgeProps) {
  return (
    <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl p-3 mb-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-indigo-200 font-medium">
            {historyT.progressionNudge ?? 'Ready to try something new?'}
          </p>
          <p className="text-xs text-indigo-300/90 mt-1 leading-relaxed">
            {suggestion}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="min-h-[44px] min-w-[44px] shrink-0 inline-flex items-center justify-center rounded-lg text-indigo-300 hover:text-indigo-100 hover:bg-indigo-800/40 transition-colors"
          aria-label={historyT.dismissNudge ?? 'Dismiss suggestion'}
        >
          ×
        </button>
      </div>
    </div>
  )
}

export function ValenceRatioPanel({ valenceRatio, historyT }: ValenceRatioPanelProps) {
  return (
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
  )
}

export function SomaticPatternsPanel({ somaticPatterns, language, regionLabels, historyT }: SomaticPatternsPanelProps) {
  return (
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
              {(regionLabels[rf.regionId]?.[language] ?? rf.regionId)} ({rf.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
