import { plutchikEmotions as plutchikData } from '../models/plutchik'

export type GranularityLanguage = 'ro' | 'en'
export type GranularityDistinction = 'intensity' | 'duration' | 'focus' | 'time'

export interface GranularityOption {
  id: string
}

export interface GranularitySet {
  id: string
  distinction: GranularityDistinction
  options: [GranularityOption, GranularityOption, GranularityOption]
}

type PlutchikLabelRecord = Record<string, { label?: Partial<Record<GranularityLanguage, string>> }>

const PLUTCHIK_LABELS = plutchikData as PlutchikLabelRecord

export const GRANULARITY_SETS: GranularitySet[] = [
  {
    id: 'anxiety-scale',
    distinction: 'intensity',
    options: [{ id: 'anxiety' }, { id: 'apprehension' }, { id: 'fear' }],
  },
  {
    id: 'anger-scale',
    distinction: 'intensity',
    options: [{ id: 'annoyance' }, { id: 'anger' }, { id: 'rage' }],
  },
  {
    id: 'sadness-scale',
    distinction: 'duration',
    options: [{ id: 'sadness' }, { id: 'grief' }, { id: 'despair' }],
  },
  {
    id: 'self-evaluation',
    distinction: 'focus',
    options: [{ id: 'guilt' }, { id: 'shame' }, { id: 'remorse' }],
  },
  {
    id: 'future-orientation',
    distinction: 'time',
    options: [{ id: 'interest' }, { id: 'curiosity' }, { id: 'anticipation' }],
  },
]

function normalizeLabel(label: string, language: GranularityLanguage): string {
  const locale = language === 'ro' ? 'ro-RO' : 'en-US'
  return label.trim().toLocaleLowerCase(locale)
}

export function getGranularityLabel(id: string, language: GranularityLanguage): string {
  const label = PLUTCHIK_LABELS[id]?.label?.[language]
  if (!label) {
    return normalizeLabel(id.replace(/[-_]/g, ' '), language)
  }
  return normalizeLabel(label, language)
}

export function isGranularityOptionValid(option: GranularityOption): boolean {
  const entry = PLUTCHIK_LABELS[option.id]
  return Boolean(entry?.label?.ro && entry?.label?.en)
}

export function getValidGranularitySets(sets: GranularitySet[] = GRANULARITY_SETS): GranularitySet[] {
  return sets.filter((set) => {
    if (set.options.length !== 3) return false
    const uniqueIds = new Set(set.options.map((option) => option.id))
    if (uniqueIds.size !== 3) return false
    return set.options.every((option) => isGranularityOptionValid(option))
  })
}
