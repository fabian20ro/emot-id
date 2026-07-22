import { Bell, ChevronRight, Languages, LifeBuoy, LockKeyhole, Moon, Volume2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { ScreenHeader } from '../components/ScreenHeader'

interface SettingsScreenProps {
  soundMuted: boolean
  dailyReminderEnabled: boolean
  reminderSupported: boolean
  theme: 'light' | 'dark'
  onBack: () => void
  onSoundChange: (muted: boolean) => void
  onReminderChange: (enabled: boolean) => void
  onThemeChange: (theme: 'light' | 'dark') => void
  onOpenPrivacy: () => void
  onOpenSupport: () => void
}

function Toggle({ checked, label, onChange, disabled = false }: { checked: boolean; label: string; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={checked ? 'switch is-on' : 'switch'}
      onClick={() => onChange(!checked)}
    ><span /></button>
  )
}

export function SettingsScreen({ soundMuted, dailyReminderEnabled, reminderSupported, theme, onBack, onSoundChange, onReminderChange, onThemeChange, onOpenPrivacy, onOpenSupport }: SettingsScreenProps) {
  const { language, setLanguage, simpleLanguage, setSimpleLanguage, section } = useLanguage()
  const t = section('settingsScreen')

  return (
    <div className="screen" data-testid="settings-screen">
      <ScreenHeader title={t.title} onBack={onBack} />
      <h2 className="section-heading">{t.preferences}</h2>
      <div className="settings-list">
        <div className="settings-row">
          <Languages size={20} aria-hidden="true" />
          <span>{t.language}</span>
          <div className="segmented" aria-label={t.language}>
            <button type="button" className={language === 'en' ? 'is-active' : ''} onClick={() => setLanguage('en')}>EN</button>
            <button type="button" className={language === 'ro' ? 'is-active' : ''} onClick={() => setLanguage('ro')}>RO</button>
          </div>
        </div>
        <div className="settings-row"><Languages size={20} aria-hidden="true" /><span>{t.simple}</span><Toggle checked={simpleLanguage} label={t.simple} onChange={setSimpleLanguage} /></div>
        <div className="settings-row"><Moon size={20} aria-hidden="true" /><span>{t.theme}</span><div className="segmented" aria-label={t.theme}><button type="button" className={theme === 'light' ? 'is-active' : ''} onClick={() => onThemeChange('light')}>{t.light}</button><button type="button" className={theme === 'dark' ? 'is-active' : ''} onClick={() => onThemeChange('dark')}>{t.dark}</button></div></div>
        <div className="settings-row"><Volume2 size={20} aria-hidden="true" /><span>{t.sound}</span><Toggle checked={!soundMuted} label={t.sound} onChange={(enabled) => onSoundChange(!enabled)} /></div>
        <div className="settings-row"><Bell size={20} aria-hidden="true" /><span>{t.reminders}</span><Toggle checked={dailyReminderEnabled} label={t.reminders} disabled={!reminderSupported} onChange={onReminderChange} /></div>
      </div>

      <h2 className="section-heading">{section('privacyData').title}</h2>
      <div className="settings-list">
        <button type="button" className="settings-link" onClick={onOpenPrivacy}><LockKeyhole size={20} aria-hidden="true" /><span>{t.privacy}</span><ChevronRight size={18} aria-hidden="true" /></button>
        <button type="button" className="settings-link" onClick={onOpenSupport}><LifeBuoy size={20} aria-hidden="true" /><span>{t.support}</span><ChevronRight size={18} aria-hidden="true" /></button>
      </div>
    </div>
  )
}

export { Toggle }
