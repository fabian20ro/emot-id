import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { getAvailableModels } from '../models/registry'
import { InfoButton } from './InfoButton'

interface SettingsMenuProps {
  isOpen: boolean
  onClose: () => void
  modelId: string
  onModelChange: (id: string) => void
  soundMuted: boolean
  onSoundMutedChange: (muted: boolean) => void
  onOpenHistory?: () => void
}

function toggleClass(active: boolean): string {
  return active
    ? 'bg-purple-500 text-white'
    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
}

export function SettingsMenu({ isOpen, onClose, modelId, onModelChange, soundMuted, onSoundMutedChange, onOpenHistory }: SettingsMenuProps) {
  const { language, setLanguage, section } = useLanguage()
  const availableModels = getAvailableModels()
  const menuT = section('menu')
  const disclaimerT = section('disclaimer')
  const settingsT = section('settings')
  const historyT = section('history')
  const privacyT = section('privacy')
  const focusTrapRef = useFocusTrap(isOpen, onClose)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — fixed to viewport, escapes Header stacking context */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[var(--z-backdrop)] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Full-screen slide-in panel — fixed to viewport */}
          <motion.div
            ref={focusTrapRef}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            role="dialog"
            aria-modal="true"
            className="fixed inset-y-0 left-0 z-[var(--z-modal)] w-80 max-w-[85vw] bg-gray-800 shadow-2xl border-r border-gray-700 flex flex-col"
          >
            {/* Sticky header with close button */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <h2 className="text-sm font-semibold text-gray-200">
                {settingsT.title ?? 'Settings'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-300 text-lg leading-none w-11 h-11 flex items-center justify-center"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-3 pb-[env(safe-area-inset-bottom,0.75rem)] space-y-1">
              {/* Language Section */}
              <div className="px-3 py-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {menuT.language}
                </span>
              </div>
              <div className="flex gap-1 px-2 pb-2">
                <button
                  onClick={() => { setLanguage('ro'); onClose() }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${toggleClass(language === 'ro')}`}
                >
                  Romana
                </button>
                <button
                  onClick={() => { setLanguage('en'); onClose() }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${toggleClass(language === 'en')}`}
                >
                  English
                </button>
              </div>

              {/* Model Section */}
              <div className="px-3 py-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {menuT.model}
                </span>
              </div>
              <div className="flex flex-col gap-1 px-2 pb-2">
                {availableModels.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { onModelChange(m.id); onClose() }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${toggleClass(modelId === m.id)}`}
                  >
                    <span className="block">{m.name[language]}</span>
                    <span className={`block text-xs mt-0.5 ${
                      modelId === m.id ? 'text-purple-200' : 'text-gray-400'
                    }`}>
                      {m.description[language]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Sound Section */}
              <div className="px-3 py-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {settingsT.soundLabel ?? 'Sound effects'}
                </span>
              </div>
              <div className="flex gap-1 px-2 pb-2">
                <button
                  onClick={() => { onSoundMutedChange(false); onClose() }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${toggleClass(!soundMuted)}`}
                >
                  {settingsT.soundOn ?? 'On'}
                </button>
                <button
                  onClick={() => { onSoundMutedChange(true); onClose() }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${toggleClass(soundMuted)}`}
                >
                  {settingsT.soundOff ?? 'Off'}
                </button>
              </div>

              {/* Past Sessions */}
              {onOpenHistory && (
                <div className="px-2 pb-1 pt-1 border-t border-gray-700 mt-1">
                  <button
                    onClick={() => { onOpenHistory(); onClose() }}
                    className="w-full px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors text-left"
                  >
                    {historyT.menuLabel ?? 'Past sessions'}
                  </button>
                </div>
              )}

              {/* Crisis support */}
              <div className="px-2 pb-1 pt-1 border-t border-gray-700 mt-1">
                <div className="flex items-center justify-between px-3 py-1">
                  <span className="text-xs text-gray-400">
                    {menuT.crisisSupport ?? 'Need support?'}
                  </span>
                  <InfoButton
                    title={menuT.crisisSupport ?? 'Need support?'}
                    ariaLabel={menuT.crisisSupport ?? 'Need support?'}
                  >
                    <p>{menuT.crisisDetail ?? 'Call 116 123 (Romania, free, 24/7) or visit findahelpline.com'}</p>
                  </InfoButton>
                </div>
              </div>

              {/* Privacy */}
              <div className="px-2 pb-1 pt-1 border-t border-gray-700 mt-1">
                <div className="flex items-center justify-between px-3 py-1">
                  <span className="text-xs text-gray-400">
                    {privacyT.headline ?? 'Your data stays on this device'}
                  </span>
                  <InfoButton
                    title={privacyT.title ?? 'Privacy'}
                    ariaLabel={privacyT.headline ?? 'Your data stays on this device'}
                  >
                    <p>{privacyT.detail ?? ''}</p>
                  </InfoButton>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="px-2 pb-2 pt-1 border-t border-gray-700">
                <div className="flex items-center justify-between px-3 py-1">
                  <span className="text-xs text-gray-500">
                    {disclaimerT.label ?? 'Disclaimer'}
                  </span>
                  <InfoButton
                    title={disclaimerT.title ?? 'About this app'}
                    ariaLabel={disclaimerT.label ?? 'Disclaimer'}
                  >
                    <p>{disclaimerT.text ?? ''}</p>
                  </InfoButton>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
