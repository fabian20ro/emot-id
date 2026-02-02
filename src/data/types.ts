import type { AnalysisResult } from '../models/types'
import type { CrisisTier } from '../models/distress'

/** Serialized selection — model-agnostic representation of what the user picked. */
export interface SerializedSelection {
  emotionId: string
  label: { ro: string; en: string }
  /** Model-specific extras (e.g. sensation type, intensity for somatic) */
  extras?: Record<string, unknown>
}

/** A single completed analysis session. */
export interface Session {
  id: string
  timestamp: number
  modelId: string
  selections: SerializedSelection[]
  results: AnalysisResult[]
  crisisTier: CrisisTier
  reflectionAnswer?: 'yes' | 'partly' | 'no'
}
