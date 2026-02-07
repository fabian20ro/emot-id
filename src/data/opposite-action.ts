type Language = 'ro' | 'en'

interface OppositeAction {
  emotionPattern: string[]
  suggestion: { ro: string; en: string }
}

const OPPOSITE_ACTIONS: OppositeAction[] = [
  {
    emotionPattern: ['shame', 'embarrassment', 'humiliation'],
    suggestion: {
      en: 'A gentle approach instead of hiding — share something small with someone you trust.',
      ro: 'O abordare blanda in loc sa te ascunzi — imparte ceva mic cu cineva de incredere.',
    },
  },
  {
    emotionPattern: ['fear', 'anxiety', 'worried', 'nervous', 'dread'],
    suggestion: {
      en: 'Approach what feels scary, gradually and safely — avoidance often increases fear.',
      ro: 'Apropierea treptata si sigura de ceea ce te sperie — evitarea amplifica adesea frica.',
    },
  },
  {
    emotionPattern: ['anger', 'rage', 'frustration', 'irritation', 'resentment'],
    suggestion: {
      en: 'Try gentle avoidance of the trigger and do something kind — anger often calls for the opposite of attack.',
      ro: 'Incearca sa te indepartezi de declansator si fa ceva bun — furia cere adesea opusul atacului.',
    },
  },
  {
    emotionPattern: ['sadness', 'grief', 'sorrow', 'melancholy', 'despair'],
    suggestion: {
      en: 'Get active — even a short walk or one small task. Movement is the opposite of withdrawal.',
      ro: 'Activeaza-te — chiar si o plimbare scurta sau o sarcina mica. Miscarea este opusul retragerii.',
    },
  },
  {
    emotionPattern: ['guilt', 'regret', 'remorse'],
    suggestion: {
      en: 'First pause and ask whether the guilt fits the facts. If it does, repair what you can. If it does not, choose a self-respecting action instead of self-punishment.',
      ro: 'Mai intai opreste-te si intreaba-te daca vina se potriveste faptelor. Daca da, repara ce poti. Daca nu, alege o actiune cu respect de sine in locul autopedepsirii.',
    },
  },
  {
    emotionPattern: ['jealousy', 'envy'],
    suggestion: {
      en: 'Practice gratitude for what you have — notice three things you appreciate right now.',
      ro: 'Practica recunostinta pentru ce ai — observa trei lucruri pe care le apreciezi acum.',
    },
  },
  {
    emotionPattern: ['loneliness', 'isolation', 'abandoned'],
    suggestion: {
      en: 'Reach out to someone — send a message, make a call, or visit a shared space.',
      ro: 'Contacteaza pe cineva — trimite un mesaj, suna sau mergi intr-un loc cu oameni.',
    },
  },
]

export function getOppositeAction(
  emotionIds: string[],
  language: Language,
): string | null {
  const lowerIds = emotionIds.map((id) => id.toLowerCase())
  for (const action of OPPOSITE_ACTIONS) {
    if (action.emotionPattern.some((p) => lowerIds.includes(p))) {
      return action.suggestion[language]
    }
  }
  return null
}
