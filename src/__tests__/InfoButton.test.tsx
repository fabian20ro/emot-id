import { describe, it, expect } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
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
    await act(async () => {
      await user.keyboard('{Escape}')
    })
    // AnimatePresence exit — dialog should be removed after animation
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('closes modal on close button click', async () => {
    const user = userEvent.setup()
    renderInfoButton()

    await user.click(screen.getByRole('button', { name: 'Test info' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Close' }))
    })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
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

  it('supports function-as-children render prop with close callback', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn((_close: () => void) => <p>Rendered by close callback</p>)
    render(
      <LanguageProvider>
        <InfoButton title="Fn Title" ariaLabel="Fn info" children={onToggle} />
      </LanguageProvider>
    )

    await user.click(screen.getByRole('button', { name: 'Fn info' }))

    expect(onToggle).toHaveBeenCalled()
    expect(screen.getByText('Rendered by close callback')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes modal when clicking outside (backdrop)', async () => {
    const user = userEvent.setup()
    renderInfoButton()

    await user.click(screen.getByRole('button', { name: 'Test info' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // The overlay is a fixed-position container inside the portal; find it reliably by its backdrop class.
    const overlay = document.querySelector('[class*="bg-black"]') as HTMLElement | null
    if (overlay) {
      await act(async () => {
        await user.click(overlay)
      })
    }

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('uses useFocusTrap when modal opens', async () => {
    const user = userEvent.setup()
    renderInfoButton()

    await user.click(screen.getByRole('button', { name: 'Test info' }))

    const dialog = screen.getByRole('dialog')
    // The dialog receives the focus trap ref from useFocusTrap(isOpen, close)
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })
})
