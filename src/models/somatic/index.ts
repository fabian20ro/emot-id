import type { EmotionModel, ModelState, SelectionEffect, AnalysisResult } from '../types'
import type { SomaticRegion, SomaticSelection } from './types'
import { scoreSomaticSelections } from './scoring'
import regionsData from './data.json'

const allEmotions = regionsData as unknown as Record<string, SomaticRegion>

const ALL_REGION_IDS = Object.keys(allEmotions)

function makeVisibleMap(): Map<string, number> {
  return new Map(ALL_REGION_IDS.map((id) => [id, 0]))
}

export const somaticModel: EmotionModel<SomaticRegion> = {
  id: 'somatic',
  name: 'Body Map',
  description: {
    ro: 'Harta corporala a emotiilor — identifica emotii prin senzatii fizice in 14 regiuni ale corpului',
    en: 'Body Map of Emotions — identify emotions through physical sensations in 14 body regions',
  },
  allEmotions,

  get initialState(): ModelState {
    return {
      visibleEmotionIds: makeVisibleMap(),
      currentGeneration: 0,
    }
  },

  onSelect(
    _emotion: SomaticRegion,
    _state: ModelState,
    _selections: SomaticRegion[]
  ): SelectionEffect {
    // All regions stay visible. The BodyMap component handles sensation picking
    // and calls onSelect with the enriched SomaticSelection.
    // Return undefined for newSelections so the hook adds the emotion normally.
    return {
      newState: {
        visibleEmotionIds: makeVisibleMap(),
        currentGeneration: 0,
      },
    }
  },

  onDeselect(_emotion: SomaticRegion, _state: ModelState): SelectionEffect {
    return {
      newState: {
        visibleEmotionIds: makeVisibleMap(),
        currentGeneration: 0,
      },
    }
  },

  onClear(): ModelState {
    return {
      visibleEmotionIds: makeVisibleMap(),
      currentGeneration: 0,
    }
  },

  analyze(selections: SomaticRegion[]): AnalysisResult[] {
    // Cast to SomaticSelection — the BodyMap component enriches selections
    // with selectedSensation and selectedIntensity before they reach here
    const somaticSelections = selections as SomaticSelection[]
    return scoreSomaticSelections(somaticSelections)
  },

  getEmotionSize(_emotionId: string, _state: ModelState): 'small' | 'medium' | 'large' {
    return 'medium'
  },
}
