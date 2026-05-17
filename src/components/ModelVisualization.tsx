import type { ComponentType } from 'react'
import { type VisualizationProps } from '../models/types'
import { MODEL_IDS } from '../models/constants'
import { BubbleField } from './BubbleField'
import { BodyMap } from './BodyMap'
import { DimensionalField } from './DimensionalField'

interface ModelVisualizationProps extends VisualizationProps {
  modelId: string
}

export function ModelVisualization({ modelId, ...props }: ModelVisualizationProps) {
  const BodyMapVisualization = BodyMap as ComponentType<VisualizationProps>

  switch (modelId) {
    case MODEL_IDS.PLUTCHIK:
    case MODEL_IDS.WHEEL:
      return <BubbleField {...props} />
    case MODEL_IDS.SOMATIC:
      return <BodyMapVisualization {...props} />
    case MODEL_IDS.DIMENSIONAL:
      return <DimensionalField {...props} />
    default:
      return null
  }
}
