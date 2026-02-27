import type { AnalysisResult } from '../types'
import { getCanonicalEmotion } from '../catalog'
import type { SomaticSelection, BodyGroup } from './types'

interface ScoredEmotion extends AnalysisResult {
  score: number
  matchStrength: { ro: string; en: string }
}

const MINIMUM_THRESHOLD = 0.5
const MAX_RESULTS = 4
/** Scaled coherence bonus by number of contributing body groups */
const COHERENCE_BONUS: Record<number, number> = { 2: 1.2, 3: 1.3, 4: 1.4 }

/** Absolute score floor: if the best score is below this, downgrade all labels */
const STRONG_FLOOR = 1.0
const POSSIBLE_FLOOR = 0.6

function getMatchStrength(score: number, maxScore: number): { ro: string; en: string } {
  const ratio = maxScore > 0 ? score / maxScore : 0
  // Apply absolute floor: even the top result can't claim "strong" if scores are low
  if (ratio >= 0.7 && score >= STRONG_FLOOR) return { ro: 'semnal clar', en: 'clear signal' }
  if (ratio >= 0.4 && score >= POSSIBLE_FLOOR) return { ro: 'conexiune posibilă', en: 'possible connection' }
  return { ro: 'merită explorat', en: 'worth exploring' }
}

export function scoreSomaticSelections(selections: SomaticSelection[]): ScoredEmotion[] {
  if (selections.length === 0) return []

  const emotionScores = new Map<
    string,
    {
      emotionId: string
      emotionLabel: { ro: string; en: string }
      emotionColor: string
      emotionDescription?: { ro: string; en: string }
      emotionNeeds?: { ro: string; en: string }
      score: number
      contributingRegions: { ro: string; en: string }[]
      contributingGroups: Set<BodyGroup>
    }
  >()

  for (const selection of selections) {
    for (const signal of selection.emotionSignals) {
      if (signal.sensationType !== selection.selectedSensation) continue
      if (selection.selectedIntensity < signal.minIntensity) continue

      const contribution = signal.weight * selection.selectedIntensity
      const existing = emotionScores.get(signal.emotionId)

      if (existing) {
        const updatedGroups = new Set(existing.contributingGroups)
        updatedGroups.add(selection.group)
        emotionScores.set(signal.emotionId, {
          ...existing,
          score: existing.score + contribution,
          contributingRegions: [...existing.contributingRegions, selection.label],
          contributingGroups: updatedGroups,
        })
      } else {
        // Resolve emotion identity from catalog; use context-specific framing if available
        const canonical = getCanonicalEmotion(signal.emotionId)
        emotionScores.set(signal.emotionId, {
          emotionId: signal.emotionId,
          emotionLabel: canonical?.label ?? { ro: signal.emotionId, en: signal.emotionId },
          emotionColor: canonical?.color ?? '#999999',
          emotionDescription: signal.contextDescription ?? canonical?.description,
          emotionNeeds: signal.contextNeeds ?? canonical?.needs,
          score: contribution,
          contributingRegions: [selection.label],
          contributingGroups: new Set([selection.group]),
        })
      }
    }
  }

  // Apply scaled pattern coherence bonus: more body groups = higher multiplier
  for (const [key, entry] of emotionScores) {
    const groupCount = entry.contributingGroups.size
    const bonus = COHERENCE_BONUS[groupCount] ?? (groupCount >= 4 ? 1.4 : 1)
    if (bonus > 1) {
      emotionScores.set(key, { ...entry, score: entry.score * bonus })
    }
  }

  const sorted = Array.from(emotionScores.values())
    .filter((e) => e.score >= MINIMUM_THRESHOLD)
    .sort((a, b) => b.score - a.score)

  const topResults = sorted.slice(0, MAX_RESULTS)
  const maxScore = topResults[0]?.score ?? 0

  return topResults.map((entry) => ({
    id: entry.emotionId,
    label: entry.emotionLabel,
    color: entry.emotionColor,
    description: entry.emotionDescription,
    needs: entry.emotionNeeds,
    componentLabels: entry.contributingRegions,
    score: entry.score,
    matchStrength: getMatchStrength(entry.score, maxScore),
  }))
}
