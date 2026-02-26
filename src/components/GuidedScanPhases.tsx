import { motion } from 'framer-motion'
import {
  CENTERING_DURATION_MS,
  BREATH_CYCLE_MS,
} from './guided-scan-constants'
import type roStrings from '../i18n/ro.json'

type SomaticSection = (typeof roStrings)['somatic']
type CrisisSection = (typeof roStrings)['crisis']

// ---------------------------------------------------------------------------
// CenteringPhase — breathing cycle intro
// ---------------------------------------------------------------------------

interface CenteringPhaseProps {
  somaticT: SomaticSection
  breathPhase: 'in' | 'out'
  centeringDuration: number
  onSkip: () => void
  onExtend: () => void
}

export function CenteringPhase({
  somaticT,
  breathPhase,
  centeringDuration,
  onSkip,
  onExtend,
}: CenteringPhaseProps): React.ReactElement {
  return (
    <motion.div
      key="centering"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-6 mb-4 mx-4 max-w-sm max-h-[80vh] overflow-y-auto text-center pointer-events-auto"
    >
      <motion.div
        animate={{
          scale: breathPhase === 'in' ? [1, 1.15] : [1.15, 1],
          opacity: breathPhase === 'in' ? [0.7, 1] : [1, 0.7],
        }}
        transition={{
          duration: BREATH_CYCLE_MS / 2000,
          ease: 'easeInOut',
        }}
        className="text-4xl mb-3"
      >
        🫁
      </motion.div>
      <p className="text-gray-200 text-lg mb-1">
        {somaticT.guidedStart ?? 'Take a breath. Notice your body.'}
      </p>
      <p className="text-xs text-gray-400 mb-2">
        {somaticT.guidedTraumaNote ?? 'If any area feels uncomfortable, you can skip it at any time.'}
      </p>
      <motion.p
        key={breathPhase}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-indigo-300 text-sm mb-3"
      >
        {breathPhase === 'in'
          ? (somaticT.guidedBreathIn ?? 'Breathe in...')
          : (somaticT.guidedBreathOut ?? 'Breathe out...')}
      </motion.p>
      <motion.div
        className="w-full h-1 bg-gray-700 rounded-full overflow-hidden"
      >
        <motion.div
          className="h-full bg-indigo-500/50 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: centeringDuration / 1000, ease: 'linear' }}
        />
      </motion.div>
      <div className="flex items-center justify-center gap-4 mt-3">
        {centeringDuration === CENTERING_DURATION_MS && (
          <button
            onClick={onExtend}
            className="min-h-[44px] px-3 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {somaticT.guidedTakeMoreTime ?? 'Take more time'}
          </button>
        )}
        <button
          onClick={onSkip}
          className="min-h-[44px] min-w-[44px] text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          →
        </button>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// PausePhase — shown after high-intensity or numbness flooding
// ---------------------------------------------------------------------------

interface PausePhaseProps {
  somaticT: SomaticSection
  crisisT: CrisisSection
  showNumbnessWarning: boolean
  pauseContext: { sensation: string; region: string } | null
  onDismissNumbness: () => void
  onResume: () => void
}

export function PausePhase({
  somaticT,
  crisisT,
  showNumbnessWarning,
  pauseContext,
  onDismissNumbness,
  onResume,
}: PausePhaseProps): React.ReactElement {
  return (
    <motion.div
      key="pause"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-6 mb-4 mx-4 max-w-sm max-h-[80vh] overflow-y-auto text-center pointer-events-auto"
    >
      {showNumbnessWarning && !pauseContext && (
        <>
          <p className="text-gray-200 text-sm leading-relaxed mb-4">
            {somaticT.numbnessFlooding ?? 'Your body may be protecting you right now. Would you like to try a grounding exercise before continuing?'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onDismissNumbness}
              className="min-h-[44px] px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl text-sm transition-colors"
            >
              {somaticT.numbnessContinue ?? 'Continue scanning'}
            </button>
          </div>
          <p className="text-xs text-amber-200/70 mt-3 leading-relaxed">
            {crisisT?.groundingBody ?? 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.'}
          </p>
        </>
      )}
      {pauseContext && (
        <>
          <p className="text-gray-200 text-sm leading-relaxed mb-4">
            {(somaticT.guidedPause ?? 'You noticed strong {sensation} in your {region}. Take a breath before continuing.')
              .replace('{sensation}', pauseContext.sensation)
              .replace('{region}', pauseContext.region)}
          </p>
          <button
            onClick={onResume}
            className="min-h-[44px] px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm transition-colors"
          >
            {somaticT.guidedPauseContinue ?? 'Ready to continue'}
          </button>
        </>
      )}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// CompletionPhase — scan-complete view
// ---------------------------------------------------------------------------

interface CompletionPhaseProps {
  somaticT: SomaticSection
  skipCount: number
  onComplete: () => void
}

export function CompletionPhase({
  somaticT,
  skipCount,
  onComplete,
}: CompletionPhaseProps): React.ReactElement {
  return (
    <motion.div
      key="complete"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-6 mb-4 mx-4 max-w-sm max-h-[80vh] overflow-y-auto text-center pointer-events-auto"
    >
      <p className="text-gray-200 text-lg mb-2">
        {somaticT.guidedDone ?? 'Body scan complete'}
      </p>
      {skipCount >= 6 ? (
        <div className="text-xs text-gray-400 mb-3 max-w-xs space-y-1.5 text-left">
          <p>{somaticT.interoceptionTip ?? 'Body awareness is like a muscle — it develops with practice. Try placing your hand on your stomach and just noticing the temperature.'}</p>
          <p>{somaticT.interoceptionTip2 ?? 'You can practice noticing sensations during everyday activities: the warmth of a cup, the weight of your feet on the floor.'}</p>
          <p>{somaticT.interoceptionTip3 ?? "If nothing comes up, that's okay. Sometimes the signal is 'neutral' — and noticing neutral is also body awareness."}</p>
        </div>
      ) : (
        skipCount >= 3 && (
          <p className="text-xs text-gray-400 mb-3 max-w-xs">
            {somaticT.guidedNothingNormal ?? 'Not noticing sensations is common. Body awareness develops with practice.'}
          </p>
        )
      )}
      <button
        onClick={onComplete}
        className="min-h-[44px] min-w-[44px] px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm transition-colors"
      >
        ✓
      </button>
    </motion.div>
  )
}
