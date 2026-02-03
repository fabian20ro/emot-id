import { HIGH_DISTRESS_IDS } from '../models/distress'
import type { AnalysisResult } from '../models/types'
import { InfoButton } from './InfoButton'

interface ResultCardProps {
  result: AnalysisResult
  language: 'ro' | 'en'
  expanded: boolean
  showDescriptionLabel?: string
  readMoreLabel?: string
  needsLabel?: string
}

function NeedsBadge({ needs, language, label, className = 'text-xs text-gray-400 mt-2 italic' }: {
  needs: AnalysisResult['needs']
  language: 'ro' | 'en'
  label: string
  className?: string
}) {
  if (!needs) return null
  return (
    <p className={className}>
      {label}:{' '}
      <span className="text-gray-300">{needs[language]}</span>
    </p>
  )
}

export function ResultCard({ result, language, expanded, showDescriptionLabel, readMoreLabel, needsLabel }: ResultCardProps) {
  // High-distress results always start collapsed (graduated exposure)
  const isHighDistress = HIGH_DISTRESS_IDS.has(result.id)
  const shouldExpand = expanded && !isHighDistress
  const needsText = needsLabel ?? 'This emotion often needs'
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
          <>
            <p className="text-sm text-gray-300 mt-2 leading-relaxed">
              {result.description[language]}
            </p>
            <NeedsBadge needs={result.needs} language={language} label={needsText} />
          </>
        ) : (
          <div className="flex items-center gap-1 mt-1">
            <InfoButton
              title={result.label[language]}
              ariaLabel={isHighDistress
                ? (readMoreLabel ?? 'Would you like to read more about this?')
                : (showDescriptionLabel ?? 'Show description')}
            >
              <p>{result.description[language]}</p>
              <NeedsBadge needs={result.needs} language={language} label={needsText} className="mt-3 italic text-gray-400" />
            </InfoButton>
          </div>
        )
      )}
      {!result.description && (
        <NeedsBadge needs={result.needs} language={language} label={needsText} />
      )}
    </div>
  )
}
