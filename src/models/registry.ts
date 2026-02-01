import type { ComponentType } from 'react'
import type { EmotionModel, BaseEmotion, VisualizationProps } from './types'
import { plutchikModel } from './plutchik'
import { wheelModel } from './wheel'
import { BubbleField } from '../components/BubbleField'

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
}

export const defaultModelId = 'plutchik'

export function getModel(id: string): EmotionModel<BaseEmotion> | undefined {
  return models[id]?.model
}

export function getVisualization(id: string): ComponentType<VisualizationProps> | undefined {
  return models[id]?.Visualization
}

export function getAvailableModels(): { id: string; name: string; description: { ro: string; en: string } }[] {
  return Object.values(models).map((entry) => ({
    id: entry.model.id,
    name: entry.model.name,
    description: entry.model.description,
  }))
}
