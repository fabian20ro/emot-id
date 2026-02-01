import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { getAvailableModels } from '../models/registry'

interface SettingsMenuProps {
  isOpen: boolean
  onClose: () => void
  modelId: string
  onModelChange: (id: string) => void
}

export function SettingsMenu({ isOpen, onClose, modelId, onModelChange }: SettingsMenuProps) {
  const { language, setLanguage, t } = useLanguage()
  const availableModels = getAvailableModels()
  const disclaimerT = (t as Record<string, Record<string, string>>).disclaimer ?? {}

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
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 w-72 bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden z-50"
          >
            <div className="p-2">
              {/* Language Section */}
              <div className="px-3 py-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {t.menu.language}
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
                  {t.menu.model}
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
                    <span className="block">{m.name}</span>
                    <span className={`block text-xs mt-0.5 ${
                      modelId === m.id ? 'text-purple-200' : 'text-gray-400'
                    }`}>
                      {m.description[language]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="px-2 pb-2 pt-1 border-t border-gray-700 mt-1">
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
