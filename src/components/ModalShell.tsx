import type { ComponentProps, ReactNode, RefObject } from 'react'
import { motion } from 'framer-motion'

type MotionDivProps = ComponentProps<typeof motion.div>

interface ModalShellProps {
  onClose: () => void
  focusTrapRef?: RefObject<HTMLDivElement | null>
  labelledBy?: string
  describedBy?: string
  backdropClassName?: string
  viewportClassName?: string
  panelClassName: string
  backdropProps?: Omit<MotionDivProps, 'className' | 'onClick'>
  panelProps?: Omit<
    MotionDivProps,
    'className' | 'onClick' | 'ref' | 'role' | 'aria-modal' | 'aria-labelledby' | 'aria-describedby'
  >
  children: ReactNode
}

export function ModalShell({
  onClose,
  focusTrapRef,
  labelledBy,
  describedBy,
  backdropClassName = 'fixed inset-0 z-[var(--z-backdrop)] bg-black/50',
  viewportClassName = 'fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4',
  panelClassName,
  backdropProps,
  panelProps,
  children,
}: ModalShellProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        {...backdropProps}
        className={backdropClassName}
        onClick={onClose}
      />
      <div className={viewportClassName}>
        <motion.div
          ref={focusTrapRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          initial={{ scale: 0.95, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 12 }}
          transition={{ type: 'spring', damping: 25 }}
          {...panelProps}
          className={panelClassName}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </div>
    </>
  )
}
