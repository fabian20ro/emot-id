import type { AnalysisResult } from '../types'
import type { SomaticSelection, BodyGroup } from './types'

interface ScoredEmotion extends AnalysisResult {
  score: number
  matchStrength: { ro: string; en: string }
}

const MINIMUM_THRESHOLD = 0.5
const MAX_RESULTS = 4
const COHERENCE_BONUS = 1.2

function getMatchStrength(score: number, maxScore: number): { ro: string; en: string } {
  const ratio = maxScore > 0 ? score / maxScore : 0
  if (ratio >= 0.7) return { ro: 'rezonanță puternică', en: 'strong resonance' }
  if (ratio >= 0.4) return { ro: 'conexiune posibilă', en: 'possible connection' }
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
        emotionScores.set(signal.emotionId, {
          emotionId: signal.emotionId,
          emotionLabel: signal.emotionLabel,
          emotionColor: signal.emotionColor,
          emotionDescription: signal.emotionDescription,
          score: contribution,
          contributingRegions: [selection.label],
          contributingGroups: new Set([selection.group]),
        })
      }
    }
  }

  // Apply pattern coherence bonus: emotions matched from 2+ body groups get a boost
  for (const [key, entry] of emotionScores) {
    if (entry.contributingGroups.size >= 2) {
      emotionScores.set(key, { ...entry, score: entry.score * COHERENCE_BONUS })
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
    componentLabels: entry.contributingRegions,
    score: entry.score,
    matchStrength: getMatchStrength(entry.score, maxScore),
  }))
}
