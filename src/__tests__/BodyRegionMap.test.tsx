import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BodyRegionMap } from '../components/BodyRegionMap'
import { bodyRegionPaths } from '../components/body-paths'
import { LanguageProvider } from '../context/LanguageContext'
import type { SomaticRegion, SomaticSelection } from '../models/somatic/types'

function makeRegion(id: string, label: string): SomaticRegion {
  return {
    id,
    label: { ro: label, en: label },
    color: '#999999',
    svgRegionId: id,
    group: 'head',
    commonSensations: ['tension', 'warmth', 'pressure'],
    emotionSignals: [],
  }
}

function buildRegions() {
  return [
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
  ].map(([id, label]) => makeRegion(id, label))
}

function renderMap(overrides: Partial<React.ComponentProps<typeof BodyRegionMap>> = {}) {
  const props: React.ComponentProps<typeof BodyRegionMap> = {
    regions: buildRegions(),
    selections: [],
    side: 'front',
    onRegionActivate: vi.fn(),
    ...overrides,
  }
  render(
    <LanguageProvider>
      <BodyRegionMap {...props} />
    </LanguageProvider>,
  )
  return props
}

function renderedRegionPaths() {
  return document.querySelectorAll('[data-region]:not([data-region$="-hit"])')
}

describe('BodyRegionMap', () => {
  it('renders only front-facing regions for the front side', () => {
    renderMap()

    expect(renderedRegionPaths()).toHaveLength(10)
    expect(document.querySelector('[data-region="chest"]')).toBeInTheDocument()
    expect(document.querySelector('[data-region="upper-back"]')).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Front of body' })).toBeInTheDocument()
  })

  it('renders only back-facing regions for the back side', () => {
    renderMap({ side: 'back' })

    expect(renderedRegionPaths()).toHaveLength(8)
    expect(document.querySelector('[data-region="upper-back"]')).toBeInTheDocument()
    expect(document.querySelector('[data-region="chest"]')).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Back of body' })).toBeInTheDocument()
  })

  it('preserves expanded hit geometry for small regions', () => {
    renderMap()
    const expected = bodyRegionPaths.find((path) => path.id === 'throat')?.hitD
    const hitPath = document.querySelector('[data-region="throat-hit"]')

    expect(expected).toBeTruthy()
    expect(hitPath).toHaveAttribute('d', expected)
    expect(hitPath).toHaveAttribute('fill', 'transparent')
  })

  it('hands the complete region object to the route controller', async () => {
    const user = userEvent.setup()
    const props = renderMap()

    await user.click(document.querySelector('[data-region="chest"]')!)

    expect(props.onRegionActivate).toHaveBeenCalledTimes(1)
    expect(props.onRegionActivate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'chest', commonSensations: ['tension', 'warmth', 'pressure'] }),
    )
  })

  it('keeps labels as a second 48px pointer target for the same region', async () => {
    const user = userEvent.setup()
    const props = renderMap()
    const label = document.querySelector('[data-region-label="chest"]')!
    const hitRect = label.querySelector('rect')

    expect(hitRect).toHaveAttribute('height', '48')
    await user.click(label)
    expect(props.onRegionActivate).toHaveBeenCalledWith(expect.objectContaining({ id: 'chest' }))
  })

  it('supports Enter and Space activation with pressed state', async () => {
    const user = userEvent.setup()
    const props = renderMap()
    const chest = screen.getByRole('button', { name: 'Chest' })

    chest.focus()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')

    expect(chest).toHaveAttribute('tabindex', '0')
    expect(chest).toHaveAttribute('aria-pressed', 'false')
    expect(props.onRegionActivate).toHaveBeenCalledTimes(2)
  })

  it('encodes valid selection sensation and intensity without changing geometry', () => {
    const chest = makeRegion('chest', 'Chest')
    const selection: SomaticSelection = {
      ...chest,
      selectedSensation: 'tension',
      selectedIntensity: 2,
    }
    renderMap({ selections: [selection] })
    const chestButton = screen.getByRole('button', { name: 'Chest' })
    const chestPath = document.querySelector('[data-region="chest"]')

    expect(chestButton).toHaveAttribute('aria-pressed', 'true')
    expect(chestPath).toHaveAttribute('fill', '#ef4444')
    expect(chestPath).toHaveAttribute('fill-opacity', '0.8')
    expect(chestPath).toHaveAttribute(
      'd',
      bodyRegionPaths.find((path) => path.id === 'chest')?.d,
    )
    expect(document.querySelector('[data-region-label="chest"]')).toHaveClass('is-selected')
  })

  it('ignores malformed selections at the presentation boundary', () => {
    const malformed = {
      ...makeRegion('chest', 'Chest'),
      selectedSensation: '',
      selectedIntensity: 1,
    } as unknown as SomaticSelection

    renderMap({ selections: [malformed] })

    expect(screen.getByRole('button', { name: 'Chest' })).toHaveAttribute('aria-pressed', 'false')
    expect(document.querySelector('[data-region-label="chest"]')).not.toHaveClass('is-selected')
  })
})
