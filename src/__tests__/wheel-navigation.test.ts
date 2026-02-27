import { describe, it, expect } from 'vitest'
import { wheelModel } from '../models/wheel'

const e = wheelModel.allEmotions

const CENTER_IDS = [
  'happy', 'surprised', 'bad', 'fearful', 'angry', 'disgusted', 'sad',
]

function getCenterMap() {
  return new Map(CENTER_IDS.map((id) => [id, 0]))
}

describe('Wheel navigation', () => {
  it('initial state shows root emotions', () => {
    const state = wheelModel.initialState
    const ids = Array.from(state.visibleEmotionIds.keys())
    expect(ids).toEqual(CENTER_IDS)
  })

  it('selecting a branch node drills down to children', () => {
    const state = wheelModel.initialState
    const happy = e['happy']
    const effect = wheelModel.onSelect(happy, state, [])

    const visibleIds = Array.from(effect.newState.visibleEmotionIds.keys())
    expect(visibleIds).toEqual(happy.children)
  })

  it('selecting a leaf resets visible to root', () => {
    // Drill down: happy → playful → aroused (leaf)
    const state1 = wheelModel.initialState
    const effect1 = wheelModel.onSelect(e['happy'], state1, [])

    const effect2 = wheelModel.onSelect(e['playful'], effect1.newState, [])

    // Now select leaf 'aroused'
    const effect3 = wheelModel.onSelect(e['aroused'], effect2.newState, [])

    const visibleIds = Array.from(effect3.newState.visibleEmotionIds.keys())
    expect(visibleIds).toEqual(CENTER_IDS)
  })

  it('deselecting resets to root without wiping other selections', () => {
    const state = { visibleEmotionIds: getCenterMap(), currentGeneration: 0 }
    const effect = wheelModel.onDeselect(e['aroused'], state)

    // Should NOT have newSelections set (lets hook's default remove-one logic work)
    expect(effect.newSelections).toBeUndefined()

    // Should show root
    const visibleIds = Array.from(effect.newState.visibleEmotionIds.keys())
    expect(visibleIds).toEqual(CENTER_IDS)
  })

  it('onClear resets to initial state', () => {
    const cleared = wheelModel.onClear()
    const ids = Array.from(cleared.visibleEmotionIds.keys())
    expect(ids).toEqual(CENTER_IDS)
    expect(cleared.currentGeneration).toBe(0)
  })
})

describe('Wheel breadcrumb path derivation', () => {
  it('returns empty path at root level (generation 0)', () => {
    const state = wheelModel.initialState
    // At root, no breadcrumb should be shown
    expect(state.currentGeneration).toBe(0)
  })

  it('derives single-segment path at level 1', () => {
    const state = wheelModel.initialState
    const happy = e['happy']
    const effect = wheelModel.onSelect(happy, state, [])

    // After drilling into happy, visible emotions are happy's children
    const visibleIds = Array.from(effect.newState.visibleEmotionIds.keys())
    // Pick any visible emotion and walk its parent chain
    const firstChild = e[visibleIds[0]]
    expect(firstChild.parents[0]).toBe('happy')

    // Build path by walking parents
    const path: string[] = []
    let current = firstChild
    while (current?.parents[0]) {
      path.push(current.parents[0])
      current = e[current.parents[0]]
    }
    path.reverse()
    expect(path).toEqual(['happy'])
  })

  it('derives two-segment path at level 2', () => {
    const state = wheelModel.initialState
    const effect1 = wheelModel.onSelect(e['happy'], state, [])
    const effect2 = wheelModel.onSelect(e['playful'], effect1.newState, [])

    const visibleIds = Array.from(effect2.newState.visibleEmotionIds.keys())
    const firstLeaf = e[visibleIds[0]]

    // Build path
    const path: string[] = []
    let current = firstLeaf
    while (current?.parents[0]) {
      path.push(current.parents[0])
      current = e[current.parents[0]]
    }
    path.reverse()
    expect(path).toEqual(['happy', 'playful'])
  })
})

describe('Wheel analyze with hierarchy path', () => {
  it('builds hierarchy path for leaf emotion', () => {
    const results = wheelModel.analyze([e['aroused']])
    expect(results).toHaveLength(1)
    expect(results[0].hierarchyPath).toBeDefined()
    // aroused → playful → happy
    const pathIds = results[0].hierarchyPath!.map((p) => p.en)
    expect(pathIds).toEqual(['Happy', 'Playful', 'Energized'])
  })

  it('does not include hierarchy path for root emotions', () => {
    const results = wheelModel.analyze([e['happy']])
    expect(results).toHaveLength(1)
    // Root has only itself — path length 1, so hierarchyPath should be undefined
    expect(results[0].hierarchyPath).toBeUndefined()
  })

  it('builds paths for multiple selections from different branches', () => {
    const results = wheelModel.analyze([e['aroused'], e['anxious']])
    expect(results).toHaveLength(2)
    expect(results[0].hierarchyPath).toBeDefined()
    expect(results[1].hierarchyPath).toBeDefined()

    // Should be from different root branches
    const root0 = results[0].hierarchyPath![0].en
    const root1 = results[1].hierarchyPath![0].en
    expect(root0).not.toBe(root1)
  })
})
