import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Onboarding } from '../components/Onboarding'
import { LanguageProvider } from '../context/LanguageContext'

function renderOnboarding(onComplete = vi.fn()) {
  return {
    ...render(
      <LanguageProvider>
        <Onboarding onComplete={onComplete} />
      </LanguageProvider>
    ),
    onComplete,
  }
}

let setItemSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  setItemSpy = vi.spyOn(window.localStorage, 'setItem')
})

afterEach(() => {
  setItemSpy.mockRestore()
})

describe('Onboarding', () => {
  it('renders the first screen with exploration message', () => {
    renderOnboarding()
    expect(screen.getByText(/not a test/i)).toBeInTheDocument()
  })

  it('advances to the second screen on next', async () => {
    const user = userEvent.setup()
    renderOnboarding()

    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(screen.getByText(/every emotion has a purpose/i)).toBeInTheDocument()
  })

  it('advances to the third screen on next', async () => {
    const user = userEvent.setup()
    renderOnboarding()

    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(screen.getByText(/choose your way in/i)).toBeInTheDocument()
  })

  it('calls onComplete and sets localStorage on final next', async () => {
    const user = userEvent.setup()
    const { onComplete } = renderOnboarding()

    // Advance through all 4 screens
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /body map/i }))
    await user.click(screen.getByRole('button', { name: /get started/i }))

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith('somatic')
    expect(setItemSpy).toHaveBeenCalledWith('emot-id-onboarded', 'true')
  })

  it('keeps get started disabled until a model is selected on last screen', async () => {
    const user = userEvent.setup()
    renderOnboarding()

    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))

    const getStarted = screen.getByRole('button', { name: /get started/i })
    expect(getStarted).toBeDisabled()
  })

  it('does not render a skip button', () => {
    renderOnboarding()
    expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument()
  })

  it('shows step indicators for 4 screens', () => {
    renderOnboarding()
    // 4 step dots (including disclaimer screen)
    const dots = document.querySelectorAll('[data-step]')
    expect(dots.length).toBe(4)
  })

  it('shows back button on screens 2 and 3', async () => {
    const user = userEvent.setup()
    renderOnboarding()

    // No back button on first screen
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('goes back to previous screen when back is clicked', async () => {
    const user = userEvent.setup()
    renderOnboarding()

    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText(/every emotion has a purpose/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /back/i }))
    expect(screen.getByText(/not a test/i)).toBeInTheDocument()
  })
})
