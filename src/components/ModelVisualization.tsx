import type { VisualizationProps } from '../models/types'
import { getVisualization } from '../models/registry'

interface ModelVisualizationProps extends VisualizationProps {
  modelId: string
}

export function ModelVisualization({ modelId, ...props }: ModelVisualizationProps) {
  const Visualizer = getVisualization(modelId)

  if (!Visualizer) return null

  return <Visualizer {...props} />
}
