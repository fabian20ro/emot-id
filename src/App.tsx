import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Onboarding } from './components/Onboarding'
import { Header } from './components/Header'
import { SelectionBar } from './components/SelectionBar'
import { AnalyzeButton } from './components/AnalyzeButton'
import { ResultModal } from './components/ResultModal'
import { VisualizationErrorBoundary } from './components/VisualizationErrorBoundary'
import { useSound } from './hooks/useSound'
import { useEmotionModel } from './hooks/useEmotionModel'
import { useLanguage } from './context/LanguageContext'
import { defaultModelId, getVisualization } from './models/registry'
import { MODEL_IDS } from './models/constants'
import { BubbleField } from './components/BubbleField'
import type { BaseEmotion, AnalysisResult } from './models/types'

function FirstInteractionHint({ modelId }: { modelId: string }) {
  const { t } = useLanguage()
  const hintsT = (t as Record<string, Record<string, string>>).firstHint ?? {}

  const text = hintsT[modelId] ?? hintsT.wheel ?? 'Tap an emotion that resonates with you'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-2 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-indigo-600/90 backdrop-blur-sm rounded-full text-sm text-white shadow-lg pointer-events-none"
    >
      {text}
    </motion.div>
  )
}

function DontKnowModal({ onSelectModel, onClose }: { onSelectModel: (id: string) => void; onClose: () => void }) {
  const { t } = useLanguage()
  const dontKnowT = (t as Record<string, Record<string, string>>).dontKnow ?? {}

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">
          {dontKnowT.title ?? "That's okay — here are two ways to start"}
        </h3>
        <div className="space-y-3">
          <button
            onClick={() => { onSelectModel(MODEL_IDS.SOMATIC); onClose() }}
            className="w-full text-left p-3 rounded-xl bg-gray-700/50 hover:bg-gray-700 transition-colors"
          >
            <span className="text-white font-medium block">
              {dontKnowT.bodyOption ?? 'Start with your body'}
            </span>
            <span className="text-xs text-gray-400">
              {dontKnowT.bodyDesc ?? 'Notice physical sensations first'}
            </span>
          </button>
          <button
            onClick={() => { onSelectModel(MODEL_IDS.DIMENSIONAL); onClose() }}
            className="w-full text-left p-3 rounded-xl bg-gray-700/50 hover:bg-gray-700 transition-colors"
          >
            <span className="text-white font-medium block">
              {dontKnowT.dimensionalOption ?? 'Start with pleasant/unpleasant'}
            </span>
            <span className="text-xs text-gray-400">
              {dontKnowT.dimensionalDesc ?? 'Locate your state on a simple scale'}
            </span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function getHintStorageKey(modelId: string): string {
  return `emot-id-hint-${modelId}`
}

export default function App() {
  const { language, t } = useLanguage()
  const dontKnowT = (t as Record<string, Record<string, string>>).dontKnow ?? {}

  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return localStorage.getItem('emot-id-onboarded') !== 'true'
    } catch {
      return false
    }
  })

  const [modelId, setModelId] = useState(() => {
    try {
      const saved = localStorage.getItem('emot-id-model')
      if (saved && getVisualization(saved)) return saved
    } catch {
      // localStorage may be unavailable in private browsing
    }
    return defaultModelId
  })

  useEffect(() => {
    try {
      localStorage.setItem('emot-id-model', modelId)
    } catch {
      // localStorage may be unavailable in private browsing
    }
  }, [modelId])

  const {
    selections,
    visibleEmotions,
    sizes,
    combos,
    handleSelect: modelSelect,
    handleDeselect: modelDeselect,
    handleClear: modelClear,
    analyze,
  } = useEmotionModel(modelId)

  const Visualization = getVisualization(modelId) ?? BubbleField

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [showDontKnow, setShowDontKnow] = useState(false)
  const { playSound, muted, setMuted } = useSound()

  // First interaction hint — per model, dismissed on first selection
  const [showHint, setShowHint] = useState(() => {
    try {
      return !localStorage.getItem(getHintStorageKey(modelId))
    } catch {
      return false
    }
  })

  // Reset hint state when model changes
  useEffect(() => {
    try {
      setShowHint(!localStorage.getItem(getHintStorageKey(modelId)))
    } catch {
      setShowHint(false)
    }
  }, [modelId])

  const dismissHint = useCallback(() => {
    setShowHint(false)
    try {
      localStorage.setItem(getHintStorageKey(modelId), 'true')
    } catch {
      // ignore
    }
  }, [modelId])

  const handleSelect = useCallback(
    (emotion: BaseEmotion) => {
      if (showHint) dismissHint()
      playSound('select')
      modelSelect(emotion)
    },
    [playSound, modelSelect, showHint, dismissHint],
  )

  const handleDeselect = useCallback(
    (emotion: BaseEmotion) => {
      playSound('deselect')
      modelDeselect(emotion)
    },
    [playSound, modelDeselect],
  )

  const handleClear = useCallback(() => {
    playSound('deselect')
    modelClear()
  }, [playSound, modelClear])

  const analyzeEmotions = useCallback(() => {
    if (selections.length === 0) return
    const results = analyze()
    setAnalysisResults(results)
    setIsModalOpen(true)
  }, [selections, analyze])

  const handleSwitchModel = useCallback((newModelId: string) => {
    setModelId(newModelId)
  }, [])

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      <Header
        modelId={modelId}
        onModelChange={setModelId}
        soundMuted={muted}
        onSoundMutedChange={setMuted}
      />

      <div className="px-4 pt-2 max-w-md mx-auto w-full">
        <AnalyzeButton
          disabled={selections.length === 0}
          onClick={analyzeEmotions}
          modelId={modelId}
        />
        {/* "I don't know" entry point */}
        {selections.length === 0 && (
          <button
            onClick={() => setShowDontKnow(true)}
            className="block mx-auto mt-1 text-xs text-gray-500 hover:text-gray-400 transition-colors"
          >
            {dontKnowT.link ?? "I don't know what I'm feeling"}
          </button>
        )}
      </div>

      <SelectionBar
        selections={selections}
        combos={combos}
        onDeselect={handleDeselect}
        onClear={handleClear}
      />

      <VisualizationErrorBoundary key={modelId} onReset={modelClear} language={language}>
        <div className="relative flex-1">
          <AnimatePresence>
            {showHint && !showOnboarding && selections.length === 0 && (
              <FirstInteractionHint modelId={modelId} />
            )}
          </AnimatePresence>
          <Visualization
            emotions={visibleEmotions}
            onSelect={handleSelect}
            onDeselect={handleDeselect}
            sizes={sizes}
            selections={selections}
          />
        </div>
      </VisualizationErrorBoundary>

      <ResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExploreMore={handleClear}
        onSwitchModel={handleSwitchModel}
        currentModelId={modelId}
        selections={selections}
        results={analysisResults}
      />

      <AnimatePresence>
        {showDontKnow && (
          <DontKnowModal
            onSelectModel={handleSwitchModel}
            onClose={() => setShowDontKnow(false)}
          />
        )}
      </AnimatePresence>

      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}
    </div>
  )
}
