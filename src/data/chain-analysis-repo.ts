import { createStore, get, set, del, keys } from 'idb-keyval'
import type { ChainAnalysisEntry } from './types'

const store = createStore('emot-id-chain-analysis', 'entries')

export async function saveChainAnalysis(entry: ChainAnalysisEntry): Promise<void> {
  await set(entry.id, entry, store)
}

export async function getAllChainAnalyses(): Promise<ChainAnalysisEntry[]> {
  const allKeys = await keys(store)
  const entries: ChainAnalysisEntry[] = []
  for (const key of allKeys) {
    const entry = await get<ChainAnalysisEntry>(key, store)
    if (entry) entries.push(entry)
  }
  return entries.sort((a, b) => b.timestamp - a.timestamp)
}

export async function clearAllChainAnalyses(): Promise<void> {
  const allKeys = await keys(store)
  for (const key of allKeys) {
    await del(key, store)
  }
}
