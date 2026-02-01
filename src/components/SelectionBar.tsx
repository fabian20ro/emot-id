import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import type { BaseEmotion, AnalysisResult } from '../models/types'
import { SENSATION_CONFIG } from './SensationPicker'
import type { SomaticSelection } from '../models/somatic/types'

function isSomaticSelection(e: BaseEmotion): e is SomaticSelection {
  return 'selectedSensation' in e && 'selectedIntensity' in e
}

interface SelectionBarProps {
  selections: BaseEmotion[]
  combos: AnalysisResult[]
  onDeselect: (emotion: BaseEmotion) => void
  onClear: () => void
}

export function SelectionBar({ selections, combos, onDeselect, onClear }: SelectionBarProps) {
  const { language, t } = useLanguage()

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 px-3 py-2 sm:p-3 max-h-[30vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-300">
          {t.selectionBar.title}
        </h2>
        {selections.length > 0 && (
          <button
            onClick={onClear}
            className="text-lg text-gray-400 hover:text-gray-200 transition-colors"
            aria-label={t.selectionBar.clear}
          >
            ↺
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2 min-h-[32px]">
        <AnimatePresence mode="popLayout">
          {selections.length === 0 ? (
            <motion.span
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-gray-500"
            >
              {t.selectionBar.empty}
            </motion.span>
          ) : (
            selections.map((emotion) => (
              <motion.button
                key={emotion.id}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDeselect(emotion)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium cursor-pointer"
                style={{
                  backgroundColor: `${emotion.color}40`,
                  color: emotion.color,
                  border: `1px solid ${emotion.color}50`,
                }}
              >
                {emotion.label[language]}
                {isSomaticSelection(emotion) && (
                  <span className="text-xs opacity-70">
                    {SENSATION_CONFIG[emotion.selectedSensation].icon}
                    {emotion.selectedIntensity}
                  </span>
                )}
                <span className="text-xs opacity-70">&times;</span>
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {combos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 mt-2"
          >
            {combos.map((combo) => (
              <span
                key={combo.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: `${combo.color}30`,
                  color: combo.color,
                  border: `1px solid ${combo.color}60`,
                }}
              >
                = {combo.label[language]}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
