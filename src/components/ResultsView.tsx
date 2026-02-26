import { motion } from 'framer-motion'
import type { AnalysisResult } from '../models/types'
import type { CrisisTier } from '../models/distress'
import { ResultCard } from './ResultCard'
import { CrisisBanner } from './CrisisBanner'
import { InfoButton } from './InfoButton'
import { getInterventionOfferText } from './result-modal-types'

type Language = 'ro' | 'en'

interface ResultsViewProps {
  results: AnalysisResult[]
  language: Language
  hasCrisis: boolean
  crisisTier: CrisisTier
  showTemporalNote: boolean
  requiresTier4Acknowledge: boolean
  onAcknowledgeTier4: () => void
  aiLink: string
  synthesisText: string | null
  oppositeAction: string | null
  interventionType: 'breathing' | 'savoring' | 'curiosity' | null
  hasSecondaryInfo: boolean
  reflectionPrompt: string
  onStartReflection: () => void
  onStartIntervention: () => void
  // i18n labels
  crisisT: Record<string, string>
  interventionT: Record<string, string>
  combinationsFoundLabel: string
  noCombinationsLabel: string
  tier4AcknowledgeLabel: string
  exploreAILabel: string
  showDescriptionLabel?: string
  readMoreLabel?: string
  needsLabel?: string
  moreInfoTitle: string
  moreInfoAria: string
  aiWarning?: string
  noExtraInfoLabel: string
  microDisclaimerLabel: string
}

export function ResultsView({
  results,
  language,
  hasCrisis,
  crisisTier,
  showTemporalNote,
  requiresTier4Acknowledge,
  onAcknowledgeTier4,
  aiLink,
  synthesisText,
  oppositeAction,
  interventionType,
  hasSecondaryInfo,
  reflectionPrompt,
  onStartReflection,
  onStartIntervention,
  crisisT,
  interventionT,
  combinationsFoundLabel,
  noCombinationsLabel,
  tier4AcknowledgeLabel,
  exploreAILabel,
  showDescriptionLabel,
  readMoreLabel,
  needsLabel,
  moreInfoTitle,
  moreInfoAria,
  aiWarning,
  noExtraInfoLabel,
  microDisclaimerLabel,
}: ResultsViewProps) {
  return (
    <motion.div
      key="results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col overflow-hidden"
    >
      {/* Scrollable results section */}
      <div className="flex-1 overflow-y-auto mb-3">
        {/* Crisis resources — above results so distressed users see them first */}
        {hasCrisis && (
          <CrisisBanner
            tier={crisisTier}
            crisisT={crisisT}
            showTemporalNote={showTemporalNote}
          />
        )}

        {requiresTier4Acknowledge ? (
          <div className="mb-3 p-3 rounded-xl bg-red-900/25 border border-red-700/45">
            <button
              onClick={onAcknowledgeTier4}
              className="w-full min-h-[44px] px-4 py-2 rounded-lg bg-red-700/60 text-red-50 font-semibold hover:bg-red-700/80 transition-colors"
            >
              {tier4AcknowledgeLabel}
            </button>
          </div>
        ) : (
          <>
            {results.length > 0 ? (
              <div className="space-y-2">
                {results.some((r) => r.componentLabels) && (
                  <p className="text-sm text-gray-400 font-medium">
                    {combinationsFoundLabel}:
                  </p>
                )}
                {results.map((result) => (
                  <ResultCard
                    key={result.id}
                    result={result}
                    language={language}
                    expanded={results.length <= 2}
                    showDescriptionLabel={showDescriptionLabel}
                    readMoreLabel={readMoreLabel}
                    needsLabel={needsLabel}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-4 rounded-xl bg-gray-700">
                <span className="text-gray-400">
                  {noCombinationsLabel}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {!requiresTier4Acknowledge && (
        <div className="pt-1 space-y-1.5">
          <a
            href={aiLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 px-6 rounded-xl font-semibold text-center bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all"
          >
            {exploreAILabel} &rarr;
          </a>

          {results.length > 0 && (
            <div className="flex items-center justify-center gap-1">
              <button
                onClick={onStartReflection}
                className="min-h-[44px] text-sm text-gray-400 hover:text-gray-300 transition-colors text-center px-1"
              >
                {reflectionPrompt}
              </button>
              <InfoButton
                title={moreInfoTitle}
                ariaLabel={moreInfoAria}
                className="text-gray-500 hover:text-gray-300"
              >
                {(closeInfo) => (
                  <div className="space-y-3">
                    {aiWarning && (
                      <p className="text-xs text-gray-400">
                        {aiWarning}
                      </p>
                    )}
                    {synthesisText && (
                      <p className="text-sm text-gray-200 leading-relaxed">
                        {synthesisText}
                      </p>
                    )}
                    {oppositeAction && (
                      <div className="p-3 rounded-xl bg-amber-900/10 border border-amber-700/20">
                        <p className="text-xs text-amber-300/80 leading-relaxed">
                          {oppositeAction}
                        </p>
                      </div>
                    )}
                    {interventionType && (
                      <button
                        onClick={() => {
                          closeInfo()
                          onStartIntervention()
                        }}
                        className="w-full min-h-[44px] rounded-xl border border-indigo-500/40 px-3 py-2 text-sm text-indigo-300 hover:bg-indigo-600/20 transition-colors"
                      >
                        {getInterventionOfferText(interventionType, interventionT)}
                      </button>
                    )}
                    {!hasSecondaryInfo && (
                      <p className="text-xs text-gray-500">
                        {noExtraInfoLabel}
                      </p>
                    )}
                  </div>
                )}
              </InfoButton>
            </div>
          )}

          <p className="text-xs text-gray-600 text-center">
            {microDisclaimerLabel}
          </p>
        </div>
      )}
    </motion.div>
  )
}
