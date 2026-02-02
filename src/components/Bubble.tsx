import { memo } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import type { BaseEmotion } from '../models/types'

interface BubbleProps {
  emotion: BaseEmotion
  onClick: (emotion: BaseEmotion) => void
  size?: 'small' | 'medium' | 'large'
  index?: number
  position?: { x: number; y: number }
}

const sizeClasses = {
  small: 'px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm',
  medium: 'px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base',
  large: 'px-4 py-2 text-base sm:px-5 sm:py-2.5 sm:text-lg',
}

function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex)
}

function adjustColor(hex: string, amount: number): string {
  if (!isValidHex(hex)) return hex
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function getContrastColor(hex: string): string {
  if (!isValidHex(hex)) return '#ffffff'
  const num = parseInt(hex.replace('#', ''), 16)
  const r = num >> 16
  const g = (num >> 8) & 0x00ff
  const b = num & 0x0000ff
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#1a1a1a' : '#ffffff'
}

function BubbleBase({ emotion, onClick, size = 'medium', index = 0, position }: BubbleProps) {
  const { language } = useLanguage()

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
        delay: index * 0.05,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(emotion)}
      className={`rounded-full font-medium shadow-lg cursor-pointer select-none touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center ${sizeClasses[size]}`}
      style={{
        position: position ? 'absolute' : 'relative',
        left: position?.x,
        top: position?.y,
        background: `linear-gradient(135deg, ${emotion.color} 0%, ${adjustColor(emotion.color, -20)} 100%)`,
        boxShadow: `0 4px 15px ${emotion.color}40, 0 2px 4px rgba(0,0,0,0.1)`,
        color: getContrastColor(emotion.color),
      }}
      aria-label={emotion.label[language]}
    >
      {emotion.label[language]}
    </motion.button>
  )
}

export const Bubble = memo(BubbleBase)
