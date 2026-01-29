import type { BaseEmotion } from '../types'

export interface PlutchikEmotion extends BaseEmotion {
  category: string
  intensity: number
  opposite?: string
  spawns: string[]
  components?: string[]
}
