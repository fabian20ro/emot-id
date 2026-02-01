import { describe, it, expect } from 'vitest'
import { wheelModel } from '../models/wheel'

const allEmotions = wheelModel.allEmotions

describe('Wheel data integrity', () => {
  it('all children references point to existing emotions', () => {
    for (const [id, emotion] of Object.entries(allEmotions)) {
      if (emotion.children) {
        for (const childId of emotion.children) {
          expect(allEmotions[childId], `Child "${childId}" of "${id}" does not exist`).toBeDefined()
        }
      }
    }
  })

  it('all parent references point to existing emotions', () => {
    for (const [id, emotion] of Object.entries(allEmotions)) {
      if (emotion.parent) {
        expect(
          allEmotions[emotion.parent],
          `Parent "${emotion.parent}" of "${id}" does not exist`
        ).toBeDefined()
      }
    }
  })

  it('parent-child relationships are bidirectional', () => {
    for (const [id, emotion] of Object.entries(allEmotions)) {
      if (emotion.parent) {
        const parent = allEmotions[emotion.parent]
        expect(
          parent.children,
          `Parent "${emotion.parent}" of "${id}" has no children array`
        ).toBeDefined()
        expect(
          parent.children,
          `Parent "${emotion.parent}" does not list "${id}" as child`
        ).toContain(id)
      }
    }
  })

  it('no orphan emotions (every non-root has a parent)', () => {
    for (const [id, emotion] of Object.entries(allEmotions)) {
      if (emotion.level > 0) {
        expect(emotion.parent, `Emotion "${id}" at level ${emotion.level} has no parent`).toBeDefined()
      }
    }
  })

  it('root emotions have level 0 and no parent', () => {
    for (const [, emotion] of Object.entries(allEmotions)) {
      if (emotion.level === 0) {
        expect(emotion.parent).toBeUndefined()
      }
    }
  })

  it('leaf emotions have no children', () => {
    for (const [id, emotion] of Object.entries(allEmotions)) {
      if (emotion.level === 2) {
        const hasChildren = emotion.children && emotion.children.length > 0
        expect(hasChildren, `Leaf emotion "${id}" should not have children`).toBeFalsy()
      }
    }
  })

  it('all emotions have bilingual labels', () => {
    for (const [id, emotion] of Object.entries(allEmotions)) {
      expect(emotion.label.ro, `Emotion "${id}" missing Romanian label`).toBeTruthy()
      expect(emotion.label.en, `Emotion "${id}" missing English label`).toBeTruthy()
    }
  })

  it('all emotions have a color', () => {
    for (const [id, emotion] of Object.entries(allEmotions)) {
      expect(emotion.color, `Emotion "${id}" missing color`).toBeTruthy()
    }
  })
})
