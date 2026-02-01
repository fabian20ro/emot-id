import { useState, useCallback, useEffect } from 'react'
import { Onboarding } from './components/Onboarding'
import { Header } from './components/Header'
import { SelectionBar } from './components/SelectionBar'
import { AnalyzeButton } from './components/AnalyzeButton'
import { ResultModal } from './components/ResultModal'
import { useSound } from './hooks/useSound'
import { useEmotionModel } from './hooks/useEmotionModel'
import { defaultModelId, getVisualization } from './models/registry'
import { BubbleField } from './components/BubbleField'
import type { BaseEmotion, AnalysisResult } from './models/types'

export default function App() {
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
  const { playSound } = useSound()

  const handleSelect = useCallback(
    (emotion: BaseEmotion) => {
      playSound('select')
      modelSelect(emotion)
    },
    [playSound, modelSelect]
  )

  const handleDeselect = useCallback(
    (emotion: BaseEmotion) => {
      playSound('deselect')
      modelDeselect(emotion)
    },
    [playSound, modelDeselect]
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

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      <Header modelId={modelId} onModelChange={setModelId} />

      <div className="px-4 pt-2 max-w-md mx-auto w-full">
        <AnalyzeButton
          disabled={selections.length === 0}
          onClick={analyzeEmotions}
          modelId={modelId}
        />
      </div>

      <SelectionBar
        selections={selections}
        combos={combos}
        onDeselect={handleDeselect}
        onClear={handleClear}
      />

      <Visualization
        emotions={visibleEmotions}
        onSelect={handleSelect}
        onDeselect={handleDeselect}
        sizes={sizes}
        selections={selections}
      />

      <ResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExploreMore={handleClear}
        selections={selections}
        results={analysisResults}
      />

      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}
    </div>
  )
}
