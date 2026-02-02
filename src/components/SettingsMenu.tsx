import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { getAvailableModels } from '../models/registry'

interface SettingsMenuProps {
  isOpen: boolean
  onClose: () => void
  modelId: string
  onModelChange: (id: string) => void
  soundMuted: boolean
  onSoundMutedChange: (muted: boolean) => void
  onOpenHistory?: () => void
}

export function SettingsMenu({ isOpen, onClose, modelId, onModelChange, soundMuted, onSoundMutedChange, onOpenHistory }: SettingsMenuProps) {
  const { language, setLanguage, section } = useLanguage()
  const availableModels = getAvailableModels()
  const menuT = section('menu')
  const disclaimerT = section('disclaimer')
  const settingsT = section('settings')
  const historyT = section('history')
  const focusTrapRef = useFocusTrap(isOpen, onClose)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div
            ref={focusTrapRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-modal="true"
            className="absolute left-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden z-50"
          >
            <div className="p-2">
              {/* Language Section */}
              <div className="px-3 py-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {menuT.language}
                </span>
              </div>
              <div className="flex gap-1 px-2 pb-2">
                <button
                  onClick={() => { setLanguage('ro'); onClose() }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    language === 'ro'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Romana
                </button>
                <button
                  onClick={() => { setLanguage('en'); onClose() }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    language === 'en'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
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
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                      modelId === m.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
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
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !soundMuted
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {settingsT.soundOn ?? 'On'}
                </button>
                <button
                  onClick={() => { onSoundMutedChange(true); onClose() }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    soundMuted
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
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

              {/* Disclaimer */}
              <div className={`px-2 pb-2 pt-1 border-t border-gray-700 ${onOpenHistory ? '' : 'mt-1'}`}>
                <details className="group">
                  <summary className="px-3 py-2 text-xs text-gray-500 cursor-pointer hover:text-gray-400 transition-colors select-none">
                    {disclaimerT.label ?? 'Disclaimer'}
                  </summary>
                  <p className="px-3 py-2 text-xs text-gray-500 leading-relaxed">
                    {disclaimerT.text ?? 'This app supports emotional self-awareness. It is not a diagnostic tool and does not replace professional mental health support.'}
                  </p>
                </details>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
