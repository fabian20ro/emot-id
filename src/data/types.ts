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
  interventionResponse?: 'better' | 'same' | 'worse'
}

export interface ChainAnalysisEntry {
  id: string
  timestamp: number
  triggeringEvent: string
  vulnerabilityFactors: string
  promptingEvent: string
  emotion: string
  urge: string
  action: string
  consequence: string
}
