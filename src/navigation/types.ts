import type { AnalysisResult, BaseEmotion } from '../models/types'
import type { CrisisTier } from '../models/distress'

export type AppTab = 'today' | 'explore' | 'journal'
export type CheckInRoute = 'quick' | 'body' | 'affect' | 'words' | 'plutchik'

export type AppDestination =
  | { name: AppTab }
  | { name: 'arrival' }
  | { name: 'check-in'; route: Exclude<CheckInRoute, 'quick'> }
  | { name: 'reflection' }
  | { name: 'session'; sessionId: string }
  | { name: 'settings' }
  | { name: 'privacy' }
  | { name: 'support' }
  | { name: 'granularity' }
  | { name: 'chain' }

export interface CheckInCompletion {
  route: CheckInRoute
  modelId: string
  selections: BaseEmotion[]
  results: AnalysisResult[]
  crisisTier: CrisisTier
  temporalEscalation: boolean
}
