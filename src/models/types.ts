export interface BaseEmotion {
  id: string
  label: { ro: string; en: string }
  color: string
  intensity?: number
}

export interface AnalysisResult {
  id: string
  label: { ro: string; en: string }
  color: string
  description?: string
  componentLabels?: { ro: string; en: string }[]
}

export interface ModelState {
  visibleEmotionIds: Map<string, number>
  currentGeneration: number
}

export interface SelectionEffect {
  newState: ModelState
}

export interface EmotionModel<E extends BaseEmotion = BaseEmotion> {
  id: string
  name: string
  allEmotions: Record<string, E>
  initialState: ModelState
  onSelect(emotion: E, state: ModelState, selections: E[]): SelectionEffect
  onDeselect(emotion: E, state: ModelState): SelectionEffect
  onClear(): ModelState
  analyze(selections: E[]): AnalysisResult[]
  getEmotionSize(emotionId: string, state: ModelState): 'small' | 'medium' | 'large'
}
