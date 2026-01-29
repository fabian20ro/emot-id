import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BubbleField } from '../components/BubbleField'
import { LanguageProvider } from '../context/LanguageContext'
import type { Emotion } from '../components/Bubble'

const mockEmotions: Emotion[] = [
  {
    id: 'joy',
    label: { ro: 'bucurie', en: 'joy' },
    category: 'primary',
    color: '#FFE66D',
    intensity: 0.5,
    spawns: ['serenity', 'ecstasy'],
  },
  {
    id: 'sadness',
    label: { ro: 'tristețe', en: 'sadness' },
    category: 'primary',
    color: '#5DADE2',
    intensity: 0.5,
    spawns: ['pensiveness', 'grief'],
  },
]

const mockGenerations = new Map([
  ['joy', 0],
  ['sadness', 0],
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
        emotionGenerations={mockGenerations}
        currentGeneration={0}
      />
    )

    expect(screen.getByRole('button', { name: /joy/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sadness/i })).toBeInTheDocument()
  })

  it('shows instruction text when emotions are present', () => {
    const onSelect = vi.fn()
    renderWithProviders(
      <BubbleField
        emotions={mockEmotions}
        onSelect={onSelect}
        emotionGenerations={mockGenerations}
        currentGeneration={0}
      />
    )

    expect(screen.getByText(/tap the bubbles/i)).toBeInTheDocument()
  })

  it('shows empty state text when no emotions', () => {
    const onSelect = vi.fn()
    renderWithProviders(
      <BubbleField
        emotions={[]}
        onSelect={onSelect}
        emotionGenerations={new Map()}
        currentGeneration={0}
      />
    )

    expect(screen.getByText(/start by selecting/i)).toBeInTheDocument()
  })

  it('calls onSelect when a bubble is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    renderWithProviders(
      <BubbleField
        emotions={mockEmotions}
        onSelect={onSelect}
        emotionGenerations={mockGenerations}
        currentGeneration={0}
      />
    )

    const joyButton = screen.getByRole('button', { name: /joy/i })
    await user.click(joyButton)

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(mockEmotions[0])
  })
})
