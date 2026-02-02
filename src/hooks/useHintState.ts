import { useState, useEffect, useCallback } from 'react'
import { storage } from '../data/storage'

export function useHintState(modelId: string) {
  const [showHint, setShowHint] = useState(() => !storage.isHintDismissed(modelId))

  useEffect(() => {
    setShowHint(!storage.isHintDismissed(modelId))
  }, [modelId])

  const dismissHint = useCallback(() => {
    setShowHint(false)
    storage.dismissHint(modelId)
  }, [modelId])

  return { showHint, dismissHint }
}
