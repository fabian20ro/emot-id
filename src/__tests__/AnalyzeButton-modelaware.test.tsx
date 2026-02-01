import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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

describe('AnalyzeButton model-aware text', () => {
  it('shows somatic-specific text when disabled with somatic model', () => {
    renderButton({ disabled: true, modelId: 'somatic' })
    expect(screen.getByText(/Tap a body area/)).toBeInTheDocument()
  })

  it('shows default text when disabled with plutchik model', () => {
    renderButton({ disabled: true, modelId: 'plutchik' })
    expect(screen.getByText(/Select an emotion that resonates/)).toBeInTheDocument()
  })

  it('shows default text when disabled with wheel model', () => {
    renderButton({ disabled: true, modelId: 'wheel' })
    expect(screen.getByText(/Select an emotion that resonates/)).toBeInTheDocument()
  })

  it('shows Analyze regardless of modelId when enabled', () => {
    renderButton({ disabled: false, modelId: 'somatic' })
    expect(screen.getByText('Analyze')).toBeInTheDocument()
  })
})
