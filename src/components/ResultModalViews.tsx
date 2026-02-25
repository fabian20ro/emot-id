import { motion } from 'framer-motion'
import type { ReflectionAnswer } from './result-modal-types'

interface ReflectionViewProps {
  prompt: string
  yesLabel: string
  partlyLabel: string
  noLabel: string
  onReflect: (answer: 'yes' | 'partly' | 'no') => void
}

export function ReflectionView({
  prompt,
  yesLabel,
  partlyLabel,
  noLabel,
  onReflect,
}: ReflectionViewProps) {
  return (
    <motion.div
      key="reflection"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col items-center justify-center py-8"
    >
      <p className="text-lg text-gray-200 mb-6 text-center">
        {prompt}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          onClick={() => onReflect('yes')}
          className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-xl bg-gray-600/20 border border-gray-600/50 text-gray-300 hover:bg-gray-600/30 transition-colors text-sm"
        >
          {yesLabel}
        </button>
        <button
          onClick={() => onReflect('partly')}
          className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-xl bg-gray-600/20 border border-gray-600/50 text-gray-300 hover:bg-gray-600/30 transition-colors text-sm"
        >
          {partlyLabel}
        </button>
        <button
          onClick={() => onReflect('no')}
          className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-xl bg-gray-600/20 border border-gray-600/50 text-gray-300 hover:bg-gray-600/30 transition-colors text-sm"
        >
          {noLabel}
        </button>
      </div>
    </motion.div>
  )
}

interface WarmCloseViewProps {
  message: string
  closeLabel: string
  onClose: () => void
}

export function WarmCloseView({ message, closeLabel, onClose }: WarmCloseViewProps) {
  return (
    <motion.div
      key="warmClose"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center py-12"
    >
      <p className="text-lg text-gray-200 text-center leading-relaxed px-4">
        {message}
      </p>
      <button
        onClick={onClose}
        className="mt-6 min-h-[44px] px-4 text-sm text-gray-500 hover:text-gray-400 transition-colors"
      >
        {closeLabel}
      </button>
    </motion.div>
  )
}

interface BridgeInfo {
  message: string
  buttonLabel: string
  targetModelId: string
}

interface FollowUpViewProps {
  reflectionAnswer: ReflectionAnswer
  followUpText: string
  notQuiteValidation: string
  backToModelLabel: string
  stayHereLabel: string
  bridge: BridgeInfo | null
  showSwitchModel: boolean
  onExploreMore: () => void
  onSwitchModel: (targetModelId: string) => void
  onClose: () => void
}

export function FollowUpView({
  reflectionAnswer,
  followUpText,
  notQuiteValidation,
  backToModelLabel,
  stayHereLabel,
  bridge,
  showSwitchModel,
  onExploreMore,
  onSwitchModel,
  onClose,
}: FollowUpViewProps) {
  return (
    <motion.div
      key="followUp"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col items-center justify-center py-8"
    >
      {reflectionAnswer === 'no' ? (
        <>
          <p className="text-sm text-gray-300 mb-4 text-center px-4">
            {notQuiteValidation}
          </p>
          <p className="text-lg text-gray-200 mb-6 text-center">
            {followUpText}
          </p>
        </>
      ) : (
        <p className="text-lg text-gray-200 mb-6 text-center">
          {followUpText}
        </p>
      )}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={onExploreMore}
          className="min-h-[44px] px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors text-sm font-medium"
        >
          {backToModelLabel}
        </button>
        {showSwitchModel && bridge && (
          <div className="p-3 rounded-xl bg-indigo-900/20 border border-indigo-700/30 max-w-full">
            <p className="text-sm text-indigo-300 mb-2 text-center">
              {bridge.message}
            </p>
            <button
              onClick={() => onSwitchModel(bridge.targetModelId)}
              className="w-full min-h-[44px] px-4 py-2 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 hover:bg-indigo-600/40 transition-colors text-sm"
            >
              {bridge.buttonLabel}
            </button>
          </div>
        )}
        <button
          onClick={onClose}
          className="min-h-[44px] px-5 py-2 rounded-xl bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors text-sm"
        >
          {stayHereLabel}
        </button>
      </div>
    </motion.div>
  )
}
