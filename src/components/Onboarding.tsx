import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { storage } from '../data/storage'

interface OnboardingProps {
  onComplete: () => void
}

const SCREEN_ICONS = ['🔍', '💡', '🧭', 'ℹ️']

export function Onboarding({ onComplete }: OnboardingProps) {
  const { section } = useLanguage()
  const onboardingT = section('onboarding')

  const [step, setStep] = useState(0)
  const focusTrapRef = useFocusTrap(true)

  const screens = [
    { title: onboardingT.screen1Title, body: onboardingT.screen1Body },
    { title: onboardingT.screen2Title, body: onboardingT.screen2Body },
    { title: onboardingT.screen3Title, body: onboardingT.screen3Body },
    { title: onboardingT.screen4Title, body: onboardingT.screen4Body },
  ]

  const finish = useCallback(() => {
    storage.set('onboarded', 'true')
    onComplete()
  }, [onComplete])

  const handleNext = useCallback(() => {
    if (step < screens.length - 1) {
      setStep((s) => s + 1)
    } else {
      finish()
    }
  }, [step, screens.length, finish])

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(0, s - 1))
  }, [])

  const current = screens[step]
  const isLast = step === screens.length - 1

  return (
    <div className="fixed inset-0 z-[var(--z-onboarding)] bg-gray-900 flex items-center justify-center p-6" role="dialog" aria-modal="true">
      <div ref={focusTrapRef} className="max-w-sm w-full flex flex-col items-center text-center gap-6">
        {/* Step indicators */}
        <div className="flex gap-2">
          {screens.map((_, i) => (
            <div
              key={i}
              data-step={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? 'bg-indigo-400' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center gap-4"
        >
          <span className="text-4xl">{SCREEN_ICONS[step]}</span>
          <h2 className="text-xl font-semibold text-white">
            {current.title}
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            {current.body}
          </p>
        </motion.div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-3 w-full">
          {step > 0 ? (
            <button
              onClick={handleBack}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              aria-label={onboardingT.back ?? 'Back'}
            >
              {onboardingT.back ?? 'Back'}
            </button>
          ) : (
            <div />
          )}

          <div className="flex-1" />

          <button
            onClick={handleNext}
            className="px-6 py-2 text-sm bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-colors"
            aria-label={isLast ? (onboardingT.getStarted ?? 'Get started') : (onboardingT.next ?? 'Next')}
          >
            {isLast ? (onboardingT.getStarted ?? 'Get started') : (onboardingT.next ?? 'Next')}
          </button>
        </div>

        {!isLast && (
          <button
            onClick={finish}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            aria-label={onboardingT.skip ?? 'Skip'}
          >
            {onboardingT.skip ?? 'Skip'}
          </button>
        )}
      </div>
    </div>
  )
}
