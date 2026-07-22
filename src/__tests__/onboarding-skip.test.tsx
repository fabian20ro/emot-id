import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Onboarding } from '../components/Onboarding'
import { LanguageProvider } from '../context/LanguageContext'

function renderOnboarding() {
  render(<LanguageProvider><Onboarding onComplete={vi.fn()} /></LanguageProvider>)
}

describe('Onboarding skip removal', () => {
  it('never presents a skip action', async () => {
    const user = userEvent.setup()
    renderOnboarding()
    expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument()
  })
})
