import { useState, useCallback, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useLanguage } from '../context/LanguageContext'

interface InfoButtonProps {
  title: string
  ariaLabel: string
  children: ReactNode
  className?: string
}

export function InfoButton({ title, ariaLabel, children, className = '' }: InfoButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const titleId = useId()
  const { section } = useLanguage()
  const infoT = section('infoButton')
  const close = useCallback(() => setIsOpen(false), [])
  const focusTrapRef = useFocusTrap(isOpen, close)

  return (
    <>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center justify-center w-[44px] h-[44px] -m-2 text-gray-400 hover:text-gray-200 transition-colors ${className}`}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
          <text x="9" y="13" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="600">i</text>
        </svg>
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[var(--z-onboarding)] flex items-center justify-center bg-black/40 backdrop-blur-sm"
              onClick={close}
            >
              <motion.div
                ref={focusTrapRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="max-w-sm w-[90vw] max-h-[60vh] overflow-y-auto bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 id={titleId} className="text-base font-semibold text-gray-100">
                    {title}
                  </h3>
                  <button
                    type="button"
                    onClick={close}
                    aria-label={infoT.close ?? 'Close'}
                    className="inline-flex items-center justify-center w-[44px] h-[44px] -m-2 text-gray-400 hover:text-gray-200 transition-colors rounded-lg"
                  >
                    <span aria-hidden="true" className="text-xl leading-none">✕</span>
                  </button>
                </div>
                <div className="text-sm text-gray-300 leading-relaxed">
                  {children}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
