import type { EmotionModel, BaseEmotion } from './types'
import { plutchikModel } from './plutchik'

const models: Record<string, EmotionModel<BaseEmotion>> = {
  plutchik: plutchikModel as EmotionModel<BaseEmotion>,
}

export const defaultModelId = 'plutchik'

export function getModel(id: string): EmotionModel<BaseEmotion> | undefined {
  return models[id]
}

export function getAvailableModels(): { id: string; name: string }[] {
  return Object.values(models).map((m) => ({ id: m.id, name: m.name }))
}
