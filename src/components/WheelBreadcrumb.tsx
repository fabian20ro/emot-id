import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import type { BaseEmotion } from '../models/types'

interface WheelBreadcrumbProps {
  path: BaseEmotion[]
  onSelect: (emotion: BaseEmotion) => void
}

export function WheelBreadcrumb({ path, onSelect }: WheelBreadcrumbProps) {
  const { language, t } = useLanguage()

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
      className="absolute inset-x-0 top-2 z-[var(--z-dropdown)] flex justify-center pointer-events-none"
      aria-label={t.wheelBreadcrumb?.label ?? 'Emotion navigation path'}
    >
      <div className="pointer-events-auto inline-flex items-center gap-1 rounded-full bg-gray-800/90 backdrop-blur-sm border border-gray-600/50 px-3 py-1.5">
        {path.map((emotion, index) => (
          <span key={emotion.id} className="inline-flex items-center gap-1">
            {index > 0 && (
              <span className="text-gray-500 text-xs select-none" aria-hidden="true">›</span>
            )}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(emotion)}
              className="px-2 py-1 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors hover:bg-white/10"
              style={{ color: emotion.color }}
              aria-label={
                (t.wheelBreadcrumb?.selectAndReturn ?? 'Select {emotion} and return to start')
                  .replace('{emotion}', emotion.label[language])
              }
            >
              {emotion.label[language]}
            </motion.button>
          </span>
        ))}
      </div>
    </motion.nav>
  )
}
