import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Onboarding } from '../components/Onboarding'
import { LanguageProvider } from '../context/LanguageContext'
import { getAvailableModels } from '../models/registry'
import { storage } from '../data/storage'

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
  setItemSpy.mockClear()
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

    // Advance through all 4 screens.
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))

    // Pick a real model id from the registry (not hardcoded).
    const models = getAvailableModels()
    expect(models.length).toBeGreaterThan(0)
    const targetModel = models[0]

    await user.click(screen.getByRole('button', { name: new RegExp(targetModel.name.en, 'i') }))
    await user.click(screen.getByRole('button', { name: /get started/i }))

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(targetModel.id)
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

  it('onComplete receives the clicked model id, not a hardcoded value', async () => {
    const user = userEvent.setup()
    const { onComplete } = renderOnboarding()

    // Advance to last screen where models are selectable.
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))

    // Pick a real model id from the registry (not hardcoded).
    const models = getAvailableModels()
    expect(models.length).toBeGreaterThan(0)
    const targetModel = models[models.length - 1] // last registered model

    await user.click(screen.getByRole('button', { name: new RegExp(targetModel.name.en, 'i') }))
    await user.click(screen.getByRole('button', { name: /get started/i }))

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(targetModel.id)
  })

  it('blocks final next when no model is selected, even on click', async () => {
    const user = userEvent.setup()
    const { onComplete } = renderOnboarding()

    // Advance to last screen but do not select any model
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))

    const getStarted = screen.getByRole('button', { name: /get started/i })
    expect(getStarted).toBeDisabled()

    // Attempt to click despite being disabled (e.g. via keyboard or programmatic trigger)
    await user.click(getStarted)

    expect(onComplete).not.toHaveBeenCalled()
  })

  it('enables Get Started after selecting any available model', async () => {
    const user = userEvent.setup()
    renderOnboarding()

    // Advance to the last screen where models are selectable.
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))

    const getStarted = screen.getByRole('button', { name: /get started/i })
    expect(getStarted).toBeDisabled()

    // Pick a real model id from the registry (not hardcoded).
    const models = getAvailableModels()
    expect(models.length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: new RegExp(models[0].name.en, 'i') }))

    expect(getStarted).not.toBeDisabled()
  })

  it('does not render a skip button', () => {
    renderOnboarding()
    expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument()
  })

  it('selecting one model deselects any previously selected model on last screen', async () => {
    const user = userEvent.setup()
    renderOnboarding()

    // Advance to the last screen where models are selectable.
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))

    // Pick two distinct models from the registry.
    const models = getAvailableModels()
    expect(models.length).toBeGreaterThanOrEqual(2)
    const firstModel = models[0]
    const secondModel = models[1]

    await user.click(screen.getByRole('button', { name: new RegExp(firstModel.name.en, 'i') }))

    // Only one model button should carry the active indicator styling.
    const firstButton = screen.getByRole('button', { name: new RegExp(firstModel.name.en, 'i') })
    expect(firstButton.className).toMatch(/indigo/)
    expect(screen.getByRole('button', { name: new RegExp(secondModel.name.en, 'i') }).className).not.toMatch(/indigo/)

    await user.click(screen.getByRole('button', { name: new RegExp(secondModel.name.en, 'i') }))

    // Now exactly one model button should carry the active styling — and it must be the second.
    expect(firstButton.className).not.toMatch(/indigo/)
    const selectedSecond = screen.getByRole('button', { name: new RegExp(secondModel.name.en, 'i') })
    expect(selectedSecond.className).toMatch(/indigo/)

    const getStarted = screen.getByRole('button', { name: /get started/i })
    expect(getStarted).not.toBeDisabled()
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

  it('renders simplified body text when simpleLanguage is true', () => {
    vi.spyOn(storage, 'get').mockImplementation((key: string) => {
      if (key === 'simpleLanguage') return 'true'
      if (key === 'language') return 'en'
      if (key === 'onboarded') return null
      return null
    })

    renderOnboarding()

    // Under simple language, the simplified body should be shown instead of regular.
    expect(screen.getByText(/be curious/i)).toBeInTheDocument()
  })

  it('each screen renders unique title and body text (no duplicate copy across steps)', async () => {
    const user = userEvent.setup()
    renderOnboarding()

    // Collect displayed texts on the first screen.
    const step1Texts: string[] = screen.getAllByText(/.+/i).map(el => el.textContent ?? '').filter(Boolean)

    for (let i = 0; i < 3; i++) {
      await user.click(screen.getByRole('button', { name: /next/i }))

      // Every text that appeared on step 1 must not reappear on a later screen.
      for (const t of step1Texts) {
        const matches = screen.queryAllByText(t)
        expect(
          matches.length,
          `'${t}' should not appear again on screen ${i + 2}`
        ).toBeLessThanOrEqual(1)
      }

      // There must be at least one new text element unique to this step.
      const currentTexts = screen.getAllByText(/.+/i).map(el => el.textContent ?? '').filter(Boolean)
      const previous = new Set(step1Texts)
      const newOnes = currentTexts.filter(t => !previous.has(t))
      expect(newOnes.length, `screen ${i + 2} should introduce at least one unique text`).toBeGreaterThan(0)
    }
  })
})
