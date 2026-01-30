import { useState, useCallback } from 'react'
import { Header } from './components/Header'
import { SelectionBar } from './components/SelectionBar'
import { BubbleField } from './components/BubbleField'
import { AnalyzeButton } from './components/AnalyzeButton'
import { ResultModal } from './components/ResultModal'
import { useSound } from './hooks/useSound'
import { useEmotionModel } from './hooks/useEmotionModel'
import { defaultModelId } from './models/registry'
import type { BaseEmotion, AnalysisResult } from './models/types'

export default function App() {
  const [modelId, setModelId] = useState(defaultModelId)

  const {
    selections,
    visibleEmotions,
    sizes,
    handleSelect: modelSelect,
    handleDeselect: modelDeselect,
    handleClear: modelClear,
    analyze,
  } = useEmotionModel(modelId)

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      <Header modelId={modelId} onModelChange={setModelId} />

      <div className="px-4 pt-4 max-w-md mx-auto w-full">
        <AnalyzeButton
          disabled={selections.length === 0}
          onClick={analyzeEmotions}
        />
      </div>

      <SelectionBar
        selections={selections}
        onDeselect={handleDeselect}
        onClear={handleClear}
      />

      <BubbleField
        emotions={visibleEmotions}
        onSelect={handleSelect}
        sizes={sizes}
      />

      <ResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selections={selections}
        results={analysisResults}
      />
    </div>
  )
}
