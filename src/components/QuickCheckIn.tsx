import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { getModel } from '../models/registry'
import { MODEL_IDS } from '../models/constants'
import { ModalShell } from './ModalShell'
import type { BaseEmotion, AnalysisResult } from '../models/types'

const QUICK_MODEL_ID = 'quick-check-in'
const QUICK_EMOTION_IDS = [
  'anxiety',
  'sadness',
  'anger',
  'joy',
  'fear',
  'shame',
  'despair',
  'helpless',
  'numb',
  'overwhelmed',
] as const

const SOURCE_MODELS = [MODEL_IDS.WHEEL, MODEL_IDS.PLUTCHIK, MODEL_IDS.DIMENSIONAL, MODEL_IDS.SOMATIC]

const QUICK_FALLBACKS: Record<string, BaseEmotion> = {
  numb: { id: 'numb', label: { ro: 'amorteala', en: 'numb' }, color: '#6B7280' },
  overwhelmed: { id: 'overwhelmed', label: { ro: 'coplesit', en: 'overwhelmed' }, color: '#8B5CF6' },
}

function resolveEmotionById(id: string): BaseEmotion | null {
  for (const modelId of SOURCE_MODELS) {
    const model = getModel(modelId)
    if (!model) continue
    const emotion = model.allEmotions[id]
    if (emotion) return emotion
  }
  return QUICK_FALLBACKS[id] ?? null
}

const QUICK_EMOTIONS = QUICK_EMOTION_IDS
  .map((id) => resolveEmotionById(id))
  .filter((e): e is BaseEmotion => e !== null)

interface QuickCheckInProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (selected: BaseEmotion[], results: AnalysisResult[]) => void
}

export function QuickCheckIn({ isOpen, onClose, onComplete }: QuickCheckInProps) {
  const { language, section } = useLanguage()
  const quickT = section('quickCheckIn')
  const focusTrapRef = useFocusTrap(isOpen, onClose)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const selectedCount = selectedIds.length

  const selectedEmotions = useMemo(
    () => QUICK_EMOTIONS.filter((emotion) => selectedIds.includes(emotion.id)),
    [selectedIds]
  )

  const toggleEmotion = (emotionId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(emotionId)) {
        return prev.filter((id) => id !== emotionId)
      }
      if (prev.length >= 3) {
        return prev
      }
      return [...prev, emotionId]
    })
  }

  const handleDone = () => {
    const results: AnalysisResult[] = selectedEmotions.map((emotion) => ({
      id: emotion.id,
      label: emotion.label,
      color: emotion.color,
      description: emotion.description,
      needs: emotion.needs,
      valence: (emotion as { valence?: number }).valence,
      arousal: (emotion as { arousal?: number }).arousal,
    }))
    onComplete(selectedEmotions, results)
    setSelectedIds([])
  }

  const handleClose = () => {
    setSelectedIds([])
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalShell
          onClose={handleClose}
          focusTrapRef={focusTrapRef}
          labelledBy="quick-checkin-title"
          backdropClassName="fixed inset-0 z-[var(--z-backdrop)] bg-black/55 backdrop-blur-sm"
          viewportClassName="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
          panelClassName="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-5 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 id="quick-checkin-title" className="text-lg font-semibold text-white">
              {quickT.title ?? 'Quick check-in'}
            </h2>
            <button
              onClick={handleClose}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-100 hover:bg-gray-700/60 transition-colors"
              aria-label={quickT.close ?? 'Close'}
            >
              ×
            </button>
          </div>

          <p className="text-sm text-gray-300 mb-3">
            {quickT.prompt ?? 'What describes how you feel right now?'}
          </p>
          <p className="text-xs text-gray-500 mb-4">
            {selectedCount}/3
          </p>

          <div className="grid grid-cols-2 gap-2">
            {QUICK_EMOTIONS.map((emotion) => {
              const active = selectedIds.includes(emotion.id)
              return (
                <button
                  key={emotion.id}
                  onClick={() => toggleEmotion(emotion.id)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${
                    active
                      ? 'text-white border-indigo-400 bg-indigo-500/30'
                      : 'text-gray-200 border-gray-700 bg-gray-700/40 hover:bg-gray-700/70'
                  }`}
                >
                  {emotion.label[language]}
                </button>
              )
            })}
          </div>

          <button
            onClick={handleDone}
            disabled={selectedCount === 0}
            className="w-full mt-4 min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {quickT.done ?? 'Done'}
          </button>
        </ModalShell>
      )}
    </AnimatePresence>
  )
}

export { QUICK_MODEL_ID, QUICK_EMOTION_IDS }
