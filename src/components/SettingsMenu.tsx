import { createPortal } from 'react-dom'
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
  saveSessions: boolean
  onSaveSessionsChange: (save: boolean) => void
  onOpenHistory?: () => void
}

function toggleClass(active: boolean): string {
  return active
    ? 'bg-purple-500 text-white'
    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
}

export function SettingsMenu({ isOpen, onClose, modelId, onModelChange, soundMuted, onSoundMutedChange, saveSessions, onSaveSessionsChange, onOpenHistory }: SettingsMenuProps) {
  const { language, setLanguage, section } = useLanguage()
  const availableModels = getAvailableModels()
  const menuT = section('menu')
  const disclaimerT = section('disclaimer')
  const settingsT = section('settings')
  const historyT = section('history')
  const privacyT = section('privacy')
  const focusTrapRef = useFocusTrap(isOpen, onClose)

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[var(--z-backdrop)] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Bottom sheet drawer */}
          <motion.div
            ref={focusTrapRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose()
              }
            }}
            role="dialog"
            aria-modal="true"
            className="fixed inset-x-0 bottom-0 z-[var(--z-modal)] max-h-[85dvh] bg-gray-800 rounded-t-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-600" />
            </div>

            {/* Sticky header with title and close button */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
              <h2 className="text-base font-semibold text-gray-200">
                Emot-ID
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
            <div className="flex-1 overflow-y-auto overscroll-contain p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] space-y-1">
              {/* Language Section */}
              <div className="px-3 py-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {menuT.language}
                </span>
              </div>
              <div className="flex gap-1 px-2 pb-2">
                <button
                  onClick={() => { setLanguage('ro'); onClose() }}
                  className={`flex-1 px-3 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${toggleClass(language === 'ro')}`}
                >
                  Romana
                </button>
                <button
                  onClick={() => { setLanguage('en'); onClose() }}
                  className={`flex-1 px-3 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${toggleClass(language === 'en')}`}
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
                    className={`px-3 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors text-left ${toggleClass(modelId === m.id)}`}
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
                  className={`flex-1 px-3 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${toggleClass(!soundMuted)}`}
                >
                  {settingsT.soundOn ?? 'On'}
                </button>
                <button
                  onClick={() => { onSoundMutedChange(true); onClose() }}
                  className={`flex-1 px-3 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${toggleClass(soundMuted)}`}
                >
                  {settingsT.soundOff ?? 'Off'}
                </button>
              </div>

              {/* Save Sessions Toggle */}
              <div className="px-3 py-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {settingsT.saveSessionsLabel ?? 'Save sessions'}
                </span>
              </div>
              <div className="flex gap-1 px-2 pb-2">
                <button
                  onClick={() => { onSaveSessionsChange(true); onClose() }}
                  className={`flex-1 px-3 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${toggleClass(saveSessions)}`}
                >
                  {settingsT.saveSessionsOn ?? 'On'}
                </button>
                <button
                  onClick={() => { onSaveSessionsChange(false); onClose() }}
                  className={`flex-1 px-3 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${toggleClass(!saveSessions)}`}
                >
                  {settingsT.saveSessionsOff ?? 'Off'}
                </button>
              </div>

              {/* Past Sessions — hidden when saving is off */}
              {saveSessions && onOpenHistory && (
                <div className="px-2 pb-1 pt-1 border-t border-gray-700 mt-1">
                  <button
                    onClick={() => { onOpenHistory(); onClose() }}
                    className="w-full px-3 py-2 min-h-[44px] rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors text-left"
                  >
                    {historyT.menuLabel ?? 'Past sessions'}
                  </button>
                </div>
              )}

              {/* Crisis support */}
              <div className="px-2 pb-1 pt-1 border-t border-gray-700 mt-1">
                <div className="flex items-start justify-between px-3 py-1 min-h-[44px]">
                  <span className="text-xs text-gray-400 pt-2">
                    {menuT.crisisSupport ?? 'Need support?'}
                  </span>
                  <div className="pt-0.5">
                    <InfoButton
                      title={menuT.crisisSupport ?? 'Need support?'}
                      ariaLabel={menuT.crisisSupport ?? 'Need support?'}
                    >
                      <p>{menuT.crisisDetail ?? 'Call 116 123 (Romania, free, 24/7) or visit findahelpline.com'}</p>
                    </InfoButton>
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div className="px-2 pb-1 pt-1 border-t border-gray-700 mt-1">
                <div className="flex items-start justify-between px-3 py-1 min-h-[44px]">
                  <span className="text-xs text-gray-400 pt-2">
                    {privacyT.headline ?? 'Your data stays on this device'}
                  </span>
                  <div className="pt-0.5">
                    <InfoButton
                      title={privacyT.title ?? 'Privacy'}
                      ariaLabel={privacyT.headline ?? 'Your data stays on this device'}
                    >
                      <p>{privacyT.detail ?? ''}</p>
                    </InfoButton>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="px-2 pb-2 pt-1 border-t border-gray-700">
                <div className="flex items-start justify-between px-3 py-1 min-h-[44px]">
                  <span className="text-xs text-gray-500 pt-2">
                    {disclaimerT.label ?? 'Disclaimer'}
                  </span>
                  <div className="pt-0.5">
                    <InfoButton
                      title={disclaimerT.title ?? 'About this app'}
                      ariaLabel={disclaimerT.label ?? 'Disclaimer'}
                    >
                      <p>{disclaimerT.text ?? ''}</p>
                    </InfoButton>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}
