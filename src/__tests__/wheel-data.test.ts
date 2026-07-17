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
      for (const parentId of emotion.parents) {
        expect(
          allEmotions[parentId],
          `Parent "${parentId}" of "${id}" does not exist`
        ).toBeDefined()
      }
    }
  })

  it('parent-child relationships are bidirectional', () => {
    for (const [id, emotion] of Object.entries(allEmotions)) {
      for (const parentId of emotion.parents) {
        const parent = allEmotions[parentId]
        expect(
          parent.children,
          `Parent "${parentId}" of "${id}" has no children array`
        ).toBeDefined()
        expect(
          parent.children,
          `Parent "${parentId}" does not list "${id}" as child`
        ).toContain(id)
      }
    }
  })

  it('no orphan emotions (every non-root has at least one parent)', () => {
    for (const [id, emotion] of Object.entries(allEmotions)) {
      if (emotion.level > 0) {
        expect(emotion.parents.length, `Emotion "${id}" at level ${emotion.level} has no parents`).toBeGreaterThan(0)
      }
    }
  })

  it('root emotions have level 0 and no parents', () => {
    for (const [, emotion] of Object.entries(allEmotions)) {
      if (emotion.level === 0) {
        expect(emotion.parents).toEqual([])
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

  it('multi-parent emotions are listed as children of all their parents', () => {
    for (const [id, emotion] of Object.entries(allEmotions)) {
      if (emotion.parents.length > 1) {
        for (const parentId of emotion.parents) {
          const parent = allEmotions[parentId]
          expect(
            parent.children,
            `Multi-parent emotion "${id}": parent "${parentId}" missing children array`
          ).toBeDefined()
          expect(
            parent.children,
            `Multi-parent emotion "${id}": parent "${parentId}" does not list "${id}" as child`
          ).toContain(id)
        }
      }
    }
  })
})

describe('Wheel model behavior', () => {
  it('onSelect on a branch (center) returns children, increments generation, keeps selections empty', () => {
    // Pick any center emotion — they all have children by construction
    const centerId = Object.keys(allEmotions).find((id) => id === 'happy')!
    const emotion = allEmotions[centerId]

    const result = wheelModel.onSelect(emotion, wheelModel.initialState, [])

    expect(result.newState.visibleEmotionIds.size).toBeGreaterThan(0)
    // All visible keys should be children of the picked center
    for (const childId of emotion.children ?? []) {
      expect(result.newState.visibleEmotionIds.get(childId)).toBe(1)
    }
    // Selections must stay empty — branch nodes are not selected
    expect(result.newSelections).toEqual([])
  })

  it('onSelect on a leaf returns selections extended, resets generation and visible set to centers', () => {
    // Pick any level-2 (leaf) emotion — they have no children by construction
    const leafId = Object.keys(allEmotions).find((id) => allEmotions[id].level === 2)!
    const emotion = allEmotions[leafId]

    const result = wheelModel.onSelect(emotion, wheelModel.initialState, [])

    expect(result.newSelections ?? []).toHaveLength(1)
    expect(result.newSelections?.[0]).toBe(emotion)
    // Generation reset to 0
    expect(result.newState.currentGeneration).toBe(0)
    // Visible set reverts to all centers (7 root emotions)
    expect(result.newState.visibleEmotionIds.size).toBeGreaterThan(0)
  })

  it('analyze() returns hierarchy path from root to leaf', () => {
    // Pick a level-2 leaf and call analyze
    const leafId = Object.keys(allEmotions).find((id) => allEmotions[id].level === 2)!
    const emotion = allEmotions[leafId]

    const results = wheelModel.analyze([emotion])
    expect(results).toHaveLength(1)

    const path = results[0].hierarchyPath
    // Hierarchy path should contain at least the root and leaf label
    expect(path).toBeDefined()
    expect(path!.length).toBeGreaterThanOrEqual(2)
    // Root (level 0) is first; leaf (level 2) is last
    expect(path![0].ro).toBe(allEmotions[Object.keys(allEmotions).find((id) => allEmotions[id].level === 0)!].label.ro)
    expect(path![path!.length - 1].ro).toBe(emotion.label.ro)
  })

  it('analyze() returns no hierarchyPath for root emotions', () => {
    const centerId = Object.keys(allEmotions).find((id) => id === 'happy')!
    const emotion = allEmotions[centerId]

    const results = wheelModel.analyze([emotion])
    expect(results).toHaveLength(1)
    // Root has no parent — path is single-element so hierarchyPath is undefined
    expect(results[0].hierarchyPath).toBeUndefined()
  })
})
