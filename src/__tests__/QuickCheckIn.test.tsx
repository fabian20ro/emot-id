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
    const [selected, results] = onComplete.mock.calls[0] as [unknown, unknown]
    expect(selected).toHaveLength(3)
    expect(results).toHaveLength(3)
    for (const result of results) {
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('label')
      expect(typeof (result as Record<string, unknown>).id).toBe('string')
      expect((result as { label: unknown }).label).toEqual(
        expect.objectContaining({ ro: expect.any(String), en: expect.any(String) })
      )
    }
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderQuickCheckIn({ isOpen: true, onClose })

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(1)
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

  it('visually signals when selection is at max', async () => {
    const user = userEvent.setup()
    renderQuickCheckIn()

    // 0/3 starts without indigo color override
    expect(screen.getByText('0/3').style.color).not.toBe('rgb(129, 140, 248)')

    const emotionButtons = screen.getAllByRole('button').filter((button) => {
      const label = button.textContent?.trim().toLowerCase() ?? ''
      return ['anxiety', 'sadness', 'anger'].includes(label)
    })

    await user.click(emotionButtons[0]) // 1/3
    expect(screen.getByText('1/3').style.color).not.toBe('rgb(129, 140, 248)')
    await user.click(emotionButtons[1]) // 2/3
    expect(screen.getByText('2/3').style.color).not.toBe('rgb(129, 140, 248)')
    await user.click(emotionButtons[2]) // 3/3 — should turn indigo to signal saturation
    const maxCounter = screen.getByText('3/3')
    expect(maxCounter.style.color).toBe('rgb(129, 140, 248)')
  })
})
