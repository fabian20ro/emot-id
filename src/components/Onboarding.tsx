import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { storage } from '../data/storage'
import { getAvailableModels } from '../models/registry'

interface OnboardingProps {
  onComplete: (modelId: string | null) => void
}

const SCREEN_ICONS = ['🔍', '💡', '🧭', 'ℹ️']

export function Onboarding({ onComplete }: OnboardingProps) {
  const { section, language, simpleLanguage } = useLanguage()
  const onboardingT = section('onboarding')

  const [step, setStep] = useState(0)
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  const focusTrapRef = useFocusTrap(true)
  const availableModels = getAvailableModels()

  const screens = [
    {
      title: onboardingT.screen1Title,
      body: (simpleLanguage ? onboardingT.screen1BodySimple : undefined) ?? onboardingT.screen1Body,
    },
    {
      title: onboardingT.screen2Title,
      body: (simpleLanguage ? onboardingT.screen2BodySimple : undefined) ?? onboardingT.screen2Body,
    },
    {
      title: onboardingT.screen3Title,
      body: (simpleLanguage ? onboardingT.screen3BodySimple : undefined) ?? onboardingT.screen3Body,
    },
    {
      title: onboardingT.screen4Title,
      body: (simpleLanguage ? onboardingT.screen4BodySimple : undefined) ?? onboardingT.screen4Body,
    },
  ]

  const finish = useCallback(() => {
    storage.set('onboarded', 'true')
    onComplete(selectedModelId)
  }, [onComplete, selectedModelId])

  const handleNext = useCallback(() => {
    if (step < screens.length - 1) {
      setStep((s) => s + 1)
    } else {
      if (!selectedModelId) return
      finish()
    }
  }, [step, screens.length, finish, selectedModelId])

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(0, s - 1))
  }, [])

  const current = screens[step]
  const isLast = step === screens.length - 1

  return (
    <div
      className="fixed inset-0 z-[var(--z-onboarding)] bg-gray-900 flex items-center justify-center px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
      role="dialog"
      aria-modal="true"
    >
      <div ref={focusTrapRef} className="max-w-sm w-full max-h-[90vh] overflow-y-auto flex flex-col items-center text-center gap-5 rounded-2xl border border-gray-700/60 bg-gray-900/70 p-5">
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

          {isLast && (
            <div className="w-full mt-2">
              <p className="text-xs text-gray-400 mb-2">
                {onboardingT.selectModel ?? 'Choose your starting model'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {availableModels.map((model) => {
                  const active = selectedModelId === model.id
                  return (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModelId(model.id)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs text-left transition-colors ${
                        active
                          ? 'border-indigo-400 bg-indigo-600/30 text-indigo-100'
                          : 'border-gray-700 bg-gray-800/60 text-gray-200 hover:bg-gray-700'
                      }`}
                    >
                      {model.name[language]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-3 w-full">
          {step > 0 ? (
            <button
              onClick={handleBack}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-gray-700 text-sm text-gray-200 hover:border-gray-500 hover:text-white transition-colors"
              aria-label={onboardingT.back ?? 'Back'}
            >
              {onboardingT.back ?? 'Back'}
            </button>
          ) : (
            <div className="min-h-[44px] min-w-[44px]" aria-hidden="true" />
          )}

          <div className="flex-1" />

          <button
            onClick={handleNext}
            disabled={isLast && !selectedModelId}
            className="min-h-[44px] px-6 py-2 text-sm bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-colors disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            aria-label={isLast ? (onboardingT.getStarted ?? 'Get started') : (onboardingT.next ?? 'Next')}
          >
            {isLast ? (onboardingT.getStarted ?? 'Get started') : (onboardingT.next ?? 'Next')}
          </button>
        </div>

      </div>
    </div>
  )
}
