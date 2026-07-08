import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChainAnalysis } from '../components/ChainAnalysis'
import { LanguageProvider } from '../context/LanguageContext'

function renderChain(overrides: Partial<React.ComponentProps<typeof ChainAnalysis>> = {}) {
  const defaults: React.ComponentProps<typeof ChainAnalysis> = {
    isOpen: true,
    onClose: vi.fn(),
    entries: [],
    loading: false,
    onSave: vi.fn().mockResolvedValue(undefined),
    onClearAll: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }

  return {
    ...render(
      <LanguageProvider>
        <ChainAnalysis {...defaults} />
      </LanguageProvider>
    ),
    props: defaults,
  }
}

describe('ChainAnalysis', () => {
  it('requires input before advancing and saves a full chain', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    renderChain({ onSave })

    const nextButton = screen.getByRole('button', { name: 'Next' })
    expect(nextButton).toBeDisabled()

    const prompts = [
      'What happened right before this started?',
      'What made you more vulnerable today?',
      'What was the exact prompting event?',
      'What emotion did you feel most strongly?',
      'What urge showed up?',
      'What action did you take?',
      'What happened after that action?',
    ]

    for (let i = 0; i < prompts.length; i++) {
      expect(screen.getByText(prompts[i])).toBeInTheDocument()
      await user.type(screen.getByRole('textbox'), `entry-${i}`)
      await user.click(screen.getByRole('button', { name: i === prompts.length - 1 ? 'Save chain' : 'Next' }))
    }

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1)
    })

    expect(onSave.mock.calls[0][0]).toMatchObject({
      triggeringEvent: 'entry-0',
      vulnerabilityFactors: 'entry-1',
      promptingEvent: 'entry-2',
      emotion: 'entry-3',
      urge: 'entry-4',
      action: 'entry-5',
      consequence: 'entry-6',
    })
  })

  it('renders nothing and does not fire callbacks when closed', () => {
    const onClose = vi.fn()
    renderChain({ isOpen: false, onClose })

    expect(screen.queryByRole('heading', { name: /chain analysis/i })).not.toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('renders recent entries and clears them via clear-all action', async () => {
    const user = userEvent.setup()
    const onClearAll = vi.fn().mockResolvedValue(undefined)

    renderChain({
      entries: [
        {
          id: 'entry-1',
          timestamp: Date.now(),
          triggeringEvent: 'message',
          vulnerabilityFactors: 'sleep',
          promptingEvent: 'feedback',
          emotion: 'anxiety',
          urge: 'avoid',
          action: 'withdrew',
          consequence: 'felt stuck',
        },
      ],
      onClearAll,
    })

    expect(screen.getByText('Recent chains')).toBeInTheDocument()
    expect(screen.getByText('anxiety')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear all data' }))
    expect(onClearAll).toHaveBeenCalledTimes(1)
  })

  it('navigates forward and backward preserving step content', async () => {
    const user = userEvent.setup()
    renderChain()

    // Step 0 (triggeringEvent): type and advance
    await user.type(screen.getByRole('textbox'), 'trigger')
    expect(await screen.findByText(/1\/7/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText(/2\/7/)).toBeInTheDocument()

    // Step 1 (vulnerabilityFactors): type and advance to step 2
    await user.type(screen.getByRole('textbox'), 'sleep')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText(/3\/7/)).toBeInTheDocument()

    // Step 2 (promptingEvent): type content, then go Back — should return to step 1 with preserved text
    await user.type(screen.getByRole('textbox'), 'feedback')

    const backBtn = screen.getByRole('button', { name: 'Back' })
    expect(backBtn).not.toBeDisabled()
    await user.click(backBtn)

    // Back on step 2 returns to step 1; content should still be present
    const textarea = screen.getByDisplayValue('sleep') as HTMLTextAreaElement | null
    expect(textarea).not.toBeNull()
  })

  it('disables the Back button at step 0 and re-enables it after advancing', async () => {
    const user = userEvent.setup()
    renderChain()

    // Initial state: Back must be disabled — cannot go before the first step
    const backBtn = screen.getByRole('button', { name: 'Back' })
    expect(backBtn).toBeDisabled()

    // Type content so Next is enabled; advance to step 1
    await user.type(screen.getByRole('textbox'), 'trigger')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    // After advancing, Back must be re-enabled
    const updatedBackBtn = screen.getByRole('button', { name: 'Back' })
    expect(updatedBackBtn).not.toBeDisabled()
  })

  it('shows success banner with Done button after saving', async () => {
    const user = userEvent.setup()
    renderChain()

    const prompts = [
      'What happened right before this started?',
      'What made you more vulnerable today?',
      'What was the exact prompting event?',
      'What emotion did you feel most strongly?',
      'What urge showed up?',
      'What action did you take?',
      'What happened after that action?',
    ]

    for (let i = 0; i < prompts.length; i++) {
      await user.type(screen.getByRole('textbox'), `entry-${i}`)
      await user.click(screen.getByRole('button', { name: i === prompts.length - 1 ? 'Save chain' : 'Next' }))
    }

    await waitFor(() => {
      expect(screen.getByText(/chain saved/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /done/i })).toBeVisible()
    })
  })
})
