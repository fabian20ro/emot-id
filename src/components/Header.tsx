import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { MenuButton } from './MenuButton'
import { SettingsMenu } from './SettingsMenu'

interface HeaderProps {
  modelId: string
  onModelChange: (id: string) => void
  soundMuted: boolean
  onSoundMutedChange: (muted: boolean) => void
  onOpenHistory?: () => void
}

export function Header({ modelId, onModelChange, soundMuted, onSoundMutedChange, onOpenHistory }: HeaderProps) {
  const { t } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="relative z-[var(--z-header)] bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 px-3 py-2 sm:px-4 sm:py-3">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="relative">
            <MenuButton
              isOpen={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            />
            <SettingsMenu
              isOpen={menuOpen}
              onClose={() => setMenuOpen(false)}
              modelId={modelId}
              onModelChange={onModelChange}
              soundMuted={soundMuted}
              onSoundMutedChange={onSoundMutedChange}
              onOpenHistory={onOpenHistory}
            />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white">
              {t.app.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">
              {t.app.subtitle}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
