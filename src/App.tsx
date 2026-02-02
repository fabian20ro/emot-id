import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Onboarding } from './components/Onboarding'
import { Header } from './components/Header'
import { SelectionBar } from './components/SelectionBar'
import { AnalyzeButton } from './components/AnalyzeButton'
import { ResultModal } from './components/ResultModal'
import { DontKnowModal } from './components/DontKnowModal'
import { VisualizationErrorBoundary } from './components/VisualizationErrorBoundary'
import { useSound } from './hooks/useSound'
import { useEmotionModel } from './hooks/useEmotionModel'
import { useLanguage } from './context/LanguageContext'
import { defaultModelId, getVisualization } from './models/registry'
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
      className="mx-auto w-fit px-4 py-2 bg-indigo-600/90 backdrop-blur-sm rounded-full text-sm text-white shadow-lg pointer-events-none"
    >
      {text}
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

      <AnimatePresence>
        {showHint && !showOnboarding && selections.length === 0 && (
          <FirstInteractionHint modelId={modelId} />
        )}
      </AnimatePresence>

      <VisualizationErrorBoundary key={modelId} onReset={modelClear} language={language}>
        <div className="relative flex-1 min-h-0">
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
