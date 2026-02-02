import { useState, useEffect, useCallback } from 'react'
import { defaultModelId, getVisualization } from '../models/registry'
import { storage } from '../data/storage'

export function useModelSelection() {
  const [modelId, setModelId] = useState(() => {
    const saved = storage.get('model')
    return saved && getVisualization(saved) ? saved : defaultModelId
  })

  useEffect(() => {
    storage.set('model', modelId)
  }, [modelId])

  const switchModel = useCallback((newModelId: string) => {
    setModelId(newModelId)
  }, [])

  return { modelId, switchModel }
}
