import { useMemo } from 'react'
import emotionsData from '../data/emotions.json'
import type { Emotion } from '../components/Bubble'

type EmotionsMap = Record<string, Emotion>
const emotions = emotionsData as EmotionsMap

export interface CombinedEmotion extends Emotion {
  isCombined: true
  componentIds: string[]
}

export interface DetectedCombination {
  combinedEmotion: Emotion
  componentIds: string[]
}

// Build a map of component pairs to their combined emotions
const dyadMap = new Map<string, Emotion>()
Object.values(emotions).forEach((emotion) => {
  if (emotion.components && emotion.components.length === 2) {
    const key1 = `${emotion.components[0]}|${emotion.components[1]}`
    const key2 = `${emotion.components[1]}|${emotion.components[0]}`
    dyadMap.set(key1, emotion)
    dyadMap.set(key2, emotion)
  }
})

export function findDyad(id1: string, id2: string): Emotion | null {
  const key = `${id1}|${id2}`
  return dyadMap.get(key) || null
}

export function useCombinations(selections: Emotion[]) {
  return useMemo(() => {
    const result: DetectedCombination[] = []

    if (selections.length < 2) return result

    // Check last 2 selections for dyad
    const last = selections[selections.length - 1]
    const secondLast = selections[selections.length - 2]

    const dyad = findDyad(last.id, secondLast.id)
    if (dyad) {
      result.push({
        combinedEmotion: dyad,
        componentIds: [secondLast.id, last.id]
      })
    }

    return result
  }, [selections])
}

export function getComponentEmotions(combinedEmotion: Emotion): Emotion[] {
  if (!combinedEmotion.components) return []
  return combinedEmotion.components
    .map(id => emotions[id])
    .filter((e): e is Emotion => e !== undefined)
}
