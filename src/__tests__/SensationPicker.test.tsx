import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SensationPicker } from '../components/SensationPicker'
import { LanguageProvider } from '../context/LanguageContext'
import type { SensationType } from '../models/somatic/types'

const defaultSensations: SensationType[] = ['tension', 'warmth', 'heaviness', 'lightness']

function renderPicker(overrides: Partial<React.ComponentProps<typeof SensationPicker>> = {}) {
  const defaults: React.ComponentProps<typeof SensationPicker> = {
    regionLabel: 'Head',
    availableSensations: defaultSensations,
    onSelect: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  }
  return {
    ...render(
      <LanguageProvider>
        <SensationPicker {...defaults} />
      </LanguageProvider>
    ),
    onSelect: defaults.onSelect as ReturnType<typeof vi.fn>,
    onCancel: defaults.onCancel as ReturnType<typeof vi.fn>,
  }
}

describe('SensationPicker', () => {
  it('renders region label and sensation buttons', () => {
    renderPicker()
    expect(screen.getByText('Head')).toBeInTheDocument()
    expect(screen.getByText('Tension')).toBeInTheDocument()
    expect(screen.getByText('Warmth')).toBeInTheDocument()
    expect(screen.getByText('Heaviness')).toBeInTheDocument()
    expect(screen.getByText('Lightness')).toBeInTheDocument()
  })

  it('shows only the provided sensations', () => {
    renderPicker({ availableSensations: ['tension', 'pressure'] })
    expect(screen.getByText('Tension')).toBeInTheDocument()
    expect(screen.getByText('Pressure')).toBeInTheDocument()
    expect(screen.queryByText('Warmth')).not.toBeInTheDocument()
  })

  it('advances to intensity step after picking a sensation', async () => {
    const user = userEvent.setup()
    renderPicker()

    await user.click(screen.getByText('Tension'))

    // Intensity buttons should appear
    expect(screen.getByText('Mild')).toBeInTheDocument()
    expect(screen.getByText('Moderate')).toBeInTheDocument()
    expect(screen.getByText('Strong')).toBeInTheDocument()

    // Sensation grid should be gone
    expect(screen.queryByText('Warmth')).not.toBeInTheDocument()
  })

  it('calls onSelect with sensation and intensity', async () => {
    const user = userEvent.setup()
    const { onSelect } = renderPicker()

    await user.click(screen.getByText('Warmth'))
    await user.click(screen.getByText('Strong'))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('warmth', 3)
  })

  it('goes back to sensation step when back button clicked', async () => {
    const user = userEvent.setup()
    renderPicker()

    await user.click(screen.getByText('Tension'))
    expect(screen.getByText('Mild')).toBeInTheDocument()

    // Click back arrow
    await user.click(screen.getByText('←'))

    // Sensation grid should reappear
    expect(screen.getByText('Tension')).toBeInTheDocument()
    expect(screen.getByText('Warmth')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button clicked', async () => {
    const user = userEvent.setup()
    const { onCancel } = renderPicker()

    await user.click(screen.getByText('×'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when "Nothing here" clicked', async () => {
    const user = userEvent.setup()
    const { onCancel } = renderPicker()

    await user.click(screen.getByText('Nothing here'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('shows intensity anchor descriptions', async () => {
    const user = userEvent.setup()
    renderPicker()

    await user.click(screen.getByText('Tension'))

    expect(screen.getByText('barely noticeable')).toBeInTheDocument()
    expect(screen.getByText('clearly present')).toBeInTheDocument()
    expect(screen.getByText('hard to ignore')).toBeInTheDocument()
  })

  it('shows selected sensation icon in intensity step', async () => {
    const user = userEvent.setup()
    renderPicker()

    await user.click(screen.getByText('Tension'))

    // The tension icon '⫸' and label should be visible as header
    expect(screen.getByText(/Tension/)).toBeInTheDocument()
  })
})
