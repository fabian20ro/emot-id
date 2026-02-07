import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'

interface UndoToastProps {
  visible: boolean
  onUndo: () => void
  onDismiss: () => void
}

const UNDO_TIMEOUT_MS = 5000

export function UndoToast({ visible, onUndo, onDismiss }: UndoToastProps) {
  const { section } = useLanguage()
  const selectionBarT = section('selectionBar')

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onDismiss, UNDO_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [visible, onDismiss])

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)+0.5rem))] left-1/2 -translate-x-1/2 z-[var(--z-toast)] bg-gray-700 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-3 text-sm"
    >
      <span>{selectionBarT.cleared ?? 'Cleared'}</span>
      <button
        onClick={onUndo}
        className="min-h-[44px] min-w-[44px] px-2 font-semibold text-indigo-300 hover:text-indigo-200 transition-colors"
      >
        {selectionBarT.undo ?? 'Undo'}
      </button>
    </motion.div>
  )
}
