import type { ComponentType } from 'react'
import type { EmotionModel, BaseEmotion, VisualizationProps } from './types'
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

const models: Record<string, ModelRegistryEntry> = {
  plutchik: {
    model: plutchikModel as EmotionModel<BaseEmotion>,
    Visualization: BubbleField,
  },
  wheel: {
    model: wheelModel as EmotionModel<BaseEmotion>,
    Visualization: BubbleField,
  },
  somatic: {
    model: somaticModel as EmotionModel<BaseEmotion>,
    // BodyMap narrows selections to SomaticSelection[], needs cast for registry's VisualizationProps
    Visualization: BodyMap as ComponentType<VisualizationProps>,
  },
  dimensional: {
    model: dimensionalModel as EmotionModel<BaseEmotion>,
    Visualization: DimensionalField,
  },
}

export const defaultModelId = 'somatic'

export function getModel(id: string): EmotionModel<BaseEmotion> | undefined {
  return models[id]?.model
}

export function getVisualization(id: string): ComponentType<VisualizationProps> | undefined {
  return models[id]?.Visualization
}

export function getAvailableModels(): { id: string; name: { ro: string; en: string }; description: { ro: string; en: string } }[] {
  return Object.values(models).map((entry) => ({
    id: entry.model.id,
    name: entry.model.name,
    description: entry.model.description,
  }))
}
