import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { EmotionModel, BaseEmotion, VisualizationProps } from './types'
import { MODEL_IDS, type ModelId } from './constants'
import { plutchikModel } from './plutchik'
import { wheelModel } from './wheel'
import { dimensionalModel } from './dimensional'

type VisualizationComponent =
  | ComponentType<VisualizationProps>
  | LazyExoticComponent<ComponentType<VisualizationProps>>

interface ModelMeta {
  id: ModelId
  name: { ro: string; en: string }
  shortName?: { ro: string; en: string }
  description: { ro: string; en: string }
}

const MODEL_META: Record<ModelId, ModelMeta> = {
  [MODEL_IDS.PLUTCHIK]: {
    id: MODEL_IDS.PLUTCHIK,
    name: { ro: 'Roata emotiilor Plutchik', en: "Plutchik's Wheel of Emotions" },
    shortName: { ro: 'Plutchik', en: 'Plutchik' },
    description: {
      ro: '8 emotii primare care se combina in diade (bazat pe Plutchik, 1980) — selecteaza doua emotii primare pentru a descoperi combinatia lor',
      en: '8 primary emotions that combine into dyads (based on Plutchik, 1980) — select two primary emotions to discover their combination',
    },
  },
  [MODEL_IDS.WHEEL]: {
    id: MODEL_IDS.WHEEL,
    name: { ro: 'Roata emotiilor', en: 'Emotion Wheel' },
    shortName: { ro: 'Roata', en: 'Wheel' },
    description: {
      ro: 'Navigare ierarhica pe 3 nivele (bazat pe Parrott, 2001) — de la emotii generale la specifice prin explorare in profunzime',
      en: '3-level hierarchical navigation (based on Parrott, 2001) — from general to specific emotions through drill-down exploration',
    },
  },
  [MODEL_IDS.SOMATIC]: {
    id: MODEL_IDS.SOMATIC,
    name: { ro: 'Harta corporala', en: 'Body Map' },
    shortName: { ro: 'Corp', en: 'Body' },
    description: {
      ro: 'Harta corporala a emotiilor (bazat pe Nummenmaa et al., 2014) — identifica emotii prin senzatii fizice in 14 regiuni ale corpului',
      en: 'Body Map of Emotions (based on Nummenmaa et al., 2014) — identify emotions through physical sensations in 14 body regions',
    },
  },
  [MODEL_IDS.DIMENSIONAL]: {
    id: MODEL_IDS.DIMENSIONAL,
    name: { ro: 'Spatiul emotional', en: 'Emotional Space' },
    shortName: { ro: 'Spatiu', en: 'Space' },
    description: {
      ro: 'Camp bidimensional (bazat pe Russell, 1980) — plaseaza-ti experienta pe axele placut/neplacut si calm/intens',
      en: '2D emotional field (based on Russell, 1980) — place your experience on the pleasant/unpleasant and calm/intense axes',
    },
  },
}

const modelCache: Partial<Record<ModelId, EmotionModel<BaseEmotion>>> = {
  [MODEL_IDS.PLUTCHIK]: plutchikModel as EmotionModel<BaseEmotion>,
  [MODEL_IDS.WHEEL]: wheelModel as EmotionModel<BaseEmotion>,
  [MODEL_IDS.DIMENSIONAL]: dimensionalModel as EmotionModel<BaseEmotion>,
}

const BubbleFieldLazy = lazy(async () => {
  const mod = await import('../components/BubbleField')
  return { default: mod.BubbleField }
})

const BodyMapLazy = lazy(async () => {
  const mod = await import('../components/BodyMap')
  return { default: mod.BodyMap as ComponentType<VisualizationProps> }
})

const DimensionalFieldLazy = lazy(async () => {
  const mod = await import('../components/DimensionalField')
  return { default: mod.DimensionalField }
})

const visualizations: Record<ModelId, VisualizationComponent> = {
  [MODEL_IDS.PLUTCHIK]: BubbleFieldLazy,
  [MODEL_IDS.WHEEL]: BubbleFieldLazy,
  [MODEL_IDS.SOMATIC]: BodyMapLazy,
  [MODEL_IDS.DIMENSIONAL]: DimensionalFieldLazy,
}

export const defaultModelId: ModelId = MODEL_IDS.SOMATIC

function isModelId(id: string): id is ModelId {
  return id in MODEL_META
}

export function getModel(id: string): EmotionModel<BaseEmotion> | undefined {
  if (!isModelId(id)) return undefined
  return modelCache[id]
}

export async function loadModel(id: string): Promise<EmotionModel<BaseEmotion> | undefined> {
  if (!isModelId(id)) return undefined
  if (modelCache[id]) return modelCache[id]

  if (id === MODEL_IDS.SOMATIC) {
    const module = await import('./somatic')
    modelCache[id] = module.somaticModel as EmotionModel<BaseEmotion>
    return modelCache[id]
  }

  return undefined
}

export function getVisualization(id: string): VisualizationComponent | undefined {
  return isModelId(id) ? visualizations[id] : undefined
}

export function getAvailableModels(): Array<{
  id: string
  name: { ro: string; en: string }
  shortName?: { ro: string; en: string }
  description: { ro: string; en: string }
}> {
  return Object.values(MODEL_META)
}
