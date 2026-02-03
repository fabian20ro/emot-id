import { useState, useCallback, useRef, useMemo } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { Onboarding } from './components/Onboarding'
import { Header } from './components/Header'
import { SelectionBar } from './components/SelectionBar'
import { AnalyzeButton } from './components/AnalyzeButton'
import { ResultModal } from './components/ResultModal'
import { DontKnowModal } from './components/DontKnowModal'
import { UndoToast } from './components/UndoToast'
import { SessionHistory } from './components/SessionHistory'
import { VisualizationErrorBoundary } from './components/VisualizationErrorBoundary'
import { useSound } from './hooks/useSound'
import { useEmotionModel } from './hooks/useEmotionModel'
import { useModelSelection } from './hooks/useModelSelection'
import { useHintState } from './hooks/useHintState'
import { useSessionHistory } from './hooks/useSessionHistory'
import { useLanguage } from './context/LanguageContext'
import { getVisualization } from './models/registry'
import { BubbleField } from './components/BubbleField'
import { ModelBar } from './components/ModelBar'
import { storage } from './data/storage'
import { getCrisisTier } from './models/distress'
import { hasTemporalCrisisPattern } from './data/temporal-crisis'
import type { BaseEmotion, AnalysisResult, ModelState } from './models/types'
import type { Session, SerializedSelection } from './data/types'

function FirstInteractionHint({ modelId }: { modelId: string }) {
  const { section } = useLanguage()
  const hintsT = section('firstHint')

  const text = (hintsT as Record<string, string | undefined>)[modelId] ?? hintsT.wheel ?? 'Tap an emotion that resonates with you'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mx-auto w-fit px-4 py-2 bg-indigo-600/90 backdrop-blur-sm rounded-full text-sm text-white shadow-lg pointer-events-none"
    >
      {text}
    </motion.div>
  )
}

export default function App() {
  const { language, section } = useLanguage()
  const dontKnowT = section('dontKnow')

  const [showOnboarding, setShowOnboarding] = useState(() => {
    return storage.get('onboarded') !== 'true'
  })

  const { modelId, switchModel } = useModelSelection()

  const {
    selections,
    modelState,
    visibleEmotions,
    sizes,
    combos,
    handleSelect: modelSelect,
    handleDeselect: modelDeselect,
    handleClear: modelClear,
    restore,
    analyze,
  } = useEmotionModel(modelId)

  const Visualization = getVisualization(modelId) ?? BubbleField

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [showDontKnow, setShowDontKnow] = useState(false)
  const [showUndoToast, setShowUndoToast] = useState(false)
  const undoSnapshotRef = useRef<{ selections: BaseEmotion[]; state: ModelState } | null>(null)
  const { playSound, muted, setMuted } = useSound()

  const { showHint, dismissHint } = useHintState(modelId)
  const { sessions, loading: sessionsLoading, save: saveSession, clearAll: clearAllSessions, exportJSON: exportSessionsJSON } = useSessionHistory()
  const [showHistory, setShowHistory] = useState(false)

  const handleSelect = useCallback(
    (emotion: BaseEmotion) => {
      if (showHint) dismissHint()
      playSound('select')
      navigator.vibrate?.(10)
      modelSelect(emotion)
    },
    [playSound, modelSelect, showHint, dismissHint],
  )

  const handleDeselect = useCallback(
    (emotion: BaseEmotion) => {
      playSound('deselect')
      modelDeselect(emotion)
    },
    [playSound, modelDeselect],
  )

  const handleClear = useCallback(() => {
    if (selections.length === 0) return
    undoSnapshotRef.current = { selections, state: modelState }
    playSound('deselect')
    modelClear()
    setShowUndoToast(true)
  }, [selections, modelState, playSound, modelClear])

  const handleUndo = useCallback(() => {
    const snapshot = undoSnapshotRef.current
    if (snapshot) {
      restore(snapshot.selections, snapshot.state)
      undoSnapshotRef.current = null
    }
    setShowUndoToast(false)
  }, [restore])

  const dismissUndo = useCallback(() => {
    undoSnapshotRef.current = null
    setShowUndoToast(false)
  }, [])

  const shouldEscalateCrisis = useMemo(
    () => hasTemporalCrisisPattern(sessions),
    [sessions],
  )

  const analyzeEmotions = useCallback(() => {
    if (selections.length === 0) return
    const results = analyze()
    setAnalysisResults(results)
    setIsModalOpen(true)
  }, [selections, analyze])

  const handleSessionComplete = useCallback(
    (reflectionAnswer: 'yes' | 'partly' | 'no' | null) => {
      if (analysisResults.length === 0) return
      const serialized: SerializedSelection[] = selections.map((s) => {
        const base: SerializedSelection = { emotionId: s.id, label: s.label }
        // Preserve somatic extras for heat map tracking
        if ('selectedSensation' in s && 'selectedIntensity' in s) {
          base.extras = {
            sensationType: (s as { selectedSensation: string }).selectedSensation,
            intensity: (s as { selectedIntensity: number }).selectedIntensity,
          }
        }
        return base
      })
      const session: Session = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        modelId,
        selections: serialized,
        results: analysisResults,
        crisisTier: getCrisisTier(analysisResults.map((r) => r.id)),
        reflectionAnswer: reflectionAnswer ?? undefined,
      }
      saveSession(session)
    },
    [analysisResults, selections, modelId, saveSession],
  )

  return (
    <MotionConfig reducedMotion="user">
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      <Header
        modelId={modelId}
        onModelChange={switchModel}
        soundMuted={muted}
        onSoundMutedChange={setMuted}
        onOpenHistory={() => setShowHistory(true)}
      />

      <ModelBar modelId={modelId} onModelChange={switchModel} />

      <div className="px-4 pt-1 max-w-md mx-auto w-full">
        <AnalyzeButton
          disabled={selections.length === 0}
          onClick={analyzeEmotions}
          modelId={modelId}
          selectionCount={selections.length}
        />
        {/* "I don't know" entry point — hidden while hint visible to save vertical space */}
        {selections.length === 0 && !showHint && (
          <button
            onClick={() => setShowDontKnow(true)}
            className="block mx-auto mt-2 px-4 py-1.5 text-sm text-gray-300 bg-gray-700/60 hover:bg-gray-700 border border-gray-600 rounded-full transition-colors"
          >
            {dontKnowT.link ?? "I don't know what I'm feeling"}
          </button>
        )}
      </div>

      <SelectionBar
        selections={selections}
        combos={combos}
        onDeselect={handleDeselect}
        onClear={handleClear}
      />

      <AnimatePresence>
        {showHint && !showOnboarding && selections.length === 0 && (
          <FirstInteractionHint modelId={modelId} />
        )}
      </AnimatePresence>

      <VisualizationErrorBoundary key={modelId} onReset={modelClear} language={language}>
        <div className="relative flex-1 min-h-0">
          <Visualization
            emotions={visibleEmotions}
            onSelect={handleSelect}
            onDeselect={handleDeselect}
            sizes={sizes}
            selections={selections}
          />
        </div>
      </VisualizationErrorBoundary>

      <ResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExploreMore={handleClear}
        onSwitchModel={switchModel}
        onSessionComplete={handleSessionComplete}
        escalateCrisis={shouldEscalateCrisis}
        currentModelId={modelId}
        selections={selections}
        results={analysisResults}
      />

      <AnimatePresence>
        {showDontKnow && (
          <DontKnowModal
            onSelectModel={switchModel}
            onClose={() => setShowDontKnow(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        <UndoToast
          visible={showUndoToast}
          onUndo={handleUndo}
          onDismiss={dismissUndo}
        />
      </AnimatePresence>

      {/* Accessible live region for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {selections.length > 0
          ? `${selections.length} ${selections.length === 1 ? 'emotion' : 'emotions'} selected`
          : ''}
      </div>

      <SessionHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        sessions={sessions}
        loading={sessionsLoading}
        onClearAll={clearAllSessions}
        onExportJSON={exportSessionsJSON}
      />

      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}
    </div>
    </MotionConfig>
  )
}
