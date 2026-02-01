import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DimensionalField } from '../components/DimensionalField'
import { LanguageProvider } from '../context/LanguageContext'
import type { DimensionalEmotion } from '../models/dimensional/types'

const mockEmotions: DimensionalEmotion[] = [
  {
    id: 'happy',
    label: { ro: 'fericit', en: 'happy' },
    color: '#FFEB3B',
    valence: 0.7,
    arousal: 0.4,
    quadrant: 'pleasant-intense',
  },
  {
    id: 'sad',
    label: { ro: 'trist', en: 'sad' },
    color: '#5C6BC0',
    valence: -0.6,
    arousal: -0.4,
    quadrant: 'unpleasant-calm',
  },
  {
    id: 'angry',
    label: { ro: 'furios', en: 'angry' },
    color: '#F44336',
    valence: -0.7,
    arousal: 0.8,
    quadrant: 'unpleasant-intense',
  },
]

const defaultSizes = new Map<string, 'small' | 'medium' | 'large'>([
  ['happy', 'small'],
  ['sad', 'small'],
  ['angry', 'small'],
])

function renderField(overrides: Partial<React.ComponentProps<typeof DimensionalField>> = {}) {
  const defaults: React.ComponentProps<typeof DimensionalField> = {
    emotions: mockEmotions,
    onSelect: vi.fn(),
    onDeselect: vi.fn(),
    sizes: defaultSizes,
    ...overrides,
  }
  return {
    ...render(
      <LanguageProvider>
        <DimensionalField {...defaults} />
      </LanguageProvider>
    ),
    onSelect: defaults.onSelect as ReturnType<typeof vi.fn>,
    onDeselect: defaults.onDeselect as ReturnType<typeof vi.fn>,
  }
}

describe('DimensionalField', () => {
  it('renders an SVG with the field', () => {
    renderField()
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renders axis labels', () => {
    renderField()
    expect(screen.getByText('Pleasant')).toBeInTheDocument()
    expect(screen.getByText('Unpleasant')).toBeInTheDocument()
    expect(screen.getByText('Intense')).toBeInTheDocument()
    expect(screen.getByText('Calm')).toBeInTheDocument()
  })

  it('renders emotion labels as text', () => {
    renderField()
    expect(screen.getByText('happy')).toBeInTheDocument()
    expect(screen.getByText('sad')).toBeInTheDocument()
    expect(screen.getByText('angry')).toBeInTheDocument()
  })

  it('renders circles for each emotion', () => {
    renderField()
    const circles = document.querySelectorAll('circle')
    // 3 emotion dots (crosshair not rendered yet)
    expect(circles.length).toBe(3)
  })
})
