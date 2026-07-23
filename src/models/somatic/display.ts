import { somaticRegions } from '.'
import type { SensationType } from './types'

export type DisplayLanguage = 'ro' | 'en'

export const SENSATION_CONFIG: Record<SensationType, { icon: string; label: { ro: string; en: string } }> = {
  tension: { icon: '⫸', label: { ro: 'Tensiune', en: 'Tension' } },
  warmth: { icon: '◉', label: { ro: 'Căldură', en: 'Warmth' } },
  heaviness: { icon: '▼', label: { ro: 'Greutate', en: 'Heaviness' } },
  lightness: { icon: '△', label: { ro: 'Ușurință', en: 'Lightness' } },
  tingling: { icon: '✧', label: { ro: 'Furnicături', en: 'Tingling' } },
  numbness: { icon: '○', label: { ro: 'Amorțeală', en: 'Numbness' } },
  churning: { icon: '◎', label: { ro: 'Răscolire', en: 'Churning' } },
  pressure: { icon: '⊛', label: { ro: 'Presiune', en: 'Pressure' } },
  constriction: { icon: '⊘', label: { ro: 'Constricție', en: 'Constriction' } },
}

export const INTENSITY_LABELS: Record<1 | 2 | 3, { ro: string; en: string; anchor: { ro: string; en: string } }> = {
  1: { ro: 'Ușoară', en: 'Mild', anchor: { ro: 'abia perceptibilă', en: 'barely noticeable' } },
  2: { ro: 'Moderată', en: 'Moderate', anchor: { ro: 'clar prezentă', en: 'clearly present' } },
  3: { ro: 'Puternică', en: 'Strong', anchor: { ro: 'greu de ignorat', en: 'hard to ignore' } },
}

export function getSomaticRegionLabel(regionId: string, language: DisplayLanguage, fallback = regionId): string {
  return somaticRegions[regionId]?.label?.[language] ?? fallback
}

export function getSensationLabel(value: unknown, language: DisplayLanguage): string | undefined {
  if (typeof value !== 'string' || !(value in SENSATION_CONFIG)) return undefined
  return SENSATION_CONFIG[value as SensationType].label[language]
}

export function getIntensityLabel(value: unknown, language: DisplayLanguage): string | undefined {
  if (value !== 1 && value !== 2 && value !== 3) return undefined
  return INTENSITY_LABELS[value][language]
}
