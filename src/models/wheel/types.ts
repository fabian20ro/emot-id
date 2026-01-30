import type { BaseEmotion } from '../types'

export interface WheelEmotion extends BaseEmotion {
  level: number
  parent?: string
  children?: string[]
}
