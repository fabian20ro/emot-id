import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SelectionBar } from '../components/SelectionBar'
import { LanguageProvider } from '../context/LanguageContext'
import type { Emotion } from '../components/Bubble'

const mockEmotions: Emotion[] = [
  {
    id: 'joy',
    label: { ro: 'bucurie', en: 'joy' },
    category: 'primary',
    color: '#FFE66D',
    intensity: 0.5,
    spawns: [],
  },
  {
    id: 'sadness',
    label: { ro: 'tristețe', en: 'sadness' },
    category: 'primary',
    color: '#5DADE2',
    intensity: 0.5,
    spawns: [],
  },
]

function renderWithProviders(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>)
}

describe('SelectionBar', () => {
  it('shows empty state when no selections', () => {
    const onDeselect = vi.fn()
    const onClear = vi.fn()
    renderWithProviders(
      <SelectionBar selections={[]} onDeselect={onDeselect} onClear={onClear} />
    )

    expect(screen.getByText(/no selection/i)).toBeInTheDocument()
  })

  it('displays selected emotions', () => {
    const onDeselect = vi.fn()
    const onClear = vi.fn()
    renderWithProviders(
      <SelectionBar selections={mockEmotions} onDeselect={onDeselect} onClear={onClear} />
    )

    expect(screen.getByRole('button', { name: /joy/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sadness/i })).toBeInTheDocument()
  })

  it('calls onDeselect when a chip is clicked', async () => {
    const user = userEvent.setup()
    const onDeselect = vi.fn()
    const onClear = vi.fn()
    renderWithProviders(
      <SelectionBar selections={mockEmotions} onDeselect={onDeselect} onClear={onClear} />
    )

    const joyChip = screen.getByRole('button', { name: /joy/i })
    await user.click(joyChip)

    expect(onDeselect).toHaveBeenCalledTimes(1)
    expect(onDeselect).toHaveBeenCalledWith(mockEmotions[0])
  })

  it('shows clear button when selections exist', () => {
    const onDeselect = vi.fn()
    const onClear = vi.fn()
    renderWithProviders(
      <SelectionBar selections={mockEmotions} onDeselect={onDeselect} onClear={onClear} />
    )

    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument()
  })

  it('calls onClear when clear button is clicked', async () => {
    const user = userEvent.setup()
    const onDeselect = vi.fn()
    const onClear = vi.fn()
    renderWithProviders(
      <SelectionBar selections={mockEmotions} onDeselect={onDeselect} onClear={onClear} />
    )

    const clearButton = screen.getByRole('button', { name: /clear all/i })
    await user.click(clearButton)

    expect(onClear).toHaveBeenCalledTimes(1)
  })
})
