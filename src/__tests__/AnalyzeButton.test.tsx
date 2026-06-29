import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnalyzeButton } from '../components/AnalyzeButton'
import { LanguageProvider } from '../context/LanguageContext'

function renderButton(props: Partial<React.ComponentProps<typeof AnalyzeButton>> = {}) {
  const defaults = { disabled: false, onClick: () => {}, modelId: 'plutchik', ...props }
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
    renderButton({ disabled: true, modelId: 'plutchik' })
    expect(screen.getByText('Select an emotion that resonates with you')).toBeInTheDocument()
  })

  it('shows dimensional disabled guidance for the dimensional model', () => {
    renderButton({ disabled: true, modelId: 'dimensional' })
    expect(screen.getByText(/Tap the square where your state fits/)).toBeInTheDocument()
  })

  it('shows somatic disabled guidance for the somatic model', () => {
    renderButton({ disabled: true, modelId: 'somatic' })
    expect(screen.getByText(/Tap a body area where you notice a sensation/)).toBeInTheDocument()
  })

  it('includes the selection count when enabled and selections exist', () => {
    renderButton({ disabled: false, selectionCount: 3 })
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
})
