import { memo, useMemo, type CSSProperties } from 'react'
import { useLanguage } from '../context/LanguageContext'
import type { VisualizationProps } from '../models/types'
import type { PlutchikEmotion } from '../models/plutchik/types'

const PRIMARY_ORDER = [
  'joy',
  'trust',
  'fear',
  'surprise',
  'sadness',
  'disgust',
  'anger',
  'anticipation',
] as const

const POSITIONS = [
  { left: 50, top: 7 },
  { left: 78, top: 20 },
  { left: 84, top: 50 },
  { left: 78, top: 80 },
  { left: 50, top: 93 },
  { left: 22, top: 80 },
  { left: 16, top: 50 },
  { left: 22, top: 20 },
] as const

function PlutchikWheelBase({ emotions, selections = [], onSelect, onDeselect }: VisualizationProps) {
  const { language, section } = useLanguage()
  const t = section('plutchik')
  const selectedIds = useMemo(() => new Set(selections.map((emotion) => emotion.id)), [selections])
  const primaryEmotions = useMemo(() => {
    const available = new Map<string, PlutchikEmotion>()
    for (const emotion of [...emotions, ...selections] as PlutchikEmotion[]) {
      if (emotion.category === 'primary') available.set(emotion.id, emotion)
    }
    return PRIMARY_ORDER.map((id) => available.get(id)).filter((emotion): emotion is PlutchikEmotion => Boolean(emotion))
  }, [emotions, selections])
  const selectedCount = primaryEmotions.filter((emotion) => selectedIds.has(emotion.id)).length
  const wheelGradient = `conic-gradient(from -22.5deg, ${primaryEmotions.map((emotion, index) => `${emotion.color} ${index * 45}deg ${(index + 1) * 45}deg`).join(', ')})`

  return (
    <div className="plutchik-wheel-field">
      <p id="plutchik-instructions" className="plutchik-instructions">{t.instructions}</p>
      <div className="plutchik-wheel" role="group" aria-label={t.fieldLabel} aria-describedby="plutchik-instructions">
        <div className="plutchik-ring" style={{ background: wheelGradient }} aria-hidden="true" />
        {primaryEmotions.map((emotion, index) => {
          const isSelected = selectedIds.has(emotion.id)
          const unavailable = selectedCount >= 2 && !isSelected
          const position = POSITIONS[index]
          return (
            <button
              type="button"
              key={emotion.id}
              data-testid={`plutchik-emotion-${emotion.id}`}
              className={`plutchik-emotion${isSelected ? ' is-selected' : ''}`}
              style={{
                '--emotion-color': emotion.color,
                left: `${position.left}%`,
                top: `${position.top}%`,
              } as CSSProperties}
              aria-pressed={isSelected}
              disabled={unavailable}
              onClick={() => isSelected ? onDeselect(emotion) : onSelect(emotion)}
            >
              {emotion.label[language]}
            </button>
          )
        })}
        <div className="plutchik-wheel-center" aria-hidden="true">
          <strong>{selectedCount}/2</strong>
          <span>{t.selected}</span>
        </div>
      </div>
    </div>
  )
}

export const PlutchikWheel = memo(PlutchikWheelBase)
