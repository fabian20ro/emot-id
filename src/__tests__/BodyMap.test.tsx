import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BodyMap } from '../components/BodyMap'
import { LanguageProvider } from '../context/LanguageContext'
import type { SomaticRegion, SomaticSelection } from '../models/somatic/types'

function makeRegion(id: string, label: string): SomaticRegion {
  return {
    id,
    label: { ro: label, en: label },
    color: '#999',
    svgRegionId: id,
    group: 'head',
    commonSensations: ['tension', 'warmth', 'pressure'],
    emotionSignals: [],
  }
}

function buildEmotions() {
  const regions: [string, string][] = [
    ['head', 'Head / Face'],
    ['jaw', 'Jaw'],
    ['throat', 'Throat'],
    ['shoulders', 'Shoulders'],
    ['upper-back', 'Upper Back'],
    ['chest', 'Chest'],
    ['stomach', 'Stomach'],
    ['lower-back', 'Lower Back'],
    ['arms', 'Arms'],
    ['hands', 'Hands'],
    ['legs', 'Legs'],
    ['feet', 'Feet'],
  ]
  return regions.map(([id, label]) => makeRegion(id, label))
}

function renderBodyMap(overrides: Partial<React.ComponentProps<typeof BodyMap>> = {}) {
  const defaults: React.ComponentProps<typeof BodyMap> = {
    emotions: buildEmotions(),
    onSelect: vi.fn(),
    onDeselect: vi.fn(),
    sizes: new Map(),
    selections: [],
    ...overrides,
  }
  return {
    ...render(
      <LanguageProvider>
        <BodyMap {...defaults} />
      </LanguageProvider>
    ),
    onSelect: defaults.onSelect as ReturnType<typeof vi.fn>,
    onDeselect: defaults.onDeselect as ReturnType<typeof vi.fn>,
  }
}

describe('BodyMap', () => {
  it('renders SVG with body regions', () => {
    renderBodyMap()
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()

    // Should have path elements for each body region (exclude hit area paths)
    const paths = document.querySelectorAll('[data-region]:not([data-region$="-hit"])')
    expect(paths.length).toBe(12)
  })

  it('uses height-driven layout classes on root and SVG', () => {
    renderBodyMap()
    const root = screen.getByTestId('bodymap-root')
    const svg = document.querySelector('svg')!
    expect(root.className).toContain('h-full')
    expect(root.className).toContain('min-h-0')
    expect(root.className).toContain('w-full')
    expect(svg.className.baseVal).toContain('h-full')
    expect(svg.className.baseVal).toContain('w-auto')
    expect(svg.className.baseVal).toContain('max-w-full')
  })

  it('renders mode toggle buttons', () => {
    renderBodyMap()
    expect(screen.getByText('Free selection')).toBeInTheDocument()
    expect(screen.getByText('Guided scan')).toBeInTheDocument()
  })

  it('opens SensationPicker when a region is clicked', async () => {
    const user = userEvent.setup()
    renderBodyMap()

    // Click the chest region path
    const chestPath = document.querySelector('[data-region="chest"]')!
    await user.click(chestPath)

    // SensationPicker should appear with sensation options
    expect(screen.getByText('Tension')).toBeInTheDocument()
    expect(screen.getByText('Warmth')).toBeInTheDocument()
  })

  it('fires onSelect with enriched SomaticSelection after full picker flow', async () => {
    const user = userEvent.setup()
    const { onSelect } = renderBodyMap()

    // Click a region
    const chestPath = document.querySelector('[data-region="chest"]')!
    await user.click(chestPath)

    // Pick sensation
    await user.click(screen.getByText('Tension'))

    // Pick intensity
    await user.click(screen.getByText('Mild'))

    expect(onSelect).toHaveBeenCalledTimes(1)
    const selection = onSelect.mock.calls[0][0] as SomaticSelection
    expect(selection.id).toBe('chest')
    expect(selection.selectedSensation).toBe('tension')
    expect(selection.selectedIntensity).toBe(1)
  })

  it('closes picker when cancel button clicked', async () => {
    const user = userEvent.setup()
    renderBodyMap()

    const chestPath = document.querySelector('[data-region="chest"]')!
    await user.click(chestPath)
    expect(screen.getByText('Tension')).toBeInTheDocument()

    await user.click(screen.getByText('×'))

    // Picker should be gone — sensation buttons no longer visible
    expect(screen.queryByText('Mild')).not.toBeInTheDocument()
  })

  it('fires onDeselect when a selected region is clicked again', async () => {
    const user = userEvent.setup()
    const chestRegion = makeRegion('chest', 'Chest')
    const existingSelection: SomaticSelection = {
      ...chestRegion,
      selectedSensation: 'tension',
      selectedIntensity: 2,
    }
    const { onDeselect } = renderBodyMap({
      selections: [existingSelection],
    })

    const chestPath = document.querySelector('[data-region="chest"]')!
    await user.click(chestPath)

    expect(onDeselect).toHaveBeenCalledTimes(1)
    expect(onDeselect).toHaveBeenCalledWith(existingSelection)
  })

  it('does not open picker when clicking already-selected region', async () => {
    const user = userEvent.setup()
    const chestRegion = makeRegion('chest', 'Chest')
    const existingSelection: SomaticSelection = {
      ...chestRegion,
      selectedSensation: 'tension',
      selectedIntensity: 2,
    }
    renderBodyMap({ selections: [existingSelection] })

    const chestPath = document.querySelector('[data-region="chest"]')!
    await user.click(chestPath)

    // Picker should NOT appear — click triggers deselect instead
    expect(screen.queryByText('Tension')).not.toBeInTheDocument()
  })

  it('body regions have ARIA attributes for accessibility', () => {
    renderBodyMap()
    const buttons = document.querySelectorAll('g[role="button"]')
    expect(buttons.length).toBe(12)
    for (const btn of buttons) {
      expect(btn).toHaveAttribute('tabindex', '0')
      expect(btn).toHaveAttribute('aria-label')
      expect(btn).toHaveAttribute('aria-pressed', 'false')
    }
  })

  it('activates guided scan mode', async () => {
    const user = userEvent.setup()
    renderBodyMap()

    await user.click(screen.getByText('Guided scan'))

    // Guided scan starts with centering phase
    expect(screen.getByText('Take a breath. Notice your body.')).toBeInTheDocument()
  })
})
