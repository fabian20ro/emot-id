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

  it('does not mutate state when querying size', () => {
    const state = wheelModel.initialState
    const snapshot: ModelState = {
      visibleEmotionIds: new Map(state.visibleEmotionIds),
      currentGeneration: state.currentGeneration,
    }

    // Query sizes for all emotions — should leave state untouched
    for (const [id] of Object.entries(wheelModel.allEmotions)) {
      wheelModel.getEmotionSize!(id, state)
    }

    expect(state.visibleEmotionIds).toEqual(snapshot.visibleEmotionIds)
    expect(state.currentGeneration).toBe(snapshot.currentGeneration)
  })

  it('maintains sizing through onSelect drill-down', () => {
    const state = wheelModel.initialState
    // Pick a root emotion that has children to trigger drill-down
    const rootId = [...state.visibleEmotionIds.keys()].find(
      (id) => wheelModel.allEmotions[id]?.children?.length
    )
    expect(rootId).toBeDefined()

    const rootEmotion = wheelModel.allEmotions[rootId!]
    const effect = wheelModel.onSelect(rootEmotion, state, [])
    const afterDrillDown = effect.newState ?? state

    // All visible emotions should still report 'large'
    for (const [id] of afterDrillDown.visibleEmotionIds) {
      expect(wheelModel.getEmotionSize!(id, afterDrillDown)).toBe('large')
    }
  })

  it('maintains sizing through onDeselect reset', () => {
    const state = wheelModel.initialState
    // Simulate a deep drill-down with multiple generations
    let currentState: ModelState = state
    for (let i = 0; i < 3; i++) {
      const currentIds = [...currentState.visibleEmotionIds.keys()]
      if (!currentIds.length) break
      const emotionId = currentIds[0]
      const emotion = wheelModel.allEmotions[emotionId]
      if (!emotion?.children?.length) break
      const effect = wheelModel.onSelect(emotion, currentState, [])
      currentState = (effect.newState ?? {}) as ModelState
    }

    // Now deselect — should reset to root state
    const rootEmotion = wheelModel.allEmotions[[...state.visibleEmotionIds.keys()][0]]!
    const effect = wheelModel.onDeselect(rootEmotion, currentState)
    const afterReset = effect.newState ?? currentState

    for (const [id] of afterReset.visibleEmotionIds) {
      expect(wheelModel.getEmotionSize!(id, afterReset)).toBe('large')
    }
  })

  it('maintains sizing through onClear reset', () => {
    // onClear returns initial state — all root emotions visible at 'large'
    const cleared = wheelModel.onClear()

    for (const [id] of cleared.visibleEmotionIds) {
      expect(wheelModel.getEmotionSize!(id, cleared)).toBe('large')
    }
  })
})
