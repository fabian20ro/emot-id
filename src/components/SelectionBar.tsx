import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import type { BaseEmotion, AnalysisResult } from '../models/types'
import { SENSATION_CONFIG } from './SensationPicker'
import type { SomaticSelection } from '../models/somatic/types'

function isSomaticSelection(e: BaseEmotion): e is SomaticSelection {
  return 'selectedSensation' in e
}

interface SelectionBarProps {
  selections: BaseEmotion[]
  combos: AnalysisResult[]
  onDeselect: (emotion: BaseEmotion) => void
  onClear: () => void
}

export function SelectionBar({ selections, combos, onDeselect, onClear }: SelectionBarProps) {
  const { language, t } = useLanguage()

  // Compact mode: hide entirely when empty to save vertical space on mobile
  if (selections.length === 0 && combos.length === 0) {
    return null
  }

  return (
    <div className="relative bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 px-1.5 py-1 sm:px-3 sm:py-1.5">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide max-h-[48px]">
        {/* Clear button — first element, always visible when there are selections */}
        {selections.length > 0 && (
          <button
            onClick={onClear}
            className="flex-none min-w-[44px] min-h-[44px] flex items-center justify-center text-lg text-gray-400 hover:text-gray-200 transition-colors"
            aria-label={t.selectionBar.clear}
          >
            ↺
          </button>
        )}

        {/* Selection pills */}
        <AnimatePresence mode="popLayout">
          {selections.map((emotion) => (
            <motion.button
              key={emotion.id}
              layout
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDeselect(emotion)}
              className="flex-none inline-flex items-center gap-1 px-2.5 py-1 min-h-[44px] rounded-full text-sm font-medium cursor-pointer"
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
          ))}
        </AnimatePresence>

        {/* Combo badges inline */}
        <AnimatePresence>
          {combos.map((combo) => (
            <motion.span
              key={combo.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="flex-none inline-flex items-center gap-1 px-2.5 py-1 min-h-[44px] rounded-full text-sm font-medium"
              style={{
                backgroundColor: `${combo.color}30`,
                color: combo.color,
                border: `1px solid ${combo.color}60`,
              }}
            >
              = {combo.label[language]}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Right-edge gradient fade when content overflows */}
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-gray-800/80 pointer-events-none" />
    </div>
  )
}
