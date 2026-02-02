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

describe('Onboarding skip button', () => {
  it('shows skip button on first screen', () => {
    renderOnboarding()
    expect(screen.getByText('Skip')).toBeInTheDocument()
  })

  it('hides skip button on last screen (disclaimer)', async () => {
    renderOnboarding()
    const user = userEvent.setup()

    // Navigate to last screen (4th screen, so click Next 3 times)
    const nextButton = screen.getByText('Next')
    await user.click(nextButton)
    await user.click(screen.getByText('Next'))
    await user.click(screen.getByText('Next'))

    // On last screen, skip should not be present
    expect(screen.queryByText('Skip')).not.toBeInTheDocument()
    // But "Get started" should be there
    expect(screen.getByText('Get started')).toBeInTheDocument()
  })
})
