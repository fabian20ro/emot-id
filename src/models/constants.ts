export const MODEL_IDS = {
  PLUTCHIK: 'plutchik',
  WHEEL: 'wheel',
  SOMATIC: 'somatic',
  DIMENSIONAL: 'dimensional',
} as const

export type ModelId = (typeof MODEL_IDS)[keyof typeof MODEL_IDS]
