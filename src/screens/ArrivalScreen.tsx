import { useState } from 'react'
import { Activity, ArrowRight, Crosshair, ListTree, Sparkles } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { ScreenHeader } from '../components/ScreenHeader'
import type { CheckInRoute } from '../navigation/types'

interface ArrivalScreenProps {
  onBack: () => void
  onChoose: (route: Exclude<CheckInRoute, 'quick'>) => void
}

export function ArrivalScreen({ onBack, onChoose }: ArrivalScreenProps) {
  const { section } = useLanguage()
  const t = section('arrival')
  const [guided, setGuided] = useState(false)

  const routes = [
    { id: 'words' as const, title: t.words, hint: t.wordsHint, Icon: ListTree, tone: 'var(--blue-soft)', color: 'var(--blue)' },
    { id: 'body' as const, title: t.body, hint: t.bodyHint, Icon: Activity, tone: 'var(--coral-soft)', color: 'var(--coral)' },
    { id: 'affect' as const, title: t.affect, hint: t.affectHint, Icon: Crosshair, tone: 'var(--mustard-soft)', color: 'var(--mustard)' },
  ]

  return (
    <div className="screen" data-testid="arrival-screen">
      <ScreenHeader onBack={onBack} eyebrow={t.eyebrow} title={guided ? t.unsureTitle : t.title} lede={guided ? t.unsureBody : t.lede} />

      <div className="route-grid">
        {(guided ? [
          { id: 'body' as const, title: t.tryBody, hint: t.bodyHint, Icon: Activity, tone: 'var(--coral-soft)', color: 'var(--coral)' },
          { id: 'affect' as const, title: t.tryAffect, hint: t.affectHint, Icon: Crosshair, tone: 'var(--mustard-soft)', color: 'var(--mustard)' },
          { id: 'words' as const, title: t.tryWords, hint: t.wordsHint, Icon: ListTree, tone: 'var(--blue-soft)', color: 'var(--blue)' },
        ] : routes).map(({ id, title, hint, Icon, tone, color }) => (
          <button type="button" className="route-card" key={id} data-testid={`arrival-${id}`} onClick={() => onChoose(id)}>
            <span className="route-icon" style={{ background: tone, color }}><Icon size={22} aria-hidden="true" /></span>
            <span className="route-copy"><strong>{title}</strong><span>{hint}</span></span>
            <ArrowRight size={18} className="muted" aria-hidden="true" />
          </button>
        ))}

        {!guided && (
          <button type="button" className="route-card" data-testid="arrival-unsure" onClick={() => setGuided(true)}>
            <span className="route-icon" style={{ background: 'var(--teal-soft)', color: 'var(--teal)' }}><Sparkles size={22} aria-hidden="true" /></span>
            <span className="route-copy"><strong>{t.unsure}</strong><span>{t.unsureHint}</span></span>
            <ArrowRight size={18} className="muted" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}
