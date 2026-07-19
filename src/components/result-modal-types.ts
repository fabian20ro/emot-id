import type { BaseEmotion, AnalysisResult } from '../models/types'

export type ReflectionState = 'results' | 'reflection' | 'warmClose' | 'followUp' | 'intervention'
export type ReflectionAnswer = 'yes' | 'partly' | 'no' | null
export type InterventionResponse = 'better' | 'same' | 'worse' | null

/** Required keys for each intervention offer type */
const OFFER_KEY_MAP: Record<string, string> = {
  breathing: 'offerBreathing',
  savoring: 'offerSavoring',
  curiosity: 'offerCuriosity',
}

export function getInterventionOfferText(
  type: 'breathing' | 'savoring' | 'curiosity',
  t: Record<string, string>
): string {
  const key = OFFER_KEY_MAP[type]
  return t[key] ?? (t as Record<string, unknown>)['offerBreathing'] as string | undefined ??
    t.offerCuriosity ??
    'What might these feelings be telling you?'
}

export interface ResultModalProps {
  isOpen: boolean
  onClose: () => void
  onExploreMore?: () => void
  onSwitchModel?: (modelId: string) => void
  onSessionComplete?: (data: { reflectionAnswer: ReflectionAnswer; interventionResponse: InterventionResponse }) => void
  /** When true, escalates crisis tier by one level (temporal pattern detected) */
  escalateCrisis?: boolean
  currentModelId?: string
  allowExternalAI?: boolean
  selections: BaseEmotion[]
  results: AnalysisResult[]
}
