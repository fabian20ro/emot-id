import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BubbleField } from '../components/BubbleField'
import { LanguageProvider } from '../context/LanguageContext'
import type { BaseEmotion } from '../models/types'

const mockEmotions: BaseEmotion[] = [
  {
    id: 'joy',
    label: { ro: 'bucurie', en: 'joy' },
    color: '#FFE66D',
    intensity: 0.5,
  },
  {
    id: 'sadness',
    label: { ro: 'tristețe', en: 'sadness' },
    color: '#5DADE2',
    intensity: 0.5,
  },
]

const mockSizes = new Map<string, 'small' | 'medium' | 'large'>([
  ['joy', 'large'],
  ['sadness', 'large'],
])

function renderWithProviders(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>)
}

describe('BubbleField', () => {
  it('renders all provided emotions', () => {
    const onSelect = vi.fn()
    renderWithProviders(
      <BubbleField
        emotions={mockEmotions}
        onSelect={onSelect}
        onDeselect={vi.fn()}
        sizes={mockSizes}
      />
    )

    expect(screen.getByRole('button', { name: /joy/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sadness/i })).toBeInTheDocument()
  })

  it('calls onSelect when a bubble is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    renderWithProviders(
      <BubbleField
        emotions={mockEmotions}
        onSelect={onSelect}
        onDeselect={vi.fn()}
        sizes={mockSizes}
      />
    )

    const joyButton = screen.getByRole('button', { name: /joy/i })
    await user.click(joyButton)

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(mockEmotions[0])
  })
})
