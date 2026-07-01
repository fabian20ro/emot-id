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
    expect(screen.getByRole('button').textContent).toMatch(/Select an emotion/i)
  })

  it('shows dimensional disabled guidance for the dimensional model', () => {
    renderButton({ disabled: true, modelId: MODEL_IDS.DIMENSIONAL })
    expect(screen.getByRole('button').textContent).toMatch(/Tap the square/i)
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

  it('shows selection count alongside hint text when disabled with existing selections', () => {
    renderButton({ disabled: true, modelId: MODEL_IDS.PLUTCHIK, selectionCount: 2 })
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.textContent).toContain('(2 selected)')
    expect(button.textContent).toMatch(/Select an emotion/i)
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

  it('includes selection count in aria-label when enabled with selections', () => {
    renderButton({ disabled: false, selectionCount: 4 })
    expect(screen.getByRole('button', { name: 'Analyze (4)' })).toBeInTheDocument()
  })
})
