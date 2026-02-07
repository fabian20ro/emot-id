import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import type { BaseEmotion, AnalysisResult, ModelState } from '../models/types'
import { getModel, loadModel, defaultModelId } from '../models/registry'

export function useEmotionModel(modelId: string = defaultModelId) {
  const [model, setModel] = useState(() => getModel(modelId) ?? null)

  const [selections, setSelections] = useState<BaseEmotion[]>([])
  const [modelState, setModelState] = useState<ModelState>(() => model?.initialState ?? { visibleEmotionIds: new Map(), currentGeneration: 0 })
  const [modelReady, setModelReady] = useState(() => Boolean(model))
  const selectionsRef = useRef(selections)
  useEffect(() => {
    selectionsRef.current = selections
  }, [selections])

  useEffect(() => {
    let active = true
    setSelections([])
    const cached = getModel(modelId)
    if (cached) {
      setModel(cached)
      setModelState(cached.initialState)
      setModelReady(true)
      return () => {
        active = false
      }
    }

    setModel(null)
    setModelReady(false)
    setModelState({ visibleEmotionIds: new Map(), currentGeneration: 0 })
    void loadModel(modelId).then((loaded) => {
      if (!active || !loaded) return
      setModel(loaded)
      setModelState(loaded.initialState)
      setModelReady(true)
    })

    return () => {
      active = false
    }
  }, [modelId])

  const noopAnalyze = useCallback((): AnalysisResult[] => [], [])

  const visibleEmotions = useMemo(() => {
    if (!model) return []
    const ids = Array.from(modelState.visibleEmotionIds.keys())
    return ids
      .map((id) => model.allEmotions[id])
      .filter((e): e is BaseEmotion => e !== undefined)
  }, [modelState.visibleEmotionIds, model])

  const sizes = useMemo(() => {
    const map = new Map<string, 'small' | 'medium' | 'large'>()
    if (!model) return map
    for (const id of modelState.visibleEmotionIds.keys()) {
      map.set(id, model.getEmotionSize?.(id, modelState) ?? 'medium')
    }
    return map
  }, [modelState, model])

  const handleSelect = useCallback(
    (emotion: BaseEmotion) => {
      if (!model) return
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
      if (!model) return
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
    if (!model) return
    setSelections([])
    setModelState(model.onClear())
  }, [model])

  const restore = useCallback((savedSelections: BaseEmotion[], savedState: ModelState) => {
    setSelections(savedSelections)
    setModelState(savedState)
  }, [])

  const combos = useMemo(() => {
    if (!model) return []
    return selections.length < 2 ? [] : model.analyze(selections).filter((r) => r.componentLabels)
  }, [model, selections])

  const analyze = useCallback((): AnalysisResult[] => {
    if (!model) return noopAnalyze()
    return model.analyze(selections)
  }, [model, selections, noopAnalyze])

  return {
    modelReady,
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
