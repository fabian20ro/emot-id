export interface BaseEmotion {
  id: string
  label: { ro: string; en: string }
  description?: { ro: string; en: string }
  needs?: { ro: string; en: string }
  color: string
  intensity?: number
}

export interface AnalysisResult {
  id: string
  label: { ro: string; en: string }
  color: string
  description?: { ro: string; en: string }
  needs?: { ro: string; en: string }
  componentLabels?: { ro: string; en: string }[]
  hierarchyPath?: { ro: string; en: string }[]
  matchStrength?: { ro: string; en: string }
  valence?: number
  arousal?: number
}

export interface ModelState {
  visibleEmotionIds: Map<string, number>
  currentGeneration: number
}

export interface SelectionEffect {
  newState: ModelState
  newSelections?: BaseEmotion[]
}

export interface VisualizationProps {
  emotions: BaseEmotion[]
  onSelect: (emotion: BaseEmotion) => void
  onDeselect: (emotion: BaseEmotion) => void
  sizes: Map<string, 'small' | 'medium' | 'large'>
  selections?: BaseEmotion[]
}

export interface EmotionModel<E extends BaseEmotion = BaseEmotion> {
  id: string
  name: { ro: string; en: string }
  description: { ro: string; en: string }
  allEmotions: Record<string, E>
  initialState: ModelState
  onSelect(emotion: E, state: ModelState, selections: E[]): SelectionEffect
  onDeselect(emotion: E, state: ModelState): SelectionEffect
  onClear(): ModelState
  analyze(selections: E[]): AnalysisResult[]
  getEmotionSize?(emotionId: string, state: ModelState): 'small' | 'medium' | 'large'
}
