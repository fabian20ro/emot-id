import { Suspense } from 'react'
import { Check, ChevronRight, RotateCcw } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useEmotionModel } from '../hooks/useEmotionModel'
import { MODEL_IDS } from '../models/constants'
import { ModelVisualization } from '../components/ModelVisualization'
import { ScreenHeader } from '../components/ScreenHeader'
import type { AnalysisResult, BaseEmotion } from '../models/types'
import type { CheckInRoute } from '../navigation/types'

interface ModelCheckInScreenProps {
  route: Exclude<CheckInRoute, 'quick'>
  onBack: () => void
  onComplete: (modelId: string, selections: BaseEmotion[], results: AnalysisResult[]) => void
}

const MODEL_BY_ROUTE = {
  body: MODEL_IDS.SOMATIC,
  affect: MODEL_IDS.DIMENSIONAL,
  words: MODEL_IDS.WHEEL,
  plutchik: MODEL_IDS.PLUTCHIK,
} as const

export function ModelCheckInScreen({ route, onBack, onComplete }: ModelCheckInScreenProps) {
  const { language, section } = useLanguage()
  const modelId = MODEL_BY_ROUTE[route]
  const model = useEmotionModel(modelId)
  const bodyT = section('bodyCompass')
  const affectT = section('affectMap')
  const wordsT = section('wordLadder')
  const exploreT = section('exploreScreen')

  const copy = route === 'body'
    ? { eyebrow: bodyT.eyebrow, title: bodyT.title, lede: bodyT.lede, step: bodyT.step, action: bodyT.continue }
    : route === 'affect'
      ? { eyebrow: affectT.eyebrow, title: affectT.title, lede: affectT.lede, step: affectT.step, action: affectT.continue }
      : route === 'words'
        ? { eyebrow: wordsT.eyebrow, title: wordsT.title, lede: wordsT.lede, step: wordsT.level, action: wordsT.choose }
        : { eyebrow: 'Plutchik', title: exploreT.plutchik, lede: section('app').subtitle, step: exploreT.learn, action: section('analyze').button }

  const finish = () => {
    const results = model.analyze()
    if (model.selections.length > 0 && results.length > 0) onComplete(modelId, model.selections, results)
  }

  return (
    <div className="screen checkin-screen" data-testid={`${route}-screen`}>
      <ScreenHeader onBack={onBack} eyebrow={copy.eyebrow} title={copy.title} lede={copy.lede} />
      <div className="checkin-step"><span>{copy.step}</span>{model.selections.length > 0 && <span><Check size={15} aria-hidden="true" />{model.selections.length}</span>}</div>

      {route === 'words' ? (
        <WordLadder
          emotions={model.visibleEmotions}
          selections={model.selections}
          path={model.breadcrumbPath}
          language={language}
          onSelect={model.handleSelect}
          onChooseCurrent={model.handleBreadcrumbSelect}
          onClear={model.handleClear}
        />
      ) : (
        <div className={`model-stage model-stage-${route}`}>
          <Suspense fallback={<div className="model-loading">...</div>}>
            <ModelVisualization
              modelId={modelId}
              emotions={model.visibleEmotions}
              selections={model.selections}
              sizes={model.sizes}
              progressive
              onSelect={model.handleSelect}
              onDeselect={model.handleDeselect}
            />
          </Suspense>
        </div>
      )}

      {model.selections.length > 0 && route !== 'words' && (
        <div className="selection-summary" aria-live="polite">
          {model.selections.map((selection) => (
            <button type="button" key={selection.id} onClick={() => model.handleDeselect(selection)}>
              <span style={{ background: selection.color }} aria-hidden="true" />
              {selection.label[language]}
            </button>
          ))}
        </div>
      )}

      <div className="route-action">
        <button type="button" className="primary-button" disabled={!model.modelReady || model.selections.length === 0} onClick={finish}>
          {copy.action}<ChevronRight size={19} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

function WordLadder({ emotions, selections, path, language, onSelect, onChooseCurrent, onClear }: {
  emotions: BaseEmotion[]
  selections: BaseEmotion[]
  path: BaseEmotion[]
  language: 'en' | 'ro'
  onSelect: (emotion: BaseEmotion) => void
  onChooseCurrent: (emotion: BaseEmotion) => void
  onClear: () => void
}) {
  const { section } = useLanguage()
  const t = section('wordLadder')
  const trail = [...path]
  const latest = selections[selections.length - 1]
  if (latest && !trail.some((item) => item.id === latest.id)) trail.push(latest)

  return (
    <div className="word-ladder">
      {trail.length > 0 && (
        <div className="word-path" aria-label={t.path}>
          <span>{t.path}</span>
          <div>{trail.map((item, index) => <span key={`${item.id}-${index}`}>{item.label[language]}</span>)}</div>
          <div className="word-path-actions">
            {path.length > 0 && <button type="button" onClick={() => onChooseCurrent(path[path.length - 1])}>{t.choose}</button>}
            <button type="button" className="icon-button" onClick={onClear} aria-label={section('selectionBar').clear}><RotateCcw size={18} aria-hidden="true" /></button>
          </div>
        </div>
      )}
      <div className="word-options" role="list" aria-label={t.level}>
        {emotions.map((emotion) => (
          <button type="button" role="listitem" key={emotion.id} onClick={() => onSelect(emotion)}>
            <span className="word-swatch" style={{ background: emotion.color }} aria-hidden="true" />
            <span><strong>{emotion.label[language]}</strong>{emotion.description && <small>{emotion.description[language]}</small>}</span>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  )
}
