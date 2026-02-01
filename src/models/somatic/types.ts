import type { BaseEmotion } from '../types'

export type BodyGroup = 'head' | 'torso' | 'arms' | 'legs'

export type SensationType =
  | 'tension'
  | 'warmth'
  | 'heaviness'
  | 'lightness'
  | 'tingling'
  | 'numbness'
  | 'churning'
  | 'pressure'

export interface EmotionSignal {
  emotionId: string
  emotionLabel: { ro: string; en: string }
  emotionColor: string
  emotionDescription?: { ro: string; en: string }
  sensationType: SensationType
  minIntensity: 1 | 2 | 3
  weight: number
}

export interface SomaticRegion extends BaseEmotion {
  svgRegionId: string
  group: BodyGroup
  commonSensations: SensationType[]
  emotionSignals: EmotionSignal[]
}

/** Enriched selection: region + user-chosen sensation and intensity */
export interface SomaticSelection extends SomaticRegion {
  selectedSensation: SensationType
  selectedIntensity: 1 | 2 | 3
}
