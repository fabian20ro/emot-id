export function getModelBridge(
  modelId: string,
  _resultIds: string[],
  bridgesT: Record<string, string>,
): { message: string; targetModelId: string; buttonLabel: string } | null {
  switch (modelId) {
    case 'plutchik':
    case 'wheel':
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
        message: bridgesT.cognitiveFromDimensional ?? "Want to explore what this feeling is called?",
        targetModelId: 'wheel',
        buttonLabel: bridgesT.tryWheel ?? 'Try the Emotion Wheel',
      }
    default:
      return null
  }
}
