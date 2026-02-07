import { useState, useCallback, useRef, useMemo, useEffect, Suspense } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { Onboarding } from './components/Onboarding'
import { Header } from './components/Header'
import { SettingsMenu } from './components/SettingsMenu'
import { SelectionBar } from './components/SelectionBar'
import { AnalyzeButton } from './components/AnalyzeButton'
import { ResultModal } from './components/ResultModal'
import { DontKnowModal } from './components/DontKnowModal'
import { UndoToast } from './components/UndoToast'
import { SessionHistory } from './components/SessionHistory'
import { QuickCheckIn, QUICK_MODEL_ID } from './components/QuickCheckIn'
import { GranularityTraining } from './components/GranularityTraining'
import { ChainAnalysis } from './components/ChainAnalysis'
import { VisualizationErrorBoundary } from './components/VisualizationErrorBoundary'
import { useSound } from './hooks/useSound'
import { useEmotionModel } from './hooks/useEmotionModel'
import { useModelSelection } from './hooks/useModelSelection'
import { useHintState } from './hooks/useHintState'
import { useSessionHistory } from './hooks/useSessionHistory'
import { useChainAnalysis } from './hooks/useChainAnalysis'
import { useLanguage } from './context/LanguageContext'
import { getVisualization } from './models/registry'
import { MODEL_IDS } from './models/constants'
import { storage } from './data/storage'
import {
  getReminderPermission,
  isDailyReminderEnabled,
  isReminderSupported,
  maybeSendDailyReminder,
  updateDailyReminder,
} from './data/reminders'
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
  const offlineT = section('offline')

  const [showOnboarding, setShowOnboarding] = useState(() => {
    return storage.get('onboarded') !== 'true'
  })
  const [isOffline, setIsOffline] = useState(() => {
    if (typeof navigator === 'undefined') return false
    return !navigator.onLine
  })

  const { modelId, switchModel } = useModelSelection()

  const {
    modelReady,
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

  const Visualization = getVisualization(modelId)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showQuickCheckIn, setShowQuickCheckIn] = useState(false)
  const [showGranularityTraining, setShowGranularityTraining] = useState(false)
  const [showChainAnalysis, setShowChainAnalysis] = useState(false)
  const [analysisSource, setAnalysisSource] = useState<'model' | 'quick'>('model')
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [modalSelections, setModalSelections] = useState<BaseEmotion[]>([])
  const [showDontKnow, setShowDontKnow] = useState(false)
  const [showUndoToast, setShowUndoToast] = useState(false)
  const undoSnapshotRef = useRef<{ selections: BaseEmotion[]; state: ModelState } | null>(null)
  const { playSound, muted, setMuted } = useSound()

  // Menu state owned by App so SettingsMenu can render at top level via portal
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => {
      const next = !prev
      if (next) window.dispatchEvent(new Event('emot-id:dismiss-picker'))
      return next
    })
  }, [])

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
  }, [])

  const { showHint, dismissHint } = useHintState(modelId)
  const { sessions, loading: sessionsLoading, save: saveSession, clearAll: clearAllSessions, exportJSON: exportSessionsJSON } = useSessionHistory()
  const { entries: chainEntries, loading: chainLoading, save: saveChainEntry, clearAll: clearAllChains } = useChainAnalysis()
  const [showHistory, setShowHistory] = useState(false)

  const settingsT = section('settings')
  const remindersT = section('reminders')

  const [saveSessions, setSaveSessions] = useState(() => {
    return storage.get('saveSessions') !== 'false'
  })
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(() => isDailyReminderEnabled())

  const handleSaveSessionsChange = useCallback((save: boolean) => {
    storage.set('saveSessions', String(save))
    setSaveSessions(save)
    if (!save && sessions.length > 0) {
      const msg = settingsT.deleteExistingSessions ?? 'Delete existing sessions?'
      if (window.confirm(msg)) {
        clearAllSessions()
      }
    }
  }, [clearAllSessions, sessions.length, settingsT])

  const handleDailyReminderChange = useCallback(async (enabled: boolean) => {
    const result = await updateDailyReminder(enabled)
    if (result === 'enabled') {
      // Start cadence from now to avoid an immediate surprise notification.
      storage.set('dailyReminderLastSentAt', String(Date.now()))
      setDailyReminderEnabled(true)
      return
    }

    setDailyReminderEnabled(false)
    if (result === 'denied') {
      window.alert(remindersT.permissionDenied ?? 'Notifications are blocked. You can enable them from browser settings.')
    }
    if (result === 'unsupported') {
      window.alert(remindersT.unsupported ?? 'Notifications are not supported on this device.')
    }
  }, [remindersT])

  const reminderPermission = getReminderPermission()
  const reminderSupported = isReminderSupported()

  useEffect(() => {
    if (!dailyReminderEnabled) return

    const maybeNotify = () => {
      if (document.visibilityState === 'visible') return
      void maybeSendDailyReminder({
        title: remindersT.notificationTitle ?? 'Time for a quick emotional check-in',
        body: remindersT.notificationBody ?? 'Take 30 seconds to notice what you feel.',
      })
    }

    maybeNotify()
    const intervalId = window.setInterval(maybeNotify, 60 * 1000)
    document.addEventListener('visibilitychange', maybeNotify)
    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', maybeNotify)
    }
  }, [dailyReminderEnabled, remindersT])

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
    setAnalysisSource('model')
    setModalSelections(selections)
    setAnalysisResults(results)
    setIsModalOpen(true)
  }, [selections, analyze])

  const handleQuickCheckInComplete = useCallback((quickSelections: BaseEmotion[], quickResults: AnalysisResult[]) => {
    setShowQuickCheckIn(false)
    setAnalysisSource('quick')
    setModalSelections(quickSelections)
    setAnalysisResults(quickResults)
    setIsModalOpen(true)
  }, [])

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Early return: render only onboarding when not yet completed (once per device lifetime)
  if (showOnboarding) {
    return (
      <MotionConfig reducedMotion="user">
        <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
          <Onboarding onComplete={(selectedModelId) => {
            if (selectedModelId) {
              switchModel(selectedModelId)
            }
            setShowOnboarding(false)
          }} />
        </div>
      </MotionConfig>
    )
  }

  const handleSessionComplete = ({
    reflectionAnswer,
    interventionResponse,
  }: {
    reflectionAnswer: 'yes' | 'partly' | 'no' | null
    interventionResponse: 'better' | 'same' | 'worse' | null
  }) => {
    if (analysisResults.length === 0 || !saveSessions) return
    const sourceSelections = modalSelections.length > 0 ? modalSelections : selections
    const serialized: SerializedSelection[] = sourceSelections.map((s) => {
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
      modelId: analysisSource === 'quick' ? QUICK_MODEL_ID : modelId,
      selections: serialized,
      results: analysisResults,
      crisisTier: getCrisisTier(analysisResults.map((r) => r.id)),
      reflectionAnswer: reflectionAnswer ?? undefined,
      interventionResponse: interventionResponse ?? undefined,
    }
    saveSession(session)
  }

  return (
    <MotionConfig reducedMotion="user">
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      <Header
        menuOpen={menuOpen}
        onMenuToggle={toggleMenu}
        modelId={modelId}
        onModelChange={switchModel}
      />

      {isOffline && (
        <div className="shrink-0 px-4 py-2 text-xs text-amber-200 bg-amber-900/30 border-y border-amber-700/40 text-center">
          {offlineT.message ?? 'You are offline. Emot-ID is using cached content on this device.'}
        </div>
      )}

      <SettingsMenu
        isOpen={menuOpen}
        onClose={closeMenu}
        modelId={modelId}
        onModelChange={switchModel}
        soundMuted={muted}
        onSoundMutedChange={setMuted}
        saveSessions={saveSessions}
        onSaveSessionsChange={handleSaveSessionsChange}
        dailyReminderEnabled={dailyReminderEnabled}
        reminderSupported={reminderSupported}
        reminderPermission={reminderPermission}
        onDailyReminderChange={handleDailyReminderChange}
        onOpenHistory={() => setShowHistory(true)}
        onOpenGranularity={() => setShowGranularityTraining(true)}
        onOpenChainAnalysis={() => setShowChainAnalysis(true)}
      />

      <SelectionBar
        selections={selections}
        combos={combos}
        onDeselect={handleDeselect}
        onClear={handleClear}
      />

      <VisualizationErrorBoundary key={modelId} onReset={modelClear} language={language}>
        <div className="relative flex-1 min-h-0">
          {/* Floating hint overlay — inside visualization area to avoid stacking above */}
          <AnimatePresence>
            {showHint && !showOnboarding && selections.length === 0 && (
              <div className="absolute inset-x-0 top-2 z-[var(--z-dropdown)] flex justify-center pointer-events-none">
                <FirstInteractionHint modelId={modelId} />
              </div>
            )}
          </AnimatePresence>

          {Visualization && (
            <Suspense
              fallback={
                <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
                  {section('app').subtitle ?? 'Loading...'}
                </div>
              }
            >
              <Visualization
                emotions={visibleEmotions}
                onSelect={handleSelect}
                onDeselect={handleDeselect}
                sizes={sizes}
                selections={selections}
              />
            </Suspense>
          )}
        </div>
      </VisualizationErrorBoundary>

      {/* Bottom bar: analyze + "I don't know" */}
      <div className="shrink-0 px-4 py-1.5 max-w-md mx-auto w-full bg-gray-900/80 backdrop-blur-sm border-t border-gray-700/50 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <AnalyzeButton
          disabled={!modelReady || selections.length === 0}
          onClick={analyzeEmotions}
          modelId={modelId}
          selectionCount={selections.length}
        />
        <button
          onClick={() => setShowQuickCheckIn(true)}
          className="mt-2 w-full min-h-[44px] px-4 py-2 rounded-xl border border-indigo-500/50 text-indigo-200 hover:bg-indigo-600/20 transition-colors text-sm font-medium"
        >
          {section('quickCheckIn').title ?? 'Quick check-in'}
        </button>
        {/* "I don't know" — compact text link, hidden on somatic and while hint visible */}
        {selections.length === 0 && !showHint && modelId !== MODEL_IDS.SOMATIC && (
          <button
            onClick={() => setShowDontKnow(true)}
            className="block mx-auto mt-1 px-4 py-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            {dontKnowT.link ?? "I don't know what I'm feeling"}
          </button>
        )}
      </div>

      <ResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExploreMore={analysisSource === 'quick' ? undefined : handleClear}
        onSwitchModel={switchModel}
        onSessionComplete={handleSessionComplete}
        escalateCrisis={shouldEscalateCrisis}
        currentModelId={analysisSource === 'quick' ? undefined : modelId}
        selections={modalSelections}
        results={analysisResults}
      />

      <QuickCheckIn
        isOpen={showQuickCheckIn}
        onClose={() => setShowQuickCheckIn(false)}
        onComplete={handleQuickCheckInComplete}
      />

      <GranularityTraining
        isOpen={showGranularityTraining}
        onClose={() => setShowGranularityTraining(false)}
      />

      <ChainAnalysis
        isOpen={showChainAnalysis}
        onClose={() => setShowChainAnalysis(false)}
        entries={chainEntries}
        loading={chainLoading}
        onSave={saveChainEntry}
        onClearAll={clearAllChains}
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

    </div>
    </MotionConfig>
  )
}
