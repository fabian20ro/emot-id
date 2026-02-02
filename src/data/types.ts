import type { AnalysisResult } from '../models/types'
import type { CrisisTier } from '../models/distress'

export interface SerializedSelection {
  emotionId: string
  label: { ro: string; en: string }
  extras?: Record<string, unknown>
}

export interface Session {
  id: string
  timestamp: number
  modelId: string
  selections: SerializedSelection[]
  results: AnalysisResult[]
  crisisTier: CrisisTier
  reflectionAnswer?: 'yes' | 'partly' | 'no'
}
