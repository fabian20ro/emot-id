import { useMemo, useState } from 'react'
import { Check, ChevronDown, ExternalLink, HeartHandshake, Lightbulb, X } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { synthesize } from '../models/synthesis'
import { getOppositeAction } from '../data/opposite-action'
import { CrisisBanner } from '../components/CrisisBanner'
import { ScreenHeader } from '../components/ScreenHeader'
import { buildGoogleAiSearchUrl } from '../utils/google-ai-search'
import type { CheckInCompletion } from '../navigation/types'

type Fit = 'yes' | 'partly' | 'no'

interface ReflectionScreenProps {
  completion: CheckInCompletion
  saveSessions: boolean
  allowExternalAI: boolean
  onBack: () => void
  onSave: (detail: { reflectionAnswer?: Fit; selectedNeed?: string; nextStep?: string }) => void
  onReturn: () => void
}

export function ReflectionScreen({ completion, saveSessions, allowExternalAI, onBack, onSave, onReturn }: ReflectionScreenProps) {
  const { language, section } = useLanguage()
  const t = section('reflectionScreen')
  const analyzeT = section('analyze')
  const results = completion.results
  const needs = useMemo(
    () => [...new Set(results.map((result) => result.needs?.[language]).filter((need): need is string => Boolean(need)))],
    [language, results],
  )
  const [fit, setFit] = useState<Fit | undefined>()
  const [selectedNeed, setSelectedNeed] = useState<string | undefined>(() => needs.length === 1 ? needs[0] : undefined)
  const [tier4Acknowledged, setTier4Acknowledged] = useState(false)
  const [showStep, setShowStep] = useState(false)
  const [finished, setFinished] = useState(false)
  const [nextStep, setNextStep] = useState<string | undefined>()
  const synthesis = useMemo(() => synthesize(results, language), [results, language])
  const emotionNames = results.map((result) => result.label[language]).join(language === 'ro' ? ', ' : ', ')
  const briefSynthesis = language === 'ro'
    ? `${emotionNames} ar putea face parte din ceea ce este aici. Voi puteți aprecia cel mai bine ce se potrivește.`
    : `${emotionNames} may be part of what is here. You are the best judge of what fits.`
  const oppositeAction = getOppositeAction(results.map((result) => result.id), language)
  const defaultStep = language === 'ro'
    ? 'Opriți-vă pentru trei respirații lente și observați ce se schimbă.'
    : 'Pause for three slow breaths and notice what changes.'
  const suggestedStep = oppositeAction ?? defaultStep
  const requiresAcknowledge = completion.crisisTier === 'tier4' && !tier4Acknowledged
  const aiLink = allowExternalAI
    ? buildGoogleAiSearchUrl(results, language, analyzeT)
    : null

  const finish = (step = nextStep) => {
    onSave({ reflectionAnswer: fit, selectedNeed, nextStep: step })
    setFinished(true)
  }

  if (finished) {
    return (
      <div className="screen reflection-close" data-testid="reflection-close-screen">
        <span className="close-mark"><Check size={28} aria-hidden="true" /></span>
        <h1 className="screen-title">{t.closeTitle}</h1>
        <p className="screen-lede">{t.closeBody}</p>
        <p className="privacy-line">{saveSessions ? t.saved : t.notSaved}</p>
        <button type="button" className="primary-button mt-6" onClick={onReturn}>{t.returnToday}</button>
      </div>
    )
  }

  if (showStep) {
    return (
      <div className="screen" data-testid="next-step-screen">
        <ScreenHeader title={t.nextStep} onBack={() => setShowStep(false)} lede={selectedNeed ? `${t.need}: ${selectedNeed}` : undefined} />
        <div className="next-step-card"><Lightbulb size={24} aria-hidden="true" /><p>{suggestedStep}</p></div>
        <button type="button" className="primary-button mt-5" onClick={() => { setNextStep(suggestedStep); finish(suggestedStep) }}><Check size={19} aria-hidden="true" />{language === 'ro' ? 'Păstrez acest pas' : 'Keep this step'}</button>
        <button type="button" className="text-button w-full mt-2" onClick={() => finish()}>{t.done}</button>
      </div>
    )
  }

  return (
    <div className="screen" data-testid="reflection-screen">
      <ScreenHeader onBack={onBack} eyebrow={t.eyebrow} title={t.title} />

      {completion.crisisTier !== 'none' && (
        <CrisisBanner tier={completion.crisisTier} crisisT={section('crisis')} showTemporalNote={completion.temporalEscalation} />
      )}

      {requiresAcknowledge ? (
        <button type="button" className="crisis-ack" onClick={() => setTier4Acknowledged(true)}>{t.acknowledge}</button>
      ) : (
        <>
          <div className="emotion-heading">
            {results.map((result) => <span key={result.id}><i style={{ background: result.color }} />{result.label[language]}</span>)}
          </div>

          <p className="reflection-synthesis">{briefSynthesis}</p>

          <fieldset className="fit-check">
            <legend>{t.fit}</legend>
            <div>
              {(['yes', 'partly', 'no'] as const).map((answer) => (
                <button type="button" key={answer} className={fit === answer ? 'is-active' : ''} aria-pressed={fit === answer} onClick={() => setFit(answer)}>
                  {answer === 'yes' ? t.yes : answer === 'partly' ? t.partly : t.no}
                </button>
              ))}
            </div>
          </fieldset>

          {needs.length > 0 && (
            <fieldset className="need-choice">
              <legend><Lightbulb size={19} aria-hidden="true" />{t.needPrompt}</legend>
              <p>{t.needHint}</p>
              <div>
                {needs.map((need) => {
                  const active = selectedNeed === need
                  return (
                    <button
                      type="button"
                      key={need}
                      className={active ? 'is-active' : ''}
                      aria-pressed={active}
                      onClick={() => setSelectedNeed(active ? undefined : need)}
                    >
                      <span className="need-choice-mark" aria-hidden="true">{active && <Check size={16} />}</span>
                      <span>{need}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>
          )}

          <button type="button" className="primary-button mt-4" onClick={() => setShowStep(true)}>{t.nextStep}</button>
          <button type="button" className="text-button w-full mt-1" onClick={() => finish()}><X size={17} aria-hidden="true" />{t.done}</button>

          {results[0]?.description?.[language] && (
            <section className="meaning-block"><HeartHandshake size={21} aria-hidden="true" /><div><h2>{t.function}</h2><p>{results[0].description[language]}</p></div></section>
          )}

          <details className="more-context">
            <summary>{t.more}<ChevronDown size={18} aria-hidden="true" /></summary>
            <p>{synthesis}</p>
            {results.map((result) => <p key={result.id}><strong>{result.label[language]}:</strong> {result.description?.[language] ?? result.needs?.[language]}</p>)}
          </details>

          {aiLink ? (
            <a className="secondary-button external-ai-link mt-3" href={aiLink} target="_blank" rel="noopener noreferrer">
              {analyzeT.exploreAI}<ExternalLink size={18} aria-hidden="true" />
            </a>
          ) : (
            <p className="external-ai-disabled">{analyzeT.externalAIDisabled}</p>
          )}
        </>
      )}
    </div>
  )
}
