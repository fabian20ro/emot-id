import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AnalyzeButton } from '../components/AnalyzeButton'
import { LanguageProvider } from '../context/LanguageContext'
import { MODEL_IDS } from '../models/constants'

function renderButton(props: Partial<React.ComponentProps<typeof AnalyzeButton>> = {}) {
  const defaults = { disabled: false, onClick: () => {}, modelId: MODEL_IDS.PLUTCHIK, ...props }
  return render(
    <LanguageProvider>
      <AnalyzeButton {...defaults} />
    </LanguageProvider>
  )
}

describe('AnalyzeButton model-aware text — dimension-specific guidance', () => {
  it('shows dimensional-specific text when disabled with dimensional model', () => {
    renderButton({ disabled: true, modelId: MODEL_IDS.DIMENSIONAL })
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.textContent).toBe(
      'Tap the square where your state fits on the two axes'
    )
  })

  it('shows somatic-specific text when disabled with somatic model', () => {
    renderButton({ disabled: true, modelId: MODEL_IDS.SOMATIC })
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.textContent).toBe(
      'Tap a body area where you notice a sensation'
    )
  })

  it('shows Analyze regardless of modelId when enabled', () => {
    renderButton({ disabled: false, modelId: MODEL_IDS.SOMATIC })
    expect(screen.getByRole('button', { name: 'Analyze' })).toBeInTheDocument()
  })

  it('shows Analyze when enabled with dimensional model', () => {
    renderButton({ disabled: false, modelId: MODEL_IDS.DIMENSIONAL })
    expect(screen.getByRole('button', { name: 'Analyze' })).toBeInTheDocument()
  })

  it('shows Analyze when enabled with somatic model', () => {
    renderButton({ disabled: false, modelId: MODEL_IDS.SOMATIC })
    expect(screen.getByRole('button', { name: 'Analyze' })).toBeInTheDocument()
  })
})
