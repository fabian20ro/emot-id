import type { BaseEmotion } from '../types'

export interface DimensionalEmotion extends BaseEmotion {
  /** Pleasant (+1) to Unpleasant (-1) */
  valence: number
  /** Intense (+1) to Calm (-1) */
  arousal: number
  /** Quadrant label for grouping */
  quadrant: 'pleasant-intense' | 'pleasant-calm' | 'unpleasant-intense' | 'unpleasant-calm'
}
