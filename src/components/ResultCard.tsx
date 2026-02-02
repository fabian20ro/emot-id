import { HIGH_DISTRESS_IDS } from '../models/distress'
import type { AnalysisResult } from '../models/types'

interface ResultCardProps {
  result: AnalysisResult
  language: 'ro' | 'en'
  expanded: boolean
  showDescriptionLabel?: string
  readMoreLabel?: string
  needsLabel?: string
}

export function ResultCard({ result, language, expanded, showDescriptionLabel, readMoreLabel, needsLabel }: ResultCardProps) {
  // High-distress results always start collapsed (graduated exposure)
  const isHighDistress = HIGH_DISTRESS_IDS.has(result.id)
  const shouldExpand = expanded && !isHighDistress
  return (
    <div
      className="py-4 px-4 rounded-xl"
      style={{
        background: `linear-gradient(135deg, ${result.color}20 0%, ${result.color}40 100%)`,
        border: `2px solid ${result.color}`,
      }}
    >
      {result.hierarchyPath && (
        <span className="text-xs text-gray-400 block mb-1">
          {result.hierarchyPath.map((p) => p[language]).join(' > ')}
        </span>
      )}
      <div className="flex items-center gap-2">
        <span
          className="text-xl font-bold"
          style={{ color: result.color }}
        >
          {result.label[language]}
        </span>
        {result.matchStrength && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
            {result.matchStrength[language]}
          </span>
        )}
      </div>
      {result.componentLabels && (
        <span className="text-sm text-gray-300 mt-1 block">
          = {result.componentLabels
            .map((label) => label[language])
            .join(' + ')}
        </span>
      )}
      {result.description && (
        shouldExpand ? (
          <p className="text-sm text-gray-300 mt-2 leading-relaxed">
            {result.description[language]}
          </p>
        ) : (
          <details className="mt-2 group">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300 transition-colors select-none">
              {isHighDistress
                ? (readMoreLabel ?? 'Would you like to read more about this?')
                : (showDescriptionLabel ?? 'Show description')}
            </summary>
            <p className="text-sm text-gray-300 mt-1 leading-relaxed">
              {result.description[language]}
            </p>
          </details>
        )
      )}
      {result.needs && (
        <p className="text-xs text-gray-400 mt-2 italic">
          {needsLabel ?? 'This emotion often needs'}:{' '}
          <span className="text-gray-300">{result.needs[language]}</span>
        </p>
      )}
    </div>
  )
}
