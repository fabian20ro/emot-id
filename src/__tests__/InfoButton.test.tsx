import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InfoButton } from '../components/InfoButton'
import { LanguageProvider } from '../context/LanguageContext'

function renderInfoButton(props?: Partial<React.ComponentProps<typeof InfoButton>>) {
  const defaults: React.ComponentProps<typeof InfoButton> = {
    title: 'Test Title',
    ariaLabel: 'Test info',
    children: <p>Test content inside modal</p>,
    ...props,
  }
  return render(
    <LanguageProvider>
      <InfoButton {...defaults} />
    </LanguageProvider>
  )
}

describe('InfoButton', () => {
  it('renders button with aria-label', () => {
    renderInfoButton()
    expect(screen.getByRole('button', { name: 'Test info' })).toBeInTheDocument()
  })

  it('opens modal on click with title and children', async () => {
    const user = userEvent.setup()
    renderInfoButton()

    await user.click(screen.getByRole('button', { name: 'Test info' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test content inside modal')).toBeInTheDocument()
  })

  it('closes modal on Escape', async () => {
    const user = userEvent.setup()
    renderInfoButton()

    await user.click(screen.getByRole('button', { name: 'Test info' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    // AnimatePresence exit — dialog should be removed after animation
    await screen.findByRole('button', { name: 'Test info' })
    // Wait for exit animation
    await new Promise((r) => setTimeout(r, 200))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes modal on close button click', async () => {
    const user = userEvent.setup()
    renderInfoButton()

    await user.click(screen.getByRole('button', { name: 'Test info' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    await new Promise((r) => setTimeout(r, 200))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('has aria-modal and aria-labelledby on dialog', async () => {
    const user = userEvent.setup()
    renderInfoButton()

    await user.click(screen.getByRole('button', { name: 'Test info' }))

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby')

    const labelId = dialog.getAttribute('aria-labelledby')!
    expect(document.getElementById(labelId)?.textContent).toBe('Test Title')
  })
})
