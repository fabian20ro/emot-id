import type { EmotionModel, ModelState, SelectionEffect, AnalysisResult } from '../types'
import { MODEL_IDS } from '../constants'
import type { WheelEmotion } from './types'
import happyData from './data/happy.json'
import surprisedData from './data/surprised.json'
import badData from './data/bad.json'
import fearfulData from './data/fearful.json'
import angryData from './data/angry.json'
import disgustedData from './data/disgusted.json'
import sadData from './data/sad.json'

const allEmotions = {
  ...happyData,
  ...surprisedData,
  ...badData,
  ...fearfulData,
  ...angryData,
  ...disgustedData,
  ...sadData,
} as Record<string, WheelEmotion>

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
  id: MODEL_IDS.WHEEL,
  name: { ro: 'Roata emotiilor', en: 'Emotion Wheel' },
  shortName: { ro: 'Roata', en: 'Wheel' },
  description: {
    ro: 'Navigare ierarhica pe 3 nivele (bazat pe Parrott, 2001) — de la emotii generale la specifice prin explorare in profunzime',
    en: '3-level hierarchical navigation (based on Parrott, 2001) — from general to specific emotions through drill-down exploration',
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

  getEmotionSize(_emotionId: string, _state: ModelState): 'small' | 'medium' | 'large' {
    return 'large'
  },
}
