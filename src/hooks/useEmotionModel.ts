import { useState, useMemo, useCallback } from 'react'
import type { BaseEmotion, AnalysisResult, ModelState } from '../models/types'
import { getModel, defaultModelId } from '../models/registry'

export function useEmotionModel(modelId: string = defaultModelId) {
  const model = getModel(modelId)!

  const [selections, setSelections] = useState<BaseEmotion[]>([])
  const [modelState, setModelState] = useState<ModelState>(() => model.initialState)

  const visibleEmotions = useMemo(() => {
    const ids = Array.from(modelState.visibleEmotionIds.keys())
    return ids
      .map((id) => model.allEmotions[id])
      .filter((e): e is BaseEmotion => e !== undefined)
  }, [modelState.visibleEmotionIds, model.allEmotions])

  const sizes = useMemo(() => {
    const map = new Map<string, 'small' | 'medium' | 'large'>()
    for (const id of modelState.visibleEmotionIds.keys()) {
      map.set(id, model.getEmotionSize(id, modelState))
    }
    return map
  }, [modelState, model])

  const handleSelect = useCallback(
    (emotion: BaseEmotion) => {
      setSelections((prev) => {
        if (prev.find((e) => e.id === emotion.id)) return prev
        return [...prev, emotion]
      })

      setModelState((prevState) => {
        // Get current selections for spawn filtering
        // Note: we read from the state updater to avoid stale closure
        const effect = model.onSelect(emotion, prevState, [] as BaseEmotion[])
        return effect.newState
      })
    },
    [model]
  )

  const handleDeselect = useCallback(
    (emotion: BaseEmotion) => {
      setSelections((prev) => prev.filter((e) => e.id !== emotion.id))

      setModelState((prevState) => {
        const effect = model.onDeselect(emotion, prevState)
        return effect.newState
      })
    },
    [model]
  )

  const handleClear = useCallback(() => {
    setSelections([])
    setModelState(model.onClear())
  }, [model])

  const analyze = useCallback((): AnalysisResult[] => {
    return model.analyze(selections)
  }, [model, selections])

  return {
    selections,
    visibleEmotions,
    sizes,
    handleSelect,
    handleDeselect,
    handleClear,
    analyze,
  }
}
