const PLEASANT_IDS = new Set([
  'joy', 'love', 'gratitude', 'serenity', 'trust', 'anticipation',
  'ecstasy', 'admiration', 'happy', 'content', 'grateful', 'hopeful',
  'proud', 'joyful', 'calm', 'relaxed', 'tender', 'compassionate',
])

interface BridgeSuggestion {
  message: string
  targetModelId: string
  buttonLabel: string
}

export function getModelBridge(
  modelId: string,
  resultIds: string[],
  bridgesT: Record<string, string>,
): BridgeSuggestion | null {
  const hasPleasant = resultIds.some((id) => PLEASANT_IDS.has(id))

  switch (modelId) {
    case 'plutchik':
    case 'wheel':
      // Pleasant emotions → embodiment bridge (savoring)
      if (hasPleasant) {
        return {
          message: bridgesT.pleasantEmbodiment ?? 'Where do you feel that warmth? Take a moment to notice.',
          targetModelId: 'somatic',
          buttonLabel: bridgesT.trySomatic ?? 'Try the Body Map',
        }
      }
      return {
        message: bridgesT.somaticFromCognitive ?? 'Where do you notice this in your body?',
        targetModelId: 'somatic',
        buttonLabel: bridgesT.trySomatic ?? 'Try the Body Map',
      }

    case 'somatic':
      return {
        message: bridgesT.cognitiveFromSomatic ?? 'Can you name the emotion more precisely?',
        targetModelId: 'wheel',
        buttonLabel: bridgesT.tryWheel ?? 'Try the Emotion Wheel',
      }

    case 'dimensional':
      return {
        message: bridgesT.somaticFromDimensional ?? 'Where do you feel this in your body?',
        targetModelId: 'somatic',
        buttonLabel: bridgesT.trySomatic ?? 'Try the Body Map',
      }

    default:
      return null
  }
}
