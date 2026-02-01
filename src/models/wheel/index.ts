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
  description: {
    ro: 'Navigare ierarhica pe 3 nivele — de la emotii generale la specifice prin explorare in profunzime',
    en: '3-level hierarchical navigation — from general to specific emotions through drill-down exploration',
  },
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

    // Leaf node: add to selections, then reset to root for next pick
    return {
      newState: {
        visibleEmotionIds: new Map(CENTER_IDS.map((id) => [id, 0])),
        currentGeneration: 0,
      },
    }
  },

  onDeselect(_emotion: WheelEmotion, _state: ModelState): SelectionEffect {
    // Reset to root — let the hook's default behavior remove only the deselected emotion
    return {
      newState: {
        visibleEmotionIds: new Map(CENTER_IDS.map((id) => [id, 0])),
        currentGeneration: 0,
      },
    }
  },

  onClear(): ModelState {
    return {
      visibleEmotionIds: new Map(CENTER_IDS.map((id) => [id, 0])),
      currentGeneration: 0,
    }
  },

  analyze(selections: WheelEmotion[]): AnalysisResult[] {
    return selections.map((s) => {
      const path: { ro: string; en: string }[] = []
      let current: WheelEmotion | undefined = s
      let depth = 0
      while (current && depth < 10) {
        path.push(current.label)
        current = current.parent ? allEmotions[current.parent] : undefined
        depth++
      }
      path.reverse()

      return {
        id: s.id,
        label: s.label,
        color: s.color,
        description: s.description,
        needs: s.needs,
        hierarchyPath: path.length > 1 ? path : undefined,
      }
    })
  },

  getEmotionSize(emotionId: string, state: ModelState): 'small' | 'medium' | 'large' {
    const emotion = allEmotions[emotionId]
    if (!emotion) return 'medium'
    if (emotion.level === 0) return 'large'

    const visibleCount = state.visibleEmotionIds.size
    if (visibleCount <= 4) return 'large'
    if (visibleCount <= 8) return 'medium'

    if (emotion.level === 1) return 'medium'
    return 'small'
  },
}
