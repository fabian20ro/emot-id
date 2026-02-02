import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type InterventionType = 'breathing' | 'savoring' | 'curiosity'

interface MicroInterventionProps {
  type: InterventionType
  t: Record<string, string>
  onDismiss: () => void
}

function BreathingExercise({ t }: { t: Record<string, string> }) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const [cycle, setCycle] = useState(0)
  const MAX_CYCLES = 3

  useEffect(() => {
    const durations = { inhale: 4000, hold: 2000, exhale: 6000 }
    const timer = setTimeout(() => {
      if (phase === 'inhale') setPhase('hold')
      else if (phase === 'hold') setPhase('exhale')
      else {
        const next = cycle + 1
        if (next >= MAX_CYCLES) return
        setCycle(next)
        setPhase('inhale')
      }
    }, durations[phase])
    return () => clearTimeout(timer)
  }, [phase, cycle])

  const phaseText = {
    inhale: t.breathIn ?? 'Breathe in...',
    hold: t.breathHold ?? 'Hold...',
    exhale: t.breathOut ?? 'Breathe out...',
  }

  const scaleValues = { inhale: 1.2, hold: 1.2, exhale: 0.9 }

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
      <p className="text-gray-500 text-xs">{cycle + 1} / {MAX_CYCLES}</p>
    </div>
  )
}

function SavoringExercise({ t }: { t: Record<string, string> }) {
  const [step, setStep] = useState(0)
  const steps = [
    t.savorStep1 ?? 'Close your eyes for a moment.',
    t.savorStep2 ?? 'Recall the situation that brought this feeling.',
    t.savorStep3 ?? 'Notice where you feel it in your body.',
    t.savorStep4 ?? 'Breathe and let it expand.',
  ]

  useEffect(() => {
    if (step >= steps.length - 1) return
    const timer = setTimeout(() => setStep((s) => s + 1), 4000)
    return () => clearTimeout(timer)
  }, [step, steps.length])

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

export function MicroIntervention({ type, t, onDismiss }: MicroInterventionProps) {
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

      {type === 'breathing' && <BreathingExercise t={t} />}
      {type === 'savoring' && <SavoringExercise t={t} />}
      {type === 'curiosity' && <CuriosityPrompt t={t} />}

      <button
        onClick={onDismiss}
        className="mt-6 text-sm text-gray-500 hover:text-gray-400 transition-colors"
      >
        {t.interventionDismiss ?? 'Continue'}
      </button>
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
