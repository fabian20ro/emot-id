import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SettingsMenu } from '../components/SettingsMenu'
import { LanguageProvider } from '../context/LanguageContext'

function renderMenu(overrides: Partial<React.ComponentProps<typeof SettingsMenu>> = {}) {
  const defaults: React.ComponentProps<typeof SettingsMenu> = {
    isOpen: true,
    onClose: vi.fn(),
    modelId: 'plutchik',
    onModelChange: vi.fn(),
    ...overrides,
  }
  return render(
    <LanguageProvider>
      <SettingsMenu {...defaults} />
    </LanguageProvider>
  )
}

describe('SettingsMenu', () => {
  it('renders language header from i18n (English)', () => {
    renderMenu()
    // English default: should show "Language"
    expect(screen.getByText('Language')).toBeInTheDocument()
  })

  it('renders model header from i18n', () => {
    renderMenu()
    expect(screen.getByText('Model')).toBeInTheDocument()
  })

  it('has w-72 width class on the menu container', () => {
    const { container } = renderMenu()
    const menu = container.querySelector('.w-72')
    expect(menu).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    renderMenu({ isOpen: false })
    expect(screen.queryByText('Language')).not.toBeInTheDocument()
  })

  it('renders disclaimer section', () => {
    renderMenu()
    expect(screen.getByText('Disclaimer')).toBeInTheDocument()
  })
})
