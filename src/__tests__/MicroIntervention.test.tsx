import { describe, it, expect, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MicroIntervention } from '../components/MicroIntervention'

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
})
