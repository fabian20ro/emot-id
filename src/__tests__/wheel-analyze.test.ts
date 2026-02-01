import { describe, it, expect } from 'vitest'
import { wheelModel } from '../models/wheel'

const e = wheelModel.allEmotions

function analyze(ids: string[]) {
  return wheelModel.analyze(ids.map((id) => e[id]))
}

describe('wheelModel.analyze', () => {
  it('returns empty array for no selections', () => {
    expect(analyze([])).toEqual([])
  })

  it('returns one result per selection', () => {
    const leafId = Object.keys(e).find((id) => !e[id].children?.length)!
    const results = analyze([leafId])
    expect(results).toHaveLength(1)
    expect(results[0].id).toBe(leafId)
    expect(results[0].label).toEqual(e[leafId].label)
    expect(results[0].color).toBe(e[leafId].color)
  })

  it('passes bilingual description from data', () => {
    const withDesc = Object.keys(e).find((id) => e[id].description)
    if (!withDesc) return // skip if no descriptions in data yet

    const results = analyze([withDesc])
    expect(results[0].description).toEqual(e[withDesc].description)
    expect(results[0].description?.ro).toBeDefined()
    expect(results[0].description?.en).toBeDefined()
  })

  it('returns multiple results for multiple selections', () => {
    const leaves = Object.keys(e).filter((id) => !e[id].children?.length).slice(0, 3)
    const results = analyze(leaves)
    expect(results).toHaveLength(leaves.length)
  })
})
