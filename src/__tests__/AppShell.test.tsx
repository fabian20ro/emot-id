import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppShell } from '../components/AppShell'
import { LanguageProvider } from '../context/LanguageContext'

function renderShell(showSettings?: boolean) {
  render(
    <LanguageProvider>
      <AppShell
        activeTab={null}
        isOffline={false}
        screenKey="test"
        showSettings={showSettings}
        showTabs={false}
        onTabChange={vi.fn()}
        onOpenSettings={vi.fn()}
      >
        <p>Screen content</p>
      </AppShell>
    </LanguageProvider>,
  )
}

describe('AppShell', () => {
  beforeAll(() => {
    HTMLElement.prototype.scrollTo = vi.fn()
  })

  it('shows Settings by default', () => {
    renderShell()
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  })

  it('removes Settings when the active workflow cannot be interrupted', () => {
    renderShell(false)
    expect(screen.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument()
    expect(screen.getByText('Screen content')).toBeInTheDocument()
  })
})
