import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { getModel } from '../models/registry'
import { MODEL_IDS } from '../models/constants'
import { ModalShell } from './ModalShell'
import type { BaseEmotion } from '../models/types'

const TRAINING_SETS = [
  ['anxiety', 'worry', 'fear'],
  ['sadness', 'grief', 'loneliness'],
  ['anger', 'frustration', 'resentment'],
  ['guilt', 'shame', 'embarrassment'],
  ['joy', 'content', 'relief'],
] as const

const SOURCE_MODELS = [MODEL_IDS.WHEEL, MODEL_IDS.PLUTCHIK, MODEL_IDS.DIMENSIONAL, MODEL_IDS.SOMATIC]

const TRAINING_FALLBACKS: Record<string, BaseEmotion> = {
  loneliness: { id: 'loneliness', label: { ro: 'singuratate', en: 'loneliness' }, color: '#6366F1' },
  relief: { id: 'relief', label: { ro: 'usurare', en: 'relief' }, color: '#10B981' },
}

function resolveEmotionById(id: string): BaseEmotion | null {
  for (const modelId of SOURCE_MODELS) {
    const model = getModel(modelId)
    if (!model) continue
    const emotion = model.allEmotions[id]
    if (emotion) return emotion
  }
  return TRAINING_FALLBACKS[id] ?? null
}

interface GranularityTrainingProps {
  isOpen: boolean
  onClose: () => void
}

export function GranularityTraining({ isOpen, onClose }: GranularityTrainingProps) {
  const { language, section } = useLanguage()
  const granularityT = section('granularity')
  const focusTrapRef = useFocusTrap(isOpen, onClose)
  const [setIndex, setSetIndex] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [usedNotSure, setUsedNotSure] = useState(false)

  const currentOptions = useMemo(
    () => TRAINING_SETS[setIndex]
      .map((id) => resolveEmotionById(id))
      .filter((emotion): emotion is BaseEmotion => emotion !== null),
    [setIndex]
  )

  const nextSet = () => {
    setSelectedId(null)
    setUsedNotSure(false)
    setSetIndex((prev) => (prev + 1) % TRAINING_SETS.length)
  }

  const handleClose = () => {
    setSelectedId(null)
    setUsedNotSure(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalShell
          onClose={handleClose}
          focusTrapRef={focusTrapRef}
          labelledBy="granularity-title"
          backdropClassName="fixed inset-0 z-[var(--z-backdrop)] bg-black/50 backdrop-blur-sm"
          viewportClassName="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
          panelClassName="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-5 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 id="granularity-title" className="text-lg font-semibold text-white">
              {granularityT.title ?? 'Emotional granularity'}
            </h2>
            <button
              onClick={handleClose}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-100 hover:bg-gray-700/60 transition-colors"
              aria-label={granularityT.close ?? 'Close'}
            >
              ×
            </button>
          </div>

          <p className="text-sm text-gray-300 mb-4">
            {granularityT.prompt ?? 'Which of these best describes what you feel?'}
          </p>

          <div className="space-y-2">
            {currentOptions.map((option) => {
              const active = selectedId === option.id
              return (
                <button
                  key={option.id}
                  onClick={() => {
                    setUsedNotSure(false)
                    setSelectedId(option.id)
                  }}
                  className={`w-full min-h-[44px] px-4 py-2 rounded-xl text-left text-sm transition-colors border ${
                    active
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-100'
                      : 'bg-gray-700/40 border-gray-700 text-gray-200 hover:bg-gray-700/70'
                  }`}
                >
                  {option.label[language]}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => {
              setSelectedId(null)
              setUsedNotSure(true)
            }}
            className={`w-full mt-3 min-h-[44px] px-4 py-2 rounded-xl text-sm transition-colors border ${
              usedNotSure
                ? 'bg-gray-600/40 border-gray-500 text-gray-100'
                : 'bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            {granularityT.notSure ?? "I'm not sure — they all fit"}
          </button>

          {(selectedId || usedNotSure) && (
            <button
              onClick={nextSet}
              className="w-full mt-4 min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors"
            >
              {granularityT.next ?? 'Next'}
            </button>
          )}
        </ModalShell>
      )}
    </AnimatePresence>
  )
}
