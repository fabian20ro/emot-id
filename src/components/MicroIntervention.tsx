import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type InterventionType = 'breathing' | 'savoring' | 'curiosity'
type InterventionResponse = 'better' | 'same' | 'worse'

interface MicroInterventionProps {
  type: InterventionType
  t: Record<string, string>
  onDismiss: () => void
  onResponse?: (response: InterventionResponse) => void
}

function BreathingExercise({ t, onComplete }: { t: Record<string, string>; onComplete: () => void }) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'done'>('inhale')
  const [cycle, setCycle] = useState(0)
  const MAX_CYCLES = 3

  useEffect(() => {
    if (phase === 'done') return
    const durations = { inhale: 4000, hold: 2000, exhale: 6000 }
    const timer = setTimeout(() => {
      if (phase === 'inhale') setPhase('hold')
      else if (phase === 'hold') setPhase('exhale')
      else {
        const next = cycle + 1
        if (next >= MAX_CYCLES) {
          setPhase('done')
          return
        }
        setCycle(next)
        setPhase('inhale')
      }
    }, durations[phase as 'inhale' | 'hold' | 'exhale'])
    return () => clearTimeout(timer)
  }, [phase, cycle])

  useEffect(() => {
    if (phase === 'done') {
      onComplete()
    }
  }, [phase, onComplete])

  const phaseText = {
    inhale: t.breathIn ?? 'Breathe in...',
    hold: t.breathHold ?? 'Hold...',
    exhale: t.breathOut ?? 'Breathe out...',
    done: t.interventionDone ?? 'You finished this practice.',
  }

  const scaleValues = { inhale: 1.2, hold: 1.2, exhale: 0.9, done: 0.9 }

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={{ scale: scaleValues[phase] }}
        transition={{ duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 6 : 0.3, ease: 'easeInOut' }}
        className="w-20 h-20 rounded-full bg-blue-500/20 border-2 border-blue-400/50 flex items-center justify-center"
      >
        <span className="text-2xl">🫁</span>
      </motion.div>
      <p className="text-gray-200 text-sm">{phaseText[phase]}</p>
      <p className="text-gray-500 text-xs">{Math.min(cycle + 1, MAX_CYCLES)} / {MAX_CYCLES}</p>
    </div>
  )
}

function SavoringExercise({ t, onComplete }: { t: Record<string, string>; onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const steps = [
    t.savorStep1 ?? 'Close your eyes for a moment.',
    t.savorStep2 ?? 'Recall the situation that brought this feeling.',
    t.savorStep3 ?? 'Notice where you feel it in your body.',
    t.savorStep4 ?? 'Breathe and let it expand.',
  ]

  useEffect(() => {
    if (step >= steps.length - 1) {
      if (!completed) {
        setCompleted(true)
        onComplete()
      }
      return
    }
    const timer = setTimeout(() => setStep((s) => s + 1), 4000)
    return () => clearTimeout(timer)
  }, [step, steps.length, completed, onComplete])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center">
        <span className="text-2xl">✨</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-gray-200 text-sm text-center px-4"
        >
          {steps[step]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

function CuriosityPrompt({ t }: { t: Record<string, string> }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-20 h-20 rounded-full bg-indigo-500/20 border-2 border-indigo-400/50 flex items-center justify-center">
        <span className="text-2xl">🔍</span>
      </div>
      <p className="text-gray-200 text-sm text-center px-4 leading-relaxed">
        {t.curiosityPrompt ?? 'What might these emotions be telling you? Take a moment to wonder without needing an answer.'}
      </p>
    </div>
  )
}

export function MicroIntervention({ type, t, onDismiss, onResponse }: MicroInterventionProps) {
  const [showCheck, setShowCheck] = useState(type === 'curiosity')
  const [worseSelected, setWorseSelected] = useState(false)

  useEffect(() => {
    setShowCheck(type === 'curiosity')
    setWorseSelected(false)
  }, [type])

  const handleExerciseComplete = () => {
    setShowCheck(true)
  }

  const handleResponse = (response: InterventionResponse) => {
    onResponse?.(response)
    if (response === 'worse') {
      setWorseSelected(true)
    }
    if (response !== 'worse') {
      onDismiss()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center py-6"
    >
      <p className="text-xs text-gray-400 mb-4">
        {t.interventionTitle ?? 'A moment for you'}
      </p>

      {!showCheck && (
        <>
          {type === 'breathing' && <BreathingExercise t={t} onComplete={handleExerciseComplete} />}
          {type === 'savoring' && <SavoringExercise t={t} onComplete={handleExerciseComplete} />}
          {type === 'curiosity' && <CuriosityPrompt t={t} />}

          <button
            onClick={onDismiss}
            className="mt-6 min-h-[44px] px-4 text-sm text-gray-500 hover:text-gray-400 transition-colors"
          >
            {t.interventionDismiss ?? 'Continue'}
          </button>
        </>
      )}

      {showCheck && (
        <div className="w-full mt-2">
          <p className="text-sm text-gray-200 text-center mb-3">
            {t.checkPrompt ?? 'How do you feel now?'}
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleResponse('better')}
              className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-green-700/30 border border-green-600/50 text-green-200 hover:bg-green-700/45 transition-colors text-sm"
            >
              {t.checkBetter ?? 'Better'}
            </button>
            <button
              onClick={() => handleResponse('same')}
              className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-gray-700/40 border border-gray-600/60 text-gray-200 hover:bg-gray-700/55 transition-colors text-sm"
            >
              {t.checkSame ?? 'About the same'}
            </button>
            <button
              onClick={() => handleResponse('worse')}
              className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-amber-700/25 border border-amber-600/40 text-amber-200 hover:bg-amber-700/40 transition-colors text-sm"
            >
              {t.checkWorse ?? 'Worse'}
            </button>
          </div>
          {worseSelected && (
            <div className="mt-3 p-3 rounded-xl bg-amber-900/20 border border-amber-700/35">
              <p className="text-xs text-amber-200/90 leading-relaxed">
                {t.worseValidation ?? "That's important information. Some exercises don't work for everyone. Your experience is valid."}
              </p>
              <button
                onClick={onDismiss}
                className="mt-3 min-h-[44px] px-4 text-sm text-amber-200 hover:text-amber-100 transition-colors"
              >
                {t.interventionDismiss ?? 'Continue'}
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

/**
 * Determine appropriate micro-intervention type based on analysis results.
 * Returns null if no intervention is contextually appropriate.
 */
export function getInterventionType(
  avgArousal: number | undefined,
  hasPositive: boolean,
  hasNegative: boolean,
  isMixed: boolean,
): InterventionType | null {
  // High arousal → offer calming breathing
  if (avgArousal !== undefined && avgArousal > 0.65) return 'breathing'
  // Pleasant emotions only → offer savoring
  if (hasPositive && !hasNegative && !isMixed) return 'savoring'
  // Mixed valence → offer curiosity prompt
  if (isMixed) return 'curiosity'
  return null
}
