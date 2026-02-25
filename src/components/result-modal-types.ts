import type { BaseEmotion, AnalysisResult } from '../models/types'

export type ReflectionState = 'results' | 'reflection' | 'warmClose' | 'followUp' | 'intervention'
export type ReflectionAnswer = 'yes' | 'partly' | 'no' | null
export type InterventionResponse = 'better' | 'same' | 'worse' | null

export function getInterventionOfferText(
  type: 'breathing' | 'savoring' | 'curiosity',
  t: Record<string, string>
): string {
  switch (type) {
    case 'breathing':
      return t.offerBreathing ?? 'Would you like to try something calming?'
    case 'savoring':
      return t.offerSavoring ?? 'Take a moment to savor this?'
    case 'curiosity':
      return t.offerCuriosity ?? 'What might these feelings be telling you?'
  }
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
  selections: BaseEmotion[]
  results: AnalysisResult[]
}
