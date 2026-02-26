import type { EmotionModel, ModelState, SelectionEffect, AnalysisResult } from '../types'
import { MODEL_IDS } from '../constants'
import type { WheelEmotion } from './types'
import happy1Data from './data/happy-1.json'
import happy2Data from './data/happy-2.json'
import surprisedData from './data/surprised.json'
import badData from './data/bad.json'
import fearful1Data from './data/fearful-1.json'
import fearful2Data from './data/fearful-2.json'
import angry1Data from './data/angry-1.json'
import angry2Data from './data/angry-2.json'
import disgustedData from './data/disgusted.json'
import sad1Data from './data/sad-1.json'
import sad2Data from './data/sad-2.json'

const allEmotions = {
  ...happy1Data,
  ...happy2Data,
  ...surprisedData,
  ...badData,
  ...fearful1Data,
  ...fearful2Data,
  ...angry1Data,
  ...angry2Data,
  ...disgustedData,
  ...sad1Data,
  ...sad2Data,
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
