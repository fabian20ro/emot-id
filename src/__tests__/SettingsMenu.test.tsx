import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsMenu } from '../components/SettingsMenu'
import { LanguageProvider } from '../context/LanguageContext'
import { storage } from '../data/storage'

function renderMenu(overrides: Partial<React.ComponentProps<typeof SettingsMenu>> = {}) {
  const defaults: React.ComponentProps<typeof SettingsMenu> = {
    isOpen: true,
    onClose: vi.fn(),
    modelId: 'plutchik',
    onModelChange: vi.fn(),
    soundMuted: false,
    onSoundMutedChange: vi.fn(),
    saveSessions: true,
    onSaveSessionsChange: vi.fn(),
    allowExternalAI: false,
    onAllowExternalAIChange: vi.fn(),
    dailyReminderEnabled: false,
    reminderSupported: true,
    reminderPermission: 'granted',
    onDailyReminderChange: vi.fn(),
    ...overrides,
  }
  return render(
    <LanguageProvider>
      <SettingsMenu {...defaults} />
    </LanguageProvider>
  )
}

describe('SettingsMenu', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    window.localStorage.clear()
  })

  it('shows simplified model descriptions when simple language mode is enabled', () => {
    vi.spyOn(storage, 'get').mockImplementation((key) => {
      if (key === 'simpleLanguage') return 'true'
      return null
    })
    renderMenu()
    expect(screen.getByText('Notice body sensations first.')).toBeInTheDocument()
  })

  it('shows full model descriptions when simple language mode is disabled', () => {
    window.localStorage.setItem('emot-id-simple-language', 'false')
    renderMenu()
    expect(screen.getByText(/physical sensations in 14 body regions/i)).toBeInTheDocument()
  })

  it('renders language header from i18n (English)', () => {
    renderMenu()
    expect(screen.getByText('Language')).toBeInTheDocument()
  })

  it('renders localized language buttons from i18n (English)', () => {
    renderMenu()
    expect(screen.getByRole('button', { name: 'Romanian' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument()
  })

  it('renders localized language buttons from i18n (Romanian)', () => {
    vi.spyOn(storage, 'get').mockImplementation((key) => {
      if (key === 'language') return 'ro'
      return null
    })
    renderMenu()
    expect(screen.getByRole('button', { name: 'Română' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Engleză' })).toBeInTheDocument()
  })

  it('renders model header from i18n', () => {
    renderMenu()
    expect(screen.getByText('Model')).toBeInTheDocument()
  })

  it('renders daily reminder section', () => {
    renderMenu()
    expect(screen.getByText('Daily reminder')).toBeInTheDocument()
  })

  it('renders external AI consent copy from i18n (English)', () => {
    renderMenu()
    expect(screen.getByText('External AI links')).toBeInTheDocument()
    expect(
      screen.getByText(
        /When enabled, opening AI links sends your selected emotions to Google Search\./
      )
    ).toBeInTheDocument()
  })

  it('renders external AI consent copy from i18n (Romanian)', () => {
    vi.spyOn(storage, 'get').mockImplementation((key) => {
      if (key === 'language') return 'ro'
      return null
    })
    renderMenu()
    expect(screen.getByText('Linkuri AI externe')).toBeInTheDocument()
    expect(
      screen.getByText(
        /Când este activată, deschiderea linkurilor AI trimite emoțiile selectate către Căutarea Google\./
      )
    ).toBeInTheDocument()
  })

  it('renders sound section label from i18n (English)', () => {
    renderMenu()
    expect(screen.getByText('Sound')).toBeInTheDocument()
  })

  it('renders sound section label from i18n (Romanian)', () => {
    vi.spyOn(storage, 'get').mockImplementation((key) => {
      if (key === 'language') return 'ro'
      return null
    })
    renderMenu()
    expect(screen.getByText('Sunet')).toBeInTheDocument()
  })

  it('renders into document.body portal (bottom sheet)', () => {
    renderMenu()
    // The dialog should be in document.body, not inside the test container
    const dialog = document.body.querySelector('[role="dialog"]')
    expect(dialog).toBeInTheDocument()
    // Bottom sheet uses rounded-t-2xl instead of old w-80
    expect(dialog?.classList.contains('rounded-t-2xl')).toBe(true)
  })

  it('renders Emot-ID as drawer title', () => {
    renderMenu()
    expect(screen.getByText('Emot-ID')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    renderMenu({ isOpen: false })
    expect(screen.queryByText('Language')).not.toBeInTheDocument()
  })

  it('renders daily reminder toggle', async () => {
    const user = userEvent.setup()
    const onDailyReminderChange = vi.fn()
    renderMenu({ onDailyReminderChange })
    
    // Find the label text first
    const label = screen.getByText(/Daily reminder/i)
    expect(label).toBeInTheDocument()

    // The toggle buttons are in the next div sibling of the label's parent div
    const containerDiv = label.closest('div')!
    const nextSibling = containerDiv.nextElementSibling
    expect(nextSibling).toBeInstanceOf(HTMLElement)
    const toggleButtons = within(nextSibling as HTMLElement).getAllByRole('button', { name: /On|Off/i })
    const toggleButton = toggleButtons[0]
    
    expect(toggleButton).toBeInTheDocument()
    
    await user.click(toggleButton)
    expect(onDailyReminderChange).toHaveBeenCalledWith(true)
  })

  it('shows permission-denied warning when notifications are blocked', () => {
    renderMenu({ reminderPermission: 'denied' })
    expect(
      screen.getByText(/Notifications are blocked\. Enable them in browser settings\./)
    ).toBeInTheDocument()
  })

  it('does not show permission-denied warning when notifications are granted', () => {
    renderMenu({ reminderPermission: 'granted' })
    expect(screen.queryByText(/Notifications are blocked/)).not.toBeInTheDocument()
  })

  it('renders disclaimer section with InfoButton', () => {
    renderMenu()
    expect(screen.getByText('Disclaimer')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Disclaimer' })).toBeInTheDocument()
  })

  it('opens disclaimer modal on InfoButton click', async () => {
    const user = userEvent.setup()
    renderMenu()

    await user.click(screen.getByRole('button', { name: 'Disclaimer' }))
    // SettingsMenu dialog + InfoButton modal = 2 dialogs
    const dialogs = screen.getAllByRole('dialog')
    expect(dialogs.length).toBe(2)
    expect(screen.getByText(/supports emotional self-awareness/)).toBeInTheDocument()
  })

  it('renders privacy headline', () => {
    renderMenu()
    expect(screen.getByText(/Emot-ID keeps everything on your device/)).toBeInTheDocument()
  })

  it('opens privacy modal on InfoButton click', async () => {
    const user = userEvent.setup()
    renderMenu()

    await user.click(screen.getByRole('button', { name: /Emot-ID keeps everything on your device/ }))
    const dialogs = screen.getAllByRole('dialog')
    expect(dialogs.length).toBe(2)
    expect(screen.getByText(/stored locally on your device/)).toBeInTheDocument()
  })

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderMenu({ onClose })

    // The backdrop is the first element with bg-black/60
    const backdrop = document.body.querySelector('.bg-black\\/60')
    expect(backdrop).toBeInTheDocument()
    await user.click(backdrop!)
    expect(onClose).toHaveBeenCalled()
  })

  it('has min-h-[44px] on all interactive menu items', () => {
    renderMenu()
    const dialog = document.body.querySelector('[role="dialog"]')!
    const buttons = dialog.querySelectorAll('button')
    // Filter out the close button (has w-11 h-11)
    const menuButtons = Array.from(buttons).filter(
      (btn) => !btn.getAttribute('aria-label')?.includes('Close')
    )
    for (const btn of menuButtons) {
      const hasMinHeight = btn.classList.contains('min-h-[44px]')
      // InfoButtons use explicit w-[44px] h-[44px]
      const hasExplicit44 = btn.classList.contains('h-[44px]') || btn.classList.contains('w-[44px]')
      // Close-like buttons with w-11 h-11 (= 44px)
      const hasExplicitSize = btn.classList.contains('h-11') || btn.classList.contains('w-11')
      expect(hasMinHeight || hasExplicit44 || hasExplicitSize).toBe(true)
    }
  })

  it('disables the daily reminder On button when notifications are unsupported', () => {
    renderMenu({ reminderSupported: false, reminderPermission: 'unsupported' })

    const label = screen.getByText(/Daily reminder/i)
    const containerDiv = label.closest('div')!
    const nextSibling = containerDiv.nextElementSibling
    const buttons = within(nextSibling as HTMLElement).getAllByRole('button', { name: /On|Off/i })
    // The On button is disabled when unsupported; the Off button remains enabled (SettingsToggle only disables first)
    expect(buttons[0].disabled).toBe(true)
  })

  it('shows version badge in disclaimer section', () => {
    renderMenu()
    expect(screen.getByText('v0.1.0')).toBeInTheDocument()
  })

  it('does not call onDailyReminderChange with true when clicking the disabled reminder On button', async () => {
    const user = userEvent.setup()
    const onDailyReminderChange = vi.fn()
    renderMenu({
      reminderSupported: false,
      reminderPermission: 'unsupported',
      onDailyReminderChange,
    })

    const label = screen.getByText(/Daily reminder/i)
    const containerDiv = label.closest('div')!
    const nextSibling = containerDiv.nextElementSibling
    const buttons = within(nextSibling as HTMLElement).getAllByRole('button', { name: /On|Off/i })
    await user.click(buttons[0]) // the On/true button (disabled)
    expect(onDailyReminderChange).not.toHaveBeenCalledWith(true)
  })

  it('renders unsupported warning when reminders are not supported', () => {
    renderMenu({ reminderSupported: false, reminderPermission: 'unsupported' })
    expect(
      screen.getByText(/Notifications are not supported on this device/)
    ).toBeInTheDocument()
  })

  it('calls onModelChange and onClose when a model button is clicked', async () => {
    const user = userEvent.setup()
    const onModelChange = vi.fn()
    const onClose = vi.fn()
    renderMenu({ onModelChange, onClose, modelId: 'dimensional' })

    // Plutchik's Wheel of Emotions is the 4th option (last) in MODEL_DISPLAY_ORDER
    const plutchikBtn = screen.getByRole('button', { name: /Plutchik/i })
    expect(plutchikBtn).toBeInTheDocument()

    await user.click(plutchikBtn)
    expect(onModelChange).toHaveBeenCalledWith('plutchik')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not show Past sessions when saveSessions is false', () => {
    renderMenu({ saveSessions: false, onOpenHistory: vi.fn() })
    expect(
      screen.queryByRole('button', { name: /Past sessions|Istoric sesiuni/i })
    ).not.toBeInTheDocument()
  })

  it('does not show Past sessions when onOpenHistory is not provided', () => {
    renderMenu({ saveSessions: true, onOpenHistory: undefined })
    expect(
      screen.queryByRole('button', { name: /Past sessions|Istoric sesiuni/i })
    ).not.toBeInTheDocument()
  })
})
