import type { VisualizationProps } from '../models/types'
import { getVisualization } from '../models/registry'
import React, { useMemo } from 'react'

interface ModelVisualizationProps extends VisualizationProps {
  modelId: string
}

export function ModelVisualization({ modelId, ...props }: ModelVisualizationProps) {
  const Visualizer = useMemo(() => getVisualization(modelId), [modelId])

  if (!Visualizer) return null

  return React.createElement(Visualizer, props)
}
