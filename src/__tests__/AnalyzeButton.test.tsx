import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MODEL_IDS } from '../models/constants'
import { AnalyzeButton } from '../components/AnalyzeButton'
import { LanguageProvider } from '../context/LanguageContext'

function renderButton(props: Partial<React.ComponentProps<typeof AnalyzeButton>> = {}) {
  const defaults = { disabled: false, onClick: () => {}, modelId: MODEL_IDS.PLUTCHIK, ...props }
  return render(
    <LanguageProvider>
      <AnalyzeButton {...defaults} />
    </LanguageProvider>
  )
}

describe('AnalyzeButton', () => {
  it('shows analyze text when enabled', () => {
    renderButton({ disabled: false })
    expect(screen.getByText('Analyze')).toBeInTheDocument()
  })

  it('shows default disabled text when disabled with non-somatic model', () => {
    renderButton({ disabled: true, modelId: MODEL_IDS.PLUTCHIK })
    expect(screen.getByRole('button').textContent).toBe('Select an emotion that resonates with you')
  })

  it('shows dimensional disabled guidance for the dimensional model', () => {
    renderButton({ disabled: true, modelId: MODEL_IDS.DIMENSIONAL })
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.textContent).toBe('Tap the square where your state fits on the two axes')
  })

  it('shows somatic disabled guidance for the somatic model', () => {
    renderButton({ disabled: true, modelId: MODEL_IDS.SOMATIC })
    expect(screen.getByRole('button', { name: /Tap a body area where you notice a sensation/i })).toBeInTheDocument()
  })

  it('includes the selection count when enabled and selections exist', () => {
    renderButton({ disabled: false, selectionCount: 3 })
    expect(screen.getByText('Analyze (3)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Analyze (3)' })).toBeInTheDocument()
  })

  it('calls onClick when enabled and clicked', async () => {
    const onClick = vi.fn()
    renderButton({ disabled: false, onClick })
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('has disabled attribute when disabled', () => {
    renderButton({ disabled: true })
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not fire onClick on a disabled button', async () => {
    const onClick = vi.fn()
    renderButton({ disabled: true, onClick })
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('shows exact disabled text with selection count when disabled and selections exist', () => {
    renderButton({ disabled: true, modelId: MODEL_IDS.PLUTCHIK, selectionCount: 2 })
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.textContent).toBe('Select an emotion that resonates with you\n(2 selected)')
  })

  it('does not show count suffix when disabled with no selections', () => {
    renderButton({ disabled: true, selectionCount: 0 })
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.textContent).not.toContain('(selected)')
  })

  it('sets aria-label to undefined when no selections', () => {
    renderButton({ disabled: false, selectionCount: 0 })
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.getAttribute('aria-label')).toBeNull()
  })

  it('includes selection count=1 in aria-label when enabled', () => {
    renderButton({ disabled: false, selectionCount: 1 })
    expect(screen.getByRole('button', { name: 'Analyze (1)' })).toBeInTheDocument()
  })

  it('includes selection count in aria-label when enabled with selections', () => {
    renderButton({ disabled: false, selectionCount: 4 })
    expect(screen.getByRole('button', { name: 'Analyze (4)' })).toBeInTheDocument()
  })

  it('does not set aria-label when disabled even with selections', () => {
    renderButton({ disabled: true, modelId: MODEL_IDS.PLUTCHIK, selectionCount: 3 })
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.getAttribute('aria-label')).toBeNull()
  })

  it('renders a native button with gradient classes when enabled to draw attention', () => {
    renderButton({ disabled: false })
    const button = screen.getByRole('button') as HTMLButtonElement
    // framer-motion motion.button renders a real <button>; any other element signals
    // the component did not mount through the intended path.
    expect(button.tagName).toBe('BUTTON')
    expect(button instanceof HTMLButtonElement).toBe(true)
    // The main render path (line 57-68 in AnalyzeButton.tsx) does not set type="button";
    // only the loading-state branch sets it explicitly. Verifying disabled=false ensures
    // the button is interactive and framer-motion rendered through to a real element.
    expect(button.disabled).toBe(false)

    const classes = button.className.split(/\s+/)
    // Every expected utility class must be present as an explicit string token so a
    // missing gradient, wrong palette, or absent animation hook fails visibly.
    expect(classes).toEqual(
      expect.arrayContaining([
        'w-full',
        'py-2.5',
        'px-6',
        'rounded-xl',
        'font-semibold',
        'text-base',
        'shadow-lg',
        'transition-all',
        'bg-gradient-to-r',
        'from-purple-500',
        'to-pink-500',
        'text-white',
      ])
    )
  })

  it('renders a native button with gray palette when disabled', () => {
    renderButton({ disabled: true })
    const button = screen.getByRole('button') as HTMLButtonElement
    // framer-motion motion.button renders a real <button>; any other element signals
    // the component did not mount through the intended path.
    expect(button.tagName).toBe('BUTTON')
    expect(button instanceof HTMLButtonElement).toBe(true)
    expect(button.disabled).toBe(true)

    const classes = button.className.split(/\s+/)
    // Every expected utility class must be present as an explicit string token so a
    // missing palette, wrong color, or absent disabled hook fails visibly.
    expect(classes).toEqual(
      expect.arrayContaining([
        'w-full',
        'py-2.5',
        'px-6',
        'rounded-xl',
        'font-semibold',
        'text-base',
        'shadow-lg',
        'transition-all',
        'bg-gray-700',
        'text-gray-400',
        'cursor-not-allowed',
      ])
    )
  })

  it('shows Analyzing... text when modelReady is false', () => {
    renderButton({ disabled: true, modelReady: false })
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.textContent).toBe('Analyzing...')
    expect(button.getAttribute('aria-label')).toBe('Analyzing...')
  })

  it('does not show disabled text when modelReady is false', () => {
    renderButton({ disabled: true, modelId: MODEL_IDS.PLUTCHIK, selectionCount: 0, modelReady: false })
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.textContent).toBe('Analyzing...')
    expect(button.textContent).not.toContain('(selected)')
  })

  it('shows Analyzing text regardless of selection count when modelReady is false', () => {
    renderButton({ disabled: true, modelId: MODEL_IDS.PLUTCHIK, selectionCount: 3, modelReady: false })
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.textContent).toBe('Analyzing...')
    // Loading state must not leak the disabled guidance or selection count into visible text
    expect(button.textContent).not.toContain('(selected)')
    expect(button.textContent).not.toContain('Select an emotion')
  })

  it('applies loading-state gradient and is disabled when modelReady=false', () => {
    renderButton({ disabled: true, modelId: MODEL_IDS.PLUTCHIK, selectionCount: 0, modelReady: false })
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button).toBeDisabled()
    expect(button.textContent).toBe('Analyzing...')
    expect(button.getAttribute('aria-label')).toBe('Analyzing...')
    // Loading state uses the purple-to-pink gradient, not the gray disabled palette
    const classes = button.className.split(/\s+/)
    expect(classes).toEqual(
      expect.arrayContaining(['bg-gradient-to-r', 'from-purple-500', 'to-pink-500'])
    )
  })

  it('is interactive when enabled and modelReady is true by default', () => {
    renderButton({ disabled: false, modelId: MODEL_IDS.PLUTCHIK, selectionCount: 2 })
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button).not.toBeDisabled()
    expect(button.textContent).toBe('Analyze (2)')
    expect(button.getAttribute('aria-label')).toBe('Analyze (2)')
  })

  it('shows Analyze text when enabled and modelReady defaults to true', () => {
    renderButton({ disabled: false, modelReady: undefined })
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.textContent).toBe('Analyze')
  })

  it('forces the loading button to be disabled even when parent passes disabled=false', async () => {
    const onClick = vi.fn()
    renderButton({ disabled: false, modelReady: false, onClick })
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button).toBeDisabled()
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders the main path with type="button" to avoid accidental form submission', () => {
    renderButton({ disabled: false })
    const button = screen.getByRole('button') as HTMLButtonElement
    // The component renders inside potential <form> contexts; without type="button",
    // browsers default interactive buttons become submit triggers. This matches the
    // loading-state branch which explicitly sets type="button" (line 21 of source).
    expect(button.type).toBe('button')
    expect(button.getAttribute('type')).toBe('button')
  })

  it('renders the disabled path with type="button" to avoid accidental form submission', () => {
    renderButton({ disabled: true })
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.type).toBe('button')
    expect(button.getAttribute('type')).toBe('button')
  })

  it('renders the loading path with type="button" to avoid accidental form submission', () => {
    renderButton({ disabled: true, modelReady: false })
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.type).toBe('button')
    expect(button.getAttribute('type')).toBe('button')
  })

  it('renders the dimensional disabled path with type="button"', () => {
    renderButton({ disabled: true, modelId: MODEL_IDS.DIMENSIONAL })
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.type).toBe('button')
  })

  it('renders the somatic disabled path with type="button"', () => {
    renderButton({ disabled: true, modelId: MODEL_IDS.SOMATIC })
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.type).toBe('button')
  })
})
