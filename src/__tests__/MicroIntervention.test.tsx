import { describe, it, expect, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MicroIntervention, getInterventionType } from '../components/MicroIntervention'

const t = {
  interventionTitle: 'A moment for you',
  checkPrompt: 'How do you feel now?',
  checkBetter: 'Better',
  checkSame: 'About the same',
  checkWorse: 'Worse',
  worseValidation: 'Validation text',
  interventionDismiss: 'Continue',
}

describe('MicroIntervention', () => {
  it('announces breathing phases to assistive tech', () => {
    vi.useFakeTimers()
    const { unmount } = render(
      <MicroIntervention
        type="breathing"
        t={t}
        onDismiss={vi.fn()}
      />
    )

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Breathe in...')
    expect(status).toHaveAttribute('aria-live', 'polite')

    unmount()
    vi.useRealTimers()
  })

  it('advances breathing cues and shows check-in when complete', () => {
    vi.useFakeTimers()
    render(
      <MicroIntervention
        type="breathing"
        t={t}
        onDismiss={vi.fn()}
      />
    )

    expect(screen.getByRole('status')).toHaveTextContent('Breathe in...')

    act(() => { vi.advanceTimersByTime(4000) })
    expect(screen.getByRole('status')).toHaveTextContent('Hold...')

    act(() => { vi.advanceTimersByTime(2000) })
    expect(screen.getByRole('status')).toHaveTextContent('Breathe out...')

    act(() => { vi.advanceTimersByTime(6000) })
    act(() => { vi.advanceTimersByTime(4000) })
    act(() => { vi.advanceTimersByTime(2000) })
    act(() => { vi.advanceTimersByTime(6000) })
    act(() => { vi.advanceTimersByTime(4000) })
    act(() => { vi.advanceTimersByTime(2000) })
    act(() => { vi.advanceTimersByTime(6000) })

    expect(screen.getByText('How do you feel now?')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('announces savoring steps to assistive tech', () => {
    vi.useFakeTimers()
    const { unmount } = render(
      <MicroIntervention
        type="savoring"
        t={t}
        onDismiss={vi.fn()}
      />
    )

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Close your eyes for a moment.')
    expect(status).toHaveAttribute('aria-live', 'polite')

    unmount()
    vi.useRealTimers()
  })

  it('emits better response and dismisses for curiosity flow', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    const onResponse = vi.fn()

    render(
      <MicroIntervention
        type="curiosity"
        t={t}
        onDismiss={onDismiss}
        onResponse={onResponse}
      />
    )

    expect(screen.getByText('How do you feel now?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Better' }))

    expect(onResponse).toHaveBeenCalledWith('better')
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('shows validation when worse is selected', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    const onResponse = vi.fn()

    render(
      <MicroIntervention
        type="curiosity"
        t={t}
        onDismiss={onDismiss}
        onResponse={onResponse}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Worse' }))
    expect(onResponse).toHaveBeenCalledWith('worse')
    expect(screen.getByText('Validation text')).toBeInTheDocument()
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('dismisses after same response and does not show validation', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    const onResponse = vi.fn()

    render(
      <MicroIntervention
        type="curiosity"
        t={t}
        onDismiss={onDismiss}
        onResponse={onResponse}
      />
    )

    await user.click(screen.getByRole('button', { name: 'About the same' }))
    expect(onResponse).toHaveBeenCalledWith('same')
    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('Validation text')).not.toBeInTheDocument()
  })

  it('emits worse response, shows validation, and waits for dismiss', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    const onResponse = vi.fn()

    render(
      <MicroIntervention
        type="curiosity"
        t={t}
        onDismiss={onDismiss}
        onResponse={onResponse}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Worse' }))
    expect(onResponse).toHaveBeenCalledWith('worse')
    expect(onDismiss).not.toHaveBeenCalled()
    expect(screen.queryByText('Validation text')).toBeInTheDocument()

    // Dismiss only via the Continue button inside validation panel
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})

describe('getInterventionType', () => {
  it('returns curiosity for mixed valence regardless of arousal', () => {
    // Mixed valence should trigger curiosity even when arousal is undefined (no high-arousal bias)
    expect(getInterventionType(undefined, true, false, true)).toBe('curiosity')
    expect(getInterventionType(undefined, false, true, true)).toBe('curiosity')
  })

  it('returns breathing for high arousal with only negative emotions', () => {
    // High arousal + negative-only → calming intervention is appropriate
    expect(getInterventionType(0.8, false, true, false)).toBe('breathing')
  })

  it('returns savoring for positive-only emotions without mixed signal', () => {
    // Pleasant-only state should offer savoring to extend the positive experience
    expect(getInterventionType(undefined, true, false, false)).toBe('savoring')
    expect(getInterventionType(0.3, true, false, false)).toBe('savoring')
  })

  it('returns null when no intervention fits', () => {
    // No positive/negative/mixed signal → nothing to intervene on
    expect(getInterventionType(undefined, false, false, false)).toBeNull()
  })

  it('prefers curiosity over breathing when both signals are present', () => {
    // Mixed valence is more informative than arousal alone — curiosity takes priority
    expect(getInterventionType(0.8, true, false, true)).toBe('curiosity')
  })
})
