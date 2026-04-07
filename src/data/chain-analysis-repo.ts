import { createStore, set, del, keys, values } from 'idb-keyval'
import type { ChainAnalysisEntry } from './types'

const store = createStore('emot-id-chain-analysis', 'entries')

export async function saveChainAnalysis(entry: ChainAnalysisEntry): Promise<void> {
  await set(entry.id, entry, store)
}

export async function getAllChainAnalyses(): Promise<ChainAnalysisEntry[]> {
  const allValues = await values<ChainAnalysisEntry>(store)
  const entries = allValues.filter(entry => entry != null)
  return entries.sort((a, b) => b.timestamp - a.timestamp)
}

export async function clearAllChainAnalyses(): Promise<void> {
  const allKeys = await keys(store)
  for (const key of allKeys) {
    await del(key, store)
  }
}
