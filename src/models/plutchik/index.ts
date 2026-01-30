import type { EmotionModel, ModelState, SelectionEffect, AnalysisResult } from '../types'
import type { PlutchikEmotion } from './types'
import emotionsData from './data.json'

const allEmotions = emotionsData as Record<string, PlutchikEmotion>

const INITIAL_EMOTION_IDS = [
  'joy',
  'trust',
  'fear',
  'surprise',
  'sadness',
  'disgust',
  'anger',
  'anticipation',
]

export const plutchikModel: EmotionModel<PlutchikEmotion> = {
  id: 'plutchik',
  name: "Plutchik's Wheel of Emotions",
  allEmotions,

  get initialState(): ModelState {
    return {
      visibleEmotionIds: new Map(INITIAL_EMOTION_IDS.map((id) => [id, 0])),
      currentGeneration: 0,
    }
  },

  onSelect(emotion: PlutchikEmotion, state: ModelState, selections: PlutchikEmotion[]): SelectionEffect {
    const newGen = state.currentGeneration + 1
    const newMap = new Map(state.visibleEmotionIds)
    newMap.delete(emotion.id)

    const spawns = emotion.spawns || []
    for (const spawnId of spawns) {
      if (allEmotions[spawnId] && !selections.find((s) => s.id === spawnId)) {
        if (!newMap.has(spawnId)) {
          newMap.set(spawnId, newGen)
        }
      }
    }

    return {
      newState: {
        visibleEmotionIds: newMap,
        currentGeneration: newGen,
      },
    }
  },

  onDeselect(emotion: PlutchikEmotion, state: ModelState): SelectionEffect {
    const newMap = new Map(state.visibleEmotionIds)
    const smallGen = Math.max(0, state.currentGeneration - 2)

    if (emotion.components) {
      emotion.components.forEach((id) => {
        if (allEmotions[id]) newMap.set(id, smallGen)
      })
    } else {
      newMap.set(emotion.id, smallGen)
    }

    return {
      newState: {
        visibleEmotionIds: newMap,
        currentGeneration: state.currentGeneration,
      },
    }
  },

  onClear(): ModelState {
    return {
      visibleEmotionIds: new Map(INITIAL_EMOTION_IDS.map((id) => [id, 0])),
      currentGeneration: 0,
    }
  },

  analyze(selections: PlutchikEmotion[]): AnalysisResult[] {
    if (selections.length === 0) return []

    if (selections.length === 1) {
      const s = selections[0]
      return [{ id: s.id, label: s.label, color: s.color }]
    }

    const results: AnalysisResult[] = []
    const selectionIds = new Set(selections.map((s) => s.id))

    for (const emotion of Object.values(allEmotions)) {
      if (emotion.components && emotion.components.length === 2) {
        const [c1, c2] = emotion.components
        if (selectionIds.has(c1) && selectionIds.has(c2)) {
          const comp1 = allEmotions[c1]
          const comp2 = allEmotions[c2]
          results.push({
            id: emotion.id,
            label: emotion.label,
            color: emotion.color,
            componentLabels: [comp1.label, comp2.label],
          })
        }
      }
    }

    return results
  },

  getEmotionSize(emotionId: string, state: ModelState): 'small' | 'medium' | 'large' {
    const gen = state.visibleEmotionIds.get(emotionId) ?? 0
    const diff = state.currentGeneration - gen
    if (diff === 0) return 'large'
    return 'small'
  },
}
