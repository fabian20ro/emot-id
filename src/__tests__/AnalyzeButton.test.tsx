import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { AnalyzeButton } from '../components/AnalyzeButton'
import { LanguageProvider } from '../context/LanguageContext'

function renderButton(props: Partial<React.ComponentProps<typeof AnalyzeButton>> = {}) {
  const defaults = { disabled: false, onClick: () => {}, ...props }
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

  it('shows disabled text when disabled', () => {
    renderButton({ disabled: true })
    expect(screen.getByText(/Select an emotion bubble/)).toBeInTheDocument()
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
