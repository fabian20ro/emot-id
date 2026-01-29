import { useState, useMemo, useCallback } from 'react'
import { Header } from './components/Header'
import { SelectionBar } from './components/SelectionBar'
import { BubbleField } from './components/BubbleField'
import { AnalyzeButton } from './components/AnalyzeButton'
import { ResultModal } from './components/ResultModal'
import { useSound } from './hooks/useSound'
import emotionsData from './data/emotions.json'
import type { Emotion } from './components/Bubble'

const allEmotions = emotionsData as Record<string, Emotion>

const INITIAL_EMOTION_IDS = [
  'joy',
  'trust',
  'fear',
  'surprise',
  'sadness',
  'disgust',
  'anger',
  'anticipation',
]

export default function App() {
  const [selections, setSelections] = useState<Emotion[]>([])
  const [emotionGenerations, setEmotionGenerations] = useState<Map<string, number>>(
    () => new Map(INITIAL_EMOTION_IDS.map((id) => [id, 0]))
  )
  const [currentGeneration, setCurrentGeneration] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<Emotion[]>([])
  const { playSound } = useSound()

  const visibleEmotionIds = useMemo(
    () => Array.from(emotionGenerations.keys()),
    [emotionGenerations]
  )

  const visibleEmotions = useMemo(() => {
    return visibleEmotionIds
      .map((id) => allEmotions[id])
      .filter((e): e is Emotion => e !== undefined)
  }, [visibleEmotionIds])

  const handleSelect = useCallback(
    (emotion: Emotion) => {
      playSound('select')

      setSelections((prev) => {
        if (prev.find((e) => e.id === emotion.id)) {
          return prev
        }
        return [...prev, emotion]
      })

      // Use functional update to avoid stale closure issues
      setCurrentGeneration((prevGen) => {
        const newGen = prevGen + 1

        setEmotionGenerations((prevEmotions) => {
          const newMap = new Map(prevEmotions)
          newMap.delete(emotion.id)

          const spawns = emotion.spawns || []
          for (const spawnId of spawns) {
            if (allEmotions[spawnId] && !selections.find((s) => s.id === spawnId)) {
              // Only add if not already visible (don't overwrite existing generation)
              if (!newMap.has(spawnId)) {
                newMap.set(spawnId, newGen)
              }
            }
          }

          return newMap
        })

        return newGen
      })
    },
    [playSound, selections]
  )

  const handleDeselect = useCallback(
    (emotion: Emotion) => {
      playSound('deselect')
      setSelections((prev) => prev.filter((e) => e.id !== emotion.id))

      // Return emotion to pool with current generation (so it appears large)
      // Use functional update to get the latest generation value
      setCurrentGeneration((currentGen) => {
        setEmotionGenerations((prev) => {
          const newMap = new Map(prev)
          if (emotion.components) {
            // Combined emotion: return components to pool
            emotion.components.forEach((id) => {
              if (allEmotions[id]) newMap.set(id, currentGen)
            })
          } else {
            // Basic emotion: return to pool
            newMap.set(emotion.id, currentGen)
          }
          return newMap
        })
        return currentGen // Don't change generation on deselect
      })
    },
    [playSound]
  )

  const handleClear = useCallback(() => {
    playSound('deselect')
    setSelections([])
    setEmotionGenerations(new Map(INITIAL_EMOTION_IDS.map((id) => [id, 0])))
    setCurrentGeneration(0)
  }, [playSound])

  const analyzeEmotions = useCallback(() => {
    if (selections.length === 0) return

    if (selections.length === 1) {
      // Single selection: show it as the result
      setAnalysisResults([selections[0]])
      setIsModalOpen(true)
      return
    }

    // Multiple selections: find all dyad combinations
    const results: Emotion[] = []
    const selectionIds = new Set(selections.map((s) => s.id))

    for (const emotion of Object.values(allEmotions)) {
      if (emotion.components && emotion.components.length === 2) {
        const [c1, c2] = emotion.components
        if (selectionIds.has(c1) && selectionIds.has(c2)) {
          results.push(emotion)
        }
      }
    }

    setAnalysisResults(results)
    setIsModalOpen(true)
  }, [selections])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      <Header />
      <SelectionBar
        selections={selections}
        onDeselect={handleDeselect}
        onClear={handleClear}
      />

      <BubbleField
        emotions={visibleEmotions}
        onSelect={handleSelect}
        emotionGenerations={emotionGenerations}
        currentGeneration={currentGeneration}
      />

      <div className="p-4 max-w-md mx-auto w-full">
        <AnalyzeButton
          disabled={selections.length === 0}
          onClick={analyzeEmotions}
        />
      </div>

      <ResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selections={selections}
        results={analysisResults}
      />
    </div>
  )
}
