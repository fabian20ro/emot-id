import type { BaseEmotion } from '../types'

export interface WheelEmotion extends BaseEmotion {
  level: number
  parents: string[]
  children?: string[]
}
