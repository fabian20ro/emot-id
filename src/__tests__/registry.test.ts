import { describe, it, expect } from 'vitest'
import { getAvailableModels, getModel, getVisualization, loadModel } from '../models/registry'
import { MODEL_IDS } from '../models/constants'

describe('model registry', () => {
  it('exposes all four models in metadata', () => {
    const models = getAvailableModels()
    expect(models.map((model) => model.id).sort()).toEqual([
      MODEL_IDS.DIMENSIONAL,
      MODEL_IDS.PLUTCHIK,
      MODEL_IDS.SOMATIC,
      MODEL_IDS.WHEEL,
    ])
  })

  it('loads somatic model on demand', async () => {
    const loaded = await loadModel(MODEL_IDS.SOMATIC)
    expect(loaded).toBeDefined()
    expect(getModel(MODEL_IDS.SOMATIC)).toBeDefined()
  })

  it('returns visualization components for all model ids', () => {
    expect(getVisualization(MODEL_IDS.PLUTCHIK)).toBeDefined()
    expect(getVisualization(MODEL_IDS.WHEEL)).toBeDefined()
    expect(getVisualization(MODEL_IDS.SOMATIC)).toBeDefined()
    expect(getVisualization(MODEL_IDS.DIMENSIONAL)).toBeDefined()
  })
})
