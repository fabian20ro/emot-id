import { memo } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { getAvailableModels } from '../models/registry'

interface ModelBarProps {
  modelId: string
  onModelChange: (id: string) => void
}

function ModelBarBase({ modelId, onModelChange }: ModelBarProps) {
  const { language } = useLanguage()
  const models = getAvailableModels()

  return (
    <div className="flex gap-1 px-4 py-1.5 overflow-x-auto scrollbar-hide">
      {models.map((m) => {
        const isActive = m.id === modelId
        return (
          <button
            key={m.id}
            onClick={() => onModelChange(m.id)}
            className={`relative px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              isActive
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-200 bg-gray-800/50'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="modelIndicator"
                className="absolute inset-0 bg-indigo-600 rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{m.name[language]}</span>
          </button>
        )
      })}
    </div>
  )
}

export const ModelBar = memo(ModelBarBase)
