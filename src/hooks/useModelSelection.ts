import { useState, useEffect, useCallback } from 'react'
import { defaultModelId, getVisualization } from '../models/registry'
import { storage } from '../data/storage'

/**
 * Manages the active model ID with localStorage persistence.
 * Validates that saved model IDs reference valid registered models.
 */
export function useModelSelection() {
  const [modelId, setModelId] = useState(() => {
    const saved = storage.get('model')
    if (saved && getVisualization(saved)) return saved
    return defaultModelId
  })

  useEffect(() => {
    storage.set('model', modelId)
  }, [modelId])

  const switchModel = useCallback((newModelId: string) => {
    setModelId(newModelId)
  }, [])

  return { modelId, switchModel }
}
