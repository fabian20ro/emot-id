import type { AnalysisResult } from './types'
import { HIGH_DISTRESS_IDS } from './distress'

type Lang = 'ro' | 'en'

/** Specific pleasant-emotion combinations with richer narratives */
const PLEASANT_COMBOS: Record<string, { en: string; ro: string }> = {
  'joy+gratitude': {
    en: 'Joy meeting gratitude — you are recognizing a gift in your life. This combination builds lasting satisfaction and deepens appreciation.',
    ro: 'Bucuria intalneste recunostinta — recunosti un dar in viata ta. Aceasta combinatie construieste satisfactie durabila si aprofundeaza aprecierea.',
  },
  'love+trust': {
    en: 'Love woven with trust — this is the experience of deep relational safety, the foundation of secure connection.',
    ro: 'Iubirea impaletita cu increderea — aceasta este experienta sigurantei relationale profunde, fundamentul conectarii sigure.',
  },
  'joy+serenity': {
    en: 'Joy settling into serenity — a state of quiet contentment. This is what wellbeing feels like when it has room to breathe.',
    ro: 'Bucuria se asaza in serenitate — o stare de multumire linistita. Asa se simte bunastarea cand are loc sa respire.',
  },
  'gratitude+serenity': {
    en: 'Gratitude in serenity — a peaceful recognition of what matters. This combination nourishes emotional resilience.',
    ro: 'Recunostinta in serenitate — o recunoastere pasnica a ceea ce conteaza. Aceasta combinatie hraneste rezilienta emotionala.',
  },
}

interface ValenceProfile {
  hasPositive: boolean
  hasNegative: boolean
  isMixed: boolean
  avgValence: number
}

interface IntensityProfile {
  avgArousal: number
  isHigh: boolean
  isLow: boolean
}

function getLabel(result: AnalysisResult, lang: Lang): string {
  return result.label[lang] || result.label.en || result.id
}

function detectValence(results: AnalysisResult[]): ValenceProfile {
  const valences = results
    .map((r) => r.valence)
    .filter((v): v is number => v !== undefined)

  if (valences.length === 0) {
    // Infer from descriptions if no explicit valence
    return { hasPositive: false, hasNegative: false, isMixed: false, avgValence: 0 }
  }

  const hasPositive = valences.some((v) => v > 0.1)
  const hasNegative = valences.some((v) => v < -0.1)
  const avgValence = valences.reduce((sum, v) => sum + v, 0) / valences.length

  return {
    hasPositive,
    hasNegative,
    isMixed: hasPositive && hasNegative,
    avgValence,
  }
}

function detectIntensity(results: AnalysisResult[]): IntensityProfile {
  const arousals = results
    .map((r) => r.arousal)
    .filter((a): a is number => a !== undefined)

  if (arousals.length === 0) {
    return { avgArousal: 0.5, isHigh: false, isLow: false }
  }

  const avg = arousals.reduce((sum, a) => sum + a, 0) / arousals.length
  return {
    avgArousal: avg,
    isHigh: avg > 0.65,
    isLow: avg < 0.35,
  }
}

function collectNeeds(results: AnalysisResult[], lang: Lang): string[] {
  return results
    .map((r) => r.needs?.[lang])
    .filter((n): n is string => !!n)
}

const templates = {
  en: {
    singleClear: (name: string) =>
      `You are experiencing a clear, focused signal: ${name}. When a single emotion stands out this distinctly, it deserves your attention.`,
    singleHighIntensity: (name: string) =>
      `${name} is showing up with strong intensity — this points to something important that your system is responding to.`,
    singleLowIntensity: (name: string) =>
      `${name} is present as a subtle, gentle signal — your quiet noticing of it speaks to your awareness.`,
    mixedValence: (names: string[]) =>
      `You are holding both ${names.join(' and ')} together. This kind of complexity is natural and healthy — it reflects the richness of your inner experience.`,
    concordantPleasant: (names: string[]) =>
      `Your experience weaves together ${names.join(' and ')} — a harmonious blend of pleasant feelings.`,
    concordantUnpleasant: (names: string[]) =>
      `You are experiencing ${names.join(' and ')} together. These feelings often appear when something meaningful is at stake.`,
    concordantUnpleasantSevere: (names: string[]) =>
      `What you're experiencing — ${names.join(' and ')} — sounds painful. You deserve support.`,
    complexityMultiple: (count: number) =>
      `You are holding multiple emotional threads simultaneously — ${count} distinct feelings. This complexity is common and healthy, reflecting how your system processes layered experiences.`,
    highIntensityGroup:
      'The intensity of what you are feeling points to something important — your emotional system is responding strongly.',
    lowIntensityGroup:
      'These are soft, subtle signals. Your ability to notice them reflects attentive self-awareness.',
    adaptiveFunction: (name: string, desc: string) =>
      `Your ${name} may signal: ${desc}`,
    needsClosing: (needs: string[]) => {
      const unique = [...new Set(needs)]
      if (unique.length === 1) return `Right now, you may need ${unique[0]}.`
      if (unique.length === 2) return `Right now, you may need ${unique[0]} and ${unique[1]}.`
      const last = unique.pop()
      return `Right now, you may need ${unique.join(', ')}, and ${last}.`
    },
    needsClosingSevere: (needs: string[]) => {
      const unique = [...new Set(needs)]
      if (unique.length === 1) return `Right now, you deserve ${unique[0]}.`
      if (unique.length === 2) return `Right now, you deserve ${unique[0]} and ${unique[1]}.`
      const last = unique.pop()
      return `Right now, you deserve ${unique.join(', ')}, and ${last}.`
    },
  },
  ro: {
    singleClear: (name: string) =>
      `Experimentezi un semnal clar si focalizat: ${name}. Cand o singura emotie iese in evidenta atat de distinct, merita atentia ta.`,
    singleHighIntensity: (name: string) =>
      `${name} se manifesta cu o intensitate puternica — aceasta indica ceva important la care sistemul tau raspunde.`,
    singleLowIntensity: (name: string) =>
      `${name} este prezenta ca un semnal subtil si bland — observarea ei vorbeste despre constientizarea ta.`,
    mixedValence: (names: string[]) =>
      `Tii impreuna ${names.join(' si ')}. Aceasta complexitate este naturala si sanatoasa — reflecta bogatia experientei tale interioare.`,
    concordantPleasant: (names: string[]) =>
      `Experienta ta impleteste ${names.join(' si ')} — un amestec armonios de sentimente placute.`,
    concordantUnpleasant: (names: string[]) =>
      `Experimentezi ${names.join(' si ')} impreuna. Aceste sentimente apar adesea cand ceva semnificativ este in joc.`,
    concordantUnpleasantSevere: (names: string[]) =>
      `Ceea ce experimentezi — ${names.join(' si ')} — pare dureros. Meriti sprijin.`,
    complexityMultiple: (count: number) =>
      `Tii simultan mai multe fire emotionale — ${count} sentimente distincte. Aceasta complexitate este comuna si sanatoasa, reflectand modul in care sistemul tau proceseaza experiențe stratificate.`,
    highIntensityGroup:
      'Intensitatea a ceea ce simti indica ceva important — sistemul tau emotional raspunde puternic.',
    lowIntensityGroup:
      'Acestea sunt semnale subtile si blande. Capacitatea ta de a le observa reflecta o constientizare atenta.',
    adaptiveFunction: (name: string, desc: string) =>
      `${name} poate semnala: ${desc}`,
    needsClosing: (needs: string[]) => {
      const unique = [...new Set(needs)]
      if (unique.length === 1) return `Acum, ai putea avea nevoie de ${unique[0]}.`
      if (unique.length === 2) return `Acum, ai putea avea nevoie de ${unique[0]} si ${unique[1]}.`
      const last = unique.pop()
      return `Acum, ai putea avea nevoie de ${unique.join(', ')} si ${last}.`
    },
    needsClosingSevere: (needs: string[]) => {
      const unique = [...new Set(needs)]
      if (unique.length === 1) return `Acum, meriti ${unique[0]}.`
      if (unique.length === 2) return `Acum, meriti ${unique[0]} si ${unique[1]}.`
      const last = unique.pop()
      return `Acum, meriti ${unique.join(', ')} si ${last}.`
    },
  },
}

function findPleasantCombo(ids: string[], lang: Lang): string | null {
  const sorted = [...ids].sort()
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const key = `${sorted[i]}+${sorted[j]}`
      if (PLEASANT_COMBOS[key]) return PLEASANT_COMBOS[key][lang]
    }
  }
  return null
}

/**
 * Synthesize a narrative paragraph from analysis results.
 * Pure function — no side effects, no diagnostic language.
 */
export function synthesize(results: AnalysisResult[], language: Lang): string {
  if (results.length === 0) return ''

  const t = templates[language]
  const names = results.map((r) => getLabel(r, language))
  const valence = detectValence(results)
  const intensity = detectIntensity(results)
  const needs = collectNeeds(results, language)
  const sentences: string[] = []

  // Detect if results contain high-distress emotions
  const isSevere = results.filter((r) => HIGH_DISTRESS_IDS.has(r.id)).length >= 2

  // 1. Complexity framing
  if (results.length === 1) {
    sentences.push(t.singleClear(names[0]))
  } else if (results.length >= 3) {
    sentences.push(t.complexityMultiple(results.length))
  }

  // 2. Valence balance (for 2+ emotions)
  if (results.length >= 2) {
    // Check for specific pleasant combinations first
    const pleasantCombo = findPleasantCombo(results.map((r) => r.id), language)

    if (valence.isMixed) {
      sentences.push(t.mixedValence(names))
    } else if (valence.hasPositive && !valence.hasNegative) {
      sentences.push(pleasantCombo ?? t.concordantPleasant(names))
    } else if (valence.hasNegative && !valence.hasPositive) {
      sentences.push(isSevere ? t.concordantUnpleasantSevere(names) : t.concordantUnpleasant(names))
    }
  }

  // 3. Intensity pattern
  if (results.length === 1) {
    if (intensity.isHigh) {
      sentences.push(t.singleHighIntensity(names[0]))
    } else if (intensity.isLow) {
      sentences.push(t.singleLowIntensity(names[0]))
    }
  } else {
    if (intensity.isHigh) {
      sentences.push(t.highIntensityGroup)
    } else if (intensity.isLow) {
      sentences.push(t.lowIntensityGroup)
    }
  }

  // 4. Adaptive function weaving (first sentence of description, max 2 emotions)
  const descriptive = results.filter((r) => r.description?.[language])
  for (const r of descriptive.slice(0, 2)) {
    const desc = r.description![language]
    // Take first sentence only
    const firstSentence = desc.split(/[.!]/).filter(Boolean)[0]?.trim()
    if (firstSentence && firstSentence.length > 10) {
      sentences.push(t.adaptiveFunction(getLabel(r, language), firstSentence.toLowerCase()))
    }
  }

  // 5. Needs integration
  if (needs.length > 0) {
    sentences.push(isSevere ? t.needsClosingSevere(needs) : t.needsClosing(needs))
  }

  return sentences.join(' ')
}
