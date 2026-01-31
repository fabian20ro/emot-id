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
            className="absolute left-0 top-full mt-2 w-56 bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden z-50"
          >
            <div className="p-2">
              {/* Language Section */}
              <div className="px-3 py-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {language === 'en' ? 'Limba' : 'Language'}
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
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
