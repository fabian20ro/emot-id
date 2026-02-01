import type { EmotionModel, ModelState, SelectionEffect, AnalysisResult } from '../types'
import type { WheelEmotion } from './types'
import emotionsData from './data.json'

const allEmotions = emotionsData as Record<string, WheelEmotion>

const CENTER_IDS = [
  'happy',
  'surprised',
  'bad',
  'fearful',
  'angry',
  'disgusted',
  'sad',
]

export const wheelModel: EmotionModel<WheelEmotion> = {
  id: 'wheel',
  name: 'Emotion Wheel',
  allEmotions,

  get initialState(): ModelState {
    return {
      visibleEmotionIds: new Map(CENTER_IDS.map((id) => [id, 0])),
      currentGeneration: 0,
    }
  },

  onSelect(emotion: WheelEmotion, state: ModelState, selections: WheelEmotion[]): SelectionEffect {
    const newGen = state.currentGeneration + 1

    if (emotion.children?.length) {
      // Has children: drill down — show children, hide current level
      // Don't add branch node to selections
      const newMap = new Map<string, number>()
      for (const childId of emotion.children) {
        newMap.set(childId, newGen)
      }
      return {
        newState: {
          visibleEmotionIds: newMap,
          currentGeneration: newGen,
        },
        newSelections: selections,
      }
    }

    // Leaf node: keep current visible set, let default selection behavior add it
    return { newState: state }
  },

  onDeselect(emotion: WheelEmotion, state: ModelState): SelectionEffect {
    // Go back to showing siblings (parent's children, or root if no parent)
    const parent = emotion.parent ? allEmotions[emotion.parent] : null
    const siblingsOrRoot = parent?.children ?? CENTER_IDS
    const gen = Math.max(0, state.currentGeneration - 1)
    const newMap = new Map(siblingsOrRoot.map((id) => [id, gen] as [string, number]))

    return {
      newState: {
        visibleEmotionIds: newMap,
        currentGeneration: gen,
      },
      newSelections: [],
    }
  },

  onClear(): ModelState {
    return {
      visibleEmotionIds: new Map(CENTER_IDS.map((id) => [id, 0])),
      currentGeneration: 0,
    }
  },

  analyze(selections: WheelEmotion[]): AnalysisResult[] {
    return selections.map((s) => ({
      id: s.id,
      label: s.label,
      color: s.color,
      description: s.description,
    }))
  },

  getEmotionSize(emotionId: string): 'small' | 'medium' | 'large' {
    const emotion = allEmotions[emotionId]
    if (!emotion) return 'medium'
    if (emotion.level === 0) return 'large'
    if (emotion.level === 1) return 'medium'
    return 'small'
  },
}
