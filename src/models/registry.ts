import type { ComponentType } from 'react'
import type { EmotionModel, BaseEmotion, VisualizationProps } from './types'
import { MODEL_IDS, type ModelId } from './constants'
import { plutchikModel } from './plutchik'
import { wheelModel } from './wheel'
import { somaticModel } from './somatic'
import { dimensionalModel } from './dimensional'
import { BubbleField } from '../components/BubbleField'
import { BodyMap } from '../components/BodyMap'
import { DimensionalField } from '../components/DimensionalField'

interface ModelRegistryEntry {
  model: EmotionModel<BaseEmotion>
  Visualization: ComponentType<VisualizationProps>
}

const models: Record<ModelId, ModelRegistryEntry> = {
  [MODEL_IDS.PLUTCHIK]: {
    model: plutchikModel as EmotionModel<BaseEmotion>,
    Visualization: BubbleField,
  },
  [MODEL_IDS.WHEEL]: {
    model: wheelModel as EmotionModel<BaseEmotion>,
    Visualization: BubbleField,
  },
  [MODEL_IDS.SOMATIC]: {
    model: somaticModel as EmotionModel<BaseEmotion>,
    // BodyMap narrows selections to SomaticSelection[], needs cast for registry's VisualizationProps
    Visualization: BodyMap as ComponentType<VisualizationProps>,
  },
  [MODEL_IDS.DIMENSIONAL]: {
    model: dimensionalModel as EmotionModel<BaseEmotion>,
    Visualization: DimensionalField,
  },
}

export const defaultModelId: ModelId = MODEL_IDS.SOMATIC

function isModelId(id: string): id is ModelId {
  return id in models
}

export function getModel(id: string): EmotionModel<BaseEmotion> | undefined {
  return isModelId(id) ? models[id].model : undefined
}

export function getVisualization(id: string): ComponentType<VisualizationProps> | undefined {
  return isModelId(id) ? models[id].Visualization : undefined
}

export function getAvailableModels(): { id: string; name: { ro: string; en: string }; shortName?: { ro: string; en: string }; description: { ro: string; en: string } }[] {
  return Object.values(models).map((entry) => ({
    id: entry.model.id,
    name: entry.model.name,
    shortName: entry.model.shortName,
    description: entry.model.description,
  }))
}
