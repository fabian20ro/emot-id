import { useState, useEffect, useCallback } from 'react'
import {
  getAllChainAnalyses,
  saveChainAnalysis,
  clearAllChainAnalyses,
} from '../data/chain-analysis-repo'
import type { ChainAnalysisEntry } from '../data/types'

export function useChainAnalysis() {
  const [entries, setEntries] = useState<ChainAnalysisEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllChainAnalyses()
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [])

  const save = useCallback(async (entry: ChainAnalysisEntry) => {
    await saveChainAnalysis(entry)
    setEntries((prev) => [entry, ...prev.filter((item) => item.id !== entry.id)])
  }, [])

  const clearAll = useCallback(async () => {
    await clearAllChainAnalyses()
    setEntries([])
  }, [])

  return {
    entries,
    loading,
    save,
    clearAll,
  }
}
