import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import type { BaseEmotion, AnalysisResult, ModelState } from '../models/types'
import { getModel, defaultModelId } from '../models/registry'

export function useEmotionModel(modelId: string = defaultModelId) {
  const model = getModel(modelId) ?? getModel(defaultModelId)!

  const [selections, setSelections] = useState<BaseEmotion[]>([])
  const [modelState, setModelState] = useState<ModelState>(() => model.initialState)
  const selectionsRef = useRef(selections)
  selectionsRef.current = selections

  useEffect(() => {
    setSelections([])
    setModelState(model.initialState)
  }, [modelId, model])

  const visibleEmotions = useMemo(() => {
    const ids = Array.from(modelState.visibleEmotionIds.keys())
    return ids
      .map((id) => model.allEmotions[id])
      .filter((e): e is BaseEmotion => e !== undefined)
  }, [modelState.visibleEmotionIds, model.allEmotions])

  const sizes = useMemo(() => {
    const map = new Map<string, 'small' | 'medium' | 'large'>()
    for (const id of modelState.visibleEmotionIds.keys()) {
      map.set(id, model.getEmotionSize?.(id, modelState) ?? 'medium')
    }
    return map
  }, [modelState, model])

  const handleSelect = useCallback(
    (emotion: BaseEmotion) => {
      setModelState((prevState) => {
        const effect = model.onSelect(emotion, prevState, selectionsRef.current)

        if (effect.newSelections !== undefined) {
          setSelections(effect.newSelections)
        } else {
          setSelections((prev) =>
            prev.find((e) => e.id === emotion.id) ? prev : [...prev, emotion]
          )
        }

        return effect.newState
      })
    },
    [model]
  )

  const handleDeselect = useCallback(
    (emotion: BaseEmotion) => {
      setModelState((prevState) => {
        const effect = model.onDeselect(emotion, prevState)

        if (effect.newSelections !== undefined) {
          setSelections(effect.newSelections)
        } else {
          setSelections((prev) => prev.filter((e) => e.id !== emotion.id))
        }

        return effect.newState
      })
    },
    [model]
  )

  const handleClear = useCallback(() => {
    setSelections([])
    setModelState(model.onClear())
  }, [model])

  const restore = useCallback((savedSelections: BaseEmotion[], savedState: ModelState) => {
    setSelections(savedSelections)
    setModelState(savedState)
  }, [])

  const combos = useMemo(() => {
    return selections.length < 2 ? [] : model.analyze(selections).filter((r) => r.componentLabels)
  }, [model, selections])

  const analyze = useCallback((): AnalysisResult[] => model.analyze(selections), [model, selections])

  return {
    selections,
    modelState,
    visibleEmotions,
    sizes,
    combos,
    handleSelect,
    handleDeselect,
    handleClear,
    restore,
    analyze,
  }
}
