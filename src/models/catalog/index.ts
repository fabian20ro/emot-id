import type { CanonicalEmotion } from './types'

import primaryAffects from './primary-affects.json'
import positive from './positive.json'
import negativeHigh from './negative-high.json'
import negativeLow from './negative-low.json'
import social from './social.json'
import complex from './complex.json'
import somaticOnly from './somatic-only.json'
import wheelBranches from './wheel-branches.json'
import wheelLeaves from './wheel-leaves.json'
import plutchikVariants from './plutchik-variants.json'
import dimensionalOnly from './dimensional-only.json'

export const emotionCatalog: Record<string, CanonicalEmotion> = {
  ...(primaryAffects as Record<string, CanonicalEmotion>),
  ...(positive as Record<string, CanonicalEmotion>),
  ...(negativeHigh as Record<string, CanonicalEmotion>),
  ...(negativeLow as Record<string, CanonicalEmotion>),
  ...(social as Record<string, CanonicalEmotion>),
  ...(complex as Record<string, CanonicalEmotion>),
  ...(somaticOnly as Record<string, CanonicalEmotion>),
  ...(wheelBranches as Record<string, CanonicalEmotion>),
  ...(wheelLeaves as Record<string, CanonicalEmotion>),
  ...(plutchikVariants as Record<string, CanonicalEmotion>),
  ...(dimensionalOnly as Record<string, CanonicalEmotion>),
}

export function getCanonicalEmotion(id: string): CanonicalEmotion | undefined {
  return emotionCatalog[id]
}
