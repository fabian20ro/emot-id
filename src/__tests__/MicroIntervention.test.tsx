import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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
