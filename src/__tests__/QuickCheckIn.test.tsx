import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuickCheckIn, QUICK_EMOTION_IDS } from '../components/QuickCheckIn'
import { LanguageProvider } from '../context/LanguageContext'

function renderQuickCheckIn(props: Partial<React.ComponentProps<typeof QuickCheckIn>> = {}) {
  const defaults: React.ComponentProps<typeof QuickCheckIn> = {
    isOpen: true,
    onClose: vi.fn(),
    onComplete: vi.fn(),
    ...props,
  }
  return {
    ...render(
      <LanguageProvider>
        <QuickCheckIn {...defaults} />
      </LanguageProvider>
    ),
    onComplete: defaults.onComplete as ReturnType<typeof vi.fn>,
  }
}

describe('QuickCheckIn', () => {
  it('includes high-distress options for crisis routing', () => {
    expect(QUICK_EMOTION_IDS).toContain('despair')
    expect(QUICK_EMOTION_IDS).toContain('helpless')
    expect(QUICK_EMOTION_IDS).toContain('numb')
  })

  it('renders quick check-in dialog', () => {
    renderQuickCheckIn()
    expect(screen.getByText('Quick check-in')).toBeInTheDocument()
    expect(screen.getByText(/What describes how you feel right now/i)).toBeInTheDocument()
  })

  it('allows at most 3 selections and submits selected emotions', async () => {
    const user = userEvent.setup()
    const { onComplete } = renderQuickCheckIn()

    const emotionButtons = screen.getAllByRole('button').filter((button) => {
      const label = button.textContent?.trim().toLowerCase() ?? ''
      return ['anxiety', 'sadness', 'anger', 'joy', 'fear'].includes(label)
    })

    await user.click(emotionButtons[0])
    await user.click(emotionButtons[1])
    await user.click(emotionButtons[2])
    // 4th click is ignored; max is 3 — selection count stays at 3
    expect(screen.getByText('3/3')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Done' }))
    expect(onComplete).toHaveBeenCalledTimes(1)
    const selected = onComplete.mock.calls[0][0]
    expect(selected).toHaveLength(3)
  })

  it('disables Done when no emotions are selected', () => {
    renderQuickCheckIn()
    expect(screen.getByRole('button', { name: 'Done' })).toBeDisabled()
  })

  it('toggles selection off when clicking an already-selected emotion', async () => {
    const user = userEvent.setup()
    const { onComplete } = renderQuickCheckIn()

    const emotionButtons = screen.getAllByRole('button').filter((button) => {
      const label = button.textContent?.trim().toLowerCase() ?? ''
      return ['anxiety', 'sadness'].includes(label)
    })

    await user.click(emotionButtons[0]) // anxiety → selected
    expect(screen.getByText('1/3')).toBeInTheDocument()
    await user.click(emotionButtons[1]) // sadness → selected
    expect(screen.getByText('2/3')).toBeInTheDocument()
    await user.click(emotionButtons[0]) // anxiety → deselected
    expect(screen.getByText('1/3')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Done' }))
    const selected = onComplete.mock.calls[0][0]
    expect(selected).toHaveLength(1)
  })

  it('resets selection counter after completing', async () => {
    const user = userEvent.setup()
    renderQuickCheckIn()

    const emotionButtons = screen.getAllByRole('button').filter((button) => {
      const label = button.textContent?.trim().toLowerCase() ?? ''
      return ['anxiety', 'sadness'].includes(label)
    })

    await user.click(emotionButtons[0]) // anxiety → selected
    expect(screen.getByText('1/3')).toBeInTheDocument()
    await user.click(emotionButtons[1]) // sadness → selected
    expect(screen.getByText('2/3')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Done' }))
    // After completion the dialog closes — counter text disappears
    expect(screen.queryByText(/1\/3|2\/3|3\/3/)).not.toBeInTheDocument()
  })
})
