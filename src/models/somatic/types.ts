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
  | 'constriction'

export interface EmotionSignal {
  emotionId: string
  sensationType: SensationType
  minIntensity: 1 | 2 | 3
  weight: number
  source: 'Nummenmaa2014' | 'clinical' | 'interpolated'
  /** Body-region-specific framing (not duplication of canonical description) */
  contextDescription?: { ro: string; en: string }
  contextNeeds?: { ro: string; en: string }
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
