import { Download, ExternalLink, Trash2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { ScreenHeader } from '../components/ScreenHeader'
import { Toggle } from './SettingsScreen'

interface PrivacyDataScreenProps {
  saveSessions: boolean
  allowExternalAI: boolean
  onBack: () => void
  onSaveSessionsChange: (enabled: boolean) => void
  onExternalAIChange: (enabled: boolean) => void
  onExport: () => void
  onClear: () => void
}

export function PrivacyDataScreen({ saveSessions, allowExternalAI, onBack, onSaveSessionsChange, onExternalAIChange, onExport, onClear }: PrivacyDataScreenProps) {
  const { section } = useLanguage()
  const t = section('privacyData')
  const clear = () => {
    if (window.confirm(t.confirmClear)) onClear()
  }

  return (
    <div className="screen" data-testid="privacy-screen">
      <ScreenHeader title={t.title} lede={t.lede} onBack={onBack} />
      <div className="settings-list mt-6">
        <div className="settings-row"><span>{t.saving}</span><Toggle checked={saveSessions} label={t.saving} onChange={onSaveSessionsChange} /></div>
        <div className="settings-row"><ExternalLink size={20} aria-hidden="true" /><span>{t.external}<small>{t.externalHint}</small></span><Toggle checked={allowExternalAI} label={t.external} onChange={onExternalAIChange} /></div>
      </div>
      <button type="button" className="secondary-button mt-6" onClick={onExport}><Download size={19} aria-hidden="true" />{t.export}</button>
      <button type="button" className="danger-button mt-3" onClick={clear}><Trash2 size={19} aria-hidden="true" />{t.clear}</button>
    </div>
  )
}
