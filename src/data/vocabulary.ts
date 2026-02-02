/**
 * Derives emotional vocabulary statistics from session history.
 * Research basis: Kashdan et al. (2015) — emotional granularity improves regulation.
 */
import type { Session } from './types'

export interface VocabularyStats {
  /** Total unique emotion IDs identified across all sessions */
  uniqueEmotionCount: number
  /** Unique emotion IDs per model */
  perModel: Record<string, number>
  /** Unique model IDs used */
  modelsUsed: number
  /** Total sessions completed */
  totalSessions: number
  /** Milestone messages (localized key, not string) */
  milestone: VocabularyMilestone | null
}

export type VocabularyMilestone =
  | { type: 'emotions'; count: number }
  | { type: 'models'; count: number }

const EMOTION_MILESTONES = [5, 10, 15, 25, 40, 60]
const MODEL_MILESTONES = [2, 3, 4]

export function computeVocabulary(sessions: Session[]): VocabularyStats {
  const allEmotionIds = new Set<string>()
  const perModelIds: Record<string, Set<string>> = {}
  const modelIds = new Set<string>()

  for (const session of sessions) {
    modelIds.add(session.modelId)
    if (!perModelIds[session.modelId]) {
      perModelIds[session.modelId] = new Set()
    }
    for (const result of session.results) {
      allEmotionIds.add(result.id)
      perModelIds[session.modelId].add(result.id)
    }
  }

  const perModel: Record<string, number> = {}
  for (const [model, ids] of Object.entries(perModelIds)) {
    perModel[model] = ids.size
  }

  const uniqueEmotionCount = allEmotionIds.size

  // Determine highest milestone reached
  let milestone: VocabularyMilestone | null = null
  for (const m of EMOTION_MILESTONES) {
    if (uniqueEmotionCount >= m) {
      milestone = { type: 'emotions', count: m }
    }
  }
  for (const m of MODEL_MILESTONES) {
    if (modelIds.size >= m) {
      const modelMilestone: VocabularyMilestone = { type: 'models', count: m }
      if (!milestone || (milestone.type === 'emotions' && milestone.count < 10)) {
        milestone = modelMilestone
      }
    }
  }

  return {
    uniqueEmotionCount,
    perModel,
    modelsUsed: modelIds.size,
    totalSessions: sessions.length,
    milestone,
  }
}
