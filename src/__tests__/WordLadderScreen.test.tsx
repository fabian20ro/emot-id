import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageProvider } from '../context/LanguageContext'
import { WordLadderScreen } from '../screens/WordLadderScreen'
import type { AnalysisResult, BaseEmotion } from '../models/types'

function renderScreen() {
  const onBack = vi.fn()
  const onComplete = vi.fn<(modelId: string, selections: BaseEmotion[], results: AnalysisResult[]) => void>()
  render(
    <LanguageProvider>
      <WordLadderScreen onBack={onBack} onComplete={onComplete} />
    </LanguageProvider>,
  )
  return { onBack, onComplete }
}

describe('WordLadderScreen', () => {
  beforeEach(() => window.localStorage.clear())

  it('starts at broad words without showing a premature completion action', () => {
    renderScreen()

    expect(screen.getByTestId('words-screen')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Happy' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Use my current choice' })).not.toBeInTheDocument()
  })

  it('returns exactly one hierarchy level at a time', async () => {
    const user = userEvent.setup()
    renderScreen()

    await user.click(screen.getByRole('button', { name: 'Happy' }))
    await user.click(screen.getByRole('button', { name: 'Playful' }))
    expect(screen.getByRole('button', { name: 'Use Happy' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Use Playful' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back one level' }))
    expect(screen.getByRole('button', { name: 'Use Happy' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Use Playful' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Playful' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back one level' }))
    expect(screen.queryByRole('button', { name: 'Back one level' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Happy' })).toBeInTheDocument()
  })

  it('selects any path level and completes through the wheel analyzer', async () => {
    const user = userEvent.setup()
    const { onComplete } = renderScreen()

    await user.click(screen.getByRole('button', { name: 'Happy' }))
    await user.click(screen.getByRole('button', { name: 'Playful' }))
    await user.click(screen.getByRole('button', { name: 'Use Happy' }))

    const selected = screen.getByRole('region', { name: 'Selected words' })
    expect(within(selected).getByRole('button', { name: /happy/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Use my current choice' }))

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete.mock.calls[0][0]).toBe('wheel')
    expect(onComplete.mock.calls[0][1].map((emotion) => emotion.id)).toEqual(['happy'])
    expect(onComplete.mock.calls[0][2].map((result) => result.id)).toEqual(['happy'])
  })

  it('selects a precise leaf and allows removing it', async () => {
    const user = userEvent.setup()
    renderScreen()

    await user.click(screen.getByRole('button', { name: 'Happy' }))
    await user.click(screen.getByRole('button', { name: 'Playful' }))
    await user.click(screen.getByRole('button', { name: 'Energized' }))

    const selected = screen.getByRole('region', { name: 'Selected words' })
    await user.click(within(selected).getByRole('button', { name: /energized/i }))
    expect(screen.queryByRole('region', { name: 'Selected words' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Use my current choice' })).not.toBeInTheDocument()
  })

  it('localizes hierarchy controls in Romanian', async () => {
    window.localStorage.setItem('emot-id-language', 'ro')
    const user = userEvent.setup()
    renderScreen()

    await user.click(screen.getByRole('button', { name: 'Fericit' }))
    expect(screen.getByRole('button', { name: /folosiți fericit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Înapoi cu un nivel' })).toBeInTheDocument()
  })
})
