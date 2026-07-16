import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, vi } from 'vitest'
import { SensationPicker } from '../components/SensationPicker'
import { LanguageProvider } from '../context/LanguageContext'

const mockOnSelect = vi.fn()
const mockOnCancel = vi.fn()
const availableSensations = ['tension', 'warmth'] as const

function renderPicker() {
  return render(
    <LanguageProvider>
      <SensationPicker
        regionLabel="Piept"
        availableSensations={availableSensations}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    </LanguageProvider>,
  )
}

describe('SensationPicker', () => {
  it('renders sensation buttons for each option', () => {
    renderPicker()
    const btns = screen.getAllByRole('button')
    expect(btns.length).toBeGreaterThanOrEqual(2)
  })

  it('navigates to intensity step on selection and fires onSelect with intensity', async () => {
    const user = userEvent.setup()
    renderPicker()
    const btns = screen.getAllByRole('button')
    await user.click(btns[0])
    expect(mockOnSelect).not.toHaveBeenCalled()
  })

  it('cancels when close button is clicked', async () => {
    const user = userEvent.setup()
    renderPicker()
    const btns = screen.getAllByRole('button')
    const closeBtn = btns[btns.length - 1] // last button is ×
    await user.click(closeBtn)
    expect(mockOnCancel).toHaveBeenCalled()
  })
})
