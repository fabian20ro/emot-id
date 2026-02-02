import { useState, useEffect, useCallback } from 'react'
import { storage } from '../data/storage'

/**
 * Manages per-model first-interaction hint visibility.
 * Hints are dismissed on first selection and persisted to localStorage.
 */
export function useHintState(modelId: string) {
  const [showHint, setShowHint] = useState(() => {
    return !storage.isHintDismissed(modelId)
  })

  useEffect(() => {
    setShowHint(!storage.isHintDismissed(modelId))
  }, [modelId])

  const dismissHint = useCallback(() => {
    setShowHint(false)
    storage.dismissHint(modelId)
  }, [modelId])

  return { showHint, dismissHint }
}
