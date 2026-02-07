import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GranularityTraining } from '../components/GranularityTraining'
import { LanguageProvider } from '../context/LanguageContext'

function renderTraining(props: Partial<React.ComponentProps<typeof GranularityTraining>> = {}) {
  const defaults: React.ComponentProps<typeof GranularityTraining> = {
    isOpen: true,
    onClose: vi.fn(),
    ...props,
  }

  return {
    ...render(
      <LanguageProvider>
        <GranularityTraining {...defaults} />
      </LanguageProvider>,
    ),
    props: defaults,
  }
}

describe('GranularityTraining', () => {
  it('renders step progress and keeps continue disabled until a response is selected', () => {
    renderTraining()

    expect(screen.getByText('Step 1/5')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  it('shows normalized lowercase options in practice mode', () => {
    renderTraining()

    expect(screen.getByRole('button', { name: 'anxiety' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'apprehension' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'fear' })).toBeInTheDocument()
  })

  it('shows immediate feedback after selecting an emotion option', async () => {
    const user = userEvent.setup()
    renderTraining()

    await user.click(screen.getByRole('button', { name: 'anxiety' }))

    expect(screen.getByText(/You chose anxiety/i)).toBeInTheDocument()
    expect(screen.getByText(/differ mostly by intensity/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  it('shows dedicated non-judgmental feedback for not-sure path', async () => {
    const user = userEvent.setup()
    renderTraining()

    await user.click(screen.getByRole('button', { name: "I'm not sure — they all fit" }))

    expect(screen.getByText(/It's okay not to be sure/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  it('completes after 5 steps, shows summary, and can restart', async () => {
    const user = userEvent.setup()
    renderTraining()

    const choices = ['anxiety', 'annoyance', 'sadness', 'guilt', 'interest']

    for (const choice of choices) {
      await user.click(screen.getByRole('button', { name: choice }))
      await user.click(screen.getByRole('button', { name: 'Continue' }))
    }

    expect(screen.getByText('Practice session completed')).toBeInTheDocument()
    expect(screen.getByText('5 clear choices')).toBeInTheDocument()
    expect(screen.getByText('0 unsure choices')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Restart' }))
    expect(screen.getByText('Step 1/5')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  it('keeps modal accessibility semantics and close affordance', () => {
    renderTraining()

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })
})
