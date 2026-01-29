import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Bubble } from '../components/Bubble'
import type { BaseEmotion } from '../models/types'
import { LanguageProvider } from '../context/LanguageContext'

const mockEmotion: BaseEmotion = {
  id: 'joy',
  label: { ro: 'bucurie', en: 'joy' },
  color: '#FFE66D',
  intensity: 0.5,
}

function renderWithProviders(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>)
}

describe('Bubble', () => {
  it('renders with correct label', () => {
    const onClick = vi.fn()
    renderWithProviders(<Bubble emotion={mockEmotion} onClick={onClick} />)

    expect(screen.getByRole('button', { name: /joy/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderWithProviders(<Bubble emotion={mockEmotion} onClick={onClick} />)

    const button = screen.getByRole('button', { name: /joy/i })
    await user.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onClick).toHaveBeenCalledWith(mockEmotion)
  })

  it('applies background style with emotion color', () => {
    const onClick = vi.fn()
    renderWithProviders(<Bubble emotion={mockEmotion} onClick={onClick} />)

    const button = screen.getByRole('button', { name: /joy/i })
    const style = button.getAttribute('style') || ''
    expect(style).toContain('background')
    expect(style).toContain('linear-gradient')
  })

  it('renders with small size class when specified', () => {
    const onClick = vi.fn()
    renderWithProviders(<Bubble emotion={mockEmotion} onClick={onClick} size="small" />)

    const button = screen.getByRole('button', { name: /joy/i })
    expect(button.className).toContain('text-sm')
  })
})
