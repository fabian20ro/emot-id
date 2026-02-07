import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

  it('keeps axis labels visible after interacting with the field', () => {
    renderField()
    const svg = document.querySelector('svg') as SVGSVGElement

    vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      width: 300,
      height: 300,
      top: 0,
      left: 0,
      right: 300,
      bottom: 300,
      toJSON: () => ({}),
    } as DOMRect)

    fireEvent.click(svg, { clientX: 120, clientY: 200 })
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
    // 3 emotions × 2 circles each (invisible hit area + visible dot)
    expect(circles.length).toBe(6)
  })

  it('emotion dots have ARIA attributes for accessibility', () => {
    renderField()
    const buttons = document.querySelectorAll('g[role="button"]')
    expect(buttons.length).toBe(3)
    for (const btn of buttons) {
      expect(btn).toHaveAttribute('tabindex', '0')
      expect(btn).toHaveAttribute('aria-label')
      expect(btn).toHaveAttribute('aria-pressed', 'false')
    }
  })

  it('renders suggestions below the plot after field click', () => {
    renderField()
    const plotContainer = screen.getByTestId('dimensional-plot-container')
    const svg = document.querySelector('svg') as SVGSVGElement
    expect(plotContainer).toBeInTheDocument()

    vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      width: 300,
      height: 300,
      top: 0,
      left: 0,
      right: 300,
      bottom: 300,
      toJSON: () => ({}),
    } as DOMRect)

    fireEvent.click(svg, { clientX: 150, clientY: 240 })
    const tray = screen.getByTestId('dimensional-suggestion-tray')
    expect(tray).toBeInTheDocument()
    expect(tray.className).not.toContain('absolute')
  })

  it('uses 48px touch targets for suggestion chips', () => {
    renderField()
    const svg = document.querySelector('svg') as SVGSVGElement
    vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      width: 300,
      height: 300,
      top: 0,
      left: 0,
      right: 300,
      bottom: 300,
      toJSON: () => ({}),
    } as DOMRect)

    fireEvent.click(svg, { clientX: 120, clientY: 220 })
    const tray = screen.getByTestId('dimensional-suggestion-tray')
    const chipButtons = tray.querySelectorAll('button')
    expect(chipButtons.length).toBeGreaterThan(0)
    for (const chip of chipButtons) {
      expect(chip.className).toContain('min-h-[48px]')
    }
  })
})
