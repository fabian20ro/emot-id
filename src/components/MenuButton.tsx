import { motion } from 'framer-motion'

interface MenuButtonProps {
  isOpen: boolean
  onClick: () => void
}

export function MenuButton({ isOpen, onClick }: MenuButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="p-2.5 rounded-lg hover:bg-gray-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
      whileTap={{ scale: 0.95 }}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <div className="w-6 h-5 flex flex-col justify-between">
        <motion.span
          className="block h-0.5 w-6 bg-gray-300 rounded-full origin-left"
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? -1 : 0,
          }}
          transition={{ duration: 0.2 }}
        />
        <motion.span
          className="block h-0.5 w-6 bg-gray-300 rounded-full"
          animate={{
            opacity: isOpen ? 0 : 1,
            x: isOpen ? -10 : 0,
          }}
          transition={{ duration: 0.2 }}
        />
        <motion.span
          className="block h-0.5 w-6 bg-gray-300 rounded-full origin-left"
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
        />
      </div>
    </motion.button>
  )
}
