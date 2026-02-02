import { describe, it, expect } from 'vitest'
import { wheelModel } from '../models/wheel'
import type { ModelState } from '../models/types'

describe('Wheel bubble sizing', () => {
  const allIds = Object.keys(wheelModel.allEmotions)

  it('returns large for all root-level emotions', () => {
    const state = wheelModel.initialState
    for (const [id] of state.visibleEmotionIds) {
      expect(wheelModel.getEmotionSize!(id, state)).toBe('large')
    }
  })

  it('returns large for all emotions regardless of level', () => {
    const levels = new Set(
      allIds.map((id) => wheelModel.allEmotions[id].level)
    )
    expect(levels.size).toBeGreaterThanOrEqual(2)

    for (const id of allIds) {
      const dummyState: ModelState = {
        visibleEmotionIds: new Map(allIds.map((eid) => [eid, 0])),
        currentGeneration: 0,
      }
      expect(
        wheelModel.getEmotionSize!(id, dummyState),
        `emotion ${id} (level ${wheelModel.allEmotions[id].level}) should be large`
      ).toBe('large')
    }
  })

  it('returns large after drill-down transition', () => {
    const state = wheelModel.initialState
    // Pick first root emotion that has children
    const rootId = [...state.visibleEmotionIds.keys()].find(
      (id) => wheelModel.allEmotions[id]?.children?.length
    )
    expect(rootId).toBeDefined()

    const rootEmotion = wheelModel.allEmotions[rootId!]
    const effect = wheelModel.onSelect(rootEmotion, state, [])
    const drillState = effect.newState ?? state

    for (const [id] of drillState.visibleEmotionIds) {
      expect(
        wheelModel.getEmotionSize!(id, drillState),
        `child ${id} should be large after drill-down`
      ).toBe('large')
    }
  })

  it('returns large even with many visible emotions', () => {
    const crowdedState: ModelState = {
      visibleEmotionIds: new Map(allIds.slice(0, 20).map((id) => [id, 0])),
      currentGeneration: 0,
    }
    for (const id of allIds.slice(0, 20)) {
      expect(wheelModel.getEmotionSize!(id, crowdedState)).toBe('large')
    }
  })
})
