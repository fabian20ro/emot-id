import type { AnalysisResult } from '../models/types'

type Language = 'en' | 'ro'

interface AiPromptCopy {
  aiPrompt: string
  aiPromptMultiple: string
}

export function buildGoogleAiSearchUrl(
  results: AnalysisResult[],
  language: Language,
  prompts: AiPromptCopy,
): string | null {
  if (results.length === 0) return null

  const names = results.map((result) => result.label[language])
  const conjunction = language === 'ro' ? ' si ' : ' and '
  const emotionNames = names.length <= 1
    ? names[0]
    : names.slice(0, -1).join(', ') + conjunction + names[names.length - 1]
  const template = results.length >= 2 ? prompts.aiPromptMultiple : prompts.aiPrompt
  const query = encodeURIComponent(template.replace('{emotions}', emotionNames))

  return `https://www.google.com/search?udm=50&q=${query}`
}
