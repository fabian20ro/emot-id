import { useState } from 'react'
import { ArrowLeft, Check, ChevronRight, RotateCcw, X } from 'lucide-react'
import { ScreenHeader } from '../components/ScreenHeader'
import { useLanguage } from '../context/LanguageContext'
import { useEmotionModel } from '../hooks/useEmotionModel'
import { MODEL_IDS } from '../models/constants'
import type { AnalysisResult, BaseEmotion, ModelState } from '../models/types'

interface WordLadderScreenProps {
  onBack: () => void
  onComplete: (modelId: string, selections: BaseEmotion[], results: AnalysisResult[]) => void
}

interface LadderEmotion extends BaseEmotion {
  children?: string[]
}

interface LadderSnapshot {
  selections: BaseEmotion[]
  state: ModelState
}

function hasChildren(emotion: BaseEmotion): emotion is LadderEmotion {
  return Boolean((emotion as LadderEmotion).children?.length)
}

export function WordLadderScreen({ onBack, onComplete }: WordLadderScreenProps) {
  const { language, section } = useLanguage()
  const t = section('wordLadder')
  const selectionT = section('selectionBar')
  const model = useEmotionModel(MODEL_IDS.WHEEL)
  const [path, setPath] = useState<BaseEmotion[]>([])
  const [history, setHistory] = useState<LadderSnapshot[]>([])

  const select = (emotion: BaseEmotion) => {
    if (hasChildren(emotion)) {
      setHistory((current) => [...current, { selections: model.selections, state: model.modelState }])
      setPath((current) => [...current, emotion])
    } else {
      setHistory([])
      setPath([])
    }
    model.handleSelect(emotion)
  }

  const choosePathLevel = (index: number) => {
    model.handleBreadcrumbSelect(path[index])
    setHistory([])
    setPath([])
  }

  const backOneLevel = () => {
    const previous = history[history.length - 1]
    if (!previous) return
    model.restore(previous.selections, previous.state)
    setHistory((current) => current.slice(0, -1))
    setPath((current) => current.slice(0, -1))
  }

  const clear = () => {
    model.handleClear()
    setHistory([])
    setPath([])
  }

  const finish = () => {
    const results = model.analyze()
    if (model.selections.length > 0 && results.length > 0) {
      onComplete(MODEL_IDS.WHEEL, model.selections, results)
    }
  }

  return (
    <div className="screen checkin-screen checkin-screen-words" data-testid="words-screen">
      <ScreenHeader onBack={onBack} eyebrow={t.eyebrow} title={t.title} lede={t.lede} />
      <div className="checkin-step">
        <span>{t.level}</span>
        {model.selections.length > 0 && <span><Check size={15} aria-hidden="true" />{model.selections.length}</span>}
      </div>

      <div className="word-ladder">
        {path.length > 0 && (
          <section className="word-path" aria-label={t.path}>
            <span>{t.path}</span>
            <div className="word-path-levels">
              {path.map((item, index) => (
                <button
                  type="button"
                  key={`${item.id}-${index}`}
                  onClick={() => choosePathLevel(index)}
                  aria-label={t.useWord.replace('{word}', item.label[language])}
                >
                  {item.label[language]}
                </button>
              ))}
            </div>
            <button type="button" className="word-level-back" onClick={backOneLevel}>
              <ArrowLeft size={17} aria-hidden="true" />{t.backLevel}
            </button>
          </section>
        )}

        {model.selections.length > 0 && (
          <section className="word-selection" aria-label={t.selected} aria-live="polite">
            <div>
              <span>{t.selected}</span>
              <button type="button" className="icon-button" onClick={clear} aria-label={selectionT.clear}>
                <RotateCcw size={18} aria-hidden="true" />
              </button>
            </div>
            <div>
              {model.selections.map((emotion) => (
                <button type="button" key={emotion.id} onClick={() => model.handleDeselect(emotion)}>
                  <i style={{ background: emotion.color }} aria-hidden="true" />
                  {emotion.label[language]}
                  <X size={15} aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>
        )}

        <ul className="word-options" aria-label={t.level}>
          {model.visibleEmotions.map((emotion) => (
            <li key={emotion.id}>
              <button type="button" aria-label={emotion.label[language]} onClick={() => select(emotion)}>
                <span className="word-swatch" style={{ background: emotion.color }} aria-hidden="true" />
                <span>
                  <strong>{emotion.label[language]}</strong>
                  {emotion.description && <small>{emotion.description[language]}</small>}
                </span>
                {hasChildren(emotion) ? <ChevronRight size={18} aria-hidden="true" /> : <Check size={18} aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {model.selections.length > 0 && (
        <div className="route-action">
          <button type="button" className="primary-button" disabled={!model.modelReady} onClick={finish}>
            {t.choose}<ChevronRight size={19} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
