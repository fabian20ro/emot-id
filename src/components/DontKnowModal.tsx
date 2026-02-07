import { useLanguage } from '../context/LanguageContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { MODEL_IDS } from '../models/constants'
import { ModalShell } from './ModalShell'

export function DontKnowModal({ onSelectModel, onClose }: { onSelectModel: (id: string) => void; onClose: () => void }) {
  const { section } = useLanguage()
  const dontKnowT = section('dontKnow')
  const focusTrapRef = useFocusTrap(true, onClose)

  return (
    <ModalShell
      onClose={onClose}
      focusTrapRef={focusTrapRef}
      labelledBy="dont-know-title"
      describedBy="dont-know-description"
      backdropClassName="fixed inset-0 z-[var(--z-backdrop)] bg-black/50 backdrop-blur-sm"
      viewportClassName="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
      panelClassName="bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto"
      panelProps={{
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 },
      }}
    >
      
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 id="dont-know-title" className="text-lg font-semibold text-white">
            {dontKnowT.title ?? "That's okay — here are two ways to start"}
          </h3>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] shrink-0 inline-flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-100 hover:bg-gray-700/60 transition-colors"
            aria-label={dontKnowT.close ?? 'Close'}
          >
            ×
          </button>
        </div>
        <p id="dont-know-description" className="text-sm text-gray-400 mb-4 leading-relaxed">
          {dontKnowT.normalization ?? 'Many people find it hard to name what they feel — this is normal and a skill that develops with practice.'}
        </p>
        <div className="space-y-3">
          <button
            onClick={() => { onSelectModel(MODEL_IDS.SOMATIC); onClose() }}
            className="w-full min-h-[44px] text-left p-3 rounded-xl bg-gray-700/50 hover:bg-gray-700 transition-colors"
          >
            <span className="text-white font-medium block">
              {dontKnowT.bodyOption ?? 'Start with your body'}
            </span>
            <span className="text-xs text-gray-400">
              {dontKnowT.bodyDesc ?? 'Notice physical sensations first'}
            </span>
          </button>
          <button
            onClick={() => { onSelectModel(MODEL_IDS.DIMENSIONAL); onClose() }}
            className="w-full min-h-[44px] text-left p-3 rounded-xl bg-gray-700/50 hover:bg-gray-700 transition-colors"
          >
            <span className="text-white font-medium block">
              {dontKnowT.dimensionalOption ?? 'Start with pleasant/unpleasant'}
            </span>
            <span className="text-xs text-gray-400">
              {dontKnowT.dimensionalDesc ?? 'Locate your state on a simple scale'}
            </span>
          </button>
        </div>
    </ModalShell>
  )
}
