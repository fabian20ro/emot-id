/**
 * Model progression suggestions.
 * Suggested learning order: Somatic → Dimensional → Wheel → Plutchik
 * Not gatekeeping — all models always accessible, progression is suggestive.
 */
import type { Session } from './types'

/** Recommended learning order for models. */
export const MODEL_PROGRESSION = ['somatic', 'dimensional', 'wheel', 'plutchik'] as const

/**
 * Suggest next model based on session history.
 * Returns the model ID to suggest, or null if no suggestion.
 */
export function suggestNextModel(sessions: Session[], currentModelId: string): string | null {
  if (sessions.length === 0) return null

  const usedModels = new Set(sessions.map((s) => s.modelId))
  const currentIndex = MODEL_PROGRESSION.indexOf(currentModelId as typeof MODEL_PROGRESSION[number])

  // Only suggest after at least 1 session with current model
  const hasUsedCurrent = usedModels.has(currentModelId)
  if (!hasUsedCurrent) return null

  // Find next unused model in progression
  for (let i = currentIndex + 1; i < MODEL_PROGRESSION.length; i++) {
    const candidate = MODEL_PROGRESSION[i]
    if (!usedModels.has(candidate)) return candidate
  }
  // Also check models before current position
  for (let i = 0; i < currentIndex; i++) {
    const candidate = MODEL_PROGRESSION[i]
    if (!usedModels.has(candidate)) return candidate
  }

  return null
}
