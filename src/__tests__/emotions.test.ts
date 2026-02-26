import { describe, it, expect } from 'vitest'
import { plutchikEmotions as emotionsData } from '../models/plutchik'

interface Emotion {
  id: string
  label: { ro: string; en: string }
  category: string
  color: string
  intensity: number
  opposite?: string
  spawns: string[]
  components?: string[]
}

const emotions = emotionsData as Record<string, Emotion>
const emotionIds = Object.keys(emotions)

describe('emotions.json graph integrity', () => {
  it('has expected number of emotions', () => {
    expect(emotionIds.length).toBeGreaterThanOrEqual(40)
  })

  it('has 8 primary emotions', () => {
    const primaryEmotions = emotionIds.filter((id) => emotions[id].category === 'primary')
    expect(primaryEmotions).toHaveLength(8)
  })

  it('all spawns reference existing emotions', () => {
    const invalidSpawns: string[] = []

    for (const id of emotionIds) {
      const emotion = emotions[id]
      for (const spawnId of emotion.spawns) {
        if (!emotions[spawnId]) {
          invalidSpawns.push(`${id} -> ${spawnId}`)
        }
      }
    }

    expect(invalidSpawns).toEqual([])
  })

  it('all opposites reference existing emotions', () => {
    const invalidOpposites: string[] = []

    for (const id of emotionIds) {
      const emotion = emotions[id]
      if (emotion.opposite && !emotions[emotion.opposite]) {
        invalidOpposites.push(`${id} -> ${emotion.opposite}`)
      }
    }

    expect(invalidOpposites).toEqual([])
  })

  it('all dyad components reference existing emotions', () => {
    const invalidComponents: string[] = []

    for (const id of emotionIds) {
      const emotion = emotions[id]
      if (emotion.components) {
        for (const componentId of emotion.components) {
          if (!emotions[componentId]) {
            invalidComponents.push(`${id} -> ${componentId}`)
          }
        }
      }
    }

    expect(invalidComponents).toEqual([])
  })

  it('all emotions have valid hex colors', () => {
    const invalidColors: string[] = []
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/

    for (const id of emotionIds) {
      const emotion = emotions[id]
      if (!hexColorRegex.test(emotion.color)) {
        invalidColors.push(`${id}: ${emotion.color}`)
      }
    }

    expect(invalidColors).toEqual([])
  })

  it('all emotions have both RO and EN labels', () => {
    const missingLabels: string[] = []

    for (const id of emotionIds) {
      const emotion = emotions[id]
      if (!emotion.label.ro || !emotion.label.en) {
        missingLabels.push(id)
      }
    }

    expect(missingLabels).toEqual([])
  })

  it('intensity values are between 0 and 1', () => {
    const invalidIntensities: string[] = []

    for (const id of emotionIds) {
      const emotion = emotions[id]
      if (emotion.intensity < 0 || emotion.intensity > 1) {
        invalidIntensities.push(`${id}: ${emotion.intensity}`)
      }
    }

    expect(invalidIntensities).toEqual([])
  })
})
