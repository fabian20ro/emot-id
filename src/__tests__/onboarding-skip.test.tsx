import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Onboarding } from '../components/Onboarding'
import { LanguageProvider } from '../context/LanguageContext'

function renderOnboarding() {
  const onComplete = vi.fn()
  const result = render(
    <LanguageProvider>
      <Onboarding onComplete={onComplete} />
    </LanguageProvider>,
  )
  return { ...result, onComplete }
}

describe('Onboarding skip button removal', () => {
  it('does not show skip button on first screen', () => {
    renderOnboarding()
    expect(screen.queryByText('Skip')).not.toBeInTheDocument()
    // aria-label must also be absent for any Skip-related element
    expect(screen.queryByLabelText(/skip/i)).not.toBeInTheDocument()
  })

  it('does not show skip button on last screen (disclaimer)', async () => {
    renderOnboarding()
    const user = userEvent.setup()

    // Navigate to last screen (4th screen, so click Next 3 times)
    const nextButton = screen.getByText('Next')
    await user.click(nextButton)
    await user.click(screen.getByText('Next'))
    await user.click(screen.getByText('Next'))

    // On last screen, skip remains absent
    expect(screen.queryByText('Skip')).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/skip/i)).not.toBeInTheDocument()
    // But "Get started" should be there
    expect(screen.getByText('Get started')).toBeInTheDocument()
  })

  it('does not show skip button after navigating back from last screen', async () => {
    renderOnboarding()
    const user = userEvent.setup()

    // Navigate to last screen (4th screen, so click Next 3 times)
    await user.click(screen.getByText('Next'))
    await user.click(screen.getByText('Next'))
    await user.click(screen.getByText('Next'))

    // Go back one step
    const backButton = screen.getByLabelText(/back/i)
    expect(backButton).toBeInTheDocument()
    await user.click(backButton)

    // Skip should still be absent on the previous screen
    expect(screen.queryByText('Skip')).not.toBeInTheDocument()
  })
})